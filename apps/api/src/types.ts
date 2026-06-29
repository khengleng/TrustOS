export type CurriculumCode = "cambridge" | "moeys";

export type LanguageMode = "english" | "khmer" | "bilingual";

export type SubjectCode = "math" | "science" | "english" | "khmer";

export type DifficultyLevel = "easy" | "medium" | "hard";

export type QuizStatus = "draft" | "approved" | "rejected";

export type QuizSource = "hardcoded" | "ai" | "teacher";

export type GradeLevel =
  | "grade-1"
  | "grade-2"
  | "grade-3"
  | "grade-4"
  | "grade-5"
  | "grade-6"
  | "grade-7"
  | "grade-8"
  | "grade-9"
  | "grade-10"
  | "grade-11"
  | "grade-12";

export interface SampleQuizResponse {
  id: string;
  grade: GradeLevel;
  curriculum: CurriculumCode;
  subject: SubjectCode;
  language: LanguageMode;
  question: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
}

export interface GeneratedQuizResponse {
  id: string;
  grade: number;
  curriculum: string;
  subject: string;
  language: string;
  difficulty: string;
  question: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
}

export interface PersistedQuizRecord {
  id: string;
  grade: GradeLevel;
  curriculum: CurriculumCode;
  subject: SubjectCode;
  language: LanguageMode;
  difficulty: DifficultyLevel;
  topic?: string | null;
  question: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
  status: QuizStatus;
  source: QuizSource;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string | null;
}

export interface CurriculumMapItem {
  curriculum: CurriculumCode;
  grade: GradeLevel;
  subject: SubjectCode;
  strand: string;
  topic: string;
  learningOutcome: string;
  difficultySuggestion: DifficultyLevel;
}

export interface LearningSessionRecord {
  id: string;
  sessionId: string;
  grade: GradeLevel;
  curriculum: CurriculumCode;
  subject: SubjectCode;
  language: LanguageMode;
  topic?: string | null;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  scorePercent: number;
  startedAt: string;
  completedAt?: string | null;
}

export interface QuizAttemptRecord {
  id: string;
  sessionId: string;
  quizId: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanationShown: boolean;
  createdAt: string;
}

export interface LearningSessionSummary {
  session: LearningSessionRecord;
  attempts: QuizAttemptRecord[];
  recommendedNextTopic: string;
}

export interface LearningSessionReport {
  grade: GradeLevel;
  curriculum: CurriculumCode;
  subject: SubjectCode;
  topic?: string | null;
  language: LanguageMode;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  scorePercent: number;
  timeSpentSeconds: number;
  strongestArea: string;
  weakestArea: string;
  recommendedNextPracticeTopic: string;
  whatStudentDidWell: string;
  whatStudentShouldReview: string;
  suggestedNextStep: string;
}
