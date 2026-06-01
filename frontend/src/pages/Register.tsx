import { useState, useEffect, useCallback, FormEvent, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput, {
  fieldClass,
  labelClass,
  buttonClass,
} from "../components/PasswordInput";
import SchoolSearchDropdown from "../components/SchoolSearchDropdown";
import { register } from "../services/auth.api";
import { fetchSchools } from "../services/schools.api";
import type { School } from "../types/school";

const CLASS_OPTIONS = [6, 7, 8, 9, 10, 11, 12];

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobile: string;
  school_id: string;
  class_grade: string;
  gender: string;
  medium: string;
}

const INITIAL: FormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  mobile: "",
  school_id: "",
  class_grade: "",
  gender: "",
  medium: "",
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [schoolsError, setSchoolsError] = useState("");
  const [schoolFieldError, setSchoolFieldError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadSchools = useCallback(() => {
    setSchoolsLoading(true);
    setSchoolsError("");
    fetchSchools()
      .then(setSchools)
      .catch((err: unknown) => {
        const message =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error ||
          "Failed to load schools. Make sure the backend is running on port 8000.";
        setSchoolsError(message);
      })
      .finally(() => setSchoolsLoading(false));
  }, []);

  useEffect(() => {
    loadSchools();
  }, [loadSchools]);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  function handleSchoolChange(schoolId: string) {
    setForm((prev) => ({ ...prev, school_id: schoolId }));
    setSchoolFieldError("");
    setError("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSchoolFieldError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!/^\d{10}$/.test(form.mobile)) {
      setError("Mobile number must be exactly 10 digits.");
      return;
    }

    if (!form.school_id) {
      setSchoolFieldError("Please select your school from the list.");
      return;
    }

    setLoading(true);

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        mobile: form.mobile.trim(),
        school_id: form.school_id,
        class_grade: Number(form.class_grade),
        gender: form.gender,
        medium: form.medium,
      });

      navigate("/login", {
        state: { toast: "Account created! Please login." },
      });
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { error?: string } } })
        ?.response?.data;
      setError(res?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-[480px]">
        <Link
          to="/"
          className="mb-6 inline-block text-sm font-medium text-[var(--accent-cyan)] hover:underline"
        >
          ← Back to home
        </Link>

        <div className="auth-card p-6 shadow-md sm:p-8">
          <p className="gradient-text text-center text-lg font-bold">
            CareerLens
          </p>
          <h1 className="mt-4 text-2xl font-bold text-[var(--color-text)]">
            Create Account
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Register to start your career guidance journey.
          </p>

          {schoolsError && (
            <div
              role="alert"
              className="mt-4 rounded-lg p-3 text-sm text-[var(--color-fail)]"
              style={{ backgroundColor: "var(--color-error-bg)" }}
            >
              <p>{schoolsError}</p>
              <button
                type="button"
                onClick={loadSchools}
                className="mt-2 font-medium text-[var(--color-brand)] underline hover:text-[var(--color-brand-dark)]"
              >
                Retry loading schools
              </button>
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
                disabled={loading}
                className={fieldClass}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                className={fieldClass}
                placeholder="you@school.com"
              />
            </div>

            <PasswordInput
              id="password"
              name="password"
              label="Password"
              required
              minLength={8}
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              placeholder="Min 8 characters"
            />

            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              required
              minLength={8}
              value={form.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              placeholder="Re-enter password"
            />

            <div>
              <label htmlFor="mobile" className={labelClass}>
                Mobile Number
              </label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                required
                inputMode="numeric"
                pattern="\d{10}"
                maxLength={10}
                value={form.mobile}
                onChange={handleChange}
                disabled={loading}
                className={fieldClass}
                placeholder="10-digit mobile number"
              />
            </div>

            <SchoolSearchDropdown
              schools={schools}
              value={form.school_id}
              onChange={handleSchoolChange}
              loading={schoolsLoading}
              disabled={loading || Boolean(schoolsError)}
              error={schoolFieldError}
            />

            <div>
              <label htmlFor="class_grade" className={labelClass}>
                Class Grade
              </label>
              <select
                id="class_grade"
                name="class_grade"
                required
                value={form.class_grade}
                onChange={handleChange}
                disabled={loading}
                className={fieldClass}
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
              <label htmlFor="gender" className={labelClass}>
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                required
                value={form.gender}
                onChange={handleChange}
                disabled={loading}
                className={fieldClass}
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
                disabled={loading}
                className={fieldClass}
              >
                <option value="">Select medium</option>
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || schoolsLoading}
              className={buttonClass}
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-dark)]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
