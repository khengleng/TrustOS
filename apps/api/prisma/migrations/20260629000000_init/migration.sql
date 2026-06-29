-- CreateEnum
CREATE TYPE "QuizStatus" AS ENUM ('DRAFT', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "QuizSource" AS ENUM ('HARDCODED', 'AI', 'TEACHER');

-- CreateTable
CREATE TABLE "QuizDraft" (
    "id" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "curriculum" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "topic" TEXT,
    "question" TEXT NOT NULL,
    "choices" JSONB NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "status" "QuizStatus" NOT NULL DEFAULT 'DRAFT',
    "source" "QuizSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "QuizDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovedQuiz" (
    "id" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "curriculum" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "topic" TEXT,
    "question" TEXT NOT NULL,
    "choices" JSONB NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "status" "QuizStatus" NOT NULL DEFAULT 'APPROVED',
    "source" "QuizSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "ApprovedQuiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RejectedQuiz" (
    "id" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "curriculum" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "topic" TEXT,
    "question" TEXT NOT NULL,
    "choices" JSONB NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "status" "QuizStatus" NOT NULL DEFAULT 'REJECTED',
    "source" "QuizSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "RejectedQuiz_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuizDraft_grade_curriculum_subject_language_idx" ON "QuizDraft"("grade", "curriculum", "subject", "language");

-- CreateIndex
CREATE INDEX "ApprovedQuiz_grade_curriculum_subject_language_idx" ON "ApprovedQuiz"("grade", "curriculum", "subject", "language");

-- CreateIndex
CREATE INDEX "RejectedQuiz_grade_curriculum_subject_language_idx" ON "RejectedQuiz"("grade", "curriculum", "subject", "language");
