# Job Application Tracker

A full-stack web application for tracking job applications through every stage of the hunt — from *applied* to *offer*. Users register, log in, and manage their own private list of applications with a clean dashboard and status analytics.

Built with **NestJS**, **Next.js**, **Prisma**, and **TypeScript**.

<!-- Replace with a real screenshot once deployed -->
![Dashboard screenshot](./docs/dashboard.png)

**Live demo:** [your-demo-link.vercel.app](https://your-demo-link.vercel.app)
**Demo account:** `demo@example.com` / `demo1234`

---

## Features

- **Secure authentication** — register and log in with JWT-based auth and bcrypt-hashed passwords
- **Private data** — every user only ever sees and edits their own applications
- **Full CRUD** — create, view, update, and delete job applications
- **Status pipeline** — move applications through *applied → interview → offer → rejected*
- **Dashboard analytics** — a pie chart breaking down applications by status
- **Deadline tracking** — never miss a follow-up or interview date

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Chart.js |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + Passport, bcrypt |
| Deployment | Vercel (frontend), Railway (backend + database) |

---

## Architecture

```
job-application-tracker/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/            # Register, login, JWT strategy + guard
│   │   ├── applications/    # CRUD for job applications
│   │   ├── prisma/          # Prisma service
│   │   └── main.ts
│   └── prisma/
│       └── schema.prisma    # Database models
│
└── frontend/                # Next.js app
    ├── app/
    │   ├── login/
    │   ├── register/
    │   └── dashboard/
    ├── components/
    └── lib/                  # API client, auth helpers
```

The backend exposes a REST API. The frontend calls it with the user's JWT attached to each request. Every application record is tied to a `userId`, so users are fully isolated from one another.

---

## Data model

Two models with a one-to-many relationship — one user has many applications:

```prisma
model User {
  id           String        @id @default(uuid())
  email        String        @unique
  password     String
  applications Application[]
  createdAt    DateTime      @default(now())
}

model Application {
  id          String    @id @default(uuid())
  company     String
  role        String
  status      String    @default("applied")
  appliedDate DateTime  @default(now())
  deadline    DateTime?
  notes       String?
  link        String?
  user        User      @relation(fields: [userId], references: [id])
  userId      String
}
```

---

## Getting started

### Prerequisites

- Node.js 18 or later
- A PostgreSQL database (local, or a free one from Railway / Neon / Supabase)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/job-application-tracker.git
cd job-application-tracker
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/jobtracker"
JWT_SECRET="your-long-random-secret-string"
```

Run the database migration and start the server:

```bash
npx prisma migrate dev
npm run start:dev
```

The API will be running at `http://localhost:3000`.

### 3. Set up the frontend

```bash
cd ../frontend
npm install
```

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

Start the frontend:

```bash
npm run dev
```

The app will be running at `http://localhost:3001`.

---

## API endpoints

| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| `POST` | `/auth/register` | Create a new account | No |
| `POST` | `/auth/login` | Log in, returns a JWT | No |
| `GET` | `/applications` | List the current user's applications | Yes |
| `POST` | `/applications` | Create a new application | Yes |
| `PATCH` | `/applications/:id` | Update an application | Yes |
| `DELETE` | `/applications/:id` | Delete an application | Yes |

Authenticated requests must include the token:

```
Authorization: Bearer <your-jwt>
```

---

## Deployment

1. **Database** — provision a PostgreSQL instance on Railway, Neon, or Supabase and copy its connection string.
2. **Backend** — deploy the `backend/` folder to Railway. Set `DATABASE_URL` and `JWT_SECRET` in the environment settings.
3. **Frontend** — deploy the `frontend/` folder to Vercel. Set `NEXT_PUBLIC_API_URL` to your deployed backend URL.

---

## What I learned building this

- Designing a relational data model and expressing it in Prisma
- Implementing JWT authentication from scratch in NestJS, including guards and Passport strategies
- Enforcing per-user data ownership to prevent users accessing each other's records
- Connecting a Next.js frontend to a REST API with protected routes
- Deploying a full-stack TypeScript application end to end

---

## Development reference

For repository architecture, build and test commands, and shared code conventions, see the [repository instructions](../.github/copilot-instructions.md).

---

## License

MIT — feel free to use this as a starting point for your own projects.
