import { useState, FormEvent } from "react";
import { ownerLogin } from "../../services/schoolOwner.api";
import { setSchoolOwnerToken, setOwnerName, SCHOOL_TOKEN_KEY } from "../../services/auth";
import PasswordInput, { fieldClass, labelClass, buttonClass } from "../../components/PasswordInput";

export default function SchoolLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await ownerLogin({ email: email.trim(), password });

      // Store the school owner token under its OWN dedicated key
      setSchoolOwnerToken(data.token);
      setOwnerName(data.owner.name);

      // Debug: confirm token is saved
      console.log("[SchoolLogin] Token saved to:", SCHOOL_TOKEN_KEY);
      console.log("[SchoolLogin] Token prefix:", data.token.slice(0, 20) + "…");
      console.log("[SchoolLogin] All localStorage keys:", Object.keys(localStorage));

      // Use window.location.href instead of React Router navigate() so the
      // page does a full reload — this guarantees SchoolOwnerRoute reads the
      // freshly saved token and cannot redirect back to login.
      window.location.href = "/school/dashboard";
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Invalid credentials. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 py-8">
      <div className="auth-card w-full max-w-md p-6 shadow-md sm:p-8">
        <p className="gradient-text text-center text-lg font-bold">VidyaLens</p>
        <h1 className="mt-4 text-xl font-bold text-[var(--color-text)] md:text-2xl">
          School Owner Sign In
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Sign in with your teacher credentials to access the school dashboard
        </p>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-lg p-3 text-sm text-[var(--color-fail)]"
            style={{ backgroundColor: "var(--color-error-bg)" }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 md:flex md:flex-col md:items-stretch"
        >
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
              placeholder="teacher@school.com"
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

          <button
            type="submit"
            disabled={loading}
            className={`${buttonClass} md:mx-auto md:flex`}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
          Students →{" "}
          <a href="/login" className="text-[var(--accent-cyan)] hover:underline">
            Student login
          </a>
        </p>
      </div>
    </div>
  );
}
