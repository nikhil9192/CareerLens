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
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-lg">
        <Link
          to="/"
          className="mb-6 inline-block text-sm text-indigo-600 hover:text-indigo-700"
        >
          ← Back to home
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-slate-800">Student Registration</h1>
          <p className="mt-1 text-sm text-slate-500">
            Fill in your details to get started with CareerLens.
          </p>

          {success && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
            >
              {success}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="class_grade" className="mb-1 block text-sm font-medium text-slate-700">
                Class
              </label>
              <select
                id="class_grade"
                name="class_grade"
                required
                value={form.class_grade}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
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
              <label htmlFor="school_name" className="mb-1 block text-sm font-medium text-slate-700">
                School Name
              </label>
              <input
                id="school_name"
                name="school_name"
                type="text"
                required
                value={form.school_name}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="Enter your school name"
              />
            </div>

            <div>
              <label htmlFor="mobile" className="mb-1 block text-sm font-medium text-slate-700">
                Mobile Number
              </label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                required
                value={form.mobile}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="10-digit mobile number"
              />
            </div>

            <div>
              <label htmlFor="gender" className="mb-1 block text-sm font-medium text-slate-700">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                required
                value={form.gender}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="medium" className="mb-1 block text-sm font-medium text-slate-700">
                Medium
              </label>
              <select
                id="medium"
                name="medium"
                required
                value={form.medium}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">Select medium</option>
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="Create a password (min 6 characters)"
              />
            </div>

            <div>
              <label htmlFor="confirm_password" className="mb-1 block text-sm font-medium text-slate-700">
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="Re-enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
