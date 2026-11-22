import { useEffect, useMemo, useState } from "react";
import "./Mylearning.css";
import "../sidebar.css";
import talentPathLogo from "../assets/talentpath-logo.png";

const STATUS_LABELS = {
  in_progress: "In progress",
  not_started: "Not started",
  completed: "Completed",
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "in_progress", label: "In progress" },
  { key: "not_started", label: "Not started" },
  { key: "completed", label: "Completed" },
];

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function relativeTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(value);
}

function getCourseIcon(course) {
  const text = `${course?.title || ""} ${course?.category || ""}`.toLowerCase();
  if (text.includes("python")) return { icon: "Py", cls: "py" };
  if (text.includes("java")) return { icon: "J", cls: "java" };
  if (text.includes("sql") || text.includes("database")) return { icon: "DB", cls: "sql" };
  if (text.includes("api") || text.includes("rest")) return { icon: "API", cls: "api" };
  if (text.includes("frontend") || text.includes("javascript") || text.includes("react")) return { icon: "JS", cls: "py" };
  return { icon: (course?.category || course?.title || "C").slice(0, 2).toUpperCase(), cls: "api" };
}

function normalizeEnrolment(record) {
  const course = record.course || {};
  const progress = Math.max(0, Math.min(100, Number(record.progressPercent ?? record.progress_percent ?? 0)));
  let status = record.status || "not_started";
  // Keep the display status consistent with the acceptance criteria.
  if (progress >= 100) status = "completed";
  else if (progress > 0 || record.lastLessonId || record.last_lesson_id || status === "in_progress") status = "in_progress";
  else status = "not_started";

  const icon = getCourseIcon(course);
  const lastLesson = record.lastLessonId || record.last_lesson_id;
  const enrolledAt = record.enrolledAt || record.enrolled_at;

  return {
    id: Number(record.id),
    courseId: Number(record.courseId ?? record.course_id),
    name: course.title || "Course details unavailable",
    track: course.category || "General",
    level: course.level || "—",
    progress,
    status,
    icon: icon.icon,
    cls: icon.cls,
    enrolledAt,
    lastLesson,
    lastAccessedAt: record.lastAccessedAt || record.last_accessed_at || null,
    completedAt: record.completedAt || record.completed_at || null,
  };
}

function ActionButton({ course, onAction }) {
  const action = course.status === "completed" ? "Review"
    : course.status === "not_started" ? "Start" : "Resume";
  const className = course.status === "in_progress" ? "ml-primary-btn"
    : course.status === "not_started" ? "ml-outline-btn" : "ml-review-btn";
  return (
    <button className={`ml-action-btn ${className}`} onClick={() => onAction(course, action)}>
      {action}{action === "Review" ? "" : " →"}
    </button>
  );
}

function CourseRow({ course, onAction }) {
  let activity = `Enrolled ${formatDate(course.enrolledAt)}`;
  let when = "Not opened yet";
  if (course.status === "completed") {
    activity = course.completedAt ? `Completed ${formatDate(course.completedAt)}` : "Course completed";
    when = course.completedAt ? "All lessons completed" : "Completion date not recorded";
  } else if (course.lastLesson) {
    activity = course.lastLesson;
    when = relativeTime(course.lastAccessedAt) || "Last lesson opened";
  }

  return (
    <div className="ml-course-row">
      <div className={`ml-course-icon ${course.cls}`}>{course.icon}</div>
      <div className="ml-course-info">
        <div className="ml-course-meta">{course.track} · {course.level}</div>
        <div className="ml-course-name">{course.name}</div>
      </div>
      <div className="ml-progress-section">
        <strong>{course.progress}%</strong>
        <div className="ml-progress-track">
          <div className={`ml-progress-fill ${course.status === "completed" ? "completed-fill" : ""}`}
            style={{ width: `${course.progress}%` }} />
        </div>
      </div>
      <div><span className={`ml-status ${course.status === "in_progress" ? "progress" : course.status === "not_started" ? "notstarted" : "completed"}`}>
        {STATUS_LABELS[course.status]}
      </span></div>
      <div className="ml-activity">{activity}<small>{when}</small></div>
      <div className="ml-action-cell"><ActionButton course={course} onAction={onAction} /></div>
    </div>
  );
}

export default function MyLearning({
  apiBaseUrl = "/api",
  catalogueCount = 0,
  onBackToTrainings,
  onGoToCourses,
  onOpenWorkspace,
}) {
  const [enrolments, setEnrolments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("lastAccessed");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function loadMyLearning() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${apiBaseUrl}/enrolments/`);
        if (!response.ok) throw new Error(`Unable to load My Learning (HTTP ${response.status}). Please try again.`);
        const data = await response.json();
        const records = Array.isArray(data) ? data : (data.results || []);
        if (!cancelled) setEnrolments(records.map(normalizeEnrolment));
      } catch (err) {
        if (!cancelled) setError(!navigator.onLine ? "You're offline. Check your internet connection and try again." : (err.message || "Unable to load your enrolled courses."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadMyLearning();
    const refreshOnFocus = () => loadMyLearning();
    window.addEventListener("focus", refreshOnFocus);
    window.addEventListener("online", refreshOnFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", refreshOnFocus);
      window.removeEventListener("online", refreshOnFocus);
    };
  }, [apiBaseUrl, reloadKey]);

  const counts = useMemo(() => ({
    enrolled: enrolments.length,
    in_progress: enrolments.filter((course) => course.status === "in_progress").length,
    not_started: enrolments.filter((course) => course.status === "not_started").length,
    completed: enrolments.filter((course) => course.status === "completed").length,
  }), [enrolments]);

  const list = useMemo(() => {
    const searchText = query.trim().toLowerCase();
    const result = enrolments.filter((course) => {
      const matchesStatus = filter === "all" || course.status === filter;
      const matchesSearch = `${course.name} ${course.track}`.toLowerCase().includes(searchText);
      return matchesStatus && matchesSearch;
    });
    if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "progress") result.sort((a, b) => b.progress - a.progress);
    else if (sort === "enrolled") result.sort((a, b) => new Date(b.enrolledAt || 0) - new Date(a.enrolledAt || 0));
    else result.sort((a, b) => new Date(b.lastAccessedAt || b.enrolledAt || 0) - new Date(a.lastAccessedAt || a.enrolledAt || 0));
    return result;
  }, [enrolments, filter, query, sort]);

  const clearFilters = () => { setFilter("all"); setQuery(""); };

  return (
    <div className="my-learning-layout">
      <aside className="ml-sidebar">
        <div>
          <div className="sidebar-brand">
            <img src={talentPathLogo} alt="TalentPath IQ Logo" className="brand-mark" />
            <span className="wordmark"><span>TalentPath</span><b>IQ</b></span>
          </div>
          <nav className="sidebar-nav" aria-label="Main navigation">
            <a href="/#trainings" className="ml-nav-item active">
              <span className="nav-icon">
                <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m2 10 10-5 10 5-10 5-10-5Z" /><path d="M6 12v5c3.5 2.5 8.5 2.5 12 0v-5" /><path d="M22 10v6" />
                </svg>
              </span>
              <span>Trainings</span>
            </a>
          </nav>
        </div>
        <div className="ml-sidebar-bottom">
          <a href="#account" className="ml-account">
            <span className="ml-avatar">MY</span><span className="ml-account-text">My Account</span>
            <span className="account-chevron">›</span>
          </a>
          <div className="ml-sidebar-footer">© 2026 TalentPath IQ</div>
        </div>
      </aside>

      <main className="ml-content">
        <nav className="ml-breadcrumb">HOME / TRAININGS / COURSES / MY LEARNING</nav>
        <button type="button" className="ml-back-link" onClick={onBackToTrainings}>← Back to trainings</button>
        <h1 className="ml-heading">Courses</h1>
        <p className="ml-subtitle">Explore new courses or continue the ones you're enrolled in.</p>

        <div className="ml-tabs">
          <button type="button" className="ml-tab" onClick={onGoToCourses}>
            Course catalogue <span className="ml-count grey">{catalogueCount}</span>
          </button>
          <button type="button" className="ml-tab active">
            My learning <span className="ml-count blue">{counts.enrolled}</span>
          </button>
        </div>

        <section className="ml-stats">
          <div className="ml-stat-card"><span>ENROLLED</span><strong>{counts.enrolled}</strong></div>
          <div className="ml-stat-card"><span>IN PROGRESS</span><strong>{counts.in_progress}</strong></div>
          <div className="ml-stat-card"><span>NOT STARTED</span><strong>{counts.not_started}</strong></div>
          <div className="ml-stat-card"><span>COMPLETED</span><strong>{counts.completed}</strong></div>
        </section>

        <section className="ml-toolbar">
          <input className="ml-search" type="search" placeholder="⌕ Search my courses"
            value={query} onChange={(event) => setQuery(event.target.value)} />
          <div className="ml-filter-pills">
            {FILTERS.map((item) => (
              <button type="button" key={item.key}
                className={`ml-filter-btn ${filter === item.key ? "active" : ""}`}
                onClick={() => setFilter(item.key)}>{item.label}</button>
            ))}
          </div>
          <select className="ml-sort" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="lastAccessed">Sort: Last accessed</option>
            <option value="enrolled">Sort: Recently enrolled</option>
            <option value="progress">Sort: Progress</option>
            <option value="name">Sort: A–Z</option>
          </select>
        </section>

        {loading ? <div className="ml-empty-state"><p>Loading your enrolled courses…</p></div>
          : error ? <div className="ml-empty-state" role="alert"><h3>Couldn't load My Learning</h3><p>{error}</p>
              <button className="ml-action-btn ml-outline-btn" onClick={() => setReloadKey((key) => key + 1)}>Retry</button></div>
          : enrolments.length === 0 ? <div className="ml-empty-state"><h3>You haven't enrolled in any courses yet</h3>
              <p>Browse the course catalogue to find a course.</p>
              <button className="ml-action-btn ml-primary-btn" onClick={onGoToCourses}>Browse courses</button></div>
          : list.length === 0 ? <div className="ml-empty-state"><h3>No courses match your filters</h3>
              <button className="ml-action-btn ml-outline-btn" onClick={clearFilters}>Clear filters</button></div>
          : <section className="ml-course-list">
              <div className="ml-course-header"><span></span><span>COURSE</span><span>PROGRESS</span><span>STATUS</span><span>LAST ACTIVITY</span><span></span></div>
              {list.map((course) => <CourseRow key={course.id} course={course} onAction={onOpenWorkspace || (() => {})} />)}
            </section>}
      </main>
    </div>
  );
}
