# Deployment

## Overview

TrustOS Learn MVP has two deployable parts:

- `apps/web` for the student-facing React application
- `apps/api` for the quiz API

The current MVP can generate quiz questions through the API when `OPENAI_API_KEY` is configured. If AI generation fails, the API falls back to the hardcoded quiz bank. There is still no database or authentication requirement.

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

Environment variables:

- `PORT`
- `CORS_ORIGIN`
- `OPENAI_API_KEY`
- `OPENAI_MODEL` optional, defaults to `gpt-4.1-mini`

Important:

- Set `OPENAI_API_KEY` only on the Railway API service with root directory `apps/api`
- Do not add `OPENAI_API_KEY` to the web service
- The frontend calls the API; the OpenAI key stays server-side

The API already includes:

- Express server setup
- CORS support
- Health endpoint
- AI quiz generation endpoint with hardcoded fallback
- TypeScript build script
- Node.js start script

## Production Notes

For this MVP:

- Keep the API stateless
- Keep the OpenAI key in Railway environment variables only
- Expect the API to continue working with hardcoded fallback questions if OpenAI is unavailable
- Do not add database or authentication dependencies yet
