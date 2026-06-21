# TrainSchedule — Frontend

Next.js 16 App Router frontend for the Train Schedule application.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- JWT authentication (stored in localStorage)

## Setup

```bash
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Run the dev server:

```bash
npm run dev -- -p 3001
```

Open [http://localhost:3001](http://localhost:3001).

## Structure

```
src/
├── app/           # Pages: / · /login · /register
├── components/    # Navbar · TrainModal · ConfirmModal
├── context/       # AuthContext · ThemeContext
├── hooks/         # useTrains · useFavorites
├── lib/           # api.ts — trainsApi, authApi, favoritesApi
└── types/         # Train · AuthResponse · Station
```

## Deploy

Deployed on [Vercel](https://vercel.com). Set `NEXT_PUBLIC_API_URL` to your Railway backend URL in Vercel environment variables.
