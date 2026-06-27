# TrustOS Learn

TrustOS Learn is a simple quiz practice MVP for students in Grade 2 through Grade 12. It supports Cambridge and Cambodia MoEYS curriculum selections, English and Khmer subjects, and English, Khmer, or bilingual quiz display.

This MVP is intentionally simple:

- React + TypeScript frontend in `apps/web`
- Node.js + Express + TypeScript API in `apps/api`
- Shared TypeScript types in `packages/shared`
- Hardcoded quiz bank only
- No OpenAI
- No database
- No login
- No payments

## User Flow

1. Open the web app
2. Select grade, curriculum, subject, and language
3. Click `Start Quiz`
4. Load one question from the API
5. Choose one answer
6. See correct or wrong feedback
7. Read the explanation
8. Click `Next Question`

## Project Structure

```text
apps/
  web/
  api/

packages/
  shared/

docs/
  vision.md
  architecture.md
  deployment.md
  curriculum.md
  ai-safety.md
```

## Local Development

Install dependencies:

```bash
npm install
```

Create env files if needed:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Run the API:

```bash
npm run dev --workspace @trustos-learn/api
```

Run the web app in another terminal:

```bash
npm run dev --workspace @trustos-learn/web
```

Useful commands:

```bash
npm run build
npm run typecheck
npm run start
```

## API

Current endpoints:

- `GET /health`
- `GET /api/quiz/sample?grade=grade-6&curriculum=cambridge&subject=math&language=english`

The API returns one hardcoded quiz object with:

- `id`
- `grade`
- `curriculum`
- `subject`
- `language`
- `question`
- `choices`
- `correctAnswer`
- `explanation`

## Deployment

- `apps/web` can be deployed as a standard frontend app
- `apps/api` is prepared for Railway deployment

See [docs/deployment.md](docs/deployment.md) for details.

## License

This project is licensed under the terms of the [MIT License](LICENSE).
