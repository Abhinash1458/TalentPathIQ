import { useEffect, useMemo, useState } from "react";
import "./App.css";
import logoMark from "./assets/talentpath-logo1.png";

const courses = [
  { id: 1, title: "Java Fundamentals", category: "Java", level: "Beginner", description: "Learn Java syntax, variables, control flow and object-oriented programming.", skills: ["Java", "OOP", "Programming"], updated: "2026-10-28", duration: "4 weeks" },
  { id: 2, title: "Core Java Programming", category: "Java", level: "Intermediate", description: "Build strong foundations in collections, exceptions, streams and file handling.", skills: ["Java", "Collections", "Streams"], updated: "2026-10-24", duration: "6 weeks" },
  { id: 3, title: "Advanced Java & Multithreading", category: "Java", level: "Expert", description: "Explore concurrency, JVM concepts and advanced Java application patterns.", skills: ["Java", "JVM", "Concurrency"], updated: "2026-10-20", duration: "5 weeks" },
  { id: 4, title: "Python for Beginners", category: "Python", level: "Beginner", description: "Start programming with Python fundamentals, data types and functions.", skills: ["Python", "Syntax", "Functions"], updated: "2026-11-02", duration: "3 weeks" },
  { id: 5, title: "Python Data Structures", category: "Python", level: "Intermediate", description: "Work with lists, dictionaries, sets, comprehensions and problem solving.", skills: ["Python", "Data structures", "Algorithms"], updated: "2026-10-30", duration: "4 weeks" },
  { id: 6, title: "Advanced Python Development", category: "Python", level: "Expert", description: "Deepen your Python skills with decorators, generators, async and testing.", skills: ["Python", "Async", "Testing"], updated: "2026-10-17", duration: "5 weeks" },
  { id: 7, title: "REST API Fundamentals", category: "REST", level: "Beginner", description: "Understand HTTP methods, status codes, resources and API basics.", skills: ["REST", "HTTP", "API"], updated: "2026-11-04", duration: "2 weeks" },
  { id: 8, title: "REST API Testing", category: "REST", level: "Intermediate", description: "Validate API contracts, requests, responses and common error scenarios.", skills: ["REST", "API testing", "Postman"], updated: "2026-10-26", duration: "3 weeks" },
  { id: 9, title: "REST API Design & Security", category: "REST", level: "Expert", description: "Design scalable APIs with authentication, authorization and versioning.", skills: ["REST", "Security", "API design"], updated: "2026-10-15", duration: "5 weeks" },
  { id: 10, title: "Java Object-Oriented Concepts", category: "Java", level: "Beginner", description: "Understand classes, objects, inheritance, polymorphism and interfaces.", skills: ["Java", "OOP"], updated: "2026-10-12", duration: "3 weeks" },
  { id: 11, title: "Java Collections Framework", category: "Java", level: "Intermediate", description: "Choose and use Java collection types effectively in applications.", skills: ["Java", "Collections"], updated: "2026-10-09", duration: "4 weeks" },
  { id: 12, title: "Java Performance Tuning", category: "Java", level: "Expert", description: "Profile applications and improve memory usage and runtime performance.", skills: ["Java", "Performance", "JVM"], updated: "2026-10-06", duration: "4 weeks" },
  { id: 13, title: "Python Functions & Modules", category: "Python", level: "Beginner", description: "Organize reusable code using functions, modules and packages.", skills: ["Python", "Functions"], updated: "2026-10-04", duration: "2 weeks" },
  { id: 14, title: "Python Object-Oriented Programming", category: "Python", level: "Intermediate", description: "Model real-world problems using classes, inheritance and composition.", skills: ["Python", "OOP"], updated: "2026-10-01", duration: "4 weeks" },
  { id: 15, title: "Python Automation", category: "Python", level: "Expert", description: "Automate workflows with robust scripts, logging and exception handling.", skills: ["Python", "Automation"], updated: "2026-09-28", duration: "5 weeks" },
  { id: 16, title: "HTTP & REST Essentials", category: "REST", level: "Beginner", description: "Explore endpoints, headers, payloads and the request-response cycle.", skills: ["REST", "HTTP"], updated: "2026-09-25", duration: "2 weeks" },
  { id: 17, title: "REST API Integration", category: "REST", level: "Intermediate", description: "Connect services and handle API responses, errors and pagination.", skills: ["REST", "Integration"], updated: "2026-09-22", duration: "3 weeks" },
  { id: 18, title: "Microservices API Patterns", category: "REST", level: "Expert", description: "Apply API gateway, resilience and service communication patterns.", skills: ["REST", "Microservices"], updated: "2026-09-19", duration: "6 weeks" },
  { id: 19, title: "Java Exception Handling", category: "Java", level: "Beginner", description: "Write reliable programs with exceptions and defensive coding.", skills: ["Java", "Exceptions"], updated: "2026-09-16", duration: "2 weeks" },
  { id: 20, title: "Java Database Connectivity", category: "Java", level: "Intermediate", description: "Connect Java applications to relational databases using JDBC.", skills: ["Java", "JDBC", "SQL"], updated: "2026-09-13", duration: "3 weeks" },
  { id: 21, title: "Java Design Patterns", category: "Java", level: "Expert", description: "Apply common object-oriented design patterns to maintainable software.", skills: ["Java", "Design patterns"], updated: "2026-09-10", duration: "5 weeks" },
  { id: 22, title: "Python Strings & Collections", category: "Python", level: "Beginner", description: "Manipulate strings and collections to solve everyday coding tasks.", skills: ["Python", "Strings"], updated: "2026-09-07", duration: "2 weeks" },
  { id: 23, title: "Python File Handling", category: "Python", level: "Intermediate", description: "Read, write and process files while managing errors and resources.", skills: ["Python", "Files"], updated: "2026-09-04", duration: "3 weeks" },
  { id: 24, title: "Python Async Programming", category: "Python", level: "Expert", description: "Build concurrent applications with asyncio and asynchronous I/O.", skills: ["Python", "Async"], updated: "2026-09-01", duration: "4 weeks" },
  { id: 25, title: "REST Status Codes & Errors", category: "REST", level: "Beginner", description: "Interpret HTTP status codes and create consistent error responses.", skills: ["REST", "HTTP"], updated: "2026-08-29", duration: "2 weeks" },
  { id: 26, title: "REST Authentication", category: "REST", level: "Intermediate", description: "Understand tokens, API keys and authentication flows for APIs.", skills: ["REST", "Authentication"], updated: "2026-08-26", duration: "3 weeks" },
  { id: 27, title: "REST API Scalability", category: "REST", level: "Expert", description: "Improve API throughput with caching, rate limiting and observability.", skills: ["REST", "Scalability"], updated: "2026-08-23", duration: "5 weeks" },
  { id: 28, title: "Java Algorithms Practice", category: "Java", level: "Intermediate", description: "Strengthen algorithmic thinking with Java coding exercises.", skills: ["Java", "Algorithms"], updated: "2026-08-20", duration: "4 weeks" },
  { id: 29, title: "Python Problem Solving", category: "Python", level: "Intermediate", description: "Solve practical programming challenges using Python.", skills: ["Python", "Problem solving"], updated: "2026-08-17", duration: "3 weeks" },
  { id: 30, title: "REST API Architecture", category: "REST", level: "Expert", description: "Structure API resources and contracts for long-lived services.", skills: ["REST", "Architecture"], updated: "2026-08-14", duration: "5 weeks" },
];

const categories = ["Java", "Python", "REST"];
const levels = ["Beginner", "Intermediate", "Expert"];
const pageSize = 6;

function GraduationCap() {
  return <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m2 10 10-5 10 5-10 5-10-5Z" /><path d="M6 12v5c3.5 2.5 8.5 2.5 12 0v-5" /><path d="M22 10v6" /></svg>;
}

function App() {
  const [page, setPage] = useState("trainings");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = courses.filter((course) => {
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(course.category);
      const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(course.level);
      const searchable = `${course.title} ${course.category} ${course.level} ${course.description} ${course.skills.join(" ")}`.toLowerCase();
      return matchesCategory && matchesLevel && (!query || searchable.includes(query));
    });
    return result.sort((a, b) => sortBy === "alphabetical" ? a.title.localeCompare(b.title) : new Date(b.updated) - new Date(a.updated));
  }, [selectedCategories, selectedLevels, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const visibleCourses = filteredCourses.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const activeFilterCount = selectedCategories.length + selectedLevels.length;

  useEffect(() => { setCurrentPage(1); }, [selectedCategories, selectedLevels, search, sortBy]);
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);

  function navigate(nextPage) {
    setPage(nextPage);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleValue(value, values, setter) {
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  }

  function clearFilters() {
    setSelectedCategories([]);
    setSelectedLevels([]);
    setSearch("");
    setCurrentPage(1);
  }

  function showComingSoon(section) { setToast(`${section} is coming soon.`); }

  function openCourse(course) {
    setSelectedCourse(course);
    setPage("course-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCourseAction(course) {
    if (!enrolledCourses.includes(course.id)) {
      setEnrolledCourses((current) => [...current, course.id]);
      setToast(`You are enrolled in ${course.title}.`);
      return;
    }
    setToast(`Resuming ${course.title}.`);
  }

  return (
    <div className="app-shell">
      <div className={`sidebar-overlay ${sidebarOpen ? "visible" : ""}`} onClick={() => setSidebarOpen(false)} />
      <div className="workspace">
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <a className="sidebar-brand" href="#trainings" onClick={(event) => { event.preventDefault(); navigate("trainings"); }} aria-label="TalentPath IQ home">
            <img src={logoMark} alt="TalentPath IQ Logo" className="brand-mark" />
            <span className="wordmark"><span>TalentPath</span><b>IQ</b></span>
          </a>
          <nav className="sidebar-nav" aria-label="Main navigation">
            <button className={`nav-item ${["trainings", "catalogue"].includes(page) ? "active" : ""}`} type="button" onClick={() => navigate("trainings")}>
              <span className="nav-icon"><GraduationCap /></span><span>Trainings</span>
            </button>
          </nav>
          <div className="sidebar-spacer" />
          <button className={`account-nav ${page === "account" ? "active" : ""}`} type="button" onClick={() => navigate("account")}>
            <span className="account-avatar">MY</span><span>My Account</span><span className="account-chevron">›</span>
          </button>
          <div className="sidebar-copyright">© 2026 TalentPath IQ</div>
        </aside>

        <main className="main-content">
          <button className="mobile-menu" type="button" aria-label="Toggle navigation" onClick={() => setSidebarOpen((open) => !open)}>☰</button>

          {page === "trainings" && <section id="trainings" className="trainings-page">
            <div className="breadcrumb"><span>HOME</span><span className="slash">/</span><span>TRAININGS</span></div>
            <div className="page-heading"><div><h1>Trainings</h1><p>Pick a training type to see what you can enrol in.</p></div><span className="entry-tag">Learning space</span></div>
            <section className="training-grid" aria-label="Training types">
              <article className="training-card" id="courses"><div className="card-icon courses-icon">▤</div><div className="card-title-row"><h2>Courses</h2><span className="status-tag live">In sprint 1</span></div><p className="card-description">Structured modules and problem statements across Java, Python and REST, with graded exercises.</p><div className="stats two-stats"><div><span className="stat-label">COURSES</span><strong>30</strong></div><div><span className="stat-label">PROBLEM STATEMENTS</span><strong>0</strong></div></div><button className="btn btn-primary" type="button" onClick={() => navigate("catalogue")}>Browse courses <span>→</span></button></article>
              <article className="training-card" id="hackathons"><div className="card-icon hackathon-icon">♜</div><div className="card-title-row"><h2>Hackathon</h2><span className="status-tag backlog">Backlog</span></div><p className="card-description">Timed team challenges with a leaderboard and a judged submission at the end.</p><div className="stats"><div><span className="stat-label">LIVE NOW</span><strong>3</strong></div><div><span className="stat-label">PAST EVENTS</span><strong>12</strong></div></div><button className="btn btn-outline" type="button" onClick={() => showComingSoon("Hackathon")}>Coming soon</button></article>
              <article className="training-card" id="assessments"><div className="card-icon assessment-icon">▧</div><div className="card-title-row"><h2>Assessments</h2><span className="status-tag backlog">Backlog</span></div><p className="card-description">Timed skill tests that score you by category and level, and feed your profile.</p><div className="stats"><div><span className="stat-label">AVAILABLE</span><strong>9</strong></div><div><span className="stat-label">ATTEMPTED</span><strong>2</strong></div></div><button className="btn btn-outline" type="button" onClick={() => showComingSoon("Assessments")}>Coming soon</button></article>
            </section>
          </section>}

          {page === "catalogue" && <section className="catalogue-page" id="catalogue">
            <div className="breadcrumb"><span>HOME</span><span className="slash">/</span><span>TRAININGS</span><span className="slash">/</span><span>COURSES</span></div>
            <div className="page-heading"><div><button className="text-back" type="button" onClick={() => navigate("trainings")}>← Back to trainings</button><h1>Course Catalogue</h1><p>Explore courses and narrow your learning path by category and difficulty.</p></div><span className="entry-tag">{courses.length} courses</span></div>
            <div className="catalogue-toolbar">
              <label className="search-field"><span aria-hidden="true">⌕</span><input type="search" placeholder="Search courses or skills" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search courses or skills" /></label>
              <label className="sort-field"><span>Sort by</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort courses"><option value="recent">Recently added</option><option value="alphabetical">Alphabetical</option></select></label>
            </div>
            <div className="catalogue-layout">
              <aside className="filter-panel" aria-label="Course filters">
                <div className="filter-heading"><h2>Filters</h2>{activeFilterCount > 0 && <span>{activeFilterCount} active</span>}</div>
                <div className="filter-group"><h3>Category</h3>{categories.map((category) => <label className="filter-option" key={category}><input type="checkbox" checked={selectedCategories.includes(category)} onChange={() => toggleValue(category, selectedCategories, setSelectedCategories)} /><span>{category}</span><small>{courses.filter((course) => course.category === category).length}</small></label>)}</div>
                <div className="filter-group"><h3>Difficulty</h3>{levels.map((level) => <label className="filter-option" key={level}><input type="checkbox" checked={selectedLevels.includes(level)} onChange={() => toggleValue(level, selectedLevels, setSelectedLevels)} /><span>{level}</span></label>)}</div>
                <button className="clear-filter-button" type="button" onClick={clearFilters} disabled={!activeFilterCount && !search}>Clear all filters</button>
              </aside>
              <div className="catalogue-results">
                <div className="results-heading"><p><strong>{filteredCourses.length}</strong> courses found</p>{(activeFilterCount > 0 || search) && <button type="button" onClick={clearFilters}>Clear all</button>}</div>
                {(activeFilterCount > 0 || search) && <div className="active-chips" aria-label="Active filters">{selectedCategories.map((item) => <button key={item} type="button" className="filter-chip" onClick={() => toggleValue(item, selectedCategories, setSelectedCategories)}>{item} <span>×</span></button>)}{selectedLevels.map((item) => <button key={item} type="button" className="filter-chip" onClick={() => toggleValue(item, selectedLevels, setSelectedLevels)}>{item} <span>×</span></button>)}{search && <button type="button" className="filter-chip" onClick={() => setSearch("")}>Search: {search} <span>×</span></button>}</div>}
                {visibleCourses.length > 0 ? <div className="catalogue-grid">{visibleCourses.map((course) => <article className="catalogue-card" key={course.id}><div className={`course-symbol ${course.category.toLowerCase()}`}>{course.category === "REST" ? "API" : course.category === "Java" ? "J" : "Py"}</div><div className="catalogue-card-copy"><div className="course-card-topline"><span className="course-level">{course.category.toUpperCase()}</span><span className={`level-pill ${course.level.toLowerCase()}`}>{course.level}</span></div><h3>{course.title}</h3><p>{course.description}</p><div className="course-meta"><span>◷ {course.duration}</span><span>Updated {new Date(course.updated).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div></div><button className="btn btn-outline catalogue-action" type="button" onClick={() => openCourse(course)}>View course <span>→</span></button></article>)}</div> : <div className="empty-state"><div className="empty-icon">⌕</div><h3>No courses found</h3><p>Try changing your search or removing some filters.</p><button className="btn btn-primary" type="button" onClick={clearFilters}>Clear all filters</button></div>}
                {filteredCourses.length > 0 && <div className="pagination"><span>Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredCourses.length)} of {filteredCourses.length}</span><div className="pagination-controls"><button type="button" aria-label="Previous page" disabled={currentPage === 1} onClick={() => setCurrentPage((value) => value - 1)}>‹</button>{Array.from({ length: totalPages }, (_, index) => <button type="button" key={index + 1} className={currentPage === index + 1 ? "selected" : ""} aria-label={`Page ${index + 1}`} aria-current={currentPage === index + 1 ? "page" : undefined} onClick={() => setCurrentPage(index + 1)}>{index + 1}</button>)}<button type="button" aria-label="Next page" disabled={currentPage === totalPages} onClick={() => setCurrentPage((value) => value + 1)}>›</button></div></div>}
              </div>
            </div>
          </section>}

          {page === "course-detail" && selectedCourse && <section className="course-detail-page">
            <div className="breadcrumb"><span>HOME</span><span className="slash">/</span><span>TRAININGS</span><span className="slash">/</span><span>COURSES</span><span className="slash">/</span><span>COURSE DETAILS</span></div>
            <div className="detail-back-row"><button className="text-back" type="button" onClick={() => navigate("catalogue")}>← Back to course catalogue</button><span className="entry-tag">Course overview</span></div>
            <section className="detail-hero">
              <div className={`course-symbol detail-symbol ${selectedCourse.category.toLowerCase()}`}>{selectedCourse.category === "REST" ? "API" : selectedCourse.category === "Java" ? "J" : "Py"}</div>
              <div className="detail-hero-copy"><div className="course-card-topline"><span className="course-level">{selectedCourse.category.toUpperCase()}</span><span className={`level-pill ${selectedCourse.level.toLowerCase()}`}>{selectedCourse.level}</span></div>
                <h1>{selectedCourse.title}</h1><p>{selectedCourse.description}</p>
                <div className="detail-meta"><span>◷ {selectedCourse.duration}</span><span>Updated {new Date(selectedCourse.updated).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div>
              </div>
              <div className="detail-action"><span className={enrolledCourses.includes(selectedCourse.id) ? "enrolled-label" : "not-enrolled-label"}>{enrolledCourses.includes(selectedCourse.id) ? "You are enrolled" : "Not enrolled"}</span>
                <button className="btn btn-primary" type="button" onClick={() => handleCourseAction(selectedCourse)}>{enrolledCourses.includes(selectedCourse.id) ? "Open / Resume" : "Enrol now"} <span>→</span></button>
              </div>
            </section>
            <div className="detail-content-grid">
              <article className="detail-panel detail-summary"><div className="detail-section-heading"><span className="detail-section-icon">▤</span><div><h2>Course summary</h2><p>What this course covers</p></div></div><p className="summary-copy">{selectedCourse.description} This learning path is designed to build practical understanding through structured topics and focused practice.</p></article>
              <article className="detail-panel"><div className="detail-section-heading"><span className="detail-section-icon focus-icon">◎</span><div><h2>Key focus areas</h2><p>Skills you will develop</p></div></div><ul className="focus-list">{selectedCourse.skills.map((skill) => <li key={skill}><span>✓</span>{skill}</li>)}</ul></article>
              <article className="detail-panel"><div className="detail-section-heading"><span className="detail-section-icon inclusion-icon">＋</span><div><h2>What's included</h2><p>Your learning experience</p></div></div><ul className="inclusion-list"><li><span>✓</span>Structured learning content</li><li><span>✓</span>Topic-based skill coverage</li><li><span>✓</span>Self-paced course access</li><li><span>✓</span>Practical learning outcomes</li></ul></article>
            </div>
          </section>}

          {page === "account" && <section className="account-page"><div className="breadcrumb"><span>HOME</span><span className="slash">/</span><span>MY ACCOUNT</span></div><div className="page-heading"><div><h1>My Account</h1><p>Manage your TalentPath IQ profile.</p></div></div><div className="account-placeholder"><div className="account-avatar large">MY</div><h2>Student Account</h2><p>Your account details will be available here.</p><span className="status-tag backlog">Profile settings coming soon</span></div></section>}
        </main>
      </div>
      {toast && <div className="toast show" role="status" aria-live="polite">{toast}</div>}
    </div>
  );
}

export default App;
