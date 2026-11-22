// Shared helpers for presenting course records coming from the API.

/** Short badge text for a course (e.g. "API", "Py", "DB"). */
export function getCourseSymbol(course) {
  const title = String(course?.title || course?.name || "").toLowerCase();
  const category = String(course?.category || course?.track || "").toLowerCase();

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

/** "14 Nov 2026" — empty string when the value is missing or invalid. */
export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
