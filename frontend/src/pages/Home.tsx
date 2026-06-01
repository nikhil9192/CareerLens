import { Link } from "react-router-dom";
import { isAuthenticated } from "../services/auth";

const FEATURES = [
  {
    title: "Smart Marks Analysis",
    description: "Track your academic performance across subjects and terms.",
    icon: "📊",
  },
  {
    title: "AI Career Matching",
    description: "Find careers that suit your interests, skills, and marks.",
    icon: "🎯",
  },
  {
    title: "15-Question Assessment",
    description: "Understand your strengths with a guided interest quiz.",
    icon: "✨",
  },
];

export default function Home() {
  const loggedIn = isAuthenticated();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <header className="hero-dark px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="gradient-text text-xl font-bold">CareerLens</p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            <span className="text-[var(--text-primary)]">Discover Your </span>
            <span className="gradient-text-cyan">Perfect Career Path</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-[var(--text-secondary)] sm:text-xl">
            AI-powered career guidance for Class 6–12 students
          </p>

          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              to={loggedIn ? "/dashboard" : "/register"}
              className="btn-primary px-8 py-3.5 text-base"
            >
              {loggedIn ? "Go to Dashboard" : "Get Started Free"}
            </Link>
            {!loggedIn && (
              <p className="text-sm text-[var(--text-secondary)]">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-[var(--accent-cyan)] hover:underline"
                >
                  Login
                </Link>
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-[var(--text-primary)]">
          Everything you need to plan your future
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-[var(--text-secondary)]">
          From marks to matches — CareerLens helps you make confident career
          decisions.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="card p-6">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(0,212,255,0.1)] text-2xl"
                aria-hidden="true"
              >
                {feature.icon}
              </span>
              <h3 className="mt-4 text-lg font-bold text-[var(--text-primary)]">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
