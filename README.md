# TrainSchedule

TrainSchedule demonstrates a production-style separation of concerns between a REST API and a modern frontend. The backend exposes a typed HTTP interface; the frontend consumes it directly, with no intermediate proxy layer. Authentication is stateless — the server issues a signed JWT on login, and the client attaches it to every subsequent request.

The application supports three levels of access. A guest can browse, search, and filter the schedule without an account. A registered user can additionally bookmark routes. An administrator has full control over the schedule data.

---

## Architecture

The project consists of two independently deployed services.

```
TrainSchedule/
├── backend/     NestJS REST API — Railway
└── frontend/    Next.js 16 App Router — Vercel
```

The frontend communicates with the backend through the `NEXT_PUBLIC_API_URL` environment variable. This makes the deployment target configurable without touching application code.

### Backend

The API is organised into three feature modules, each encapsulating its own entity, service, and controller.

| Module | Responsibility |
|--------|---------------|
| `auth` | Registration, login, JWT issuance, and route guards |
| `trains` | Train schedule — public reads, admin writes |
| `favorites` | Per-user saved routes — toggle on/off |

### Frontend

State is kept close to where it is needed. Two React contexts cover authentication and theming at the application level. Data fetching is handled by two custom hooks that encapsulate all API interaction and local state updates.

| Hook | Responsibility |
|------|---------------|
| `useTrains` | Load trains, expose `create`, `update`, and `remove` |
| `useFavorites` | Load saved routes, expose `toggle` with optimistic updates |

---

## Prerequisites

- Node.js 18 or later
- npm 9 or later
- A PostgreSQL database — a free instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com) is sufficient

---

## Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/weronikachepil/TrainSchedule.git
cd TrainSchedule
```

### 2. Start the backend

```bash
cd backend
npm install
```

The backend requires two environment variables. Create `backend/.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
JWT_SECRET=your_secret_key
```

> **Note:** `JWT_SECRET` must be the same value in every environment the backend runs in. Changing it invalidates all existing tokens.

```bash
npm run start:dev
```

The server starts on `http://localhost:3000`. The Swagger interface — which documents every endpoint with request and response shapes — is available at `http://localhost:3000/api`.

### 3. Start the frontend

Open a second terminal from the repository root:

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

All endpoints return JSON. Authenticated endpoints require an `Authorization: Bearer <token>` header. The token is obtained from `/auth/login`.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Create an account. Returns a JWT on success. |
| `POST` | `/auth/login` | Verify credentials. Returns a JWT on success. |

### Trains

The `GET` endpoint is public. Write operations require an admin token.

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/trains` | Public | Return all trains. Accepts `?search=`, `?departureDate=`, `?arrivalDate=`. |
| `POST` | `/trains` | Admin | Create a train entry. |
| `PATCH` | `/trains/:id` | Admin | Update a train entry. |
| `DELETE` | `/trains/:id` | Admin | Delete a train entry. |

### Favourites

Both endpoints require a valid user token.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/favorites` | Return the current user's saved trains. |
| `POST` | `/favorites/:trainId` | Toggle a train as saved or unsaved. |

---

## Access Control

Roles are stored on the user record in the database. They are embedded in the JWT payload and enforced by route guards on the backend.

| Role | Permissions |
|------|-------------|
| **Guest** | Browse, search, and filter the schedule |
| **User** | All of the above, plus save and unsave favourite routes |
| **Admin** | All of the above, plus create, edit, and delete trains |

To promote an existing account to admin, run the following query against your database:

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Deployment

The backend is deployed on Railway. The frontend is deployed on Vercel. Each service requires its environment variables to be set in the platform dashboard — they are not read from committed files.

| Service | Platform | Required variables |
|---------|----------|--------------------|
| Backend | Railway | `DATABASE_URL`, `JWT_SECRET` |
| Frontend | Vercel | `NEXT_PUBLIC_API_URL` |
