# 🚝 Train Schedule Application

A full-stack train schedule app where users can register, log in, and manage train routes. Built with NestJS, Next.js, and PostgreSQL.

---

## Features

- View train schedule in a table without an account (read-only)
- Register and log in with JWT authentication
- Add trains via a form with station dropdowns and a date/time picker
- Users can edit and delete only their own train entries
- Admins have full CRUD over all entries
- Role-based access control: Guest · User · Admin
- Custom confirm dialog for destructive actions
- Dark and light theme

---

## Tech Stack

**Backend** — NestJS · TypeScript · TypeORM · PostgreSQL · Passport JWT · bcrypt · Swagger

**Frontend** — Next.js 16 · TypeScript · Tailwind CSS v4

**Database** — PostgreSQL hosted on [Neon](https://neon.tech)

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- A PostgreSQL database (local or cloud)

---

### 1. Clone the repository

```bash
git clone https://github.com/weronikachepil/TrainSchedule.git
cd TrainSchedule
```

---

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
JWT_SECRET=your_secret_key_here
```

> Replace `USER`, `PASSWORD`, `HOST`, and `DATABASE` with your PostgreSQL credentials.  
> You can use a free cloud database from [Neon](https://neon.tech) or [Supabase](https://supabase.com).

Start the backend server:

```bash
npm run start:dev
```

The backend runs on **http://localhost:3000**

Swagger API documentation is available at **http://localhost:3000/api**

---

### 3. Set up the Frontend

Open a new terminal tab, then:

```bash
cd frontend
npm install
```

Create a `.env.local` file inside the `frontend/` folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev -- -p 3001
```

The frontend runs on **http://localhost:3001**

---

## API Endpoints

| Method | Endpoint | Auth required | Description |
|--------|----------|:---:|-------------|
| POST | `/auth/register` | No | Create a new account |
| POST | `/auth/login` | No | Log in and receive a JWT |
| GET | `/trains` | No | Get all trains |
| POST | `/trains` | Yes | Create a new train |
| PATCH | `/trains/:id` | Yes | Update a train |
| DELETE | `/trains/:id` | Yes | Delete a train |

---

## User Roles

| Role | Access |
|------|--------|
| Guest | View train schedule (read-only) |
| User | View + create trains + edit and delete **own** trains only |
| Admin | Full CRUD over all trains |

To grant Admin rights, run the following SQL query on your database:

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Project Structure

```
TrainSchedule/
├── backend/
│   └── src/
│       ├── auth/          # Authentication (JWT, guards, strategies)
│       ├── trains/        # Train CRUD (entity, service, controller)
│       └── users/         # User management
├── frontend/
│   └── src/
│       ├── app/           # Pages: / · /login · /register
│       ├── components/    # Navbar, TrainCard, TrainModal
│       ├── context/       # Auth and Theme context
│       └── lib/           # API client
└── README.md
```
