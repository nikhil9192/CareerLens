import { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import PasswordInput, { fieldClass, labelClass, buttonClass } from "../components/PasswordInput";
import { login } from "../services/auth.api";
import { setStudentId, setStudentName } from "../services/auth";
import { TOKEN_KEY } from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const message = (location.state as { toast?: string })?.toast;
    if (message) {
      setToast(message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setToast("");

    try {
      const data = await login({ email: email.trim(), password });
      localStorage.setItem(TOKEN_KEY, data.token);
      setStudentId(data.student.id);
      setStudentName(data.student.name);
      navigate("/dashboard");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Invalid credentials. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 py-8">
      <div className="auth-card w-full max-w-[480px] p-6 shadow-md sm:p-8">
        <p className="gradient-text text-center text-lg font-bold">
          CareerLens
        </p>
        <h1 className="mt-4 text-2xl font-bold text-[var(--color-text)]">
          Sign In
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Log in with your email and password
        </p>

        {toast && (
          <div
            role="status"
            className="mt-4 rounded-lg p-3 text-sm text-[var(--color-good)]"
            style={{ backgroundColor: "var(--color-success-bg)" }}
          >
            {toast}
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
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className={fieldClass}
              placeholder="you@school.com"
              autoComplete="email"
            />
          </div>

          <PasswordInput
            id="password"
            label="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="Enter your password"
            autoComplete="current-password"
          />

          <button type="submit" disabled={loading} className={buttonClass}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
          New student?{" "}
          <Link
            to="/register"
            className="font-medium text-[var(--accent-cyan)] hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
