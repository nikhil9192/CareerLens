import { NavLink } from "react-router-dom";
import { isAuthenticated } from "../services/auth";

const BOTTOM_ITEMS = [
  { to: "/dashboard", label: "Home", icon: "🏠" },
  { to: "/marks", label: "Marks", icon: "📝" },
  { to: "/career-quiz", label: "Quiz", icon: "🎯" },
  { to: "/ai-chat", label: "AI", icon: "🧠" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

function bottomLinkClass(isActive: boolean): string {
  const base =
    "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition sm:text-xs";
  if (isActive) {
    return `${base} text-[var(--accent-cyan)]`;
  }
  return `${base} text-[var(--text-secondary)] hover:text-[var(--accent-cyan)]`;
}

export default function BottomNav() {
  if (!isAuthenticated()) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t md:hidden"
      style={{
        background: "var(--navbar-bg)",
        borderColor: "var(--border)",
      }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {BOTTOM_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => bottomLinkClass(isActive)}
          >
            <span className="text-lg" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
