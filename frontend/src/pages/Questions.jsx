import { Link } from "react-router-dom";

export default function Questions() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="auth-card w-full max-w-[480px] p-6 text-center shadow-md">
        <p className="gradient-text text-lg font-bold">CareerLens</p>
        <h1 className="mt-4 text-2xl font-bold text-[var(--color-text)]">
          Career Questions
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          This section is coming soon. Your marks have been saved.
        </p>
        <Link
          to="/marks"
          className="mt-6 inline-block text-sm font-medium text-[var(--accent-cyan)] hover:underline"
        >
          ← Back to marks entry
        </Link>
      </div>
    </div>
  );
}
