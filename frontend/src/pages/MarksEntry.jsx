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

const inputClass =
  "w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-gray-100";

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

      setSuccess(data.message || "Marks saved successfully!");
      setTimeout(() => navigate("/questions"), 1500);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to save marks. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-8">
      <div className="mx-auto w-full max-w-[480px]">
        <p className="mb-2 text-center text-lg font-bold text-indigo-600">
          CareerLens
        </p>

        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h1 className="text-2xl font-bold text-gray-800">Enter Your Marks</h1>

          {success && (
            <div
              role="alert"
              className="mt-4 rounded-lg bg-green-50 p-3 text-green-600"
            >
              {success}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-lg bg-red-50 p-3 text-red-600"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="exam_term"
                className="mb-1 block text-sm font-medium text-gray-600"
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
              <p className="text-sm font-medium text-gray-600">Subjects</p>
              <div className="space-y-3">
                {SUBJECTS.map((subject) => (
                  <div
                    key={subject}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <label
                      htmlFor={subject}
                      className="mb-2 block text-sm font-medium text-gray-600"
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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
