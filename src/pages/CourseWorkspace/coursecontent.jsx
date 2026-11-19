import { useEffect, useState } from "react";
import {
  GraduationCap,
  ChevronRight,
  ChevronDown,
  Check,
  Play,
  FileText,
  Menu,
  X,
  ClipboardList,
  CircleHelp,
} from "lucide-react";
import "./coursecontent.css";
import logoMark from "../../assets/talentpath-logo.png";
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
function CourseContent() {
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

  const [selectedLessonId, setSelectedLessonId] = useState("1.1");
  const [completedLessons, setCompletedLessons] = useState([]);
  const [expandedModules, setExpandedModules] = useState([1]);
  const [activeTab, setActiveTab] = useState("content");
  const [activeModule, setActiveModule] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      setActiveTab("content");
    }
    setExpandedModules((current) =>
      current.includes(moduleId)
        ? current.filter((id) => id !== moduleId)
        : [...current, moduleId]
    );
  }

  function selectLesson(lesson) {
    setSelectedLessonId(lesson.id);
    setActiveModule(lesson.moduleId);
    setActiveTab("content");

    setExpandedModules((current) =>
      current.includes(lesson.moduleId)
        ? current
        : [...current, lesson.moduleId]
    );
  }

  function toggleComplete() {
    setCompletedLessons((current) =>
      current.includes(selectedLessonId)
        ? current.filter((id) => id !== selectedLessonId)
        : [...current, selectedLessonId]
    );
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
            <span>
              TalentPath <strong>IQ</strong>
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
              <GraduationCap size={20} />
              <span>Trainings</span>
            </a>
          </nav>

          {/* MY ACCOUNT */}
          <div className="cc-sidebar-bottom">
            <a href="#account" className="cc-account-link">
              <span className="cc-avatar">MY</span>
              <span className="cc-account-text">My Account</span>
              <ChevronRight className="cc-account-arrow" size={19} />
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
              <a href="#trainings">MY LEARNING</a>
              <span>/</span>
              <strong>REST API FUNDAMENTALS</strong>
            </div>

            <a href="#catalogue" className="cc-back-learning">
              ← Back to My Learning
            </a>
          </header>

          <div className="cc-workspace">
            {/* COURSE SUMMARY */}
            <section className="cc-course-summary">
              <div className="cc-course-summary-left">
                <div className="cc-api-icon">API</div>

                <div className="cc-course-heading">
                  <div className="cc-course-category">
                    REST <span>·</span> BEGINNER
                  </div>

                  <h1>REST API Fundamentals</h1>
                  <p>Enrolled 14 Nov 2026</p>
                </div>
              </div>

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
            </section>

            {/* TABS */}
            <div className="cc-tabs">
              <button
                className={activeTab === "content" ? "selected" : ""}
                onClick={() => setActiveTab("content")}
              >
                Content
              </button>

              <button
                className={activeTab === "submission" ? "selected" : ""}
                onClick={() => setActiveTab("submission")}
              >
                Submission
                <span className="cc-due-badge">1 due</span>
              </button>

              <button
                className={activeTab === "quiz" ? "selected" : ""}
                onClick={() => setActiveTab("quiz")}
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
                      See how REST API concepts work in real applications.
                      Understand the key concepts, explore practical examples,
                      and learn how to apply them when creating, updating and
                      deleting requests.
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
                        : "Mark as complete"}
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

            {/* SUBMISSION */}
            {activeTab === "submission" && (
              <section className="cc-tab-placeholder">
                <div className="cc-placeholder-icon">
                  <ClipboardList size={28} />
                </div>

                <h2>Course submissions</h2>

                <p>
                  View your assignments, submit your work and check
                  submission status here.
                </p>
              </section>
            )}

            {/* QUIZ */}
            {activeTab === "quiz" && (
              <section className="cc-tab-placeholder">
                <div className="cc-placeholder-icon">
                  <CircleHelp size={28} />
                </div>

                <h2>Course quiz</h2>

                <p>
                  Test your understanding of REST API Fundamentals through
                  course quizzes.
                </p>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default CourseContent;
