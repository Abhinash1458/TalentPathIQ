
import { useState, useMemo, useEffect } from "react";
import "./Mylearning.css";
import talentPathLogo from "../assets/talentpath-logo.png";

const courses = [
  {
    id: 1,name: "REST API Fundamentals", track: "REST", level: "Beginner", icon: "API", cls: "api", progress: 45, status: "progress",activity: "3.2 Status codes in practice",
    when: "2 hours ago",
    lastAccessed: 6,
    enrolledOrder: 1,},
  {
    id: 2, name: "Python for Beginners",track: "Python", level: "Beginner",icon: "Py", cls: "py", progress: 80, status: "progress",activity: "5.1 Writing functions",
    when: "Yesterday",lastAccessed: 5, enrolledOrder: 2, },
  {
    id: 3, name: "REST API Testing", track: "REST",level: "Intermediate",icon: "API",cls: "api",progress: 12,status: "progress",activity: "1.2 Contract testing basics",
    when: "5 days ago", lastAccessed: 4,enrolledOrder: 3, },
  {
    id: 4, name: "Java Fundamentals", track: "Java", level: "Beginner", icon: "J",cls: "java",progress: 0, status: "notstarted",activity: "Enrolled 12 Nov 2026",
    when: "Not opened yet",lastAccessed: 0,enrolledOrder: 4,},
  {
    id: 5, name: "Python Data Structures",track: "Python",level: "Intermediate",icon: "Py",cls: "py",progress: 100,status: "completed", activity: "Completed 10 Nov 2026",
    when: "All lessons and quizzes done",lastAccessed: 3, enrolledOrder: 5,
  },
  {
    id: 6, name: "SQL Essentials",track: "SQL", level: "Beginner",icon: "SQL", cls: "sql", progress: 100, status: "completed", activity: "Completed 2 Nov 2026",
    when: "All lessons and quizzes done",lastAccessed: 2, enrolledOrder: 6, },
];

const labels = {
  progress: "In progress",
  notstarted: "Not started",
  completed: "Completed",
};

const filters = [
  { key: "all", label: "All" },
  { key: "progress", label: "In progress" },
  { key: "notstarted", label: "Not started" },
  { key: "completed", label: "Completed" },
];

function ActionButton({ course, onAction }) {
  if (course.status === "progress") {
    return (
      <button
        className="ml-action-btn ml-primary-btn"
        onClick={() => onAction(course, "Resume")}>
        Resume →
      </button>
    );
  }

  if (course.status === "notstarted") {
    return (
      <button
        className="ml-action-btn ml-outline-btn"
        onClick={() => onAction(course, "Start")}>
        Start →
      </button>
    );
  }

  return (
    <button
      className="ml-action-btn ml-review-btn"
      onClick={() => onAction(course, "Review")}
    >
      Review
    </button>
  );
}

function CourseRow({ course, onAction }) {
  return (
    <div className="ml-course-row">
      <div className={`ml-course-icon ${course.cls}`}>
        {course.icon}
      </div>

      <div className="ml-course-info">
        <div className="ml-course-meta">
          {course.track} · {course.level}
        </div>
        <div className="ml-course-name">{course.name}</div>
      </div>

      <div className="ml-progress-section">
        <strong>{course.progress}%</strong>
        <div className="ml-progress-track">
          <div
            className={`ml-progress-fill ${
              course.status === "completed" ? "completed-fill" : ""
            }`}
            style={{ width: `${course.progress}%` }}
          />
        </div>
      </div>

      <div>
        <span className={`ml-status ${course.status}`}>
          {labels[course.status]}
        </span>
      </div>

      <div className="ml-activity">
        {course.activity}
        <small>{course.when}</small>
      </div>

      <div className="ml-action-cell">
        <ActionButton course={course} onAction={onAction} />
      </div>
    </div>
  );
}

export default function MyLearning({
  onBackToTrainings,
  onGoToCourses,
  onOpenWorkspace,
}) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("lastAccessed");
  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);
  };

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const count = (status) =>
    courses.filter((course) => course.status === status).length;

  const list = useMemo(() => {
    const searchText = query.trim().toLowerCase();

    const result = courses.filter((course) => {
      const matchesStatus =
        filter === "all" || course.status === filter;

      const matchesSearch =
        course.name.toLowerCase().includes(searchText) ||
        course.track.toLowerCase().includes(searchText);

      return matchesStatus && matchesSearch;
    });

    if (sort === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "progress") {
      result.sort((a, b) => b.progress - a.progress);
    } else if (sort === "enrolled") {
      result.sort((a, b) => a.enrolledOrder - b.enrolledOrder);
    } else {
      result.sort((a, b) => b.lastAccessed - a.lastAccessed);
    }

    return result;
  }, [filter, query, sort]);

  const handleCourseAction = (course, action) => {
    const message =
      action === "Resume"
        ? `You are resuming ${course.name}`
        : action === "Start"
        ? `${course.name} is ready to start!`
        : `You are reviewing ${course.name}`;

    if (onOpenWorkspace) {
      onOpenWorkspace(course, action);
    } else {
      showToast(message);
    }
  };

  const clearFilters = () => {
    setFilter("all");
    setQuery("");
  };

  return (
   <div className="my-learning-layout">

  <aside className="ml-sidebar">
    <div>
      <div className="sidebar-brand">
        <img
          src={talentPathLogo}
          alt="TalentPath IQ Logo"
          className="brand-mark"
        />

        <span className="wordmark">
          <span>TalentPath</span>
          <b>IQ</b>
        </span>
      </div>

  <a href="/#trainings" className="ml-nav-item active">
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 10L12 5 2 10l10 5 10-5Z" />
    <path d="M6 12v5c3.5 3 8.5 3 12 0v-5" />
    <path d="M22 10v6" />
  </svg>

  <span>Trainings</span>
</a>

</div>
 <div className="ml-sidebar-bottom">
  <a href="/#account" className="ml-account">
    <span className="ml-avatar">MY</span>

    <span className="ml-account-text">My Account</span>

    <svg
      className="ml-account-arrow"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  </a>

  <div className="ml-sidebar-footer">
    © 2026 TalentPath IQ
  </div>
</div>

</aside>
  

   <main className="ml-content">
    <nav className="ml-breadcrumb">
       HOME / TRAININGS / COURSES / MY LEARNING </nav>
<button
  type="button"
  className="ml-back-link"
  onClick={() => {
    window.location.hash = "trainings";

    if (onBackToTrainings) {
      onBackToTrainings();
    } else {
      showToast("Navigating to Trainings");
    }
  }}
>
  ← Back to trainings
</button>

<h1 className="ml-heading">Courses</h1>

<p className="ml-subtitle">
  Explore new courses or continue the ones you're enrolled in.
</p>

<div className="ml-tabs">

   <button
    type="button"
    className="ml-tab"
    onClick={() => {
      window.location.hash = "coursecatalogue";

      if (onGoToCourses) {
        onGoToCourses();
      } else {
        showToast("Opening Course Catalogue");
      }
    }}
  >
    Course catalogue
    <span className="ml-count grey">30</span>
  </button>
 <button
    type="button"
    className="ml-tab active"
  >
    My learning
    <span className="ml-count blue">{courses.length}</span>
  </button>

</div>
        <section className="ml-stats">
          <div className="ml-stat-card">
            <span>ENROLLED</span>
            <strong>{courses.length}</strong>
          </div>

          <div className="ml-stat-card">
            <span>IN PROGRESS</span>
            <strong>{count("progress")}</strong>
          </div>

          <div className="ml-stat-card">
            <span>NOT STARTED</span>
            <strong>{count("notstarted")}</strong>
          </div>

          <div className="ml-stat-card">
            <span>COMPLETED</span>
            <strong>{count("completed")}</strong>
          </div>
        </section>

        <section className="ml-toolbar">
          <input
            className="ml-search"
            type="search"
            placeholder="⌕ Search my courses"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <div className="ml-filter-pills">
            {filters.map((item) => (
              <button
                type="button"
                key={item.key}
                className={`ml-filter-btn ${
                  filter === item.key ? "active" : ""
                }`}
                onClick={() => setFilter(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <select
            className="ml-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="lastAccessed">Sort: Last accessed</option>
            <option value="enrolled">Sort: Recently enrolled</option>
            <option value="progress">Sort: Progress</option>
            <option value="name">Sort: A–Z</option>
          </select>
        </section>

        {courses.length === 0 ? (
          <div className="ml-empty-state">
            <h3>You haven't enrolled in any courses yet</h3>
            <p>Browse the course catalogue to find a course.</p>
            <button
              className="ml-action-btn ml-primary-btn"
              onClick={onGoToCourses}
            >
              Browse courses
            </button>
          </div>
        ) : list.length === 0 ? (
          <div className="ml-empty-state">
            <h3>No courses match your filters</h3>
            <button
              className="ml-action-btn ml-outline-btn"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <section className="ml-course-list">
            <div className="ml-course-header">
              <span></span>
              <span>COURSE</span>
              <span>PROGRESS</span>
              <span>STATUS</span>
              <span>LAST ACTIVITY</span>
              <span></span>
            </div>

            {list.map((course) => (
              <CourseRow
                key={course.id}
                course={course}
                onAction={handleCourseAction}
              />
            ))}
          </section>
        )}
      </main>

      {toast && (
        <div className="ml-toast" role="status">
          <span>✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}
