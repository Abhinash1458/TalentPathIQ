import { useEffect, useState } from "react";
import {
  ChevronDown,
  Check,
  Play,
  FileText,
  Menu,
  X,
} from "lucide-react";
import "./coursecontent.css";
import Submission from "./Submission.jsx";
import Quiz from "./Quiz.jsx";
import "../../sidebar.css";
import logoMark from "../../assets/talentpath-logo.png";
import { getCourseSymbol, formatDate } from "../../utils/courseMeta.js";

const modules = [
  {
    id: 1,
    title: "Introduction to REST",
    lessons: [
      { id: "1.1", title: "What is an API?", duration: "8 min" },
      { id: "1.2", title: "Understanding REST", duration: "12 min" },
    ],
  },
  {
    id: 2,
    title: "HTTP methods",
    lessons: [
      { id: "2.1", title: "Introduction to HTTP", duration: "10 min" },
      { id: "2.2", title: "GET and POST methods", duration: "14 min" },
    ],
  },
  {
    id: 3,
    title: "Status codes",
    lessons: [
      { id: "3.1", title: "Status code families", duration: "8 min" },
      { id: "3.2", title: "Status codes in practice", duration: "12 min" },
      {
        id: "3.3",
        title: "Status code cheat sheet",
        duration: "PDF",
        type: "pdf",
      },
    ],
  },
  {
    id: 4,
    title: "Resources and URIs",
    lessons: [
      { id: "4.1", title: "Understanding resources", duration: "10 min" },
    ],
  },
  {
    id: 5,
    title: "API basics wrap-up",
    lessons: [
      { id: "5.1", title: "REST API knowledge check", duration: "10 min" },
    ],
  },
];
const allLessons = modules.flatMap((module) =>
  module.lessons.map((lesson) => ({
    ...lesson,
    moduleId: module.id,
    moduleTitle: module.title,
  }))
);

// The workspace can be opened from My Learning (an enrolment row with `name` /
// `track`), from the catalogue (a course with `title` / `category`) or directly
// by URL (#course-content/<id>), so accept every shape and resolve the rest from
// the API instead of falling back to a default course.
function readCourseIdFromLocation() {
  const hashMatch = window.location.hash.match(/^#course-content\/(\d+)/);
  if (hashMatch) return Number(hashMatch[1]);
  const queryId = new URLSearchParams(window.location.search).get("courseId");
  return queryId && /^\d+$/.test(queryId) ? Number(queryId) : null;
}

function readWorkspaceTabFromLocation() {
  const match = window.location.hash.match(/^#course-content\/\d+\/(content|submission|quiz)\/?$/);
  return match?.[1] || "content";
}

function normalizeWorkspaceCourse(record) {
  if (!record) return null;
  const title = record.title ?? record.name;
  if (!title) return null;
  return {
    id: Number(record.courseId ?? record.id) || null,
    title,
    category: record.category ?? record.track ?? "",
    level: record.level ?? "",
    description: record.description ?? "",
    duration: record.duration ?? "",
  };
}

function CourseContent({ course = null, apiBaseUrl = "/api" }) {
  useEffect(() => {
    const navigationEntry = performance.getEntriesByType("navigation")[0];
    const isPageRefresh = navigationEntry?.type === "reload";
    const isCourseWorkspace =
      window.location.pathname === "/course-content.html";
    const hasCatalogueHash = window.location.hash === "#catalogue";

    if (isPageRefresh && isCourseWorkspace && hasCatalogueHash) {
      window.location.replace("/course-content.html");
    }
  }, []);

  const [selectedLessonId, setSelectedLessonId] = useState(course?.lastLessonId || "1.1");
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progressSaving, setProgressSaving] = useState(false);
  const courseId = Number(course?.courseId ?? course?.id) || readCourseIdFromLocation();

  // Course details come from the API: seeded from whatever the previous page
  // passed, then confirmed/overwritten by GET /courses/<id>/.
  const [courseInfo, setCourseInfo] = useState(() => normalizeWorkspaceCourse(course));
  const [enrolment, setEnrolment] = useState(null);
  const [loadState, setLoadState] = useState(courseId ? "loading" : "missing");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const passed = normalizeWorkspaceCourse(course);
    if (passed) setCourseInfo(passed);
  }, [course]);

  useEffect(() => {
    if (!courseId) {
      setLoadState("missing");
      return undefined;
    }
    let cancelled = false;
    async function loadWorkspace() {
      setLoadState((state) => (state === "ready" ? state : "loading"));
      const [courseResult, enrolmentResult] = await Promise.allSettled([
        fetch(`${apiBaseUrl}/courses/${courseId}/`, { headers: { Accept: "application/json" } }),
        fetch(`${apiBaseUrl}/enrolments/`, { headers: { Accept: "application/json" } }),
      ]);
      if (cancelled) return;

      let record = null;
      if (enrolmentResult.status === "fulfilled" && enrolmentResult.value.ok) {
        try {
          const payload = await enrolmentResult.value.json();
          const records = Array.isArray(payload) ? payload : (payload.results || []);
          record = records.find((item) => Number(item.courseId ?? item.course_id) === courseId) || null;
        } catch (error) {
          console.warn("Unable to read enrolments", error);
        }
      }
      if (cancelled) return;

      let details = null;
      const notFound = courseResult.status === "fulfilled" && courseResult.value.status === 404;
      if (courseResult.status === "fulfilled" && courseResult.value.ok) {
        try {
          details = normalizeWorkspaceCourse(await courseResult.value.json());
        } catch (error) {
          console.warn("Unable to read course details", error);
        }
      }
      if (cancelled) return;

      // The enrolment embeds the course, so it is a valid fallback source.
      const resolved = details || normalizeWorkspaceCourse(record?.course);
      if (resolved) {
        setCourseInfo({ ...resolved, id: courseId });
        setLoadState("ready");
      } else {
        setLoadState(notFound ? "notfound" : "error");
      }

      if (record) {
        setEnrolment(record);
        const completed = record.completedLessonIds || record.completed_lesson_ids || [];
        setCompletedLessons(completed);
        const lastLesson = record.lastLessonId || record.last_lesson_id;
        if (lastLesson && allLessons.some((lesson) => lesson.id === lastLesson)) {
          setSelectedLessonId(lastLesson);
          const active = allLessons.find((lesson) => lesson.id === lastLesson);
          setActiveModule(active.moduleId);
          setExpandedModules((current) => current.includes(active.moduleId) ? current : [...current, active.moduleId]);
        }
      }
    }
    loadWorkspace();
    return () => { cancelled = true; };
  }, [apiBaseUrl, courseId, reloadKey]);

  async function saveProgress(lessonId, completedIds) {
    if (!courseId) return;
    setProgressSaving(true);
    try {
      const response = await fetch(`${apiBaseUrl}/enrolments/progress/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ courseId, lessonId, completedLessonIds: completedIds }),
      });
      if (!response.ok) throw new Error(`Progress save failed (${response.status})`);
    } catch (error) {
      console.error("Unable to save lesson progress", error);
    } finally {
      setProgressSaving(false);
    }
  }
  // Start quiz / Retake. Replace the alert with navigation to the
  // quiz-taking screen when TPIQ-74 is built.
  function handleStartQuiz(quiz) {
    window.alert(
      `You are being directed to the quiz-taking page for "${quiz.title}".\n\nThe quiz-taking functionality (TPIQ-74) is coming soon!`
    );
  }

  const [expandedModules, setExpandedModules] = useState([1]);
  // Keep the selected workspace tab in the URL so refresh and browser
  // Back/Forward restore the same tab and course.
  const [activeTab, setActiveTab] = useState(readWorkspaceTabFromLocation);

  useEffect(() => {
    function syncWorkspaceTabFromUrl() {
      setActiveTab(readWorkspaceTabFromLocation());
    }
    window.addEventListener("hashchange", syncWorkspaceTabFromUrl);
    return () => window.removeEventListener("hashchange", syncWorkspaceTabFromUrl);
  }, []);

  function selectWorkspaceTab(tab) {
    setActiveTab(tab);
    if (courseId) {
      const nextHash = `#course-content/${courseId}/${tab}`;
      if (window.location.hash !== nextHash) {
        window.location.hash = nextHash;
      }
    }
  }
  const [activeModule, setActiveModule] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    document.title = courseInfo?.title
      ? `${courseInfo.title} | TalentPath IQ`
      : "Course workspace | TalentPath IQ";
  }, [courseInfo?.title]);

  const courseTitle = courseInfo?.title || "";
  const enrolledOn = formatDate(enrolment?.enrolledAt ?? enrolment?.enrolled_at);

  const selectedLesson =
    allLessons.find((lesson) => lesson.id === selectedLessonId) ||
    allLessons[0];
  const selectedIndex = allLessons.findIndex(
    (lesson) => lesson.id === selectedLessonId
  );
  const totalLessons = allLessons.length;
  const completedCount = completedLessons.length;
  const progress =
    totalLessons === 0
      ? 0
      : Math.round((completedCount / totalLessons) * 100);

  function toggleModule(moduleId) {
    setActiveModule(moduleId);

    const clickedModule = modules.find(
      (module) => module.id === moduleId
    );

    if (clickedModule && clickedModule.lessons.length > 0) {
      setSelectedLessonId(clickedModule.lessons[0].id);
      selectWorkspaceTab("content");
    }
    setExpandedModules((current) =>
      current.includes(moduleId)
        ? current.filter((id) => id !== moduleId)
        : [...current, moduleId]
    );
  }

  function selectLesson(lesson) {
    setSelectedLessonId(lesson.id);
    saveProgress(lesson.id, completedLessons);
    setActiveModule(lesson.moduleId);
    selectWorkspaceTab("content");

    setExpandedModules((current) =>
      current.includes(lesson.moduleId)
        ? current
        : [...current, lesson.moduleId]
    );
  }

  function toggleComplete() {
    const next = completedLessons.includes(selectedLessonId)
      ? completedLessons.filter((id) => id !== selectedLessonId)
      : [...completedLessons, selectedLessonId];
    setCompletedLessons(next);
    saveProgress(selectedLessonId, next);
  }

  function completeWatchedVideo() {
    if (completedLessons.includes(selectedLessonId)) return;
    const next = [...completedLessons, selectedLessonId];
    setCompletedLessons(next);
    saveProgress(selectedLessonId, next);
  }

  function goToLesson(direction) {
    const nextIndex = selectedIndex + direction;

    if (nextIndex >= 0 && nextIndex < allLessons.length) {
      selectLesson(allLessons[nextIndex]);
    }
  }

  return (
    <div className="cc-page">
      <div
        className={`cc-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="cc-app-layout">
        {/* SIDEBAR */}
        <aside className={`cc-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="cc-brand">
            <img src={logoMark} alt="TalentPath IQ" />
            <span className="wordmark">
              <span>TalentPath</span>
              <b>IQ</b>
            </span>
            <button
              className="cc-close-sidebar"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="cc-primary-nav">
            <a className="cc-nav-link active" href="#trainings">
              <span className="nav-icon">
                <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m2 10 10-5 10 5-10 5-10-5Z" />
                  <path d="M6 12v5c3.5 2.5 8.5 2.5 12 0v-5" />
                  <path d="M22 10v6" />
                </svg>
              </span>
              <span>Trainings</span>
            </a>
          </nav>

          {/* MY ACCOUNT */}
          <div className="cc-sidebar-bottom">
            <a href="#account" className="cc-account-link">
              <span className="cc-avatar">MY</span>
              <span className="cc-account-text">My Account</span>
              <span className="account-chevron">›</span>
            </a>

            <div className="cc-sidebar-copyright">
              © 2026 TalentPath IQ
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="cc-main">
          <header className="cc-topbar">
            <button
              className="cc-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div className="cc-breadcrumb">
              <a href="#trainings">HOME</a>
              <span>/</span>
              <a href="#trainings">TRAININGS</a>
              <span>/</span>
              <a href="#catalogue">COURSES</a>
              <span>/</span>
              <a href="#my-learning">MY LEARNING</a>
              <span>/</span>
              <strong>{courseTitle || (loadState === "loading" ? "Loading course…" : "Course unavailable")}</strong>
            </div>

            <a href="#my-learning" className="cc-back-learning">
              ← Back to My Learning
            </a>
          </header>

          <div className="cc-workspace">
            {/* COURSE SUMMARY */}
            <section className="cc-course-summary" aria-busy={loadState === "loading" && !courseInfo}>
              <div className="cc-course-summary-left">
                {courseInfo ? (
                  <div className="cc-course-symbol" aria-hidden="true">
                    {getCourseSymbol(courseInfo)}
                  </div>
                ) : (
                  <div className="cc-course-symbol cc-skeleton" aria-hidden="true" />
                )}

                <div className="cc-course-heading">
                  {courseInfo ? (
                    <>
                      <div className="cc-course-category">
                        {[courseInfo.category, courseInfo.level].filter(Boolean).join(" · ")}
                      </div>
                      <h1>{courseInfo.title}</h1>
                      {enrolledOn ? <p>Enrolled {enrolledOn}</p> : courseInfo.duration ? <p>{courseInfo.duration}</p> : null}
                    </>
                  ) : loadState === "loading" ? (
                    <>
                      <div className="cc-skeleton cc-skeleton-line short" />
                      <div className="cc-skeleton cc-skeleton-line" />
                    </>
                  ) : (
                    <div role="alert">
                      <h1>We couldn’t load this course</h1>
                      <p>
                        {loadState === "missing"
                          ? "No course was selected. Open a course from My Learning."
                          : loadState === "notfound"
                            ? "This course isn’t available. Go back to My Learning and choose another course."
                            : "Check your connection and try again."}
                      </p>
                      {loadState === "error" && (
                        <button
                          type="button"
                          className="cc-retry-button"
                          onClick={() => setReloadKey((key) => key + 1)}
                        >
                          Try again
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {courseInfo && (
                <div className="cc-summary-progress">
                  <div className="cc-summary-progress-text">
                    <strong>Course progress</strong>
                    <span>
                      {progress}% · {completedCount} of {totalLessons} lessons
                    </span>
                  </div>

                  <div className="cc-progress-bar">
                    <div
                      className="cc-progress-value"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </section>

            {courseInfo && (
            <>
            {/* TABS */}
            <div className="cc-tabs">
              <button
                className={activeTab === "content" ? "selected" : ""}
                onClick={() => selectWorkspaceTab("content")}
              >
                Content
              </button>

              <button
                className={activeTab === "submission" ? "selected" : ""}
                onClick={() => selectWorkspaceTab("submission")}
              >
                Submission
                {dueCount > 0 && (
                  <span className="cc-due-badge">{dueCount} due</span>
                )}
              </button>

              <button
                className={activeTab === "quiz" ? "selected" : ""}
                onClick={() => selectWorkspaceTab("quiz")}
              >
                Quiz
              </button>
            </div>

            {/* CONTENT TAB */}
            {activeTab === "content" && (
              <section className="cc-content-layout">
                {/* MODULE LIST */}
                <div className="cc-module-panel">
                  {modules.map((module) => {
                    const expanded = expandedModules.includes(module.id);
                    const moduleCompletedCount =
                      module.lessons.filter((lesson) =>
                        completedLessons.includes(lesson.id)
                      ).length;
                    const moduleComplete =
                      moduleCompletedCount === module.lessons.length;
                    const isActive = activeModule === module.id;
                    return (
                      <div className="cc-module-group" key={module.id}>
                        <button
                          className="cc-module-row"
                          onClick={() => toggleModule(module.id)}
                          aria-expanded={expanded}
                        >
                          <span
                            className={`cc-module-number ${
                              isActive
                                ? "current"
                                : moduleComplete
                                  ? "complete"
                                  : ""
                            }`}
                          >
                            {isActive ? (
                              module.id
                            ) : moduleComplete ? (
                              <Check size={17} />
                            ) : (
                              module.id
                            )}
                          </span>

                          <span className="cc-module-name">
                            {module.id}. {module.title}
                          </span>

                          <span className="cc-module-progress">
                            {moduleCompletedCount}/{module.lessons.length}
                          </span>

                          <ChevronDown
                            size={16}
                            className={expanded ? "rotated" : ""}
                          />
                        </button>

                        {/* LESSON LIST */}
                        {expanded && (
                          <div className="cc-lesson-list">
                            {module.lessons.map((lesson) => {
                              const active =
                                selectedLessonId === lesson.id;

                              const completed =
                                completedLessons.includes(lesson.id);
                              return (
                                <button
                                  key={lesson.id}
                                  className={`cc-lesson-row ${
                                    active ? "active" : ""
                                  }`}
                                  onClick={() =>
                                    selectLesson({
                                      ...lesson,
                                      moduleId: module.id,
                                    })
                                  }
                                >
                                  <span className="cc-lesson-leading">
                                    {completed ? (
                                      <Check size={15} />
                                    ) : lesson.type === "pdf" ? (
                                      <FileText size={15} />
                                    ) : (
                                      <Play
                                        size={13}
                                        fill={active ? "currentColor" : "none"}
                                      />
                                    )}
                                  </span>

                                  <span className="cc-lesson-title">
                                    {lesson.id} {lesson.title}
                                  </span>

                                  <span className="cc-lesson-time">
                                    {lesson.duration}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* LESSON PANEL */}
                <div className="cc-lesson-panel">
                  {/* VIDEO PLAYER */}
                  <div className="cc-video-player">
                    <video
                      className="cc-video"
                      controls
                      playsInline
                      preload="metadata"
                      onPlay={() => saveProgress(selectedLessonId, completedLessons)}
                      onEnded={completeWatchedVideo}
                    >
                      <source
                        src="/videos/rest-api-demo.mp4"
                        type="video/mp4"
                      />
                      Your browser does not support HTML video.
                    </video>
                  </div>

                  {/* LESSON DETAILS */}
                  <div className="cc-lesson-details">
                    <div className="cc-lesson-eyebrow">
                      MODULE {selectedLesson.moduleId} · LESSON{" "}
                      {selectedLesson.id.split(".")[1]}
                    </div>

                    <h2>{selectedLesson.title}</h2>

                    <p>
                      {courseInfo?.description ||
                        `Continue learning ${courseTitle} with this lesson.`}
                    </p>

                    <button
                      className="cc-pdf-resource"
                      onClick={() =>
                        alert("Connect your PDF file to open this resource.")
                      }
                    >
                      <span className="cc-pdf-label">PDF</span>
                      <strong>
                        status-codes-examples.pdf · 420 KB
                      </strong>
                    </button>
                  </div>

                  {/* LESSON BUTTONS */}
                  <div className="cc-lesson-footer">
                    <button
                      className="cc-action-button previous"
                      onClick={() => goToLesson(-1)}
                      disabled={selectedIndex === 0}
                    >
                      ← Previous
                    </button>

                    <button
                      className="cc-action-button complete"
                      onClick={toggleComplete}
                    >
                      {completedLessons.includes(selectedLessonId)
                        ? "Completed ✓"
                        : progressSaving ? "Saving…" : "Mark as complete"}
                    </button>

                    <button
                      className="cc-action-button next"
                      onClick={() => goToLesson(1)}
                      disabled={selectedIndex === allLessons.length - 1}
                    >
                      Next lesson →
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* SUBMISSION (TPIQ-57-B) - kept mounted so selected files survive tab switches */}
            <div
              className="cc-submission-tab"
              style={{ display: activeTab === "submission" ? "block" : "none" }}
            >
              <Submission onDueCountChange={setDueCount} courseId={courseId} apiBaseUrl={apiBaseUrl} />
            </div>

            {/* QUIZ (TPIQ-57-C) */}
            {activeTab === "quiz" && (
              <Quiz
                modules={modules}
                completedLessons={completedLessons}
                onStartQuiz={handleStartQuiz}
                courseId={courseId}
                apiBaseUrl={apiBaseUrl}
              />
            )}
            </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default CourseContent;
