import type { Prisma } from "@prisma/client";
import type {
  CurriculumCode,
  DifficultyLevel,
  GradeLevel,
  LanguageMode,
  PersistedQuizRecord,
  QuizSource,
  QuizStatus,
  SubjectCode,
} from "./types";
import { getPrismaClient, isDatabaseConfigured } from "./prisma";

type QuizSelection = {
  grade: GradeLevel;
  curriculum: CurriculumCode;
  subject: SubjectCode;
  language: LanguageMode;
};

type CreateQuizInput = {
  id?: string;
  grade: GradeLevel;
  curriculum: CurriculumCode;
  subject: SubjectCode;
  language: LanguageMode;
  difficulty: DifficultyLevel;
  topic?: string;
  question: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
  source: QuizSource;
};

type DatabaseQuizRecord = {
  id: string;
  grade: string;
  curriculum: string;
  subject: string;
  language: string;
  difficulty: string;
  topic: string | null;
  question: string;
  choices: unknown;
  correctAnswer: string;
  explanation: string;
  status: "DRAFT" | "APPROVED" | "REJECTED";
  source: "HARDCODED" | "AI" | "TEACHER";
  createdAt: Date;
  updatedAt: Date;
  reviewedAt: Date | null;
};

const prismaSourceMap: Record<QuizSource, DatabaseQuizRecord["source"]> = {
  hardcoded: "HARDCODED",
  ai: "AI",
  teacher: "TEACHER",
};

const statusMap: Record<DatabaseQuizRecord["status"], QuizStatus> = {
  DRAFT: "draft",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// Temporary fallback store used only when PostgreSQL is unavailable.
const memoryDrafts: PersistedQuizRecord[] = [];
const memoryApprovedQuizzes: PersistedQuizRecord[] = [];
const memoryRejectedQuizzes: PersistedQuizRecord[] = [];

function logDatabaseFallback(event: string, error: unknown) {
  console.log(
    JSON.stringify({
      level: "warn",
      event,
      message: error instanceof Error ? error.message : "Unknown database error",
      ts: new Date().toISOString(),
    }),
  );
}

function normalizeChoices(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function mapStoredQuiz(record: DatabaseQuizRecord): PersistedQuizRecord {
  return {
    id: record.id,
    grade: record.grade as GradeLevel,
    curriculum: record.curriculum as CurriculumCode,
    subject: record.subject as SubjectCode,
    language: record.language as LanguageMode,
    difficulty: record.difficulty as DifficultyLevel,
    topic: record.topic,
    question: record.question,
    choices: normalizeChoices(record.choices),
    correctAnswer: record.correctAnswer,
    explanation: record.explanation,
    status: statusMap[record.status],
    source: record.source.toLowerCase() as QuizSource,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    reviewedAt: record.reviewedAt?.toISOString() ?? null,
  };
}

function buildMemoryRecord(
  status: QuizStatus,
  input: CreateQuizInput,
): PersistedQuizRecord {
  const now = new Date().toISOString();

  return {
    id: input.id ?? crypto.randomUUID(),
    grade: input.grade,
    curriculum: input.curriculum,
    subject: input.subject,
    language: input.language,
    difficulty: input.difficulty,
    topic: input.topic ?? null,
    question: input.question,
    choices: [...input.choices],
    correctAnswer: input.correctAnswer,
    explanation: input.explanation,
    status,
    source: input.source,
    createdAt: now,
    updatedAt: now,
    reviewedAt: status === "draft" ? null : now,
  };
}

function toPrismaData(
  status: DatabaseQuizRecord["status"],
  input: CreateQuizInput,
) {
  return {
    id: input.id,
    grade: input.grade,
    curriculum: input.curriculum,
    subject: input.subject,
    language: input.language,
    difficulty: input.difficulty,
    topic: input.topic,
    question: input.question,
    choices: input.choices,
    correctAnswer: input.correctAnswer,
    explanation: input.explanation,
    status,
    source: prismaSourceMap[input.source],
    reviewedAt: status === "DRAFT" ? null : new Date(),
  };
}

function pickRandomQuiz(quizzes: PersistedQuizRecord[]) {
  if (quizzes.length === 0) {
    return null;
  }

  return quizzes[Math.floor(Math.random() * quizzes.length)];
}

function filterBySelection(quizzes: PersistedQuizRecord[], selection: QuizSelection) {
  return quizzes.filter(
    (quiz) =>
      quiz.grade === selection.grade &&
      quiz.curriculum === selection.curriculum &&
      quiz.subject === selection.subject &&
      quiz.language === selection.language,
  );
}

export async function createQuizDraft(input: CreateQuizInput): Promise<PersistedQuizRecord> {
  if (!isDatabaseConfigured()) {
    const record = buildMemoryRecord("draft", input);
    memoryDrafts.unshift(record);
    return record;
  }

  try {
    const prisma = getPrismaClient();
    const record = await prisma.quizDraft.create({
      data: toPrismaData("DRAFT", input),
    });

    return mapStoredQuiz(record);
  } catch (error) {
    logDatabaseFallback("quiz_draft_create_fallback", error);
    const record = buildMemoryRecord("draft", input);
    memoryDrafts.unshift(record);
    return record;
  }
}

export async function listQuizDrafts(): Promise<PersistedQuizRecord[]> {
  if (!isDatabaseConfigured()) {
    return [...memoryDrafts];
  }

  try {
    const prisma = getPrismaClient();
    const records = await prisma.quizDraft.findMany({
      orderBy: { createdAt: "desc" },
    });

    return records.map(mapStoredQuiz);
  } catch (error) {
    logDatabaseFallback("quiz_drafts_list_fallback", error);
    return [...memoryDrafts];
  }
}

export async function listApprovedQuizzes(): Promise<PersistedQuizRecord[]> {
  if (!isDatabaseConfigured()) {
    return [...memoryApprovedQuizzes];
  }

  try {
    const prisma = getPrismaClient();
    const records = await prisma.approvedQuiz.findMany({
      orderBy: { createdAt: "desc" },
    });

    return records.map(mapStoredQuiz);
  } catch (error) {
    logDatabaseFallback("approved_quizzes_list_fallback", error);
    return [...memoryApprovedQuizzes];
  }
}

export async function findApprovedQuizForSelection(
  selection: QuizSelection,
): Promise<PersistedQuizRecord | null> {
  if (!isDatabaseConfigured()) {
    return pickRandomQuiz(filterBySelection(memoryApprovedQuizzes, selection));
  }

  try {
    const prisma = getPrismaClient();
    const records = await prisma.approvedQuiz.findMany({
      where: {
        grade: selection.grade,
        curriculum: selection.curriculum,
        subject: selection.subject,
        language: selection.language,
      },
    });

    return pickRandomQuiz(records.map(mapStoredQuiz));
  } catch (error) {
    logDatabaseFallback("approved_quiz_match_fallback", error);
    return pickRandomQuiz(filterBySelection(memoryApprovedQuizzes, selection));
  }
}

export async function approveQuizDraft(id: string): Promise<PersistedQuizRecord | null> {
  if (!isDatabaseConfigured()) {
    const draftIndex = memoryDrafts.findIndex((record) => record.id === id);
    if (draftIndex === -1) {
      return null;
    }

    const draft = memoryDrafts.splice(draftIndex, 1)[0];
    const approved: PersistedQuizRecord = {
      ...draft,
      status: "approved",
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryApprovedQuizzes.unshift(approved);
    return approved;
  }

  try {
    const prisma = getPrismaClient();
    const approved = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const draft = await tx.quizDraft.findUnique({ where: { id } });
      if (!draft) {
        return null;
      }

      const approvedRecord = await tx.approvedQuiz.create({
        data: {
          id: draft.id,
          grade: draft.grade,
          curriculum: draft.curriculum,
          subject: draft.subject,
          language: draft.language,
          difficulty: draft.difficulty,
          topic: draft.topic,
          question: draft.question,
          choices: normalizeChoices(draft.choices),
          correctAnswer: draft.correctAnswer,
          explanation: draft.explanation,
          status: "APPROVED",
          source: draft.source,
          createdAt: draft.createdAt,
          reviewedAt: new Date(),
        },
      });

      await tx.quizDraft.delete({ where: { id } });
      return approvedRecord;
    });

    return approved ? mapStoredQuiz(approved) : null;
  } catch (error) {
    logDatabaseFallback("quiz_draft_approve_fallback", error);
    const draftIndex = memoryDrafts.findIndex((record) => record.id === id);
    if (draftIndex === -1) {
      return null;
    }

    const draft = memoryDrafts.splice(draftIndex, 1)[0];
    const approved: PersistedQuizRecord = {
      ...draft,
      status: "approved",
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryApprovedQuizzes.unshift(approved);
    return approved;
  }
}

export async function rejectQuizDraft(id: string): Promise<PersistedQuizRecord | null> {
  if (!isDatabaseConfigured()) {
    const draftIndex = memoryDrafts.findIndex((record) => record.id === id);
    if (draftIndex === -1) {
      return null;
    }

    const draft = memoryDrafts.splice(draftIndex, 1)[0];
    const rejected: PersistedQuizRecord = {
      ...draft,
      status: "rejected",
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryRejectedQuizzes.unshift(rejected);
    return rejected;
  }

  try {
    const prisma = getPrismaClient();
    const rejected = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const draft = await tx.quizDraft.findUnique({ where: { id } });
      if (!draft) {
        return null;
      }

      const rejectedRecord = await tx.rejectedQuiz.create({
        data: {
          id: draft.id,
          grade: draft.grade,
          curriculum: draft.curriculum,
          subject: draft.subject,
          language: draft.language,
          difficulty: draft.difficulty,
          topic: draft.topic,
          question: draft.question,
          choices: normalizeChoices(draft.choices),
          correctAnswer: draft.correctAnswer,
          explanation: draft.explanation,
          status: "REJECTED",
          source: draft.source,
          createdAt: draft.createdAt,
          reviewedAt: new Date(),
        },
      });

      await tx.quizDraft.delete({ where: { id } });
      return rejectedRecord;
    });

    return rejected ? mapStoredQuiz(rejected) : null;
  } catch (error) {
    logDatabaseFallback("quiz_draft_reject_fallback", error);
    const draftIndex = memoryDrafts.findIndex((record) => record.id === id);
    if (draftIndex === -1) {
      return null;
    }

    const draft = memoryDrafts.splice(draftIndex, 1)[0];
    const rejected: PersistedQuizRecord = {
      ...draft,
      status: "rejected",
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryRejectedQuizzes.unshift(rejected);
    return rejected;
  }
}
