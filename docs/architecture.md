# Architecture

## Overview

TrustOS Learn is structured as a small monorepo with separate application and shared package boundaries.

```text
apps/
  web/       React + TypeScript learner-facing web app
  api/       Express + TypeScript backend API

packages/
  shared/    Shared domain types used by web and API
```

## Design Goals

- Keep frontend and backend independently deployable
- Share core curriculum and quiz types in one package
- Stay simple while adding only the persistence and AI foundations needed for quiz review and session tracking
- Preserve an easy path to Railway deployment for the API

## Application Responsibilities

### `apps/web`

- Deliver the learner-facing TrustOS Learn experience
- Render curriculum, grade, and language-aware UI
- Store an anonymous `sessionId` in `sessionStorage` for privacy-friendly session tracking
- Consume the API over HTTP

### `apps/api`

- Expose quiz and curriculum-related APIs
- Provide a deployable Node.js service boundary
- Use Prisma with PostgreSQL for quiz review data and anonymous learning sessions
- Act as the future integration point for authentication and deeper AI services

### `packages/shared`

- Define reusable domain types
- Reduce schema drift between frontend and backend

## Current Data Flows

- Curriculum map:
  The web app calls `GET /api/curriculum` to load seeded topic and learning-outcome guidance for the selected curriculum, grade, and subject.
- Quiz review:
  AI-generated drafts are stored in PostgreSQL, reviewed, then moved into approved or rejected quiz tables.
- Anonymous learning sessions:
  The web app starts an anonymous session, saves each quiz attempt, completes the session at the end of the run, and requests a summary with score and recommended next topic.

## Current Non-Goals

- No authentication
- No student profile or cross-device identity
- No payments
- No background jobs
