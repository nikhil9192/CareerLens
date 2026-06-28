import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { getOwnerName, getSchoolId, schoolOwnerLogout } from "../../services/auth";

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/school/dashboard", label: "Dashboard", icon: "🏫" },
  { to: "/school/profile", label: "School Profile", icon: "⚙️" },
];

export default function SchoolLayout() {
  const navigate = useNavigate();
  const ownerName = getOwnerName() ?? "School Owner";
  const schoolId = getSchoolId();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    schoolOwnerLogout();
    navigate("/school/login");
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
      isActive
        ? "bg-[var(--accent-cyan)] bg-opacity-15 text-[var(--accent-cyan)]"
        : "text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)]",
    ].join(" ");

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* ── Top header ──────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 backdrop-blur-sm"
        style={{ background: "var(--color-surface, #0f172a)" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-[var(--accent-cyan)]">
            VidyaLens
          </span>
          <span className="hidden text-xs text-[var(--color-text-muted)] md:inline">
            School Dashboard
          </span>
        </div>

        {/* Desktop: inline nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-[var(--color-text-muted)] md:inline">
            {ownerName}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="hidden rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-fail)] hover:text-[var(--color-fail)] md:inline-flex"
          >
            Sign out
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="rounded-lg p-2 text-[var(--color-text-muted)] transition hover:bg-white/5 md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Open menu"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile dropdown nav */}
      {menuOpen && (
        <div
          className="z-20 border-b border-white/10 px-4 py-3 md:hidden"
          style={{ background: "var(--color-surface, #0f172a)" }}
        >
          <p className="mb-2 text-xs text-[var(--color-text-muted)]">
            {ownerName}
            {schoolId && (
              <span className="ml-2 opacity-50 text-[10px]">
                ID: {schoolId.slice(0, 8)}…
              </span>
            )}
          </p>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={navLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 w-full rounded-xl border border-[var(--color-fail)] py-2.5 text-sm font-medium text-[var(--color-fail)]"
          >
            Sign out
          </button>
        </div>
      )}

      {/* ── Page content ────────────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
