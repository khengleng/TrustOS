# TrustOS Learn

TrustOS Learn is a simple education quiz MVP for students in Grade 2 through Grade 12. It supports Cambridge and Cambodia MoEYS curriculum selections, English and Khmer subjects, and English, Khmer, or bilingual quiz display.

This MVP is intentionally simple:

- React + TypeScript frontend in `apps/web`
- Node.js + Express + TypeScript API in `apps/api`
- Shared TypeScript types in `packages/shared`
- PostgreSQL + Prisma persistence for quiz review workflow
- Anonymous learning session tracking for score and progress
- Server-side OpenAI quiz generation for draft creation
- Seed curriculum map foundation for selected math grades
- No login
- No payments

## Current Experience

1. Open the homepage
2. Click `Start Learning`
3. Choose grade, curriculum, subject, and language
4. Start quiz practice
5. Student questions prefer approved quizzes from PostgreSQL
6. If no approved quiz exists, the API uses a hardcoded fallback
7. Answer one question at a time
8. See correct or wrong feedback
9. Read the explanation
10. Continue with `Next Question`
11. Track score, correct count, and current question number
12. Finish with an anonymous session summary and recommended next topic
13. View a simple learning report that parents or teachers can understand

Review flow:

1. Generate a draft with `POST /api/quiz/generate-draft`
2. Review draft items from `GET /api/quiz/drafts`
3. Approve with `POST /api/quiz/drafts/:id/approve`
4. Reject with `POST /api/quiz/drafts/:id/reject`
5. Serve approved items from `GET /api/quiz/approved`

The draft review pipeline is now database-backed, but the API still falls back to temporary in-memory storage if PostgreSQL is unavailable.

Curriculum map flow:

1. Select curriculum, grade, and subject
2. The web app loads seeded curriculum items from `GET /api/curriculum`
3. If a map exists, choose a `Topic / Learning Outcome`
4. AI draft generation can use that learning outcome as guidance
5. Teacher review is still required before content should be treated as approved

Anonymous session flow:

1. The web app starts a learning session with `POST /api/sessions/start`
2. A privacy-friendly anonymous `sessionId` is stored in `sessionStorage`
3. Each submitted answer is saved with `POST /api/sessions/:sessionId/attempt`
4. The session is completed with `POST /api/sessions/:sessionId/complete`
5. The summary is loaded from `GET /api/sessions/:sessionId/summary`
6. A rule-based learning report is loaded from `GET /api/sessions/:sessionId/report`

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
npm run db:generate --workspace @trustos-learn/api
npm run db:migrate --workspace @trustos-learn/api
npm run db:studio --workspace @trustos-learn/api
```

## API

Current endpoints:

- `GET /health`
- `GET /api/curriculum?curriculum=cambridge&grade=grade-4&subject=math`
- `GET /api/quiz/sample?grade=grade-6&curriculum=cambridge&subject=math&language=english`
- `POST /api/quiz/generate`
- `POST /api/quiz/generate-draft`
- `GET /api/quiz/drafts`
- `POST /api/quiz/drafts/:id/approve`
- `POST /api/quiz/drafts/:id/reject`
- `GET /api/quiz/approved`
- `POST /api/sessions/start`
- `POST /api/sessions/:sessionId/attempt`
- `POST /api/sessions/:sessionId/complete`
- `GET /api/sessions/:sessionId/summary`
- `GET /api/sessions/:sessionId/report`

Stored quiz records include:

- `id`
- `grade`
- `curriculum`
- `subject`
- `language`
- `question`
- `choices`
- `correctAnswer`
- `explanation`
- `status`
- `source`
- `createdAt`
- `updatedAt`
- `reviewedAt`

Curriculum map entries include:

- `curriculum`
- `grade`
- `subject`
- `strand`
- `topic`
- `learningOutcome`
- `difficultySuggestion`

Example draft generation request:

```bash
curl -X POST http://localhost:3000/api/quiz/generate-draft \
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
- Railway API variables: `PORT`, `CORS_ORIGIN`, `OPENAI_API_KEY`, `DATABASE_URL`
- Optional Railway API variable: `OPENAI_MODEL=gpt-4.1-mini`
- Do not set `OPENAI_API_KEY` on `apps/web`
- Example database variable reference in Railway: `${{Postgres.DATABASE_URL}}`
- Run `npm run db:migrate` in `apps/api` after PostgreSQL is connected

See [docs/deployment.md](docs/deployment.md) for details.

## Current Limitations

- Curriculum map is initial seed data only
- Current seed data covers selected Grade 2 to Grade 5 Math topics only
- If no curriculum map exists for a selection, the app uses a friendly fallback message and continues with generic quiz behavior
- AI draft generation depends on `OPENAI_API_KEY` being configured on the API service
- Student delivery falls back to hardcoded quiz data when no approved quiz matches
- If PostgreSQL is unavailable, review items fall back to temporary in-memory storage
- In-memory fallback data resets on deploy or service restart
- Anonymous sessions do not create student profiles or cross-device history
- Learning reports use rule-based logic only and do not use OpenAI
- No login or student accounts
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
