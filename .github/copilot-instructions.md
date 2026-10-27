# Repository Guidelines

## Architecture

- This repository has two independent npm projects; run commands from `backend/` or `frontend/`, as appropriate.
- `frontend/src/app/` contains the Next.js App Router routes. Route pages are generally thin and compose feature UI from `frontend/src/components/`; shared API calls, React Query hooks, and query keys live in `frontend/src/lib/api.ts` and `frontend/src/lib/queries.ts`.
- `backend/src/` is a NestJS REST API organized by feature modules. Controllers handle HTTP and delegate to services; services use the shared `PrismaService`. The API is globally prefixed with `/api`.
- `backend/prisma/schema.prisma` is the PostgreSQL data model; Prisma's generated client is in `backend/generated/prisma/`. Keep the frontend types and API payloads aligned with the backend schema and DTOs, especially the application status values.

## Build, lint, and test

Run these commands from the named project directory:

| Project | Command | Purpose |
|---|---|---|
| `frontend/` | `npm run dev` | Start the Next.js development server |
| `frontend/` | `npm run build` | Build the frontend |
| `frontend/` | `npm run start` | Serve a production build |
| `frontend/` | `npm run lint` | Lint the frontend |
| `frontend/` | `npx eslint "src/path/to/file.tsx"` | Lint one frontend file |
| `backend/` | `npm run start:dev` | Start the NestJS API in watch mode |
| `backend/` | `npm run build` | Build the API |
| `backend/` | `npm test -- --runInBand` | Run backend unit tests |
| `backend/` | `npm test -- --runInBand app.controller.spec.ts` | Run one test file |
| `backend/` | `npm test -- --runInBand -t "test name"` | Run a named test |
| `backend/` | `npm run test:e2e -- --runInBand` | Run end-to-end tests |
| `backend/` | `npm run lint` | Lint backend files; this script uses ESLint `--fix` |
| `backend/` | `npx eslint src/path/to/file.ts` | Lint one backend file without the all-files fix script |

After changing the Prisma schema, regenerate the client with `npx prisma generate`; create database migrations from `backend/` with `npx prisma migrate dev --name <description>`. Prisma reads `DATABASE_URL` from the backend environment.

## Conventions

- Backend endpoints that accept input use DTOs with `class-validator` (and `class-transformer` where needed). The global `ValidationPipe` transforms values and strips fields not declared by the DTO.
- For authenticated endpoints, use `JwtAuthGuard` and `@CurrentUser()` to get the caller. Always scope reads, updates, and deletes of user-owned records to that user's ID; do not trust a client-supplied owner ID.
- Keep frontend data fetching in the React Query hooks in `frontend/src/lib/queries.ts`, use its query keys, and invalidate related keys after mutations. Use the shared Axios client in `frontend/src/lib/api.ts` so requests include authentication and share error handling.
- `ApplicationStatus` is represented both by the Prisma enum and the frontend union in `frontend/src/types/application.types.ts`; update both when the status set changes.
- Before changing frontend code, read the installed Next.js guidance in `frontend/AGENTS.md` and the relevant documentation under `frontend/node_modules/next/dist/docs/`. This project uses Next.js 16; follow its current APIs rather than relying on older conventions. Preserve the generated Next.js guidance block in `frontend/AGENTS.md`, which `next dev` may re-add.
