
import React, { useMemo, useState } from "react";
import "./MyLearning.css";

const INITIAL_COURSES = [
  {
    id: 1,
    title: "REST API Fundamentals",
    category: "REST",
    level: "Beginner",
    icon: "API",
    progress: 45,
    status: "In progress",
    activity: "3.2 Status codes in practice",
    time: "2 hours ago",
    lastAccessed: 6,
  },
  {
    id: 2,
    title: "Python for Beginners",
    category: "Python",
    level: "Beginner",
    icon: "Py",
    progress: 80,
    status: "In progress",
    activity: "5.1 Writing functions",
    time: "Yesterday",
    lastAccessed: 5,
  },
  {
    id: 3,
    title: "REST API Testing",
    category: "REST",
    level: "Intermediate",
    icon: "API",
    progress: 12,
    status: "In progress",
    activity: "1.2 Contract testing basics",
    time: "5 days ago",
    lastAccessed: 4,
  },
  {
    id: 4,
    title: "Java Fundamentals",
    category: "Java",
    level: "Beginner",
    icon: "J",
    progress: 0,
    status: "Not started",
    activity: "Enrolled 12 Nov 2026",
    time: "Not opened yet",
    lastAccessed: 3,
  },
  {
    id: 5,
    title: "Python Data Structures",
    category: "Python",
    level: "Intermediate",
    icon: "Py",
    progress: 100,
    status: "Completed",
    activity: "Completed 10 Nov 2026",
    time: "All lessons and quizzes done",
    lastAccessed: 2,
  },
  {
    id: 6,
    title: "Django Web Development",
    category: "Python",
    level: "Intermediate",
    icon: "Dj",
    progress: 100,
    status: "Completed",
    activity: "Completed 8 Nov 2026",
    time: "All lessons and quizzes done",
    lastAccessed: 1,
  },
];

export default function MyLearningView({
  onBackToTrainings,
  onBrowseCourses,
  onOpenCourse,
}) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Last accessed");

  const counts = useMemo(() => ({
    enrolled: INITIAL_COURSES.length,
    inProgress: INITIAL_COURSES.filter(
      (course) => course.status === "In progress"
    ).length,
    notStarted: INITIAL_COURSES.filter(
      (course) => course.status === "Not started"
    ).length,
    completed: INITIAL_COURSES.filter(
      (course) => course.status === "Completed"
    ).length,
  }), []);

  const filteredCourses = useMemo(() => {
    let result = INITIAL_COURSES.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.category.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        activeFilter === "All" || course.status === activeFilter;

      return matchesSearch && matchesStatus;
    });

    if (sortBy === "Progress") {
      result.sort((a, b) => b.progress - a.progress);
    } else if (sortBy === "A–Z") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result.sort((a, b) => b.lastAccessed - a.lastAccessed);
    }

    return result;
  }, [search, activeFilter, sortBy]);

  const handleCourseAction = (course) => {
    if (onOpenCourse) {
      onOpenCourse(course, course.status === "Completed" ? "review" : "resume");
    } else {
      alert(`Opening ${course.title}`);
    }
  };

  return (
    <div className="tpiq-page">
      <div className="tpiq-container">

        <div className="tpiq-breadcrumb">
          HOME / TRAININGS / COURSES / MY LEARNING
        </div>

        <button
          className="tpiq-back-link"
          onClick={onBackToTrainings || (() => window.history.back())}
        >
          ← Back to trainings
        </button>

        <div className="tpiq-heading">
          <h1 className="tpiq-title">Courses</h1>
          <p className="tpiq-subtitle">
            Explore new courses or continue the ones you're enrolled in.
          </p>
        </div>

        <div className="tpiq-tabs">
          <button className="tpiq-tab-btn" onClick={onBrowseCourses}>
            Course catalogue <span className="tpiq-tab-count">30</span>
          </button>

          <button className="tpiq-tab-btn active">
            My learning <span className="tpiq-tab-count">{counts.enrolled}</span>
          </button>
        </div>

        <div className="tpiq-summary-grid">
          <div className="tpiq-summary-card">
            <span className="tpiq-summary-label">ENROLLED</span>
            <strong className="tpiq-summary-value">{counts.enrolled}</strong>
          </div>

          <div className="tpiq-summary-card">
            <span className="tpiq-summary-label">IN PROGRESS</span>
            <strong className="tpiq-summary-value">{counts.inProgress}</strong>
          </div>

          <div className="tpiq-summary-card">
            <span className="tpiq-summary-label">NOT STARTED</span>
            <strong className="tpiq-summary-value">{counts.notStarted}</strong>
          </div>

          <div className="tpiq-summary-card">
            <span className="tpiq-summary-label">COMPLETED</span>
            <strong className="tpiq-summary-value">{counts.completed}</strong>
          </div>
        </div>

        <div className="tpiq-toolbar">
          <input
            className="tpiq-search"
            type="text"
            placeholder="⌕ Search my courses"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="tpiq-filters">
            {["All", "In progress", "Not started", "Completed"].map((filter) => (
              <button
                key={filter}
                className={`tpiq-filter-btn ${
                  activeFilter === filter ? "active" : ""
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <select
            className="tpiq-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option>Last accessed</option>
            <option>Progress</option>
            <option>A–Z</option>
          </select>
        </div>

        <div className="tpiq-card-table">
          <table className="tpiq-table">
            <thead>
              <tr>
                <th>COURSE</th>
                <th>PROGRESS</th>
                <th>STATUS</th>
                <th>LAST ACTIVITY</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id}>
                  <td>
                    <div className="tpiq-course-cell">
                      <div className={`tpiq-course-icon ${course.category.toLowerCase()}`}>
                        {course.icon}
                      </div>

                      <div>
                        <div className="tpiq-course-eyebrow">
                          {course.category} · {course.level}
                        </div>
                        <div className="tpiq-course-name">{course.title}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="tpiq-progress-value">
                      {course.progress}%
                    </div>
                    <div className="tpiq-progress-track">
                      <div
                        className={`tpiq-progress-fill ${
                          course.status === "Completed" ? "completed" : ""
                        }`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </td>

                  <td>
                    <span
                      className={`tpiq-status ${
                        course.status === "In progress"
                          ? "in-progress"
                          : course.status === "Completed"
                          ? "completed"
                          : "not-started"
                      }`}
                    >
                      {course.status}
                    </span>
                  </td>

                  <td>
                    <div className="tpiq-activity">{course.activity}</div>
                    <div className="tpiq-activity-time">{course.time}</div>
                  </td>

                  <td>
                    <button
                      className={`tpiq-action-btn ${
                        course.status === "In progress"
                          ? "primary"
                          : ""
                      }`}
                      onClick={() => handleCourseAction(course)}
                    >
                      {course.status === "Completed"
                        ? "Review"
                        : course.status === "Not started"
                        ? "Start →"
                        : "Resume →"}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredCourses.length === 0 && (
                <tr>
                  <td colSpan="5" className="tpiq-empty">
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
