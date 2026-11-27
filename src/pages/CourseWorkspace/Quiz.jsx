import { useEffect, useState } from "react";
import { CircleHelp, Lock } from "lucide-react";

import "./Quiz.css";

/* =========================================
   QUIZ DATA (TPIQ-57-C)

   Replace with the quizzes API response.
========================================= */

/* Quiz metadata and learner attempt summaries are loaded from Django/PostgreSQL. */

/* =========================================
   COMPONENT

   Props
   - modules:          course modules (for locks)
   - completedLessons: ids of completed lessons
   - onStartQuiz(quiz): opens the quiz-taking screen (TPIQ-74)
========================================= */

function Quiz({ modules, completedLessons, onStartQuiz, courseId, apiBaseUrl = "/api" }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadQuizzes() {
      if (!courseId) {
        setQuizzes([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError("");
      try {
        const response = await fetch(`${apiBaseUrl}/quizzes/?courseId=${encodeURIComponent(courseId)}`, {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error(`Quizzes could not be loaded (${response.status}).`);
        const payload = await response.json();
        const records = Array.isArray(payload) ? payload : (payload.results || []);
        if (!cancelled) setQuizzes(records);
      } catch (error) {
        if (!cancelled) setLoadError(error.message || "Unable to load quizzes.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadQuizzes();
    return () => { cancelled = true; };
  }, [courseId, apiBaseUrl]);

  // Locked until every lesson of the required module is complete.
  function isQuizLocked(quiz) {
    if (!quiz.lockedUntilModule) return false;

    const requiredModule = (modules || []).find(
      (module) => Number(module.id) === Number(quiz.lockedUntilModule)
    );

    if (!requiredModule) return true;

    return !requiredModule.lessons.every((lesson) =>
      completedLessons.includes(lesson.id)
    );
  }

  // Start quiz / Retake / Locked. Null once all attempts are used (AC 4).
  function getQuizAction(quiz, attempt) {
    if (isQuizLocked(quiz)) return "Locked";
    if (attempt.attemptsUsed === 0) return "Start quiz";
    if (attempt.attemptsUsed < quiz.attemptsAllowed) return "Retake";
    return null;
  }

  function getQuizStatus(quiz, attempt) {
    if (attempt.attemptsUsed === 0) return "Not attempted";
    return attempt.bestScore >= quiz.passMark ? "Passed" : "Failed";
  }

  /* ---------- EMPTY STATE (AC 6) ---------- */

  if (loading) {
    return <section className="cc-quiz-container"><p>Loading quizzes…</p></section>;
  }

  if (loadError) {
    return <section className="cc-quiz-container"><p role="alert">{loadError}</p><button type="button" onClick={() => window.location.reload()}>Try again</button></section>;
  }

  if (quizzes.length === 0) {
    return (
      <section className="cc-quiz-container">
        <div className="cc-quiz-empty">
          <div className="cc-quiz-empty-icon">
            <CircleHelp size={28} />
          </div>
          <h2>No quizzes for this course yet</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="cc-quiz-container">
      {quizzes.map((quiz, index) => {
        const attempt = {
          attemptsUsed: Number(quiz.attemptsUsed || 0),
          bestScore: quiz.bestScore == null ? null : Number(quiz.bestScore),
        };

        const locked = isQuizLocked(quiz);
        const attempted = attempt.attemptsUsed > 0;
        const action = getQuizAction(quiz, attempt);
        const status = getQuizStatus(quiz, attempt);

        return (
          <div className="cc-quiz-row" key={quiz.id}>
            {/* QUESTIONS, TIME LIMIT, PASS MARK, ATTEMPTS */}
            <div className="cc-quiz-info">
              <h3>
                Quiz {index + 1} · {quiz.title}
              </h3>

              <p>
                {quiz.questions} questions · {quiz.timeLimit} min · Pass mark{" "}
                {quiz.passMark}/{quiz.questions} · Attempts{" "}
                {attempt.attemptsUsed}/{quiz.attemptsAllowed}
              </p>

              {locked && (
                <span className="cc-quiz-lock-reason">
                  Unlocks when you complete Module {quiz.lockedUntilModule}
                </span>
              )}
            </div>

            {/* BEST SCORE + PASSED / FAILED, OR NOT ATTEMPTED */}
            <div
              className={`cc-quiz-result ${locked ? "cc-locked" : ""}`}
            >
              {locked ? (
                <>
                  <Lock size={16} />
                  <span>Locked</span>
                </>
              ) : attempted ? (
                <>
                  <strong>
                    {attempt.bestScore}/{quiz.questions}
                  </strong>

                  <span
                    className={
                      status === "Passed" ? "cc-quiz-passed" : "cc-quiz-failed"
                    }
                  >
                    Best score · {status}
                  </span>
                </>
              ) : (
                <span>Not attempted</span>
              )}
            </div>

            {/* START QUIZ / RETAKE / LOCKED */}
            <div className="cc-quiz-action">
              {action && (
                <button
                  type="button"
                  className={`cc-quiz-button ${
                    action === "Start quiz"
                      ? "cc-start-button"
                      : action === "Retake"
                        ? "cc-retake-button"
                        : "cc-locked-button"
                  }`}
                  disabled={locked}
                  onClick={() => onStartQuiz(quiz)}
                >
                  {action}
                </button>
              )}

              {!locked && attempted && action === null && (
                <span className="cc-attempts-exhausted">
                  No attempts remaining
                </span>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default Quiz;
