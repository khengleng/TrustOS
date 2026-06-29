# Deployment

## Overview

TrustOS Learn MVP has two deployable parts:

- `apps/web` for the student-facing React application
- `apps/api` for the quiz API

The current MVP can generate quiz drafts through the API when `OPENAI_API_KEY` is configured. If AI generation fails, the API falls back to the hardcoded quiz bank. The API also supports PostgreSQL persistence through Prisma for quiz drafts, approved quizzes, and rejected quizzes. Student quiz delivery prefers approved quizzes first and falls back to the hardcoded bank if no approved quiz is available.

## Local Development

### API

Create a local env file if needed:

```bash
cp apps/api/.env.example apps/api/.env
```

Run the API:

```bash
npm run dev --workspace @trustos-learn/api
```

The API listens on:

- `process.env.PORT || 3000`

Health check:

- `GET /health`

Sample quiz endpoint:

- `GET /api/quiz/sample`

AI quiz generation endpoint:

- `POST /api/quiz/generate`

Draft review endpoints:

- `POST /api/quiz/generate-draft`
- `GET /api/quiz/drafts`
- `POST /api/quiz/drafts/:id/approve`
- `POST /api/quiz/drafts/:id/reject`
- `GET /api/quiz/approved`

### Web App

Create a local env file if needed:

```bash
cp apps/web/.env.example apps/web/.env
```

Run the web app:

```bash
npm run dev --workspace @trustos-learn/web
```

Default local frontend URL:

- `http://localhost:5173`

Default local API URL:

- `http://localhost:3000`

## Railway Deployment For API

Use these Railway settings:

- Root Directory: `apps/api`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Pre-Deploy Command: `npm run db:migrate`

Add a PostgreSQL service to the same Railway project, then connect the API service to it.

Environment variables:

- `PORT`
- `CORS_ORIGIN`
- `OPENAI_API_KEY`
- `OPENAI_MODEL` optional, defaults to `gpt-4.1-mini`
- `DATABASE_URL`

Important:

- Set `OPENAI_API_KEY` only on the Railway API service with root directory `apps/api`
- Do not add `OPENAI_API_KEY` to the web service
- The frontend calls the API; the OpenAI key stays server-side
- Set `DATABASE_URL` on the API service from the Railway PostgreSQL service reference, for example `${{Postgres.DATABASE_URL}}`
- Run Prisma migrations after the database is attached to the API service

Recommended API service setup:

```bash
npm install
npm run db:generate
npm run build
npm run db:migrate
npm start
```

The API already includes:

- Express server setup
- CORS support
- Health endpoint
- PostgreSQL persistence through Prisma
- Draft review endpoints
- Student quiz endpoint that prefers approved quizzes first
- TypeScript build script
- Node.js start script

## Production Notes

For this MVP:

- Keep the API service stateless apart from PostgreSQL
- Keep the OpenAI key in Railway environment variables only
- Expect the student flow to continue with hardcoded fallback questions if no approved quizzes are available
- If PostgreSQL is unavailable, the API temporarily falls back to in-memory review storage, which resets on restart or deploy
- Do not add database or authentication dependencies yet
