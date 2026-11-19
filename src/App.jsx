import { useEffect, useMemo, useState } from "react";
import "./App.css";
import logoMark from "./assets/talentpath-logo.png";

const pageSize = 6;



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



function getCourseSymbol(course) {
  const title = String(course?.title || "").toLowerCase();
  const category = String(course?.category || "").toLowerCase();

  if (title.includes("java") || category === "java") return "J";
  if (title.includes("python")) return "Py";
  if (title.includes("c programming") || title === "c") return "C";
  if (title.includes("c++") || title.includes("cpp")) return "C++";
  if (title.includes("javascript") || title.includes("react") || title.includes("node") ||
      title.includes("html") || title.includes("css") || category === "frontend") return "JS";
  if (title.includes("mysql") || title.includes("postgres") || title.includes("sql") ||
      title.includes("database") || category === "database") return "DB";
  if (title.includes("api") || title.includes("rest") || category === "rest") return "API";
  if (title.includes("artificial intelligence") || title.includes("machine learning") ||
      title.includes("data science") || category === "ai/ml") return "AI";
  if (title.includes("django") || title.includes("fastapi") ||
      title.includes("backend") || category === "backend") return "BE";
  if (category === "programming") return "DEV";
  return title ? title.charAt(0).toUpperCase() : "C";
}

function App() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8002/api";
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState("");

  function normalizeCourse(record) {
    const category = record.category || "General";
    const rawLevel = record.level || "Beginner";
    return {
      ...record,
      id: Number(record.id),
      title: record.title || "Untitled course",
      category,
      level: rawLevel === "Advanced" ? "Expert" : rawLevel,
      description: record.description || "",
      duration: record.duration?.trim() || "3 weeks",
      updated: record.updated_at || record.updated || record.created_at || new Date().toISOString(),
      skills: Array.isArray(record.skills) && record.skills.length
        ? record.skills
        : [category],
    };
  }

  function getRouteFromHash(courseList = courses) {
    const hash = window.location.hash;

    if (hash.startsWith("#course/")) {
      const courseId = Number(hash.split("/")[1]);
      const course = courseList.find((item) => item.id === courseId);

      if (course) {
        return { page: "course-detail", course };
      }
      return { page: "course-detail", course: null };
    }

    if (hash === "#catalogue") {
      return { page: "catalogue", course: null };
    }

    if (hash === "#account") {
      return { page: "account", course: null };
    }

    return { page: "trainings", course: null };
  }

  const [page, setPage] = useState(() => getRouteFromHash().page);
  const [selectedCourse, setSelectedCourse] = useState(
    () => getRouteFromHash().course
  );

  // TPIQ-54: enrolment state is loaded from and persisted by the Django API.
  const [enrolments, setEnrolments] = useState([]);
  const [enrolmentsLoaded, setEnrolmentsLoaded] = useState(false);
  const enrolledCourses = enrolments.map((item) => Number(item.courseId));
  const [enrolmentDialogOpen, setEnrolmentDialogOpen] = useState(false);
  const [enrolmentSubmitting, setEnrolmentSubmitting] = useState(false);
  const [enrolmentError, setEnrolmentError] = useState(false);
  const [enrolmentErrorDetail, setEnrolmentErrorDetail] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(
    () => [...new Set(courses.map((course) => course.category).filter(Boolean))].sort(),
    [courses]
  );
  const levels = useMemo(
    () => [...new Set(courses.map((course) => course.level).filter(Boolean))].sort(
      (a, b) => ({ Beginner: 1, Intermediate: 2, Expert: 3 }[a] || 99) -
                ({ Beginner: 1, Intermediate: 2, Expert: 3 }[b] || 99)
    ),
    [courses]
  );

  // Load the catalogue from Django/PostgreSQL instead of a hardcoded frontend array.
  useEffect(() => {
    let cancelled = false;
    async function loadCourses() {
      try {
        setCoursesError("");
        const response = await fetch(`${API_BASE_URL}/courses/`);
        if (!response.ok) {
          throw new Error(`Course API returned HTTP ${response.status}`);
        }
        const payload = await response.json();
        const records = Array.isArray(payload) ? payload : (payload.results || []);
        const loadedCourses = records.map(normalizeCourse);
        if (!cancelled) {
          setCourses(loadedCourses);
          const hash = window.location.hash;
          if (hash.startsWith("#course/")) {
            const requestedId = Number(hash.split("/")[1]);
            const match = loadedCourses.find((course) => course.id === requestedId);
            if (match) {
              setSelectedCourse(match);
              setPage("course-detail");
            } else {
              setSelectedCourse(null);
              setPage("catalogue");
            }
          }
        }
      } catch (error) {
        console.error("Unable to load course catalogue:", error);
        if (!cancelled) setCoursesError(error.message || "Unable to load courses.");
      } finally {
        if (!cancelled) setCoursesLoading(false);
      }
    }
    loadCourses();
    return () => { cancelled = true; };
  }, []);

  // Listen for URL changes, including browser Back and Forward.
  useEffect(() => {
    function handleHashChange() {
      const route = getRouteFromHash(courses);

      setPage(route.page);
      setSelectedCourse(route.course);
      setSidebarOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [courses]);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(() => setToast(""), 4000);

    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    let cancelled = false;
    async function loadEnrolments() {
      try {
        const response = await fetch(`${API_BASE_URL}/enrolments/`);
        if (!response.ok) throw new Error(`Unable to load enrolments (${response.status})`);
        const records = await response.json();
        if (!cancelled) setEnrolments(Array.isArray(records) ? records : []);
      } catch (error) {
        console.error("Unable to load enrolments:", error);
      } finally {
        if (!cancelled) setEnrolmentsLoaded(true);
      }
    }
    loadEnrolments();
    return () => { cancelled = true; };
  }, []);

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = courses.filter((course) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(course.category);

      const matchesLevel =
        selectedLevels.length === 0 ||
        selectedLevels.includes(course.level);

      const searchable =
        `${course.title} ${course.category} ${course.level} ${course.description} ${(course.skills || []).join(" ")}`.toLowerCase();

      return matchesCategory && matchesLevel && (!query || searchable.includes(query));
    });

    const levelOrder = {
      Beginner: 1,
      Intermediate: 2,
      Expert: 3,
    };

    const titleCollator = new Intl.Collator("en", {
      sensitivity: "base",
      numeric: true,
    });

    return result.sort((a, b) => {
      if (sortBy === "alphabetical") {
        return titleCollator.compare(a.title, b.title);
      }

      const levelDifference = levelOrder[a.level] - levelOrder[b.level];

      if (levelDifference !== 0) {
        return levelDifference;
      }

      return new Date(b.updated) - new Date(a.updated);
    });
  }, [courses, selectedCategories, selectedLevels, search, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCourses.length / pageSize)
  );

  const visibleCourses = filteredCourses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const activeFilterCount =
    selectedCategories.length + selectedLevels.length;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedLevels, search, sortBy]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function navigate(nextPage) {
    setSearch("");
    setSelectedCategories([]);
    setSelectedLevels([]);
    setCurrentPage(1);
    setSortBy("recent");
    setPage(nextPage);
    setSelectedCourse(null);
    setSidebarOpen(false);

    const routes = {
      trainings: "#trainings",
      catalogue: "#catalogue",
      account: "#account",
    };

    window.location.hash = routes[nextPage] || "#trainings";

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleValue(value, values, setter) {
    setter(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value]
    );
  }

  // Clear only category and difficulty filters.
  // Search text is intentionally preserved.
  function clearFilters() {
    setSelectedCategories([]);
    setSelectedLevels([]);
    setCurrentPage(1);
  }

  function showComingSoon(section) {
    setToast(`${section} is coming soon.`);
  }

  function openCourse(course) {
    setSelectedCourse(course);
    setPage("course-detail");
    window.location.hash = `#course/${course.id}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openEnrolmentDialog() {
    setEnrolmentError(false);
    setEnrolmentErrorDetail("");
    setEnrolmentDialogOpen(true);
  }
  function closeEnrolmentDialog() {
    if (!enrolmentSubmitting) setEnrolmentDialogOpen(false);
  }
  async function confirmEnrolment() {
    if (!selectedCourse || enrolledCourses.includes(selectedCourse.id) || enrolmentSubmitting) return;
    setEnrolmentSubmitting(true);
    setEnrolmentError(false);
    try {
      const requestUrl = `${API_BASE_URL}/enrolments/`;
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ courseId: selectedCourse.id }),
      });
      const responseText = await response.text();
      let record = {};
      try {
        record = responseText ? JSON.parse(responseText) : {};
      } catch {
        record = { detail: responseText || "The server returned an empty response." };
      }
      console.info("TPIQ-54 enrolment response", {
        url: requestUrl,
        status: response.status,
        statusText: response.statusText,
        body: record,
      });
      if (response.status === 409) {
        const refresh = await fetch(`${API_BASE_URL}/enrolments/`);
        if (refresh.ok) setEnrolments(await refresh.json());
        setEnrolmentDialogOpen(false);
        setToast(`You're already enrolled in ${selectedCourse.title}.`);
        return;
      }
      if (!response.ok) {
        const serverMessage = record.detail || record.message || JSON.stringify(record);
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${serverMessage}`);
      }
      setEnrolments((current) => current.some((item) => Number(item.courseId) === selectedCourse.id) ? current : [...current, record]);
      setEnrolmentDialogOpen(false);
      setToast(`You're enrolled in ${selectedCourse.title}.`);
    } catch (error) {
      const diagnostic = error instanceof Error ? error.message : String(error);
      console.error("TPIQ-54 enrolment request failed", {
        message: diagnostic,
        apiBaseUrl: API_BASE_URL,
        courseId: selectedCourse?.id,
        error,
      });
      setEnrolmentErrorDetail(diagnostic);
      setEnrolmentDialogOpen(false);
      setEnrolmentError(true);
    } finally { setEnrolmentSubmitting(false); }
  }
  useEffect(() => {
    if (!enrolmentDialogOpen) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape" && !enrolmentSubmitting) setEnrolmentDialogOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enrolmentDialogOpen, enrolmentSubmitting]);
  function handleCourseAction(course) {
    if (!enrolledCourses.includes(course.id)) { openEnrolmentDialog(); return; }
    setToast(`Opening ${course.title}…`);
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
              navigate("trainings");
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
                ["trainings", "catalogue", "course-detail", "account"].includes(page) ? "active" : ""
              }`}
              type="button"
              onClick={() => navigate("trainings")}
            >
              <span className="nav-icon">
                <GraduationCap />
              </span>
              <span>Trainings</span>
            </button>
          </nav>

          <div className="sidebar-spacer" />

          <button
            className={`account-nav ${page === "account" ? "active" : ""}`}
            type="button"
            onClick={() => navigate("account")}
          >
            <span className="account-avatar">MY</span>
            <span>My Account</span>
            <span className="account-chevron">›</span>
          </button>

          <div className="sidebar-copyright">© 2026 TalentPath IQ</div>
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

          {/* TRAININGS PAGE */}
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
                  <p>Pick a training type to see what you can enrol in.</p>
                </div>
              </div>

              <section className="training-grid" aria-label="Training types">
                <article className="training-card" id="courses">
                  <div className="card-icon courses-icon">▤</div>

                  <div className="card-title-row">
                    <h2>Courses</h2>
                  </div>

                  <p className="card-description">
                    Structured modules and problem statements across Java,
                    Python and REST, with graded exercises.
                  </p>

                  <div className="stats two-stats">
                    <div>
                      <span className="stat-label">COURSES</span>
                      <strong>30</strong>
                    </div>
                    <div>
                      <span className="stat-label">PROBLEM STATEMENTS</span>
                      <strong>0</strong>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => navigate("catalogue")}
                  >
                    Browse courses <span>→</span>
                  </button>
                </article>

                <article className="training-card" id="hackathons">
                  <div className="card-icon hackathon-icon">♜</div>

                  <div className="card-title-row">
                    <h2>Hackathon</h2>
                  </div>

                  <p className="card-description">
                    Timed team challenges with a leaderboard and a judged
                    submission at the end.
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
                  </div>

                  <p className="card-description">
                    Timed skill tests that score you by category and level,
                    and feed your profile.
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

          {/* COURSE CATALOGUE PAGE */}
          {page === "catalogue" && (
            <section className="catalogue-page" id="catalogue">
              <div className="breadcrumb">
                <span>HOME</span>
                <span className="slash">/</span>
                <span>TRAININGS</span>
                <span className="slash">/</span>
                <span>COURSES</span>
              </div>

              <div className="page-heading">
                <div>
                  <button
                    className="text-back"
                    type="button"
                    onClick={() => navigate("trainings")}
                  >
                    ← Back to trainings
                  </button>

                  <h1>Course Catalogue</h1>
                  <p>
                    Explore courses and narrow your learning path by category
                    and difficulty.
                  </p>
                </div>
              </div>

              <div className="catalogue-toolbar">
                <label className="search-field">
                  <span aria-hidden="true">⌕</span>

                  <input
                    type="search"
                    placeholder="Search courses or skills"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    aria-label="Search courses or skills"
                  />
                </label>

                <label className="sort-field">
                  <span>Sort by</span>

                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    aria-label="Sort courses"
                  >
                    <option value="recent">Recently added</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                </label>
              </div>

              <div className="catalogue-layout">
                <aside className="filter-panel" aria-label="Course filters">
                  <div className="filter-heading">
                    <h2>Filters</h2>
                    {activeFilterCount > 0 && (
                      <span>{activeFilterCount} active</span>
                    )}
                  </div>

                  <div className="filter-group">
                    <h3>Category</h3>

                    {categories.map((category) => (
                      <label className="filter-option" key={category}>
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() =>
                            toggleValue(
                              category,
                              selectedCategories,
                              setSelectedCategories
                            )
                          }
                        />

                        <span>{category}</span>

                        <small>
                          {
                            courses.filter(
                              (course) => course.category === category
                            ).length
                          }
                        </small>
                      </label>
                    ))}
                  </div>

                  <div className="filter-group">
                    <h3>Difficulty</h3>

                    {levels.map((level) => (
                      <label className="filter-option" key={level}>
                        <input
                          type="checkbox"
                          checked={selectedLevels.includes(level)}
                          onChange={() =>
                            toggleValue(
                              level,
                              selectedLevels,
                              setSelectedLevels
                            )
                          }
                        />

                        <span>{level}</span>
                      </label>
                    ))}
                  </div>

                  {/* Clears category and difficulty only, not search. */}
                  <button
                    className="clear-filter-button"
                    type="button"
                    onClick={clearFilters}
                    disabled={!activeFilterCount}
                  >
                    Clear all filters
                  </button>
                </aside>

                <div className="catalogue-results">
                  {coursesLoading && (
                  <div className="empty-state"><p>Loading courses from the database...</p></div>
                )}
                {!coursesLoading && coursesError && (
                  <div className="empty-state">
                    <h3>Unable to load courses</h3>
                    <p>{coursesError}. Check that the Django API is running and try refreshing.</p>
                  </div>
                )}

                <div className="results-heading">
                    <p>
                      <strong>{filteredCourses.length}</strong> courses found
                    </p>
                  </div>

                  {(activeFilterCount > 0 || search) && (
                    <div className="active-chips" aria-label="Active filters">
                      {selectedCategories.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className="filter-chip"
                          onClick={() =>
                            toggleValue(
                              item,
                              selectedCategories,
                              setSelectedCategories
                            )
                          }
                        >
                          {item} <span>×</span>
                        </button>
                      ))}

                      {selectedLevels.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className="filter-chip"
                          onClick={() =>
                            toggleValue(
                              item,
                              selectedLevels,
                              setSelectedLevels
                            )
                          }
                        >
                          {item} <span>×</span>
                        </button>
                      ))}

                      {search && (
                        <button
                          type="button"
                          className="filter-chip"
                          onClick={() => setSearch("")}
                        >
                          Search: {search} <span>×</span>
                        </button>
                      )}
                    </div>
                  )}

                  {visibleCourses.length > 0 ? (
                    <div className="catalogue-grid">
                      {visibleCourses.map((course) => (
                        <article
                          className="catalogue-card"
                          key={course.id}
                        >
                          <div
                            className={`course-symbol ${course.category.toLowerCase()}`}
                          >
                            {getCourseSymbol(course)}
                          </div>

                          <div className="catalogue-card-copy">
                            <div className="course-card-topline">
                              <span className="course-level">
                                {course.category.toUpperCase()}
                              </span>

                              <span
                                className={`level-pill ${course.level.toLowerCase()}`}
                              >
                                {course.level}
                              </span>
                            </div>

                            <h3>{course.title}</h3>
                            <p>{course.description}</p>

                            <div className="course-meta">
                              <span>◷ {course.duration}</span>

                              <span>
                                Updated{" "}
                                {new Date(course.updated).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            </div>
                          </div>

                          <button
                            className="btn btn-outline catalogue-action"
                            type="button"
                            onClick={() => openCourse(course)}
                          >
                            View course <span>→</span>
                          </button>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">⌕</div>
                      <h3>No courses found</h3>
                      <p>
                        Try changing your search or removing some filters.
                      </p>
                    </div>
                  )}

                  {filteredCourses.length > 0 && (
                    <div className="pagination">
                      <span>
                        Showing {(currentPage - 1) * pageSize + 1}–
                        {Math.min(
                          currentPage * pageSize,
                          filteredCourses.length
                        )}{" "}
                        of {filteredCourses.length}
                      </span>

                      <div className="pagination-controls">
                        <button
                          type="button"
                          aria-label="Previous page"
                          disabled={currentPage === 1}
                          onClick={() => {
                            setCurrentPage((value) => value - 1);
                            window.scrollTo({
                              top: 0,
                              behavior: "smooth",
                            });
                          }}
                        >
                          ‹
                        </button>

                        {Array.from(
                          { length: totalPages },
                          (_, index) => (
                            <button
                              type="button"
                              key={index + 1}
                              className={
                                currentPage === index + 1 ? "selected" : ""
                              }
                              aria-label={`Page ${index + 1}`}
                              aria-current={
                                currentPage === index + 1
                                  ? "page"
                                  : undefined
                              }
                              onClick={() => {
                                setCurrentPage(index + 1);
                                window.scrollTo({
                                  top: 0,
                                  behavior: "smooth",
                                });
                              }}
                            >
                              {index + 1}
                            </button>
                          )
                        )}

                        <button
                          type="button"
                          aria-label="Next page"
                          disabled={currentPage === totalPages}
                          onClick={() => {
                            setCurrentPage((value) => value + 1);
                            window.scrollTo({
                              top: 0,
                              behavior: "smooth",
                            });
                          }}
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* COURSE DETAILS PAGE */}
          {page === "course-detail" && selectedCourse && (
            <section className="course-detail-page">
              <div className="breadcrumb">
                <span>HOME</span>
                <span className="slash">/</span>
                <span>TRAININGS</span>
                <span className="slash">/</span>
                <span>COURSES</span>
                <span className="slash">/</span>
                <span>COURSE DETAILS</span>
              </div>

              <div className="detail-page-heading">
                <button
                  className="text-back"
                  type="button"
                  onClick={() => navigate("catalogue")}
                >
                  ← Back to course catalogue
                </button>

                <h1>Course Details</h1>
                <p>
                  Explore the course content, key focus areas and learning
                  experience.
                </p>
              </div>

              <section className="detail-hero">
                <div
                  className={`course-symbol detail-symbol ${selectedCourse.category.toLowerCase()}`}
                >
                  {getCourseSymbol(selectedCourse)}
                </div>

                <div className="detail-hero-copy">
                  <div className="course-card-topline detail-category-line">
                    <span className="course-level">
                      {selectedCourse.category.toUpperCase()}
                    </span>
                  </div>

                  <div className="detail-title-row">
                    <h1>{selectedCourse.title}</h1>
                    <span
                      className={`level-pill ${selectedCourse.level.toLowerCase()}`}
                    >
                      {selectedCourse.level}
                    </span>
                  </div>
                  <p className="course-description">
                    {selectedCourse.description}
                  </p>

                  <div className="detail-meta">
                    <span>◷ {selectedCourse.duration}</span>

                    <span>
                      Updated{" "}
                      {new Date(
                        selectedCourse.updated
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="detail-action">
                  {enrolledCourses.includes(selectedCourse.id) ? (
                    <>
                      <span className="enrolled-label">
                        ✓ Enrolled on {new Date(enrolments.find((item) => Number(item.courseId) === selectedCourse.id)?.enrolledAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <div className="detail-action-buttons">
                        <button className="btn btn-outline" type="button" onClick={() => setToast("My learning will be available in the Courses section.")}>Go to My learning</button>
                        <button className="btn btn-primary" type="button" onClick={() => setToast("Course workspace (TPIQ-57) is not part of this story.")}>Start course <span>→</span></button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="not-enrolled-label">Not enrolled</span>
                      <button className="btn btn-primary" type="button" onClick={openEnrolmentDialog} disabled={!enrolmentsLoaded}>Enrol now <span>→</span></button>
                    </>
                  )}
                </div>
              </section>

              {enrolmentError && (
                <div className="enrolment-error" role="alert">
                  <div className="enrolment-error-copy">
                    <span><strong>Error:</strong> Couldn't enrol you right now. Check your connection and try again.</span>
                    {enrolmentErrorDetail && <small className="enrolment-error-detail">Diagnostic: {enrolmentErrorDetail}</small>}
                  </div>
                  <button className="btn btn-outline" type="button" onClick={() => { setEnrolmentError(false); setEnrolmentErrorDetail(""); openEnrolmentDialog(); }}>Try again</button>
                </div>
              )}

              <div className="detail-content-grid">
                <article className="detail-panel detail-summary">
                  <div className="detail-section-heading">
                    <span className="detail-section-icon">▤</span>

                    <div>
                      <h2>Course summary</h2>
                      <p>What this course covers</p>
                    </div>
                  </div>

                  <p className="summary-copy">
                    {selectedCourse.description} This learning path is
                    designed to build practical understanding through
                    structured topics and focused practice.
                  </p>
                </article>

                <article className="detail-panel">
                  <div className="detail-section-heading">
                    <span className="detail-section-icon focus-icon">◎</span>

                    <div>
                      <h2>Key focus areas</h2>
                      <p>Skills you will develop</p>
                    </div>
                  </div>

                  <ul className="focus-list">
                    {(selectedCourse.skills || [selectedCourse.category]).map((skill) => (
                      <li key={skill}>
                        <span>✓</span>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </article>

                <article className="detail-panel">
                  <div className="detail-section-heading">
                    <span className="detail-section-icon inclusion-icon">
                      ＋
                    </span>

                    <div>
                      <h2>What's included</h2>
                      <p>Your learning experience</p>
                    </div>
                  </div>

                  <ul className="inclusion-list">
                    <li>
                      <span>✓</span>Structured learning content
                    </li>
                    <li>
                      <span>✓</span>Topic-based skill coverage
                    </li>
                    <li>
                      <span>✓</span>Self-paced course access
                    </li>
                    <li>
                      <span>✓</span>Practical learning outcomes
                    </li>
                  </ul>
                </article>
              </div>
            </section>
          )}

          {/* ACCOUNT PAGE */}
          {page === "account" && (
            <section className="account-page">
              <div className="breadcrumb">
                <span>HOME</span>
                <span className="slash">/</span>
                <span>MY ACCOUNT</span>
              </div>

              <div className="page-heading">
                <div>
                  <h1>My Account</h1>
                  <p>Manage your TalentPath IQ profile.</p>
                </div>
              </div>

              <div className="account-placeholder">
                <div className="account-avatar large">MY</div>
                <h2>Student Account</h2>
                <p>Your account details will be available here.</p>
                <span className="status-tag backlog">
                  Profile settings coming soon
                </span>
              </div>
            </section>
          )}
        </main>
      </div>

      {enrolmentDialogOpen && selectedCourse && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeEnrolmentDialog(); }}>
          <section className="enrolment-modal" role="dialog" aria-modal="true" aria-labelledby="enrolment-title">
            <h2 id="enrolment-title">Enrol in {selectedCourse.title}?</h2>
            <dl className="enrolment-summary">
              <div><dt>Category</dt><dd>{selectedCourse.category}</dd></div>
              <div><dt>Level</dt><dd>{selectedCourse.level}</dd></div>
              <div><dt>Duration</dt><dd>{selectedCourse.duration} · 5 modules</dd></div>
              <div><dt>Price</dt><dd>Free</dd></div>
            </dl>
            <p>After you enrol, this course appears under <strong>Courses → My learning</strong> and you can start right away.</p>
            <div className="enrolment-modal-actions">
              <button className="btn btn-outline" type="button" onClick={closeEnrolmentDialog} disabled={enrolmentSubmitting}>Cancel</button>
              <button className="btn btn-primary" type="button" onClick={confirmEnrolment} disabled={enrolmentSubmitting}>
                {enrolmentSubmitting ? <><span className="button-spinner" /> Enrolling…</> : "Confirm enrolment"}
              </button>
            </div>
          </section>
        </div>
      )}

      {toast && (
        <div className="toast show" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;