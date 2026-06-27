export type CurriculumCode = "cambridge" | "moeys";

export type LanguageMode = "english" | "khmer" | "bilingual";

export type SubjectCode = "math" | "science" | "english" | "khmer";

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

export interface SubjectDescriptor {
  id: string;
  name: string;
  curriculum: CurriculumCode;
  grade: GradeLevel;
  language: LanguageMode;
}

export interface QuizDescriptor {
  id: string;
  title: string;
  subjectId: string;
  curriculum: CurriculumCode;
  grade: GradeLevel;
  language: LanguageMode;
  questionCount: number;
}

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
