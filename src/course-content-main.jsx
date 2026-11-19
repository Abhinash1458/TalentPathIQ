import React from "react";
import { createRoot } from "react-dom/client";
import CourseContent from "./pages/CourseWorkspace/coursecontent.jsx";

createRoot(document.getElementById("course-content-root")).render(
  <React.StrictMode>
    <CourseContent />
  </React.StrictMode>
);
