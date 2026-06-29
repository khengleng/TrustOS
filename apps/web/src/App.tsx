import { useEffect, useState } from "react";
import type {
  CurriculumCode,
  DifficultyLevel,
  GradeSelection,
  LanguageMode,
  QuizResponse,
  SubjectCode,
} from "./types";

function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:3000";
    }
  }

  return "https://trustos-learn-api-production.up.railway.app";
}

const apiBaseUrl = getApiBaseUrl();

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

const difficulties: Array<{ value: DifficultyLevel; label: string }> = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const labelMap: Record<CurriculumCode | LanguageMode | SubjectCode | DifficultyLevel, string> = {
  cambridge: "Cambridge",
  moeys: "Cambodia MoEYS",
  english: "English",
  khmer: "Khmer",
  bilingual: "Bilingual",
  math: "Math",
  science: "Science",
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

type Screen = "home" | "setup" | "practice";

function getAvailableSubjects(
  grade: GradeSelection,
  curriculum: CurriculumCode,
): Array<{ value: SubjectCode; label: string }> {
  if (curriculum === "cambridge") {
    return subjects.filter((option) => option.value !== "khmer");
  }

  if (grade === "grade-2" || grade === "grade-3") {
    return subjects.filter((option) => option.value !== "science");
  }

  return subjects;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [grade, setGrade] = useState<GradeSelection>("grade-6");
  const [curriculum, setCurriculum] = useState<CurriculumCode>("cambridge");
  const [subject, setSubject] = useState<SubjectCode>("math");
  const [language, setLanguage] = useState<LanguageMode>("english");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("medium");
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [score, setScore] = useState(0);

  const availableSubjects = getAvailableSubjects(grade, curriculum);
  const isCorrect = selectedAnswer === quiz?.correctAnswer;
  const answeredCount = Math.max(questionNumber - 1, 0) + (isSubmitted ? 1 : 0);

  useEffect(() => {
    if (!availableSubjects.some((option) => option.value === subject)) {
      setSubject(availableSubjects[0]?.value ?? "math");
    }
  }, [availableSubjects, subject]);

  function resetCurrentQuestion() {
    setQuiz(null);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setError(null);
  }

  function resetSession() {
    resetCurrentQuestion();
    setQuestionNumber(0);
    setCorrectCount(0);
    setScore(0);
  }

  function updateScore(nextCorrectCount: number, nextAnsweredCount: number) {
    if (nextAnsweredCount === 0) {
      setScore(0);
      return;
    }

    setScore(Math.round((nextCorrectCount / nextAnsweredCount) * 100));
  }

  async function fetchQuiz(nextQuestionNumber: number) {
    setIsLoading(true);
    setError(null);
    setSelectedAnswer(null);
    setIsSubmitted(false);

    try {
      const response = await fetch(`${apiBaseUrl}/api/quiz/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grade,
          curriculum,
          subject,
          language,
          difficulty,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = (await response.json()) as QuizResponse;
      setQuiz(data);
      setQuestionNumber(nextQuestionNumber);
      setScreen("practice");
    } catch (requestError) {
      setQuiz(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load the quiz right now.",
      );
      setScreen("practice");
    } finally {
      setIsLoading(false);
    }
  }

  function handleStartLearning() {
    resetSession();
    setScreen("setup");
  }

  function handleBackToHome() {
    resetSession();
    setScreen("home");
  }

  function handleStartQuiz() {
    resetSession();
    void fetchQuiz(1);
  }

  function handleSubmitAnswer() {
    if (!quiz || !selectedAnswer || isSubmitted) {
      return;
    }

    const nextAnsweredCount = answeredCount + 1;
    const nextCorrectCount = correctCount + (selectedAnswer === quiz.correctAnswer ? 1 : 0);
    setIsSubmitted(true);
    setCorrectCount(nextCorrectCount);
    updateScore(nextCorrectCount, nextAnsweredCount);
  }

  function handleNextQuestion() {
    if (!isSubmitted) {
      return;
    }

    void fetchQuiz(questionNumber + 1);
  }

  function renderHome() {
    return (
      <section className="hero hero-home">
        <div className="hero-copy">
          <p className="eyebrow">TrustOS Learn v0.1</p>
          <h1>Learn with simple, guided quiz practice.</h1>
          <p className="lead">
            A clean education experience for Grade 2 to Grade 12 with curriculum,
            subject, and language selection built around short, understandable quiz
            practice.
          </p>
          <div className="hero-actions">
            <button type="button" className="primary-button hero-button" onClick={handleStartLearning}>
              Start Learning
            </button>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-stat">
            <strong>Grades</strong>
            <span>2 to 12</span>
          </div>
          <div className="hero-stat">
            <strong>Curricula</strong>
            <span>Cambridge and Cambodia MoEYS</span>
          </div>
          <div className="hero-stat">
            <strong>Languages</strong>
            <span>English, Khmer, Bilingual</span>
          </div>
        </div>
      </section>
    );
  }

  function renderSetup() {
    return (
      <section className="workspace workspace-single">
        <article className="panel setup-panel">
          <div className="panel-header">
            <h2>Quiz Setup</h2>
            <p>Choose the learning path for this practice session.</p>
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
                {availableSubjects.map((option) => (
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

            <label className="field">
              <span>Difficulty</span>
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as DifficultyLevel)}
              >
                {difficulties.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mini-note">
            {language === "bilingual"
              ? "Bilingual mode displays Khmer and English together. Language changes presentation only."
              : "Language changes presentation only. Subject availability depends on grade and curriculum."}
          </div>

          <div className="selection-summary">
            <span>{grades.find((item) => item.value === grade)?.label}</span>
            <span>{labelMap[curriculum]}</span>
            <span>{labelMap[subject]}</span>
            <span>{labelMap[language]}</span>
            <span>{labelMap[difficulty]}</span>
          </div>

          <div className="actions actions-stack">
            <button type="button" className="secondary-button" onClick={handleBackToHome}>
              Back
            </button>
            <button type="button" className="primary-button" onClick={handleStartQuiz}>
              Start Quiz
            </button>
          </div>
        </article>
      </section>
    );
  }

  function renderPractice() {
    return (
      <section className="workspace">
        <article className="panel progress-panel">
          <div className="panel-header">
            <h2>Progress</h2>
            <p>Track how you are doing in this session.</p>
          </div>

          <div className="progress-grid">
            <div className="progress-card">
              <span>Question</span>
              <strong>{questionNumber || 1}</strong>
            </div>
            <div className="progress-card">
              <span>Correct</span>
              <strong>{correctCount}</strong>
            </div>
            <div className="progress-card">
              <span>Score</span>
              <strong>{score}%</strong>
            </div>
          </div>

          <div className="selection-summary">
            <span>{grades.find((item) => item.value === grade)?.label}</span>
            <span>{labelMap[curriculum]}</span>
            <span>{labelMap[subject]}</span>
            <span>{labelMap[language]}</span>
            <span>{labelMap[difficulty]}</span>
          </div>

          <div className="mini-note">
            {answeredCount === 0
              ? "Your score will update after you submit your first answer."
              : `You have answered ${answeredCount} question${answeredCount > 1 ? "s" : ""} so far.`}
          </div>

          <div className="actions actions-stack">
            <button type="button" className="secondary-button" onClick={() => setScreen("setup")}>
              Change Setup
            </button>
          </div>
        </article>

        <article className="panel question-panel">
          <div className="panel-header">
            <h2>Quiz Practice</h2>
            <p>Read the question, choose one answer, and learn from the explanation.</p>
          </div>

          {isLoading ? (
            <section className="feedback feedback-pending">
              <h4>Loading question...</h4>
              <p>Generating a quiz question for your selected learning setup.</p>
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
              <div className="question-stage">
                <span className="stage-badge">Question {questionNumber}</span>
                <p>
                  {isSubmitted
                    ? "Read the explanation, then continue to the next question."
                    : "Choose the best answer for this question."}
                </p>
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
                      disabled={isLoading || isSubmitted}
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
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer || isSubmitted}
                >
                  Submit Answer
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleNextQuestion}
                  disabled={!isSubmitted || isLoading}
                >
                  Next Question
                </button>
              </div>

              {isSubmitted ? (
                <section className={`feedback result-card ${isCorrect ? "feedback-correct" : "feedback-wrong"}`}>
                  <h4>{isCorrect ? "Correct" : "Wrong answer"}</h4>
                  <p>{quiz.explanation}</p>
                </section>
              ) : (
                <section className="feedback feedback-pending">
                  <h4>Choose one answer</h4>
                  <p>Select one answer and press “Submit Answer” to check your result.</p>
                </section>
              )}
            </>
          ) : !isLoading && !error ? (
            <section className="feedback feedback-pending">
              <h4>Loading your session</h4>
              <p>Preparing quiz practice based on your selected setup.</p>
            </section>
          ) : null}
        </article>
      </section>
    );
  }

  return (
    <main className="app-shell">
      {screen === "home" ? renderHome() : null}
      {screen === "setup" ? renderSetup() : null}
      {screen === "practice" ? renderPractice() : null}
    </main>
  );
}
