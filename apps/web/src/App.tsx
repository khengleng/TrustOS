import { useState } from "react";
import type {
  CurriculumCode,
  LanguageMode,
  SampleQuizResponse,
  SubjectCode,
} from "@trustos-learn/shared";

type GradeSelection =
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

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
).replace(/\/$/, "");

const grades: Array<{ value: GradeSelection; label: string }> = [
  { value: "grade-2", label: "Grade 2" },
  { value: "grade-3", label: "Grade 3" },
  { value: "grade-4", label: "Grade 4" },
  { value: "grade-5", label: "Grade 5" },
  { value: "grade-6", label: "Grade 6" },
  { value: "grade-7", label: "Grade 7" },
  { value: "grade-8", label: "Grade 8" },
  { value: "grade-9", label: "Grade 9" },
  { value: "grade-10", label: "Grade 10" },
  { value: "grade-11", label: "Grade 11" },
  { value: "grade-12", label: "Grade 12" },
];

const curricula: Array<{ value: CurriculumCode; label: string }> = [
  { value: "cambridge", label: "Cambridge" },
  { value: "moeys", label: "Cambodia MoEYS" },
];

const subjects: Array<{ value: SubjectCode; label: string }> = [
  { value: "math", label: "Math" },
  { value: "science", label: "Science" },
  { value: "english", label: "English" },
  { value: "khmer", label: "Khmer" },
];

const languages: Array<{ value: LanguageMode; label: string }> = [
  { value: "english", label: "English" },
  { value: "khmer", label: "Khmer" },
  { value: "bilingual", label: "Bilingual" },
];

const labelMap: Record<CurriculumCode | LanguageMode | SubjectCode, string> = {
  cambridge: "Cambridge",
  moeys: "Cambodia MoEYS",
  english: "English",
  khmer: "Khmer",
  bilingual: "Bilingual",
  math: "Math",
  science: "Science",
};

export default function App() {
  const [grade, setGrade] = useState<GradeSelection>("grade-6");
  const [curriculum, setCurriculum] = useState<CurriculumCode>("cambridge");
  const [subject, setSubject] = useState<SubjectCode>("math");
  const [language, setLanguage] = useState<LanguageMode>("english");
  const [quiz, setQuiz] = useState<SampleQuizResponse | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCorrect = selectedAnswer === quiz?.correctAnswer;

  function resetQuestionState() {
    setSelectedAnswer(null);
    setIsSubmitted(false);
  }

  async function fetchQuiz() {
    setIsLoading(true);
    setError(null);
    resetQuestionState();

    try {
      const query = new URLSearchParams({
        grade,
        curriculum,
        subject,
        language,
      });

      const response = await fetch(`${apiBaseUrl}/api/quiz/sample?${query.toString()}`);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = (await response.json()) as SampleQuizResponse;
      setQuiz(data);
    } catch (requestError) {
      setQuiz(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load the quiz right now.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleStartQuiz() {
    void fetchQuiz();
  }

  function handleNextQuestion() {
    void fetchQuiz();
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">TrustOS Learn MVP</p>
        <h1>Quiz Practice</h1>
        <p className="lead">
          Choose your learning path, start a quiz, answer one question, and learn
          from the explanation.
        </p>
      </section>

      <section className="workspace">
        <article className="panel controls-panel">
          <div className="panel-header">
            <h2>1. Choose Your Quiz</h2>
            <p>Select the grade, curriculum, subject, and language before starting.</p>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>Grade</span>
              <select value={grade} onChange={(event) => setGrade(event.target.value as GradeSelection)}>
                {grades.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Curriculum</span>
              <select
                value={curriculum}
                onChange={(event) => setCurriculum(event.target.value as CurriculumCode)}
              >
                {curricula.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Subject</span>
              <select value={subject} onChange={(event) => setSubject(event.target.value as SubjectCode)}>
                {subjects.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Language</span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value as LanguageMode)}
              >
                {languages.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="selection-summary">
            <span>{grades.find((item) => item.value === grade)?.label}</span>
            <span>{labelMap[curriculum]}</span>
            <span>{labelMap[subject]}</span>
            <span>{labelMap[language]}</span>
          </div>

          <div className="actions actions-stack">
            <button type="button" className="primary-button" onClick={handleStartQuiz} disabled={isLoading}>
              {isLoading ? "Loading..." : "Start Quiz"}
            </button>
          </div>
        </article>

        <article className="panel question-panel">
          <div className="panel-header">
            <h2>2. Practice Question</h2>
            <p>Questions are loaded from the API using the selected quiz settings.</p>
          </div>

          {!quiz && !isLoading && !error ? (
            <section className="feedback feedback-pending">
              <h4>Ready to begin</h4>
              <p>Click “Start Quiz” to load your first question.</p>
            </section>
          ) : null}

          {isLoading ? (
            <section className="feedback feedback-pending">
              <h4>Loading question...</h4>
              <p>Getting a quiz question from the TrustOS Learn API.</p>
            </section>
          ) : null}

          {error ? (
            <section className="feedback feedback-error">
              <h4>Unable to load quiz</h4>
              <p>{error}</p>
            </section>
          ) : null}

          {quiz ? (
            <>
              <div className="question-meta">
                <span>{grades.find((item) => item.value === grade)?.label}</span>
                <span>{labelMap[curriculum]}</span>
                <span>{labelMap[subject]}</span>
                <span>{labelMap[language]}</span>
              </div>

              <h3 className="question-prompt">{quiz.question}</h3>

              <div className="answers">
                {quiz.choices.map((choice, index) => {
                  const isPicked = selectedAnswer === choice;
                  const answerState =
                    isSubmitted && choice === quiz.correctAnswer
                      ? "correct"
                      : isSubmitted && isPicked
                        ? "wrong"
                        : isPicked
                          ? "selected"
                          : "idle";

                  return (
                    <button
                      key={`${quiz.id}-${choice}`}
                      type="button"
                      className={`answer answer-${answerState}`}
                      onClick={() => setSelectedAnswer(choice)}
                      disabled={isLoading}
                    >
                      <span className="answer-key">{String.fromCharCode(65 + index)}</span>
                      <span>{choice}</span>
                    </button>
                  );
                })}
              </div>

              <div className="actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => setIsSubmitted(true)}
                  disabled={!selectedAnswer || isSubmitted}
                >
                  Check Answer
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleNextQuestion}
                  disabled={isLoading}
                >
                  Next Question
                </button>
              </div>

              {isSubmitted ? (
                <section className={`feedback ${isCorrect ? "feedback-correct" : "feedback-wrong"}`}>
                  <h4>{isCorrect ? "Correct" : "Wrong answer"}</h4>
                  <p>{quiz.explanation}</p>
                </section>
              ) : (
                <section className="feedback feedback-pending">
                  <h4>Choose one answer</h4>
                  <p>Select the best answer, then click “Check Answer” to see the explanation.</p>
                </section>
              )}
            </>
          ) : null}
        </article>
      </section>
    </main>
  );
}
