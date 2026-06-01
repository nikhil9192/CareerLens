import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { isAuthenticated, logout } from "../services/auth";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", shortLabel: "Home", icon: "🏠" },
  { to: "/marks", label: "Enter Marks", shortLabel: "Marks", icon: "📝" },
  { to: "/career-quiz", label: "Career Quiz", shortLabel: "Quiz", icon: "🎯" },
];

function navLinkClass(isActive: boolean, variant: "desktop" | "mobile"): string {
  const base =
    variant === "desktop"
      ? "relative rounded-lg px-3 py-2 text-sm font-medium transition"
      : "relative flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition";

  if (isActive) {
    return `${base} text-[var(--accent-cyan)]`;
  }
  return `${base} text-[var(--text-secondary)] hover:text-[var(--accent-cyan)]`;
}

export default function Navbar() {
  const navigate = useNavigate();
  useLocation();

  if (!isAuthenticated()) {
    return null;
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <>
      <nav
        className="sticky top-0 z-50 hidden border-b md:block"
        style={{
          background: "var(--navbar-bg)",
          borderColor: "var(--border)",
        }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <NavLink to="/dashboard" className="gradient-text text-lg font-bold">
            CareerLens
          </NavLink>

          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => navLinkClass(isActive, "desktop")}
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
        </div>
      </nav>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t md:hidden"
        style={{
          background: "var(--navbar-bg)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-stretch justify-around px-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => navLinkClass(isActive, "mobile")}
            >
              <span className="text-lg" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.shortLabel}</span>
            </NavLink>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium text-[var(--text-secondary)] transition hover:text-[var(--error)]"
          >
            <span className="text-lg" aria-hidden="true">
              🚪
            </span>
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}
