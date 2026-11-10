
import { useState } from "react";
import {
  GraduationCap,
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Layers,
} from "lucide-react";
import "./App.css";

const courses = [
  // Frontend - 6
  { id: 1, title: "HTML Fundamentals", category: "Frontend", level: "Beginner", description: "Learn the fundamentals of HTML and build structured web pages." },
  { id: 2, title: "CSS Fundamentals", category: "Frontend", level: "Beginner", description: "Learn styling, layouts, selectors and modern CSS." },
  { id: 3, title: "JavaScript Development", category: "Frontend", level: "Beginner", description: "Understand JavaScript programming and browser interactions." },
  { id: 4, title: "React JS Development", category: "Frontend", level: "Intermediate", description: "Build interactive user interfaces using React." },
  { id: 5, title: "Angular Development", category: "Frontend", level: "Intermediate", description: "Develop modern web applications using Angular." },
  { id: 6, title: "Bootstrap and Responsive Design", category: "Frontend", level: "Beginner", description: "Create responsive websites using Bootstrap." },

  // Backend - 6
  { id: 7, title: "Python Full Stack Development", category: "Backend", level: "Beginner", description: "Learn Python and build full-stack web applications." },
  { id: 8, title: "Django Development", category: "Backend", level: "Intermediate", description: "Build web applications using the Django framework." },
  { id: 9, title: "Node.js Development", category: "Backend", level: "Intermediate", description: "Learn server-side JavaScript development." },
  { id: 10, title: "Express.js Development", category: "Backend", level: "Intermediate", description: "Create backend applications and APIs using Express." },
  { id: 11, title: "Java Spring Boot", category: "Backend", level: "Advanced", description: "Develop enterprise applications using Spring Boot." },
  { id: 12, title: "REST API Development", category: "Backend", level: "Advanced", description: "Design and develop RESTful backend services." },

  // Database - 6
  { id: 13, title: "SQL Fundamentals", category: "Database", level: "Beginner", description: "Learn SQL queries and relational database concepts." },
  { id: 14, title: "MySQL Database", category: "Database", level: "Beginner", description: "Manage relational databases using MySQL." },
  { id: 15, title: "PostgreSQL Database", category: "Database", level: "Intermediate", description: "Work with PostgreSQL databases and queries." },
  { id: 16, title: "MongoDB Database", category: "Database", level: "Intermediate", description: "Learn NoSQL database concepts using MongoDB." },
  { id: 17, title: "Advanced SQL", category: "Database", level: "Advanced", description: "Explore joins, subqueries, CTEs and window functions." },
  { id: 18, title: "Database Design", category: "Database", level: "Advanced", description: "Learn database modelling and normalization." },

  // AI/ML - 7
  { id: 19, title: "Artificial Intelligence Fundamentals", category: "AI/ML", level: "Beginner", description: "Understand the foundations of artificial intelligence." },
  { id: 20, title: "Data Science with Python", category: "AI/ML", level: "Beginner", description: "Explore data analysis and visualization using Python." },
  { id: 21, title: "Machine Learning", category: "AI/ML", level: "Intermediate", description: "Learn machine learning algorithms and model training." },
  { id: 22, title: "Deep Learning", category: "AI/ML", level: "Advanced", description: "Explore neural networks and deep learning architectures." },
  { id: 23, title: "Natural Language Processing", category: "AI/ML", level: "Advanced", description: "Work with text processing and language models." },
  { id: 24, title: "Computer Vision", category: "AI/ML", level: "Advanced", description: "Understand image processing and computer vision." },
  { id: 25, title: "Generative AI", category: "AI/ML", level: "Intermediate", description: "Explore generative AI models and applications." },

  // Programming - 5 (available in catalogue, not a sidebar filter)
  { id: 26, title: "Prompt Engineering", category: "AI/ML", level: "Intermediate", description: "Learn techniques for writing effective AI prompts." },
  { id: 27, title: "C Programming", category: "Programming", level: "Beginner", description: "Learn programming fundamentals using C." },
  { id: 28, title: "C++ Programming", category: "Programming", level: "Intermediate", description: "Understand object-oriented programming using C++." },
  { id: 29, title: "Data Structures and Algorithms", category: "Programming", level: "Advanced", description: "Learn essential data structures and algorithms." },
  { id: 30, title: "Java Programming", category: "Programming", level: "Advanced", description: "Learn Java programming and object-oriented concepts." },
];

const problems = [];

const categories = ["Frontend", "Backend", "Database", "AI/ML","Programming"];
const levels = ["Beginner", "Intermediate", "Advanced"];
const ITEMS_PER_PAGE = 3;

function App() {
  const [activeTab, setActiveTab] = useState("courses");
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [page, setPage] = useState(1);

  const activeItems = activeTab === "courses" ? courses : problems;

  const filteredItems = activeItems.filter((item) => {
    const searchMatch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());

    const categoryMatch =
      selectedCategories.length === 0 ||
      selectedCategories.includes(item.category);

    const levelMatch =
      selectedLevels.length === 0 ||
      selectedLevels.includes(item.level);

    return searchMatch && categoryMatch && levelMatch;
  });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  const currentItems = filteredItems.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const toggleCategory = (category) => {
    setSelectedCategories((previous) =>
      previous.includes(category)
        ? previous.filter((item) => item !== category)
        : [...previous, category]
    );
    setPage(1);
  };

  const toggleLevel = (level) => {
    setSelectedLevels((previous) =>
      previous.includes(level)
        ? previous.filter((item) => item !== level)
        : [...previous, level]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedLevels([]);
    setSearch("");
    setPage(1);
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setSearch("");
    setSelectedCategories([]);
    setSelectedLevels([]);
    setPage(1);
  };

  const categoryCount = (category) =>
    courses.filter((course) => course.category === category).length;

  const levelCount = (level) =>
    courses.filter((course) => course.level === level).length;

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo">
          <img
            src="/talentpath-logo.png"
            alt="TalentPath IQ"
            className="logo-image"
          />
          <div>
            <h2>TalentPath IQ</h2>
            <span>Learning Platform</span>
          </div>
        </div>

        <div className="sidebar-menu">
          <button
            className="menu-item active"
            onClick={() => changeTab("courses")}
          >
            <GraduationCap size={19} />
            <span>Training</span>
          </button>
        </div>

        {/* Divider is positioned above Category */}
        <div className="sidebar-filters">
          <div className="filter-heading">
            <Filter size={14} />
            <span>FILTERS</span>
          </div>

          <div className="filter-group">
            <h4>CATEGORY</h4>

            {categories.map((category) => (
              <label className="filter-option" key={category}>
                <span>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />
                  {category}
                </span>
                <small>{categoryCount(category)}</small>
              </label>
            ))}
          </div>

          <div className="filter-group level-group">
            <h4>LEVEL</h4>

            {levels.map((level) => (
              <label className="filter-option" key={level}>
                <span>
                  <input
                    type="checkbox"
                    checked={selectedLevels.includes(level)}
                    onChange={() => toggleLevel(level)}
                  />
                  {level}
                </span>
                <small>{levelCount(level)}</small>
              </label>
            ))}
          </div>

          <button className="clear-filters" onClick={clearFilters}>
            Clear all filters
          </button>
        </div>

        <div className="sidebar-bottom">
          <span>© 2026 TalentPath IQ</span>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="top-header">
          <div>
            <p className="breadcrumb">Learning / Catalogue</p>
            <h1>Learning Catalogue</h1>
            <p className="page-description">
              Explore courses and discover learning opportunities.
            </p>
          </div>

          <button className="add-course-button">
            <Plus size={17} />
            Add Course
          </button>
        </header>

        {/* SUMMARY CARDS */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <BookOpen size={22} />
            </div>
            <div>
              <p>Total Courses</p>
              <h2>{courses.length}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <Layers size={22} />
            </div>
            <div>
              <p>Categories</p>
              <h2>{new Set(courses.map((course) => course.category)).size}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <GraduationCap size={22} />
            </div>
            <div>
              <p>Problem Statements</p>
              <h2>{problems.length}</h2>
            </div>
          </div>
        </section>

        {/* CATALOGUE */}
        <section className="catalogue-panel">
          <div className="catalogue-header">
            <div>
              <h2>Browse Catalogue</h2>
              <p>Find the right learning path for your goals.</p>
            </div>

            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(event) => handleSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="catalogue-tabs">
            <button
              className={activeTab === "courses" ? "tab active-tab" : "tab"}
              onClick={() => changeTab("courses")}
            >
              Courses
              <span>{courses.length}</span>
            </button>

            <button
              className={
                activeTab === "problems" ? "tab active-tab" : "tab"
              }
              onClick={() => changeTab("problems")}
            >
              Problem Statements
              <span>{problems.length}</span>
            </button>
          </div>

          <div className="results-heading">
            <div>
              <h3>
                {activeTab === "courses" ? "Available Courses" : "Problem Statements"}
              </h3>
              <p>
                Showing {filteredItems.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1}
                {" - "}
                {Math.min(page * ITEMS_PER_PAGE, filteredItems.length)} of{" "}
                {filteredItems.length} results
              </p>
            </div>
            <span className="total-badge">
              {filteredItems.length} results
            </span>
          </div>

          {/* COURSE CARDS */}
          {currentItems.length > 0 ? (
            <div className="course-grid">
              {currentItems.map((course) => (
                <article className="course-card" key={course.id}>
                  <div className="course-card-top">
                    <div className="course-icon">
                      <GraduationCap size={24} />
                    </div>
                    <span className="course-category">
                      {course.category}
                    </span>
                  </div>

                  <h3>{course.title}</h3>
                  <p className="course-description">
                    {course.description}
                  </p>

                  <div className="course-card-footer">
                    <span className={`level-tag ${course.level.toLowerCase()}`}>
                      {course.level}
                    </span>
                    <button className="view-details">
                      View Details
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <BookOpen size={30} />
              </div>
              <h3>
                {activeTab === "problems"
                  ? "No Problem Statements Available"
                  : "No Courses Found"}
              </h3>
              <p>
                {activeTab === "problems"
                  ? "Problem statements will appear here when they become available."
                  : "Try changing your search or clearing the selected filters."}
              </p>
              {activeTab === "courses" && (
                <button onClick={clearFilters}>Clear filters</button>
              )}
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-button"
                disabled={page === 1}
                onClick={() => setPage((previous) => previous - 1)}
              >
                <ChevronLeft size={17} />
                Previous
              </button>

              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    className={page === index + 1 ? "page-number selected" : "page-number"}
                    onClick={() => setPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                className="pagination-button"
                disabled={page === totalPages}
                onClick={() => setPage((previous) => previous + 1)}
              >
                Next
                <ChevronRight size={17} />
              </button>
            </div>
          )}
        </section>

        <footer className="main-footer">
          © 2026 Talent Path Academy | Learn. Build. Grow.
        </footer>
      </main>
    </div>
  );
}

export default App;
