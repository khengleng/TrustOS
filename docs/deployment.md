# Deployment

## Overview

TrustOS Learn MVP has two deployable parts:

- `apps/web` for the student-facing React application
- `apps/api` for the quiz API

The current MVP uses a hardcoded quiz bank only. There is no database, authentication, or AI dependency required to run it.

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

The API already includes:

- Express server setup
- CORS support
- Health endpoint
- TypeScript build script
- Node.js start script

## Production Notes

For this MVP:

- Keep the API stateless
- Keep quiz content hardcoded
- Do not add database or AI dependencies until the local flow is stable
