import { useEffect, useState } from "react";
import "./App.css";
import logoMark from "./assets/talentpath-logo1.png";

function GraduationCap() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m2 10 10-5 10 5-10 5-10-5Z" />
      <path d="M6 12v5c3.5 2.5 8.5 2.5 12 0v-5" />
      <path d="M22 10v6" />
    </svg>
  );
}

// Where the API lives. Empty (the default) means same-origin relative paths,
// which is what the local nginx/Vite proxies serve. On Railway the frontend
// and backend are separate services, so this is set at build time to the
// backend's public URL.
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

// Colour accent for a course symbol, keyed off the backend's category choices.
const CATEGORY_CLASS = {
  Frontend: "frontend",
  Backend: "backend",
  Database: "database",
  "AI/ML": "aiml",
  Programming: "programming",
};

// Short badge text derived from the course title, e.g. "React JS
// Development" -> "RJ". Falls back to the first two title characters.
function courseInitials(title) {
  const words = title
    .split(/[\s/]+/)
    .filter((word) => /[a-z0-9]/i.test(word));

  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  return title.slice(0, 2).toUpperCase();
}

function App() {
  const [page, setPage] = useState("trainings");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");

  const [catalogueTab, setCatalogueTab] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [coursesState, setCoursesState] = useState("idle");
  const [coursesError, setCoursesError] = useState("");

  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Fetched from the click that opens the catalogue rather than from an
  // effect, so opening the page does not trigger a second render pass.
  async function loadCourses() {
    setCoursesError("");
    setCoursesState("loading");

    try {
      const response = await fetch(`${API_BASE}/api/courses/`);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();

      // DRF returns a bare list here, but tolerate a paginated shape too.
      setCourses(Array.isArray(data) ? data : (data.results ?? []));
      setCoursesState("ready");
    } catch (error) {
      setCoursesError(error.message);
      setCoursesState("error");
    }
  }

  function openCatalogue() {
    setPage("catalogue");
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (coursesState === "idle") {
      loadCourses();
    }
  }

  function backToTrainings() {
    setPage("trainings");
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showComingSoon(section) {
    setToast(`${section} is coming soon.`);
  }

  return (
    <div className="app-shell">
      <div
        className={`sidebar-overlay ${sidebarOpen ? "visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="workspace">
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <a
            className="sidebar-brand"
            href="#trainings"
            onClick={(event) => {
              event.preventDefault();
              backToTrainings();
            }}
            aria-label="TalentPath IQ home"
          >
            <img
              src={logoMark}
              alt="TalentPath IQ Logo"
              className="brand-mark"
            />

            <span className="wordmark">
              <span>TalentPath</span>
              <b>IQ</b>
            </span>
          </a>

          <nav className="sidebar-nav" aria-label="Main navigation">
            <button
              className={`nav-item ${
                page === "trainings" ? "active" : ""
              }`}
              type="button"
              onClick={backToTrainings}
            >
              <span className="nav-icon">
                <GraduationCap />
              </span>
              <span>Trainings</span>
            </button>
          </nav>

          <div className="sidebar-spacer" />

          <div className="sidebar-profile">
            <div className="profile-avatar">MY</div>

            <div className="profile-copy">
              <strong>My Profile</strong>
              <span>Student Account</span>
            </div>

            <button
              className="profile-menu"
              type="button"
              aria-label="Profile options"
              onClick={() => setToast("Profile options coming soon.")}
            >
              ⋮
            </button>
          </div>

          <div className="sidebar-copyright">
            © 2026 TalentPath IQ
          </div>
        </aside>

        <main className="main-content">
          <button
            className="mobile-menu"
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setSidebarOpen((open) => !open)}
          >
            ☰
          </button>

          {page === "trainings" && (
            <section id="trainings" className="trainings-page">
              <div className="breadcrumb">
                <span>HOME</span>
                <span className="slash">/</span>
                <span>TRAININGS</span>
              </div>

              <div className="page-heading">
                <div>
                  <h1>Trainings</h1>
                  <p>
                    Pick a training type to see what you can enrol in.
                  </p>
                </div>

                <span className="entry-tag">Learning space</span>
              </div>

              <section
                className="training-grid"
                aria-label="Training types"
              >
                <article className="training-card" id="courses">
                  <div className="card-icon courses-icon">▤</div>

                  <div className="card-title-row">
                    <h2>Courses</h2>
                    <span className="status-tag live">In sprint 1</span>
                  </div>

                  <p className="card-description">
                    Structured modules and problem statements across
                    Java, Python and REST, with graded exercises.
                  </p>

                  <div className="stats two-stats">
                    <div>
                      <span className="stat-label">COURSES</span>
                      <strong>30</strong>
                    </div>

                    <div>
                      <span className="stat-label">
                        PROBLEM STATEMENTS
                      </span>
                      <strong>0</strong>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={openCatalogue}
                  >
                    Browse courses <span>→</span>
                  </button>
                </article>

                <article className="training-card" id="hackathons">
                  <div className="card-icon hackathon-icon">♜</div>

                  <div className="card-title-row">
                    <h2>Hackathon</h2>
                    <span className="status-tag backlog">Backlog</span>
                  </div>

                  <p className="card-description">
                    Timed team challenges with a leaderboard and a
                    judged submission at the end.
                  </p>

                  <div className="stats">
                    <div>
                      <span className="stat-label">LIVE NOW</span>
                      <strong>3</strong>
                    </div>

                    <div>
                      <span className="stat-label">PAST EVENTS</span>
                      <strong>12</strong>
                    </div>
                  </div>

                  <button
                    className="btn btn-outline"
                    type="button"
                    onClick={() => showComingSoon("Hackathon")}
                  >
                    Coming soon
                  </button>
                </article>

                <article className="training-card" id="assessments">
                  <div className="card-icon assessment-icon">▧</div>

                  <div className="card-title-row">
                    <h2>Assessments</h2>
                    <span className="status-tag backlog">Backlog</span>
                  </div>

                  <p className="card-description">
                    Timed skill tests that score you by category
                    and level, and feed your profile.
                  </p>

                  <div className="stats">
                    <div>
                      <span className="stat-label">AVAILABLE</span>
                      <strong>9</strong>
                    </div>

                    <div>
                      <span className="stat-label">ATTEMPTED</span>
                      <strong>2</strong>
                    </div>
                  </div>

                  <button
                    className="btn btn-outline"
                    type="button"
                    onClick={() => showComingSoon("Assessments")}
                  >
                    Coming soon
                  </button>
                </article>
              </section>
            </section>
          )}

          {page === "catalogue" && (
            <section className="catalogue-page" id="catalogue">
              <button
                className="text-back"
                type="button"
                onClick={backToTrainings}
              >
                ← Back to trainings
              </button>

              <div className="catalogue-tabs" role="tablist">
                <button
                  className={`catalogue-tab ${
                    catalogueTab === "courses" ? "active" : ""
                  }`}
                  type="button"
                  role="tab"
                  aria-selected={catalogueTab === "courses"}
                  onClick={() => setCatalogueTab("courses")}
                >
                  Courses
                  {coursesState === "ready" && <span>{courses.length}</span>}
                </button>

                <button
                  className={`catalogue-tab ${
                    catalogueTab === "problems" ? "active" : ""
                  }`}
                  type="button"
                  role="tab"
                  aria-selected={catalogueTab === "problems"}
                  onClick={() => setCatalogueTab("problems")}
                >
                  Problem Statements
                </button>
              </div>

              {catalogueTab === "courses" && (
                <div className="catalogue-panel">
                  <div className="catalogue-intro">
                    <h2>Course catalogue</h2>
                    <p>
                      Browse the full training catalogue by category and
                      level, then enrol in the track you want to work
                      through.
                    </p>
                  </div>

                  {coursesState === "loading" && (
                    <p className="catalogue-status">Loading courses…</p>
                  )}

                  {coursesState === "error" && (
                    <div className="catalogue-status error">
                      <p>Could not load courses: {coursesError}</p>
                      <button
                        className="btn btn-outline"
                        type="button"
                        onClick={loadCourses}
                      >
                        Try again
                      </button>
                    </div>
                  )}

                  {coursesState === "ready" && courses.length === 0 && (
                    <p className="catalogue-status">
                      No courses have been published yet.
                    </p>
                  )}

                  {coursesState === "ready" && courses.length > 0 && (
                    <div className="catalogue-grid">
                      {courses.map((course) => (
                        <article className="catalogue-card" key={course.id}>
                          <div
                            className={`course-symbol ${
                              CATEGORY_CLASS[course.category] ?? "programming"
                            }`}
                            aria-hidden="true"
                          >
                            {courseInitials(course.title)}
                          </div>

                          <div className="catalogue-card-copy">
                            <span className="course-level">
                              {course.level?.toUpperCase()}
                            </span>

                            <h3>{course.title}</h3>

                            <p>{course.description}</p>
                          </div>

                          <div className="course-meta">
                            <span>{course.category}</span>
                            <span>{course.level}</span>
                            {course.duration && <span>{course.duration}</span>}
                          </div>

                          <button
                            className="btn btn-primary catalogue-action"
                            type="button"
                            onClick={() =>
                              setToast(`Enrolment for ${course.title} is coming soon.`)
                            }
                          >
                            Enrol
                          </button>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {catalogueTab === "problems" && (
                <div className="catalogue-panel">
                  <div className="catalogue-intro">
                    <h2>Problem statements</h2>
                    <p>
                      Practice problems are not available from the API yet.
                      This tab is ready for them once the backend exposes a
                      problems endpoint.
                    </p>
                  </div>

                  <p className="catalogue-status">
                    No problem statements yet.
                  </p>
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {toast && (
        <div className="toast show" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
