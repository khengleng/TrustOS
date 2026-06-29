export type CurriculumCode = "cambridge" | "moeys";

export type LanguageMode = "english" | "khmer" | "bilingual";

export type SubjectCode = "math" | "science" | "english" | "khmer";

export type DifficultyLevel = "easy" | "medium" | "hard";

export type GradeSelection =
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

export interface QuizResponse {
  id: string;
  grade: string | number;
  curriculum: string;
  subject: string;
  language: string;
  difficulty?: string;
  question: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
}

export interface CurriculumMapItem {
  curriculum: CurriculumCode;
  grade: GradeSelection;
  subject: SubjectCode;
  strand: string;
  topic: string;
  learningOutcome: string;
  difficultySuggestion: DifficultyLevel;
}

export interface LearningSessionRecord {
  id: string;
  sessionId: string;
  grade: GradeSelection;
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

export interface LearningSessionSummary {
  session: LearningSessionRecord;
  attempts: Array<{
    id: string;
    sessionId: string;
    quizId: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanationShown: boolean;
    createdAt: string;
  }>;
  recommendedNextTopic: string;
}

export interface LearningSessionReport {
  grade: GradeSelection;
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
