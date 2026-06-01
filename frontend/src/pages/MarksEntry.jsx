import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";

const EXAM_TERMS = ["Term1", "Term2", "Final"];

const SUBJECTS = [
  "Math",
  "Science",
  "English",
  "Hindi",
  "Social Science",
];

const INITIAL_MARKS = Object.fromEntries(SUBJECTS.map((s) => [s, ""]));

const inputClass = "input-dark disabled:opacity-60";

export default function MarksEntry() {
  const navigate = useNavigate();
  const [examTerm, setExamTerm] = useState("");
  const [marks, setMarks] = useState(INITIAL_MARKS);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function handleMarksChange(subject, value) {
    if (value === "" || (/^\d+$/.test(value) && Number(value) <= 100)) {
      setMarks((prev) => ({ ...prev, [subject]: value }));
      setSuccess("");
      setError("");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    const studentId = localStorage.getItem("student_id");
    if (!studentId) {
      setError("Student ID not found. Please register first.");
      setLoading(false);
      return;
    }

    if (!examTerm) {
      setError("Please select an exam term.");
      setLoading(false);
      return;
    }

    const emptySubject = SUBJECTS.find((s) => marks[s] === "");
    if (emptySubject) {
      setError(`Please enter marks for ${emptySubject}.`);
      setLoading(false);
      return;
    }

    const subjects = SUBJECTS.map((subject) => ({
      subject,
      marks: Number(marks[subject]),
      total_marks: 100,
    }));

    try {
      const data = await apiPost("/api/marks", {
        student_id: studentId,
        exam_term: examTerm,
        subjects,
      });

      setSuccess("Marks saved successfully!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      const apiErr = err && typeof err === "object" ? err : {};
      const response = "response" in apiErr ? apiErr.response : undefined;
      const data =
        response && typeof response === "object" && "data" in response
          ? response.data
          : undefined;
      const message =
        (data && typeof data === "object" && "error" in data && data.error) ||
        (data && typeof data === "object" && "message" in data && data.message) ||
        (err instanceof Error ? err.message : null) ||
        "Failed to save marks. Please try again.";
      setError(String(message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-8">
      <div className="mx-auto w-full max-w-[480px]">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-4 text-sm font-medium text-[var(--color-brand)] hover:underline"
        >
          ← Back to Dashboard
        </button>

        <div className="auth-card p-6">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Enter Your Marks</h1>

          {success && (
            <div
              role="status"
              className="mt-4 rounded-lg p-3 text-sm text-[var(--color-good)]"
              style={{ backgroundColor: "var(--color-success-bg)" }}
            >
              {success}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-lg p-3 text-sm text-[var(--color-fail)]"
              style={{ backgroundColor: "var(--color-error-bg)" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="exam_term"
                className="mb-1 block text-sm font-medium text-[var(--color-text-muted)]"
              >
                Exam Term
              </label>
              <select
                id="exam_term"
                value={examTerm}
                onChange={(e) => {
                  setExamTerm(e.target.value);
                  setSuccess("");
                  setError("");
                }}
                disabled={loading}
                required
                className={inputClass}
              >
                <option value="">Select exam term</option>
                {EXAM_TERMS.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-[var(--color-text-muted)]">Subjects</p>
              <div className="space-y-3">
                {SUBJECTS.map((subject) => (
                  <div
                    key={subject}
                    className="card p-4"
                  >
                    <label
                      htmlFor={subject}
                      className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]"
                    >
                      {subject}
                    </label>
                    <input
                      id={subject}
                      type="number"
                      min={0}
                      max={100}
                      required
                      disabled={loading}
                      value={marks[subject]}
                      onChange={(e) => handleMarksChange(subject, e.target.value)}
                      placeholder="0 – 100"
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex w-full items-center justify-center gap-2 py-3 font-semibold disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span
                    className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
                    aria-hidden="true"
                  />
                  Please wait...
                </>
              ) : (
                "Submit Marks"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
