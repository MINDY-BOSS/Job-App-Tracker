# Job Application Tracker

A full-stack application for tracking job applications, company details, notes, documents, interviews, and deadlines. The frontend is built with Next.js and the REST API with NestJS; PostgreSQL persistence is managed with Prisma.

## Features

- JWT-based registration and login
- Private, per-user job application tracking with status, search, filters, and pagination
- Dashboard and statistics for application activity and outcomes
- Calendar views for interviews and deadlines
- Company profiles and supported job-board openings
- Notes and document management
- Profile and password settings

## Architecture

- `frontend/` is a Next.js App Router application. Routes are in `frontend/src/app/`, feature UI in `frontend/src/components/`, and the shared Axios client and React Query hooks in `frontend/src/lib/`.
- `backend/` is a NestJS REST API organized into feature modules under `backend/src/`. Controllers handle HTTP requests and services implement application logic using the shared Prisma service.
- `backend/prisma/schema.prisma` defines the PostgreSQL data model. Database migrations are in `backend/prisma/migrations/`.
- API routes use the `/api` prefix. In the Vercel deployment, the frontend proxies these requests to the private backend service using a service binding. Authenticated requests use a JWT bearer token, and user-owned records are scoped to the authenticated user.

## Requirements

- Node.js and npm
- PostgreSQL

## Local development

### 1. Configure and start the backend

From `backend/`, install dependencies:

```bash
npm install
```

Create `backend/.env` with your PostgreSQL connection string and a private JWT signing secret:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/jobtracker"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=3000
FRONTEND_URL="http://localhost:3001"
```

Generate the Prisma client, apply local development migrations, and start the API:

```bash
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

The API listens at `http://localhost:3000`, with endpoints under `/api`.

### 2. Configure and start the frontend

From `frontend/`, install dependencies:

```bash
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

Start Next.js on port 3001 so it does not conflict with the API:

```bash
npm run dev -- --port 3001
```

Open `http://localhost:3001`.

## Project commands

Run commands from the corresponding project directory.

| Project | Command | Purpose |
|---|---|---|
| `frontend/` | `npm run dev` | Start Next.js |
| `frontend/` | `npm run build` | Build the frontend |
| `frontend/` | `npm run lint` | Lint the frontend |
| `backend/` | `npm run start:dev` | Start NestJS in watch mode |
| `backend/` | `npm run build` | Build the API |
| `backend/` | `npm test -- --runInBand` | Run backend unit tests |
| `backend/` | `npm test -- --runInBand app.controller.spec.ts` | Run a single test file |
| `backend/` | `npm run test:e2e -- --runInBand` | Run backend end-to-end tests |
| `backend/` | `npm run lint` | Lint backend files (this script applies fixes) |

For repository conventions and additional command details, see [`.github/copilot-instructions.md`](.github/copilot-instructions.md).

## Vercel deployment

The root [`vercel.json`](vercel.json) configures the `backend` and `frontend` services in one Vercel project. The frontend is public and handles all paths, including `/api/*`; a Next.js route handler proxies API requests to the private NestJS backend over the `BACKEND_URL` service binding. Vercel injects this binding at runtime; do not set it manually. The frontend uses the same-origin `/api` path by default, so do not set `NEXT_PUBLIC_API_URL` to a localhost or separate deployment URL in Vercel.

Configure `DATABASE_URL` and `JWT_SECRET` for the backend service in Vercel. Uploaded documents currently use local filesystem storage (`backend/src/documents/documents.service.ts`), which is not durable on Vercel Functions; configure persistent external object storage before relying on document uploads in production.

Test the services together locally with `vercel dev`.
