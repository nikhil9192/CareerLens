import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";

const INITIAL_FORM = {
  name: "",
  class_grade: "",
  school_name: "",
  mobile: "",
  gender: "",
  medium: "",
  password: "",
  confirm_password: "",
};

const CLASS_OPTIONS = ["6", "7", "8", "9", "10", "11", "12"];

const labelClass = "mb-1 block text-sm font-medium text-[var(--color-text-muted)]";
const inputClass = "input-dark";

export default function StudentRegistration() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccess("");
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const { confirm_password, ...payload } = form;

    try {
      const data = await apiPost("/api/students", payload);
      localStorage.setItem("student_id", data.student.id);
      if (data.token) {
        localStorage.setItem("careerlens_token", data.token);
      }
      setSuccess(`Registration successful! Welcome, ${data.student.name}.`);
      setForm(INITIAL_FORM);
      navigate("/marks");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-lg">
        <Link
          to="/"
          className="mb-6 inline-block text-sm text-[var(--accent-cyan)] hover:underline"
        >
          ← Back to home
        </Link>

        <div className="auth-card p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Student Registration
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Fill in your details to get started with CareerLens.
          </p>

          {success && (
            <div
              role="alert"
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
              <label htmlFor="name" className={labelClass}>
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="class_grade" className={labelClass}>
                Class
              </label>
              <select
                id="class_grade"
                name="class_grade"
                required
                value={form.class_grade}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select class</option>
                {CLASS_OPTIONS.map((grade) => (
                  <option key={grade} value={grade}>
                    Class {grade}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="school_name" className={labelClass}>
                School Name
              </label>
              <input
                id="school_name"
                name="school_name"
                type="text"
                required
                value={form.school_name}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter your school name"
              />
            </div>

            <div>
              <label htmlFor="mobile" className={labelClass}>
                Mobile Number
              </label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                required
                value={form.mobile}
                onChange={handleChange}
                className={inputClass}
                placeholder="10-digit mobile number"
              />
            </div>

            <div>
              <label htmlFor="gender" className={labelClass}>
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                required
                value={form.gender}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="medium" className={labelClass}>
                Medium
              </label>
              <select
                id="medium"
                name="medium"
                required
                value={form.medium}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select medium</option>
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={handleChange}
                className={inputClass}
                placeholder="Create a password (min 6 characters)"
              />
            </div>

            <div>
              <label htmlFor="confirm_password" className={labelClass}>
                Re-enter Password
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                required
                minLength={6}
                value={form.confirm_password}
                onChange={handleChange}
                className={inputClass}
                placeholder="Re-enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm font-medium disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
