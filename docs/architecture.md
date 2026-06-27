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
- Stay simple until authentication, persistence, and AI workflows are ready
- Preserve an easy path to Railway deployment for the API

## Application Responsibilities

### `apps/web`

- Deliver the learner-facing TrustOS Learn experience
- Render curriculum, grade, and language-aware UI
- Consume the API over HTTP

### `apps/api`

- Expose quiz and curriculum-related APIs
- Provide a deployable Node.js service boundary
- Act as the future integration point for authentication, data storage, and AI services

### `packages/shared`

- Define reusable domain types
- Reduce schema drift between frontend and backend

## Current Non-Goals

- No authentication
- No database
- No OpenAI or other AI provider integration
- No background jobs
