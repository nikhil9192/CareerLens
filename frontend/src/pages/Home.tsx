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
    <div className="min-h-screen w-full bg-[var(--bg-primary)]">
      <header className="hero-dark px-4 py-16 md:px-8 md:py-24 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="gradient-text text-lg font-bold md:text-xl">CareerLens</p>
          <h1 className="mt-4 text-2xl font-bold tracking-tight md:mt-6 md:text-4xl lg:text-6xl">
            <span className="text-[var(--text-primary)]">Discover Your </span>
            <span className="gradient-text-cyan">Perfect Career Path</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-[var(--text-secondary)] md:mt-5 md:text-lg lg:text-xl">
            AI-powered career guidance for Class 6–12 students
          </p>

          <div className="mt-8 flex w-full flex-col items-stretch gap-4 md:mt-10 md:items-center">
            <Link
              to={loggedIn ? "/dashboard" : "/register"}
              className="btn-primary w-full px-8 py-3.5 text-base md:w-auto"
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

      <main className="mx-auto w-full max-w-5xl px-4 py-12 md:px-8 md:py-16 lg:px-16">
        <h2 className="text-center text-xl font-bold text-[var(--text-primary)] md:text-2xl">
          Everything you need to plan your future
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-sm text-[var(--text-secondary)] md:text-base">
          From marks to matches — CareerLens helps you make confident career
          decisions.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-3 md:gap-6">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="card p-4 md:p-6">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(0,212,255,0.1)] text-xl md:h-12 md:w-12 md:text-2xl"
                aria-hidden="true"
              >
                {feature.icon}
              </span>
              <h3 className="mt-3 text-base font-bold text-[var(--text-primary)] md:mt-4 md:text-lg">
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
