import { useState, type FormEvent } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { BrainCircuit, LayoutGrid, Users, LogOut, ShieldCheck } from "lucide-react";
import {
  getAdminSecret,
  clearAdminSecret,
  verifyAdminSecret,
} from "../../services/aiLiteracy.admin.api";

function navClass(isActive: boolean): string {
  const base =
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition";
  return isActive
    ? `${base} bg-[rgba(0,212,255,0.12)] text-[var(--accent-cyan)]`
    : `${base} text-[var(--text-secondary)] hover:text-[var(--accent-cyan)]`;
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!secret.trim()) return;
    setLoading(true);
    setError("");
    try {
      const ok = await verifyAdminSecret(secret.trim());
      if (ok) {
        onSuccess();
      } else {
        setError("Incorrect admin secret. Please try again.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not verify the secret."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <form
        onSubmit={handleSubmit}
        className="auth-card w-full max-w-sm p-6 md:p-8"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <span
            className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-[#0a0f1e]"
            style={{ background: "linear-gradient(135deg, #00d4ff, #7c3aed)" }}
          >
            <ShieldCheck size={24} />
          </span>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">
            AI Literacy Admin
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Enter the admin secret to manage content.
          </p>
        </div>

        <label
          htmlFor="admin-secret"
          className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]"
        >
          Admin secret
        </label>
        <input
          id="admin-secret"
          type="password"
          autoComplete="off"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="input-dark"
          placeholder="••••••••••••"
        />

        {error && (
          <p className="mt-3 text-sm text-[var(--error)]" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !secret.trim()}
          className="btn-primary mt-5 w-full py-2.5 text-sm"
        >
          {loading ? "Verifying..." : "Unlock"}
        </button>

        <Link
          to="/"
          className="mt-4 block text-center text-xs text-[var(--text-secondary)] hover:text-[var(--accent-cyan)]"
        >
          ← Back to site
        </Link>
      </form>
    </div>
  );
}

export default function AdminLayout() {
  const location = useLocation();
  const [authed, setAuthed] = useState(Boolean(getAdminSecret()));

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  function handleLogout() {
    clearAdminSecret();
    setAuthed(false);
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--text-primary)]">
      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: "var(--navbar-bg)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link
            to="/admin/ai-literacy"
            className="flex items-center gap-2 text-base font-bold"
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#0a0f1e]"
              style={{ background: "linear-gradient(135deg, #00d4ff, #7c3aed)" }}
            >
              <BrainCircuit size={16} />
            </span>
            <span className="gradient-text">AI Literacy Admin</span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavLink
              to="/admin/ai-literacy"
              end
              className={({ isActive }) => navClass(isActive)}
            >
              <LayoutGrid size={16} />
              <span className="hidden sm:inline">Levels</span>
            </NavLink>
            <NavLink
              to="/admin/ai-literacy/progress"
              className={({ isActive }) => navClass(isActive)}
            >
              <Users size={16} />
              <span className="hidden sm:inline">Progress</span>
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--error)]"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Lock</span>
            </button>
          </nav>
        </div>
      </header>

      <main
        key={location.pathname}
        className="mx-auto w-full max-w-5xl px-4 py-6 md:py-8"
      >
        <Outlet />
      </main>
    </div>
  );
}
