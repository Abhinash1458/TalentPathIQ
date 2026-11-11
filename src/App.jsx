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

function App() {
  const [page, setPage] = useState("trainings");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function openCatalogue() {
    setPage("catalogue");
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

          {/* Browse Courses Page - Intentionally Blank */}
          {page === "catalogue" && (
            <section className="catalogue-page" id="catalogue" />
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
