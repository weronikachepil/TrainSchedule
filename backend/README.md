# TrainSchedule — Backend

NestJS 11 REST API for the Train Schedule application.

## Stack

- NestJS 11
- TypeScript
- TypeORM
- PostgreSQL
- Passport JWT
- bcrypt
- Swagger

## Setup

```bash
npm install
```

Create `.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
JWT_SECRET=your_secret_key_here
PORT=3000
```

Run in development:

```bash
npm run start:dev
```

API runs on **http://localhost:3000**  
Swagger docs at **http://localhost:3000/api**

## Structure

```
src/
├── auth/        # JWT strategy, guards, login/register
├── trains/      # Train CRUD (entity, service, controller)
├── favorites/   # Favourite routes (entity, service, controller)
└── users/       # User entity and service
```

## Deploy

Deployed on [Railway](https://railway.app). Set `DATABASE_URL` and `JWT_SECRET` in Railway Variables.
