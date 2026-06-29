import { useEffect, useState } from "react";
import type {
  CurriculumMapItem,
  CurriculumCode,
  DifficultyLevel,
  GradeSelection,
  LanguageMode,
  LearningSessionReport,
  LearningSessionSummary,
  QuizResponse,
  SubjectCode,
} from "./types";

const QUIZ_SESSION_STORAGE_KEY = "trustos-learn-session-id";
const TOTAL_QUESTIONS = 5;

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

function getStoredSessionId() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(QUIZ_SESSION_STORAGE_KEY);
}

function setStoredSessionId(sessionId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(QUIZ_SESSION_STORAGE_KEY, sessionId);
}

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

type Screen = "home" | "setup" | "practice" | "summary";

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
  const [curriculumItems, setCurriculumItems] = useState<CurriculumMapItem[]>([]);
  const [selectedCurriculumItemKey, setSelectedCurriculumItemKey] = useState("");
  const [isCurriculumLoading, setIsCurriculumLoading] = useState(false);
  const [curriculumMessage, setCurriculumMessage] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [score, setScore] = useState(0);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(getStoredSessionId());
  const [sessionSummary, setSessionSummary] = useState<LearningSessionSummary | null>(null);
  const [sessionReport, setSessionReport] = useState<LearningSessionReport | null>(null);

  const availableSubjects = getAvailableSubjects(grade, curriculum);
  const isCorrect = selectedAnswer === quiz?.correctAnswer;
  const answeredCount = Math.max(questionNumber - 1, 0) + (isSubmitted ? 1 : 0);
  const selectedCurriculumItem =
    curriculumItems.find(
      (item) => `${item.strand}::${item.topic}::${item.learningOutcome}` === selectedCurriculumItemKey,
    ) ?? null;

  useEffect(() => {
    if (!availableSubjects.some((option) => option.value === subject)) {
      setSubject(availableSubjects[0]?.value ?? "math");
    }
  }, [availableSubjects, subject]);

  useEffect(() => {
    if (selectedCurriculumItem) {
      setDifficulty(selectedCurriculumItem.difficultySuggestion);
    }
  }, [selectedCurriculumItem]);

  useEffect(() => {
    async function fetchCurriculumItems() {
      setIsCurriculumLoading(true);
      setCurriculumMessage(null);

      try {
        const query = new URLSearchParams({
          curriculum,
          grade,
          subject,
        });

        const response = await fetch(`${apiBaseUrl}/api/curriculum?${query.toString()}`);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = (await response.json()) as CurriculumMapItem[];
        setCurriculumItems(data);

        if (data.length === 0) {
          setSelectedCurriculumItemKey("");
          setCurriculumMessage(
            "Curriculum map seed data is not available for this selection yet. The quiz can still continue with a generic prompt or hardcoded fallback.",
          );
          return;
        }

        const firstKey = `${data[0].strand}::${data[0].topic}::${data[0].learningOutcome}`;
        setSelectedCurriculumItemKey((currentKey) =>
          data.some(
            (item) => `${item.strand}::${item.topic}::${item.learningOutcome}` === currentKey,
          )
            ? currentKey
            : firstKey,
        );
        setCurriculumMessage(null);
      } catch (requestError) {
        setCurriculumItems([]);
        setSelectedCurriculumItemKey("");
        setCurriculumMessage(
          requestError instanceof Error
            ? `Unable to load curriculum guidance right now. ${requestError.message}`
            : "Unable to load curriculum guidance right now.",
        );
      } finally {
        setIsCurriculumLoading(false);
      }
    }

    void fetchCurriculumItems();
  }, [curriculum, grade, subject]);

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
    setSessionSummary(null);
    setSessionReport(null);
  }

  function formatSeconds(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds} sec`;
    }

    return `${minutes} min ${remainingSeconds} sec`;
  }

  async function copyReport() {
    if (!sessionReport) {
      return;
    }

    const reportText = [
      "TrustOS Learn Report",
      `Grade: ${sessionReport.grade}`,
      `Curriculum: ${sessionReport.curriculum}`,
      `Subject: ${sessionReport.subject}`,
      `Topic: ${sessionReport.topic ?? "Generic practice"}`,
      `Language: ${sessionReport.language}`,
      `Total Questions: ${sessionReport.totalQuestions}`,
      `Correct Answers: ${sessionReport.correctAnswers}`,
      `Wrong Answers: ${sessionReport.wrongAnswers}`,
      `Score Percentage: ${sessionReport.scorePercent}%`,
      `Time Spent: ${formatSeconds(sessionReport.timeSpentSeconds)}`,
      `Strongest Area: ${sessionReport.strongestArea}`,
      `Weakest Area: ${sessionReport.weakestArea}`,
      `Recommended Next Practice Topic: ${sessionReport.recommendedNextPracticeTopic}`,
      `What the student did well: ${sessionReport.whatStudentDidWell}`,
      `What the student should review: ${sessionReport.whatStudentShouldReview}`,
      `Suggested next step: ${sessionReport.suggestedNextStep}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(reportText);
    } catch {
      // Copy is best-effort only.
    }
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
          topic: selectedCurriculumItem?.topic,
          learningOutcome: selectedCurriculumItem?.learningOutcome,
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

  async function handleStartQuiz() {
    resetSession();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/sessions/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: getStoredSessionId(),
          grade,
          curriculum,
          subject,
          language,
          difficulty,
          topic: selectedCurriculumItem?.topic,
          learningOutcome: selectedCurriculumItem?.learningOutcome,
          totalQuestions: TOTAL_QUESTIONS,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const session = (await response.json()) as { sessionId: string };
      setActiveSessionId(session.sessionId);
      setStoredSessionId(session.sessionId);
      await fetchQuiz(1);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to start the learning session right now.",
      );
      setScreen("practice");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!quiz || !selectedAnswer || isSubmitted) {
      return;
    }

    const nextAnsweredCount = answeredCount + 1;
    const nextCorrectCount = correctCount + (selectedAnswer === quiz.correctAnswer ? 1 : 0);
    setIsSubmitted(true);
    setCorrectCount(nextCorrectCount);
    updateScore(nextCorrectCount, nextAnsweredCount);

    if (!activeSessionId) {
      return;
    }

    try {
      await fetch(`${apiBaseUrl}/api/sessions/${activeSessionId}/attempt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId: quiz.id,
          selectedAnswer,
          correctAnswer: quiz.correctAnswer,
          isCorrect: selectedAnswer === quiz.correctAnswer,
          explanationShown: true,
        }),
      });
    } catch {
      // Best-effort tracking for anonymous sessions.
    }
  }

  async function handleNextQuestion() {
    if (!isSubmitted) {
      return;
    }

    if (questionNumber >= TOTAL_QUESTIONS && activeSessionId) {
      try {
        await fetch(`${apiBaseUrl}/api/sessions/${activeSessionId}/complete`, {
          method: "POST",
        });

        const summaryResponse = await fetch(`${apiBaseUrl}/api/sessions/${activeSessionId}/summary`);
        if (!summaryResponse.ok) {
          throw new Error(`Request failed with status ${summaryResponse.status}`);
        }

        const summary = (await summaryResponse.json()) as LearningSessionSummary;
        const reportResponse = await fetch(`${apiBaseUrl}/api/sessions/${activeSessionId}/report`);
        if (!reportResponse.ok) {
          throw new Error(`Request failed with status ${reportResponse.status}`);
        }

        const report = (await reportResponse.json()) as LearningSessionReport;
        setSessionSummary(summary);
        setSessionReport(report);
        setScreen("summary");
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load the session summary right now.",
        );
      }
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

            <label className="field">
              <span>Topic / Learning Outcome</span>
              <select
                value={selectedCurriculumItemKey}
                onChange={(event) => setSelectedCurriculumItemKey(event.target.value)}
                disabled={isCurriculumLoading || curriculumItems.length === 0}
              >
                {curriculumItems.length === 0 ? (
                  <option value="">
                    {isCurriculumLoading ? "Loading curriculum map..." : "No seeded curriculum map yet"}
                  </option>
                ) : null}
                {curriculumItems.map((item) => {
                  const itemKey = `${item.strand}::${item.topic}::${item.learningOutcome}`;
                  return (
                    <option key={itemKey} value={itemKey}>
                      {item.topic} - {item.learningOutcome}
                    </option>
                  );
                })}
              </select>
            </label>
          </div>

          <div className="mini-note">
            {curriculumMessage
              ? curriculumMessage
              : language === "bilingual"
                ? "Bilingual mode displays Khmer and English together. Language changes presentation only."
                : "Language changes presentation only. Subject availability depends on grade and curriculum."}
          </div>

          {selectedCurriculumItem ? (
            <div className="mini-note">
              <strong>{selectedCurriculumItem.strand}</strong>
              <br />
              {selectedCurriculumItem.learningOutcome}
            </div>
          ) : null}

          <div className="selection-summary">
            <span>{grades.find((item) => item.value === grade)?.label}</span>
            <span>{labelMap[curriculum]}</span>
            <span>{labelMap[subject]}</span>
            <span>{labelMap[language]}</span>
            <span>{labelMap[difficulty]}</span>
            {selectedCurriculumItem ? <span>{selectedCurriculumItem.topic}</span> : null}
          </div>

          <div className="actions actions-stack">
            <button type="button" className="secondary-button" onClick={handleBackToHome}>
              Back
            </button>
            <button type="button" className="primary-button" onClick={() => void handleStartQuiz()}>
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
              <strong>{questionNumber || 1} / {TOTAL_QUESTIONS}</strong>
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
            {selectedCurriculumItem ? <span>{selectedCurriculumItem.topic}</span> : null}
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
                  onClick={() => void handleSubmitAnswer()}
                  disabled={!selectedAnswer || isSubmitted}
                >
                  Submit Answer
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => void handleNextQuestion()}
                  disabled={!isSubmitted || isLoading}
                >
                  {questionNumber >= TOTAL_QUESTIONS ? "Finish Quiz" : "Next Question"}
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

  function renderSummary() {
    return (
      <section className="workspace workspace-single report-screen">
        <article className="panel setup-panel report-panel">
          <div className="panel-header">
            <h2>Learning Report</h2>
            <p>Your learning session is stored anonymously on this device and in the API only.</p>
          </div>

          {sessionSummary && sessionReport ? (
            <>
              <div className="progress-grid">
                <div className="progress-card">
                  <span>Grade</span>
                  <strong>{sessionReport.grade}</strong>
                </div>
                <div className="progress-card">
                  <span>Curriculum</span>
                  <strong>{sessionReport.curriculum}</strong>
                </div>
                <div className="progress-card">
                  <span>Subject</span>
                  <strong>{sessionReport.subject}</strong>
                </div>
                <div className="progress-card">
                  <span>Topic</span>
                  <strong>{sessionReport.topic ?? "Generic practice"}</strong>
                </div>
              </div>

              <div className="report-grid">
                <div className="report-card">
                  <span>Language</span>
                  <strong>{sessionReport.language}</strong>
                </div>
                <div className="report-card">
                  <span>Total Questions</span>
                  <strong>{sessionReport.totalQuestions}</strong>
                </div>
                <div className="report-card">
                  <span>Correct Answers</span>
                  <strong>{sessionReport.correctAnswers}</strong>
                </div>
                <div className="report-card">
                  <span>Wrong Answers</span>
                  <strong>{sessionReport.wrongAnswers}</strong>
                </div>
                <div className="report-card">
                  <span>Score Percentage</span>
                  <strong>{sessionReport.scorePercent}%</strong>
                </div>
                <div className="report-card">
                  <span>Time Spent</span>
                  <strong>{formatSeconds(sessionReport.timeSpentSeconds)}</strong>
                </div>
              </div>

              <div className="report-grid report-grid-secondary">
                <div className="report-card">
                  <span>Strongest Area</span>
                  <strong>{sessionReport.strongestArea}</strong>
                </div>
                <div className="report-card">
                  <span>Weakest Area</span>
                  <strong>{sessionReport.weakestArea}</strong>
                </div>
                <div className="report-card report-card-wide">
                  <span>Recommended Next Practice Topic</span>
                  <strong>{sessionReport.recommendedNextPracticeTopic}</strong>
                </div>
              </div>

              <div className="mini-note report-note">
                <strong>What the student did well</strong>
                <br />
                {sessionReport.whatStudentDidWell}
              </div>

              <div className="mini-note report-note">
                <strong>What the student should review</strong>
                <br />
                {sessionReport.whatStudentShouldReview}
              </div>

              <div className="mini-note report-note">
                <strong>Suggested next step</strong>
                <br />
                {sessionReport.suggestedNextStep}
              </div>
            </>
          ) : (
            <section className="feedback feedback-pending">
              <h4>Summary unavailable</h4>
              <p>We could not load the summary for this anonymous session.</p>
            </section>
          )}

          <div className="actions actions-stack">
            <button type="button" className="secondary-button print-hidden" onClick={() => void copyReport()}>
              Copy Report
            </button>
            <button type="button" className="secondary-button print-hidden" onClick={() => window.print()}>
              Print Report
            </button>
            <button type="button" className="secondary-button" onClick={handleBackToHome}>
              Back Home
            </button>
            <button type="button" className="primary-button" onClick={() => setScreen("setup")}>
              Start New Practice
            </button>
          </div>
        </article>
      </section>
    );
  }

  return (
    <main className="app-shell">
      {screen === "home" ? renderHome() : null}
      {screen === "setup" ? renderSetup() : null}
      {screen === "practice" ? renderPractice() : null}
      {screen === "summary" ? renderSummary() : null}
    </main>
  );
}
