# TrustOS Learn

TrustOS Learn is a simple education quiz MVP for students in Grade 2 through Grade 12. It supports Cambridge and Cambodia MoEYS curriculum selections, English and Khmer subjects, and English, Khmer, or bilingual quiz display.

This MVP is intentionally simple:

- React + TypeScript frontend in `apps/web`
- Node.js + Express + TypeScript API in `apps/api`
- Shared TypeScript types in `packages/shared`
- Hardcoded quiz bank only
- Server-side OpenAI quiz generation with hardcoded fallback
- No database
- No login
- No payments

## Current Experience

1. Open the homepage
2. Click `Start Learning`
3. Choose grade, curriculum, subject, and language
4. Start quiz practice
5. Answer one question at a time
6. See correct or wrong feedback
7. Read the explanation
8. Continue with `Next Question`
9. Track score, correct count, and current question number

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

## Local Run

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
- `POST /api/quiz/generate`

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

Example AI generation request:

```bash
curl -X POST http://localhost:3000/api/quiz/generate \
  -H "Content-Type: application/json" \
  -d '{
    "grade": "grade-4",
    "curriculum": "cambridge",
    "subject": "math",
    "language": "bilingual",
    "difficulty": "easy",
    "topic": "fractions"
  }'
```

## Railway Deployment

- API root directory: `apps/api`
- Web root directory: `apps/web`
- API start command: `npm start`
- Web start command: `npm start`
- Railway API variables: `PORT`, `CORS_ORIGIN`, `OPENAI_API_KEY`
- Optional Railway API variable: `OPENAI_MODEL=gpt-4.1-mini`
- Do not set `OPENAI_API_KEY` on `apps/web`

See [docs/deployment.md](docs/deployment.md) for details.

## Current Limitations

- AI generation depends on `OPENAI_API_KEY` being configured on the API service
- If OpenAI fails, the API falls back to hardcoded quiz data
- No login or student accounts
- No database persistence
- No payments
- No analytics
- No teacher dashboard or admin tools

## Next Roadmap

- Add larger curriculum-aligned quiz banks
- Add multi-question quiz sessions with fixed sets
- Add learner history and progress saving
- Add teacher and parent views
- Add AI-assisted content generation later, after the hardcoded MVP is stable

## License

This project is licensed under the terms of the [MIT License](LICENSE).
