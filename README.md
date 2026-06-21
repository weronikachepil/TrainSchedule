# Train Schedule Application

A full-stack train schedule app with role-based access, server-side search, and saved favourite routes. Built with NestJS, Next.js, and PostgreSQL.

---

## Features

- View train schedule in a table without an account (read-only)
- Register and log in with JWT authentication
- **Server-side search** by train number, departure city, or arrival city
- **Date filters** for departure and arrival dates
- Time-of-day filters: morning / afternoon / evening
- Role-based access control: Guest · User · Admin
- **Users** can save favourite routes with a heart button; saved routes appear in a list below the table
- **Admins** have full CRUD over all train entries
- Custom confirm dialog for destructive actions

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

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/auth/register` | No | Create a new account |
| POST | `/auth/login` | No | Log in and receive a JWT |

### Trains

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| GET | `/trains` | No | Get all trains (supports `?search=`, `?departureDate=`, `?arrivalDate=`) |
| POST | `/trains` | Admin | Create a new train |
| PATCH | `/trains/:id` | Admin | Update a train |
| DELETE | `/trains/:id` | Admin | Delete a train |

### Favorites

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| GET | `/favorites` | User | Get current user's saved trains |
| POST | `/favorites/:trainId` | User | Toggle a train as favourite |

---

## User Roles

| Role | Access |
|------|--------|
| Guest | View train schedule (read-only), search and filter |
| User | Save and remove favourite routes |
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
│       ├── favorites/     # Favourite routes (entity, service, controller)
│       ├── trains/        # Train CRUD (entity, service, controller)
│       └── users/         # User management
├── frontend/
│   └── src/
│       ├── app/           # Pages: / · /login · /register
│       ├── components/    # Navbar, TrainModal, ConfirmModal
│       ├── context/       # AuthContext
│       ├── hooks/         # useTrains, useFavorites
│       └── lib/           # API client (trainsApi, favoritesApi, authApi)
└── README.md
```
