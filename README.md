# TrainSchedule

TrainSchedule is a full-stack web application for browsing Ukrainian train timetables. Unauthenticated visitors can search and filter routes; registered users can bookmark favourites; administrators manage the schedule through a full CRUD interface. The application is split into two independent services — a NestJS REST API and a Next.js frontend — each deployed on its own platform.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Backend | NestJS · TypeScript · TypeORM · PostgreSQL · Passport JWT · bcrypt · Swagger |
| Frontend | Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 |
| Database | PostgreSQL (hosted on [Neon](https://neon.tech)) |
| Deployment | Backend → Railway · Frontend → Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A running PostgreSQL instance (local or cloud)

### Clone

```bash
git clone https://github.com/weronikachepil/TrainSchedule.git
cd TrainSchedule
```

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
JWT_SECRET=your_secret_key
```

```bash
npm run start:dev
```

The API is available at `http://localhost:3000`. Interactive documentation is served at `http://localhost:3000/api`.

### Frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

```bash
npm run dev -- -p 3001
```

The application is available at `http://localhost:3001`.

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Create a new account |
| `POST` | `/auth/login` | Authenticate and receive a JWT |

### Trains

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/trains` | Public | List trains. Accepts `?search=`, `?departureDate=`, `?arrivalDate=` |
| `POST` | `/trains` | Admin | Create a train entry |
| `PATCH` | `/trains/:id` | Admin | Update a train entry |
| `DELETE` | `/trains/:id` | Admin | Delete a train entry |

### Favourites

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/favorites` | User | Return the current user's saved trains |
| `POST` | `/favorites/:trainId` | User | Toggle a train as saved or unsaved |

---

## Access Control

The application uses three roles.

| Role | Permissions |
|------|-------------|
| **Guest** | Browse, search, and filter the schedule |
| **User** | All of the above, plus save and remove favourite routes |
| **Admin** | All of the above, plus create, edit, and delete trains |

To elevate an account to Admin, run the following query directly on your database:

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Project Structure

```
TrainSchedule/
├── backend/
│   └── src/
│       ├── auth/        # JWT strategy, guards, login and register
│       ├── trains/      # Train CRUD — entity, service, controller
│       ├── favorites/   # Favourite routes — entity, service, controller
│       └── users/       # User entity and service
└── frontend/
    └── src/
        ├── app/         # Pages: / · /login · /register
        ├── components/  # Navbar · TrainModal · ConfirmModal
        ├── context/     # AuthContext · ThemeContext
        ├── hooks/       # useTrains · useFavorites
        └── lib/         # API client
```
