# TrainSchedule 🚝

Train schedule application built with NestJS, Next.js, and PostgreSQL.

## Features

- JWT authentication (register / login)
- Role-based access: Guest (read-only) · User · Admin (full CRUD)
- Train schedule: view, add, edit, delete entries
- Departure / arrival datepicker, station dropdown

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS, TypeScript, Passport JWT |
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| Database | PostgreSQL (Neon) via TypeORM |
| Auth | JWT + bcrypt |

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL database (local or cloud, e.g. [Neon](https://neon.tech))

## Local Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd TrainSchedule
```

### 2. Backend

```bash
cd backend
npm install
```

Create `.env` in `backend/`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
JWT_SECRET=your_secret_key_here
```

Start the dev server:

```bash
npm run start:dev
```

Backend runs on **http://localhost:3000**  
Swagger API docs: **http://localhost:3000/api**

### 3. Frontend

```bash
cd frontend
npm install
```

Create `.env.local` in `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Start the dev server:

```bash
npm run dev -- -p 3001
```

Frontend runs on **http://localhost:3001**

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Register a new user |
| POST | `/auth/login` | — | Login, returns JWT |
| GET | `/trains` | — | Get all trains |
| POST | `/trains` | JWT | Create a train |
| PATCH | `/trains/:id` | JWT | Update a train |
| DELETE | `/trains/:id` | JWT | Delete a train |
| GET | `/users` | JWT + Admin | Get all users |

## Roles

| Role | Permissions |
|------|------------|
| Guest | View train schedule |
| User | View + Create / Edit / Delete trains |
| Admin | All of the above + manage users |

> To set a user as Admin, run this SQL query against your database:
> ```sql
> UPDATE "user" SET role = 'admin' WHERE email = 'your@email.com';
> ```

## Project Structure

```
TrainSchedule/
├── backend/          # NestJS API
│   └── src/
│       ├── auth/     # JWT auth, guards, strategies
│       ├── trains/   # Train CRUD
│       └── users/    # User management
└── frontend/         # Next.js app
    └── src/
        ├── app/      # Pages (/, /login, /register)
        ├── components/
        ├── context/  # Auth & Theme context
        └── lib/      # API client
```
