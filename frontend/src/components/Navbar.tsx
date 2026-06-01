import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { isAuthenticated, logout } from "../services/auth";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/marks", label: "Enter Marks", icon: "📝" },
  { to: "/career-quiz", label: "Career Quiz", icon: "🎯" },
];

function desktopLinkClass(isActive: boolean): string {
  const base =
    "relative rounded-lg px-3 py-2 text-sm font-medium transition";
  if (isActive) {
    return `${base} text-[var(--accent-cyan)]`;
  }
  return `${base} text-[var(--text-secondary)] hover:text-[var(--accent-cyan)]`;
}

function mobileMenuLinkClass(isActive: boolean): string {
  const base =
    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition";
  if (isActive) {
    return `${base} bg-[rgba(0,212,255,0.1)] text-[var(--accent-cyan)]`;
  }
  return `${base} text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--accent-cyan)]`;
}

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!isAuthenticated()) {
    return null;
  }

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate("/");
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        background: "var(--navbar-bg)",
        borderColor: "var(--border)",
      }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <NavLink
          to="/dashboard"
          className="gradient-text text-base font-bold sm:text-lg"
          onClick={closeMenu}
        >
          CareerLens
        </NavLink>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => desktopLinkClass(isActive)}
            >
              {({ isActive }) => (
                <>
                  {item.icon} {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[var(--accent-cyan)]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="ml-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--error)]"
          >
            🚪 Logout
          </button>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-xl text-[var(--text-primary)] transition hover:bg-[var(--bg-card-hover)] md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div
          className="border-t md:hidden"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="mx-auto max-w-5xl space-y-1 px-2 py-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => mobileMenuLinkClass(isActive)}
                onClick={closeMenu}
              >
                <span className="text-lg" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="md:inline">{item.label}</span>
              </NavLink>
            ))}
            <NavLink
              to="/profile"
              className={({ isActive }) => mobileMenuLinkClass(isActive)}
              onClick={closeMenu}
            >
              <span className="text-lg" aria-hidden="true">
                👤
              </span>
              <span>Profile</span>
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-[var(--error)] transition hover:bg-[var(--color-error-bg)]"
            >
              <span className="text-lg" aria-hidden="true">
                🚪
              </span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
