# Brain App

A lightweight cognitive training web app built with React + Vite. It includes onboarding, dashboard, math and memory mini-games, results with charts, settings, and optional AI coaching.

## Getting started

```bash
npm install
npm run dev
```

## Frontend highlights
- React + React Router with contextual auth/state via `UserContext`.
- Tailwind styling and Lucide icons.
- Math and memory mini-games with session persistence and optional OpenAI feedback.
- Results charting with Recharts.

## API routes (serverless-style under `/api`)
- `POST /api/auth-register`
- `POST /api/auth-login`
- `GET /api/profile`
- `GET/POST /api/sessions`

Set `DATABASE_URL` (Neon) and `AUTH_SECRET`/`STACK_SECRET_SERVER_KEY` for JWT signing when deploying the API layer.
