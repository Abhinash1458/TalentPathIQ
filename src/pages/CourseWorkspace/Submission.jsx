import React, { useEffect, useRef, useState } from "react";
import {
  FileArchive,
  X,
  Upload,
  MessageSquare,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";

import "./Submission.css";

/* =========================================
   ASSIGNMENTS (TPIQ-57-B)

   Replace with the assignments API response.
   Each assignment carries its own file rule.
   status: "Not submitted" | "Under review" | "Graded"
   ("Missed" is derived: Not submitted + due date passed)
========================================= */

export const initialAssignments = [];

/* =========================================
   HELPERS
========================================= */

const MAX_SCORE = 10;

function getExtension(name) {
  return name.includes(".") ? name.split(".").pop().toLowerCase() : "";
}

function formatFileSize(bytes) {
  if (!bytes) return "0 KB";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// "PDF, DOCX or ZIP"
function formatAllowedTypes(types) {
  const upper = types.map((type) => type.toUpperCase());
  if (upper.length <= 1) return upper[0] || "";
  return `${upper.slice(0, -1).join(", ")} or ${upper[upper.length - 1]}`;
}

// "Only PDF, DOCX or ZIP up to 20 MB"
function getRuleMessage(assignment) {
  return `Only ${formatAllowedTypes(assignment.allowedTypes)} up to ${assignment.maxSizeMB} MB`;
}

// "20 Nov 2026, 11:59 PM"
function formatDue(dueAt) {
  const date = new Date(dueAt);
  const day = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${day}, ${time}`;
}

function formatToday() {
  return new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Missed = due date passed without a submission.
function getStatus(assignment, now) {
  // A missing due date means the assignment has no deadline; it must never
  // be treated as missed (new Date(null) otherwise evaluates to epoch zero).
  if (
    assignment.status === "Not submitted" &&
    assignment.dueAt &&
    now > new Date(assignment.dueAt).getTime()
  ) {
    return "Missed";
  }
  return assignment.status;
}

export function getDueCount(assignments, now = Date.now()) {
  return assignments.filter(
    (item) => getStatus(item, now) === "Not submitted"
  ).length;
}

/* =========================================
   UPLOAD

   BACKEND INTEGRATION: replace the body with
     const body = new FormData();
     body.append("file", file);
     body.append("assignmentId", assignment.id);
     const response = await fetch(`${API_URL}/api/submissions/`, { method: "POST", body });
     if (!response.ok) throw new Error(`HTTP ${response.status}`);
   Any rejected promise is shown to the learner as
   "couldn't submit" with Try again.
========================================= */

/* =========================================
   COMPONENT
========================================= */

function Submission({ onDueCountChange, courseId, apiBaseUrl = "/api" }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadAssignments() {
      if (!courseId) {
        setAssignments([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError("");
      try {
        const response = await fetch(`${apiBaseUrl}/assignments/?courseId=${encodeURIComponent(courseId)}`, {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error(`Assignments could not be loaded (${response.status}).`);
        const payload = await response.json();
        const records = Array.isArray(payload) ? payload : (payload.results || []);
        const normalized = records.map((item) => {
          const submission = item.submission;
          const statusMap = { under_review: "Under review", graded: "Graded" };
          return {
            ...item,
            allowedTypes: Array.isArray(item.allowedTypes) && item.allowedTypes.length
              ? item.allowedTypes.map((type) => String(type).toLowerCase().replace(/^\./, ""))
              : ["pdf", "docx", "zip"],
            maxSizeMB: Number(item.maxSizeMB) || 50,
            status: statusMap[submission?.status] || "Not submitted",
            fileName: submission?.fileName || "",
            fileSize: submission?.fileSize || 0,
            submittedDate: submission?.submittedDate ? new Date(submission.submittedDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null,
            score: submission?.score == null ? null : Number(submission.score),
            feedback: submission?.feedback || "",
            submittedFileUrl: submission?.file || "",
          };
        });
        if (!cancelled) setAssignments(normalized);
      } catch (error) {
        if (!cancelled) setLoadError(error.message || "Unable to load assignments.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadAssignments();
    return () => { cancelled = true; };
  }, [courseId, apiBaseUrl]);

  // Per-assignment UI state: { file, error, uploading, uploadFailed }
  const [ui, setUi] = useState({});
  const [draggingId, setDraggingId] = useState(null);
  const [modalId, setModalId] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  const fileInputRefs = useRef({});

  // Re-check "Missed" every minute while the tab is open.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Keep the "N due" badge on the tab in sync.
  const dueCount = getDueCount(assignments, now);

  useEffect(() => {
    if (onDueCountChange) onDueCountChange(dueCount);
  }, [dueCount, onDueCountChange]);

  const patchUi = (id, updates) => {
    setUi((previous) => ({
      ...previous,
      [id]: { ...previous[id], ...updates },
    }));
  };

  const updateAssignment = (id, updates) => {
    setAssignments((previous) =>
      previous.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const openFilePicker = (id) => fileInputRefs.current[id]?.click();

  const clearInput = (id) => {
    const input = fileInputRefs.current[id];
    if (input) input.value = "";
  };

  /* ---------- FILE SELECTION (AC 1, 2, 3) ---------- */

  const processSelectedFile = (file, assignment) => {
    if (!file) return;

    const validType = assignment.allowedTypes.includes(getExtension(file.name));
    const validSize = file.size <= assignment.maxSizeMB * 1024 * 1024;

    if (!validType || !validSize) {
      // Wrong type or too big: explain the rule, no file kept,
      // so Submit stays disabled.
      patchUi(assignment.id, {
        file: null,
        error: getRuleMessage(assignment),
        uploadFailed: false,
      });
      clearInput(assignment.id);
      return;
    }

    patchUi(assignment.id, { file, error: "", uploadFailed: false });
    clearInput(assignment.id);
  };

  const handleFileChange = (event, assignment) => {
    processSelectedFile(event.target.files?.[0], assignment);
  };

  const removeSelectedFile = (assignment) => {
    patchUi(assignment.id, { file: null, error: "", uploadFailed: false });
    clearInput(assignment.id);
  };

  /* ---------- DRAG AND DROP ---------- */

  const handleDragEnter = (event, assignment) => {
    event.preventDefault();
    setDraggingId(assignment.id);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
  };

  const handleDragLeave = (event, assignment) => {
    event.preventDefault();
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setDraggingId((current) => (current === assignment.id ? null : current));
    }
  };

  const handleDrop = (event, assignment) => {
    event.preventDefault();
    setDraggingId(null);

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    if (files.length > 1) {
      patchUi(assignment.id, {
        file: null,
        error: `Upload one file at a time. ${getRuleMessage(assignment)}`,
        uploadFailed: false,
      });
      return;
    }

    processSelectedFile(files[0], assignment);
  };

  /* ---------- SUBMIT / TRY AGAIN (AC 1, 6) ---------- */

  const handleSubmit = async (assignment) => {
    const file = ui[assignment.id]?.file;
    if (!file || ui[assignment.id]?.uploading) return;

    patchUi(assignment.id, { uploading: true, uploadFailed: false });

    try {
      const formData = new FormData();
      formData.append("assignmentId", String(assignment.id));
      formData.append("file", file);
      const response = await fetch(`${apiBaseUrl}/submissions/`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.detail || `Upload failed (${response.status}).`);
      updateAssignment(assignment.id, {
        status: "Under review",
        fileName: result.fileName || file.name,
        fileSize: result.fileSize || file.size,
        submittedDate: result.submittedDate ? new Date(result.submittedDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : formatToday(),
        submittedFileUrl: result.file || "",
        score: null,
        feedback: "",
      });
      patchUi(assignment.id, { file: null, error: "", uploading: false });
    } catch (error) {
      console.error("Submission upload failed:", error);
      // Status stays "Not submitted"; the file stays selected for Try again.
      patchUi(assignment.id, { uploading: false, uploadFailed: true });
    }
  };

  const modalAssignment = assignments.find((item) => item.id === modalId);

  /* ---------- LOADING / ERROR / EMPTY STATES ---------- */

  if (loading) {
    return <section className="cc-submission-container"><p>Loading assignments…</p></section>;
  }

  if (loadError) {
    return <section className="cc-submission-container"><p role="alert">{loadError}</p><button type="button" onClick={() => window.location.reload()}>Try again</button></section>;
  }

  if (assignments.length === 0) {
    return (
      <section className="cc-submission-container">
        <div className="cc-submission-empty">
          <ClipboardList size={30} />
          <h2>No assignments for this course yet</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="cc-submission-container">
      {assignments.map((assignment) => {
        const status = getStatus(assignment, now);
        const isNotSubmitted = status === "Not submitted";
        const isMissed = status === "Missed";
        // File replacement is allowed only before the first successful submit.
        // Once a submission exists, the learner can only view it or its feedback.
        const canUpload = isNotSubmitted;
        const state = ui[assignment.id] || {};
        const selectedFile = state.file || null;
        const isDragging = draggingId === assignment.id;

        const rule = `${formatAllowedTypes(assignment.allowedTypes)} · max ${assignment.maxSizeMB} MB`;

        return (
          <article
            key={assignment.id}
            className={`cc-assignment-row ${
              canUpload ? "cc-assignment-row-upload" : ""
            }`}
          >
            {/* INFORMATION */}
            <div className="cc-assignment-info">
              <h3>{assignment.title}</h3>

              {isNotSubmitted || isMissed ? (
                <p>
                  {assignment.dueAt ? <>Due <strong>{formatDue(assignment.dueAt)}</strong></> : "No due date"}
                  {" · "}
                  {rule}
                </p>
              ) : (
                <p>
                  {status === "Graded" ? "Reviewed" : "Submitted"}{" "}
                  <strong>{assignment.submittedDate}</strong>
                  {" · "}
                  {assignment.fileName}
                </p>
              )}
            </div>

            {/* FILE PICKER / DRAG AND DROP */}
            {canUpload && (
              <div
                className={`cc-assignment-upload ${
                  isDragging ? "cc-drag-active" : ""
                }`}
                onDragEnter={(event) => handleDragEnter(event, assignment)}
                onDragOver={handleDragOver}
                onDragLeave={(event) => handleDragLeave(event, assignment)}
                onDrop={(event) => handleDrop(event, assignment)}
              >
                <input
                  ref={(element) => {
                    fileInputRefs.current[assignment.id] = element;
                  }}
                  type="file"
                  accept={assignment.allowedTypes
                    .map((type) => `.${type}`)
                    .join(",")}
                  hidden
                  onChange={(event) => handleFileChange(event, assignment)}
                />

                {!selectedFile ? (
                  <button
                    type="button"
                    className="cc-upload-prompt"
                    onClick={() => openFilePicker(assignment.id)}
                  >
                    <Upload size={18} />
                    {isDragging
                      ? "Drop your file here"
                      : "Choose a file or drag and drop"}
                  </button>
                ) : (
                  <div className="cc-selected-file">
                    <span className="cc-file-type">
                      {getExtension(selectedFile.name).toUpperCase()}
                    </span>

                    <strong title={selectedFile.name}>{selectedFile.name}</strong>

                    <span className="cc-file-size">
                      · {formatFileSize(selectedFile.size)}
                    </span>

                    <button
                      type="button"
                      className="cc-replace-file"
                      onClick={() => openFilePicker(assignment.id)}
                    >
                      Replace file
                    </button>

                    <button
                      type="button"
                      className="cc-remove-file"
                      onClick={() => removeSelectedFile(assignment)}
                      title="Remove file"
                      aria-label="Remove selected file"
                    >
                      <X size={17} />
                    </button>
                  </div>
                )}

                {/* INLINE ERROR: wrong type / too large (AC 2) */}
                {state.error && (
                  <p className="cc-upload-error" role="alert">
                    {state.error}
                  </p>
                )}

                {/* INLINE ERROR: upload failed (AC 6) */}
                {state.uploadFailed && (
                  <p className="cc-upload-error" role="alert">
                    Couldn't submit your file. Check your connection and try
                    again.
                    <button
                      type="button"
                      className="cc-upload-retry"
                      onClick={() => handleSubmit(assignment)}
                    >
                      Try again
                    </button>
                  </p>
                )}

                {!state.error && !state.uploadFailed && (
                  <p className="cc-upload-hint">
                    Accepted: {formatAllowedTypes(assignment.allowedTypes)}.
                    Max size: {assignment.maxSizeMB} MB.
                  </p>
                )}
              </div>
            )}

            {/* STATUS PILL + ACTION */}
            <div className="cc-assignment-actions">
              <span
                className={`cc-assignment-status ${
                  isNotSubmitted
                    ? "status-not-submitted"
                    : isMissed
                      ? "status-missed"
                      : status === "Under review"
                        ? "status-review"
                        : "status-graded"
                }`}
              >
                {status === "Graded"
                  ? `Graded · ${assignment.score}/${MAX_SCORE}`
                  : status}
              </span>

              {(isNotSubmitted || isMissed) && (
                <button
                  type="button"
                  className="cc-submit-button"
                  disabled={isMissed || !selectedFile || state.uploading}
                  title={isMissed ? "The due date has passed" : undefined}
                  onClick={() => handleSubmit(assignment)}
                >
                  {state.uploading ? "Submitting…" : "Submit"}
                </button>
              )}

              {status === "Under review" && (
                <button
                  type="button"
                  className="cc-view-button"
                  onClick={() => setModalId(assignment.id)}
                >
                  View
                </button>
              )}

              {status === "Graded" && (
                <button
                  type="button"
                  className="cc-feedback-button"
                  onClick={() => setModalId(assignment.id)}
                >
                  View feedback
                </button>
              )}
            </div>
          </article>
        );
      })}

      {/* VIEW / FEEDBACK MODAL */}
      {modalAssignment && (
        <div
          className="cc-submission-modal-overlay"
          onClick={() => setModalId(null)}
        >
          <div
            className="cc-submission-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="cc-modal-close"
              onClick={() => setModalId(null)}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="cc-modal-icon">
              {modalAssignment.status === "Graded" ? (
                <MessageSquare size={25} />
              ) : (
                <CheckCircle2 size={25} />
              )}
            </div>

            <h2>{modalAssignment.title}</h2>

            <p className="cc-modal-label">Submitted file</p>

            <div className="cc-modal-file">
              <FileArchive size={21} />
              {modalAssignment.submittedFileUrl ? (
                <a
                  href={modalAssignment.submittedFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="cc-submitted-file-link"
                >
                  {modalAssignment.fileName}
                </a>
              ) : (
                <strong>{modalAssignment.fileName}</strong>
              )}
              <span>{formatFileSize(modalAssignment.fileSize)}</span>
            </div>

            <p className="cc-modal-label">Submitted on</p>
            <p>{modalAssignment.submittedDate}</p>

            {modalAssignment.status === "Graded" && (
              <>
                <div className="cc-feedback-score">
                  {modalAssignment.score}/{MAX_SCORE}
                </div>

                <p className="cc-modal-label">Trainer comments</p>
                <div className="cc-feedback-comment">
                  {modalAssignment.feedback || "No comments were added."}
                </div>
              </>
            )}

            {modalAssignment.status === "Under review" && (
              <p className="cc-review-message">
                Your assignment has been submitted and is waiting for trainer
                review.
              </p>
            )}

            <button
              type="button"
              className="cc-modal-done"
              onClick={() => setModalId(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default Submission;
