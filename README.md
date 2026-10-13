# Library Management System

Full-stack library management system using Node.js, Express, TypeScript, Prisma, PostgreSQL, React, Vite, pnpm, JWT, and Zod.

## Run locally

1. Start PostgreSQL with `docker compose up -d`.
2. Copy `backend/.env.example` to `backend/.env`.
3. Install dependencies with `pnpm install` in each package.
4. In `backend`, run `pnpm prisma:generate`, `pnpm db:migrate:init`, and `pnpm db:seed`.
5. Run `pnpm dev` in both `backend` and `frontend`.

The API is available at `http://localhost:3000/api/v1` and the frontend at `http://localhost:5173`.

