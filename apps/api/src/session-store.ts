import { getCurriculumMapItems } from "./curriculum";
import { getPrismaClient, isDatabaseConfigured } from "./prisma";
import type {
  CurriculumCode,
  GradeLevel,
  LanguageMode,
  LearningSessionReport,
  LearningSessionRecord,
  LearningSessionSummary,
  QuizAttemptRecord,
  SubjectCode,
} from "./types";

type SessionInput = {
  sessionId?: string;
  grade: GradeLevel;
  curriculum: CurriculumCode;
  subject: SubjectCode;
  language: LanguageMode;
  topic?: string;
  totalQuestions: number;
};

type AttemptInput = {
  sessionId: string;
  quizId: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanationShown: boolean;
};

const memorySessions: LearningSessionRecord[] = [];
const memoryAttempts: QuizAttemptRecord[] = [];

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

function mapSessionRecord(record: {
  id: string;
  sessionId: string;
  grade: string;
  curriculum: string;
  subject: string;
  language: string;
  topic: string | null;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  scorePercent: number;
  startedAt: Date;
  completedAt: Date | null;
}): LearningSessionRecord {
  return {
    id: record.id,
    sessionId: record.sessionId,
    grade: record.grade as GradeLevel,
    curriculum: record.curriculum as CurriculumCode,
    subject: record.subject as SubjectCode,
    language: record.language as LanguageMode,
    topic: record.topic,
    totalQuestions: record.totalQuestions,
    correctAnswers: record.correctAnswers,
    wrongAnswers: record.wrongAnswers,
    scorePercent: record.scorePercent,
    startedAt: record.startedAt.toISOString(),
    completedAt: record.completedAt?.toISOString() ?? null,
  };
}

function mapAttemptRecord(record: {
  id: string;
  sessionId: string;
  quizId: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanationShown: boolean;
  createdAt: Date;
}): QuizAttemptRecord {
  return {
    id: record.id,
    sessionId: record.sessionId,
    quizId: record.quizId,
    selectedAnswer: record.selectedAnswer,
    correctAnswer: record.correctAnswer,
    isCorrect: record.isCorrect,
    explanationShown: record.explanationShown,
    createdAt: record.createdAt.toISOString(),
  };
}

function buildRecommendedNextTopic(session: LearningSessionRecord): string {
  const mappedItems = getCurriculumMapItems({
    curriculum: session.curriculum,
    grade: session.grade,
    subject: session.subject,
  });

  if (mappedItems.length === 0) {
    return "Continue with another practice question in the same subject.";
  }

  if (session.scorePercent < 70 && session.topic) {
    return `Practice ${session.topic} again to strengthen this skill.`;
  }

  const nextItem = mappedItems.find((item) => item.topic !== session.topic);
  if (nextItem) {
    return `${nextItem.topic}: ${nextItem.learningOutcome}`;
  }

  if (session.topic) {
    return `Continue building confidence in ${session.topic}.`;
  }

  return `${mappedItems[0].topic}: ${mappedItems[0].learningOutcome}`;
}

function getTimeSpentSeconds(session: LearningSessionRecord) {
  const startedAt = new Date(session.startedAt).getTime();
  const completedAt = session.completedAt
    ? new Date(session.completedAt).getTime()
    : Date.now();

  return Math.max(0, Math.round((completedAt - startedAt) / 1000));
}

function buildStrongestArea(session: LearningSessionRecord) {
  if (session.scorePercent >= 80 && session.topic) {
    return session.topic;
  }

  if (session.scorePercent >= 80) {
    return `${session.subject} fundamentals`;
  }

  if (session.correctAnswers > 0 && session.topic) {
    return `Developing confidence in ${session.topic}`;
  }

  return `${session.subject} practice habits`;
}

function buildWeakestArea(session: LearningSessionRecord) {
  if (session.wrongAnswers === 0) {
    return session.topic ?? `${session.subject} review`;
  }

  if (session.topic) {
    return session.topic;
  }

  return `${session.subject} problem solving`;
}

function buildSessionNarrative(session: LearningSessionRecord) {
  if (session.scorePercent >= 80) {
    return {
      whatStudentDidWell:
        "The student answered most questions correctly and showed strong understanding during this practice session.",
      whatStudentShouldReview:
        session.topic
          ? `Review ${session.topic} with one or two extra examples to keep the skill strong.`
          : "Review one or two similar questions to keep this skill strong.",
      suggestedNextStep:
        "Move to the recommended next practice topic and keep the same steady pace.",
    };
  }

  if (session.scorePercent >= 50) {
    return {
      whatStudentDidWell:
        "The student showed partial understanding and was able to answer some questions correctly.",
      whatStudentShouldReview:
        session.topic
          ? `Review the key ideas in ${session.topic} and focus on the questions that were missed.`
          : "Review the key ideas from the missed questions and try similar examples again.",
      suggestedNextStep:
        "Practice the same topic once more, then move to the next recommended topic when accuracy improves.",
    };
  }

  return {
    whatStudentDidWell:
      "The student completed the practice session and collected useful feedback about current understanding.",
    whatStudentShouldReview:
      session.topic
        ? `Review ${session.topic} step by step with guided examples before starting another quiz.`
        : "Review the main concept with guided examples before starting another quiz.",
    suggestedNextStep:
      "Repeat practice on the current topic with support, then try a shorter follow-up quiz.",
  };
}

function buildLearningSessionReport(session: LearningSessionRecord): LearningSessionReport {
  const recommendedNextPracticeTopic = buildRecommendedNextTopic(session);
  const narrative = buildSessionNarrative(session);

  return {
    grade: session.grade,
    curriculum: session.curriculum,
    subject: session.subject,
    topic: session.topic ?? null,
    language: session.language,
    totalQuestions: session.totalQuestions,
    correctAnswers: session.correctAnswers,
    wrongAnswers: session.wrongAnswers,
    scorePercent: session.scorePercent,
    timeSpentSeconds: getTimeSpentSeconds(session),
    strongestArea: buildStrongestArea(session),
    weakestArea: buildWeakestArea(session),
    recommendedNextPracticeTopic,
    whatStudentDidWell: narrative.whatStudentDidWell,
    whatStudentShouldReview: narrative.whatStudentShouldReview,
    suggestedNextStep: narrative.suggestedNextStep,
  };
}

export async function startLearningSession(input: SessionInput): Promise<LearningSessionRecord> {
  if (!isDatabaseConfigured()) {
    const now = new Date().toISOString();
    const session: LearningSessionRecord = {
      id: crypto.randomUUID(),
      sessionId: input.sessionId ?? crypto.randomUUID(),
      grade: input.grade,
      curriculum: input.curriculum,
      subject: input.subject,
      language: input.language,
      topic: input.topic ?? null,
      totalQuestions: input.totalQuestions,
      correctAnswers: 0,
      wrongAnswers: 0,
      scorePercent: 0,
      startedAt: now,
      completedAt: null,
    };

    memorySessions.unshift(session);
    return session;
  }

  try {
    const prisma = getPrismaClient();
    const record = await prisma.learningSession.create({
      data: {
        sessionId: input.sessionId ?? crypto.randomUUID(),
        grade: input.grade,
        curriculum: input.curriculum,
        subject: input.subject,
        language: input.language,
        topic: input.topic,
        totalQuestions: input.totalQuestions,
      },
    });

    return mapSessionRecord(record);
  } catch (error) {
    logDatabaseFallback("learning_session_start_fallback", error);
    const now = new Date().toISOString();
    const session: LearningSessionRecord = {
      id: crypto.randomUUID(),
      sessionId: input.sessionId ?? crypto.randomUUID(),
      grade: input.grade,
      curriculum: input.curriculum,
      subject: input.subject,
      language: input.language,
      topic: input.topic ?? null,
      totalQuestions: input.totalQuestions,
      correctAnswers: 0,
      wrongAnswers: 0,
      scorePercent: 0,
      startedAt: now,
      completedAt: null,
    };

    memorySessions.unshift(session);
    return session;
  }
}

export async function recordQuizAttempt(input: AttemptInput): Promise<QuizAttemptRecord | null> {
  if (!isDatabaseConfigured()) {
    const session = memorySessions.find((item) => item.sessionId === input.sessionId);
    if (!session) {
      return null;
    }

    const attempt: QuizAttemptRecord = {
      id: crypto.randomUUID(),
      sessionId: input.sessionId,
      quizId: input.quizId,
      selectedAnswer: input.selectedAnswer,
      correctAnswer: input.correctAnswer,
      isCorrect: input.isCorrect,
      explanationShown: input.explanationShown,
      createdAt: new Date().toISOString(),
    };

    memoryAttempts.push(attempt);
    const attemptsForSession = memoryAttempts.filter((item) => item.sessionId === input.sessionId);
    const correctAnswers = attemptsForSession.filter((item) => item.isCorrect).length;
    const wrongAnswers = attemptsForSession.length - correctAnswers;

    session.correctAnswers = correctAnswers;
    session.wrongAnswers = wrongAnswers;
    session.scorePercent = attemptsForSession.length === 0
      ? 0
      : Math.round((correctAnswers / attemptsForSession.length) * 100);

    return attempt;
  }

  try {
    const prisma = getPrismaClient();
    const session = await prisma.learningSession.findUnique({
      where: { sessionId: input.sessionId },
    });

    if (!session) {
      return null;
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        sessionId: input.sessionId,
        quizId: input.quizId,
        selectedAnswer: input.selectedAnswer,
        correctAnswer: input.correctAnswer,
        isCorrect: input.isCorrect,
        explanationShown: input.explanationShown,
      },
    });

    const attempts = await prisma.quizAttempt.findMany({
      where: { sessionId: input.sessionId },
    });

    const correctAnswers = attempts.filter((item) => item.isCorrect).length;
    const wrongAnswers = attempts.length - correctAnswers;

    await prisma.learningSession.update({
      where: { sessionId: input.sessionId },
      data: {
        correctAnswers,
        wrongAnswers,
        scorePercent: attempts.length === 0 ? 0 : Math.round((correctAnswers / attempts.length) * 100),
      },
    });

    return mapAttemptRecord(attempt);
  } catch (error) {
    logDatabaseFallback("learning_session_attempt_fallback", error);
    const session = memorySessions.find((item) => item.sessionId === input.sessionId);
    if (!session) {
      return null;
    }

    const attempt: QuizAttemptRecord = {
      id: crypto.randomUUID(),
      sessionId: input.sessionId,
      quizId: input.quizId,
      selectedAnswer: input.selectedAnswer,
      correctAnswer: input.correctAnswer,
      isCorrect: input.isCorrect,
      explanationShown: input.explanationShown,
      createdAt: new Date().toISOString(),
    };

    memoryAttempts.push(attempt);
    const attemptsForSession = memoryAttempts.filter((item) => item.sessionId === input.sessionId);
    const correctAnswers = attemptsForSession.filter((item) => item.isCorrect).length;
    const wrongAnswers = attemptsForSession.length - correctAnswers;

    session.correctAnswers = correctAnswers;
    session.wrongAnswers = wrongAnswers;
    session.scorePercent = attemptsForSession.length === 0
      ? 0
      : Math.round((correctAnswers / attemptsForSession.length) * 100);

    return attempt;
  }
}

export async function completeLearningSession(sessionId: string): Promise<LearningSessionRecord | null> {
  if (!isDatabaseConfigured()) {
    const session = memorySessions.find((item) => item.sessionId === sessionId);
    if (!session) {
      return null;
    }

    session.completedAt = new Date().toISOString();
    return session;
  }

  try {
    const prisma = getPrismaClient();
    const record = await prisma.learningSession.update({
      where: { sessionId },
      data: { completedAt: new Date() },
    });

    return mapSessionRecord(record);
  } catch (error) {
    logDatabaseFallback("learning_session_complete_fallback", error);
    const session = memorySessions.find((item) => item.sessionId === sessionId);
    if (!session) {
      return null;
    }

    session.completedAt = new Date().toISOString();
    return session;
  }
}

export async function getLearningSessionSummary(
  sessionId: string,
): Promise<LearningSessionSummary | null> {
  if (!isDatabaseConfigured()) {
    const session = memorySessions.find((item) => item.sessionId === sessionId);
    if (!session) {
      return null;
    }

    const attempts = memoryAttempts.filter((item) => item.sessionId === sessionId);
    return {
      session,
      attempts,
      recommendedNextTopic: buildRecommendedNextTopic(session),
    };
  }

  try {
    const prisma = getPrismaClient();
    const session = await prisma.learningSession.findUnique({
      where: { sessionId },
    });

    if (!session) {
      return null;
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });

    const mappedSession = mapSessionRecord(session);

    return {
      session: mappedSession,
      attempts: attempts.map(mapAttemptRecord),
      recommendedNextTopic: buildRecommendedNextTopic(mappedSession),
    };
  } catch (error) {
    logDatabaseFallback("learning_session_summary_fallback", error);
    const session = memorySessions.find((item) => item.sessionId === sessionId);
    if (!session) {
      return null;
    }

    const attempts = memoryAttempts.filter((item) => item.sessionId === sessionId);
    return {
      session,
      attempts,
      recommendedNextTopic: buildRecommendedNextTopic(session),
    };
  }
}

export async function getLearningSessionReport(
  sessionId: string,
): Promise<LearningSessionReport | null> {
  const summary = await getLearningSessionSummary(sessionId);
  if (!summary) {
    return null;
  }

  return buildLearningSessionReport(summary.session);
}
