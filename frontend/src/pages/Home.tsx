import { Link } from "react-router-dom";
import {
  Aperture,
  BarChart3,
  Brain,
  Lightbulb,
  Mail,
  Route,
  Sparkles,
  Target,
} from "lucide-react";
import { isAuthenticated } from "../services/auth";

const HERO_GRADIENT = "linear-gradient(135deg, #38BDF8, #818CF8)";

const FEATURES = [
  {
    title: "Smart Marks Analysis",
    description: "Track your academic performance across subjects and terms.",
    Icon: BarChart3,
  },
  {
    title: "AI Career Matching",
    description: "Find careers that suit your interests, skills, and marks.",
    Icon: Target,
  },
  {
    title: "15-Question Assessment",
    description: "Understand your strengths with a guided interest quiz.",
    Icon: Sparkles,
  },
];

const AI_LITERACY = [
  {
    title: "See AI work, not just use it",
    description:
      "Short explainers show how your matches are calculated, so you understand the reasoning behind every recommendation.",
    Icon: Route,
  },
  {
    title: "Future-ready career picks",
    description:
      "Our paths include AI, data, and emerging tech careers — not just the traditional options.",
    Icon: Sparkles,
  },
];

const NAV_LINKS = [
  { label: "How it works", href: "#features" },
  { label: "AI literacy", href: "#ai-literacy" },
  { label: "For schools", href: "#features" },
];

export default function Home() {
  const loggedIn = isAuthenticated();

  return (
    <div className="min-h-screen w-full bg-[#060912] text-[var(--text-primary)]">
      {!loggedIn && (
        <header className="sticky top-0 z-50 border-b border-[#1E2A45] bg-[#060912]/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
            <Link to="/" className="flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-lg"
                style={{ background: "linear-gradient(135deg, #3B82F6, #06B6D4)" }}
              >
                <Aperture size={18} strokeWidth={2.4} aria-hidden="true" />
              </span>
              <span className="text-base font-bold tracking-tight">VidyaLens</span>
            </Link>

            <nav className="hidden items-center gap-7 md:flex">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-[var(--text-secondary)] transition hover:text-[#38BDF8]"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <Link
              to="/login"
              className="rounded-lg border border-[#1E2A45] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[#38BDF8] hover:text-[#38BDF8]"
            >
              Login
            </Link>
          </div>
        </header>
      )}

      <section className="relative overflow-hidden px-4 py-16 md:px-8 md:py-24 lg:py-28">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(56,189,248,0.18) 0%, rgba(129,140,248,0.08) 35%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#1E2A45] bg-[rgba(56,189,248,0.08)] px-4 py-1.5 text-xs font-medium text-[#38BDF8] md:text-sm">
            <Sparkles size={15} aria-hidden="true" />
            Powered by AI career intelligence
          </span>

          <h1 className="mt-6 text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            <span className="text-[var(--text-primary)]">Discover Your </span>
            <span
              style={{
                background: HERO_GRADIENT,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }}
            >
              Perfect Career Path
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base text-[var(--text-secondary)] md:text-lg">
            We match your marks, interests, and personality against real career
            paths to show what fits you best.
          </p>

          <div className="mt-9 flex w-full flex-col items-center gap-3">
            <Link
              to={loggedIn ? "/dashboard" : "/register"}
              className="w-full rounded-xl px-8 py-3.5 text-base font-semibold text-white shadow-lg transition hover:opacity-95 md:w-auto"
              style={{ background: "linear-gradient(135deg, #3B82F6, #06B6D4)" }}
            >
              {loggedIn ? "Go to Dashboard" : "Get Started Free"}
            </Link>
            {!loggedIn && (
              <p className="text-sm text-[var(--text-secondary)]">
                New here? Takes 30 seconds to create an account first.
              </p>
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-5xl px-4 pb-16 md:px-8 lg:px-12">
        <section className="rounded-2xl border border-[#1E2A45] bg-[#0A0F1C] p-5 md:p-7">
          <div className="flex items-center gap-4">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
              style={{ background: "linear-gradient(135deg, #3B82F6, #06B6D4)" }}
            >
              <Brain size={24} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold md:text-lg">
                5-dimension AI matching engine
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Scans 30 career paths against your unique profile in seconds.
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span
                className="text-4xl font-bold md:text-5xl"
                style={{
                  background: HERO_GRADIENT,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }}
              >
                30
              </span>
              <p className="text-xs text-[var(--text-secondary)]">career paths</p>
            </div>
          </div>
        </section>

        <section id="features" className="mt-14 scroll-mt-20">
          <h2 className="text-center text-xl font-bold md:text-2xl">
            Everything you need to plan your future
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-[var(--text-secondary)] md:text-base">
            From marks to matches — VidyaLens helps you make confident career
            decisions.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-3 md:gap-6">
            {FEATURES.map(({ title, description, Icon }) => (
              <div
                key={title}
                className="rounded-2xl border border-[#1E2A45] bg-[#0A0F1C] p-5 transition hover:border-[#38BDF8]/40 md:p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(56,189,248,0.1)] text-[#38BDF8]">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-bold md:text-lg">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="ai-literacy" className="mt-16 scroll-mt-20">
          <h2 className="flex items-center justify-center gap-2 text-center text-xl font-bold md:text-2xl">
            <Lightbulb size={22} className="text-[#38BDF8]" aria-hidden="true" />
            Why learn about AI here too
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {AI_LITERACY.map(({ title, description, Icon }) => (
              <div
                key={title}
                className="rounded-2xl border border-[#1E2A45] bg-[#0A0F1C] p-5 md:p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(129,140,248,0.12)] text-[#818CF8]">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-bold md:text-lg">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              to={loggedIn ? "/ai-literacy" : "/login"}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 md:text-base"
              style={{ background: "linear-gradient(135deg, #3B82F6, #06B6D4)" }}
            >
              <Brain size={18} aria-hidden="true" />
              Explore the AI Literacy module
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#1E2A45] px-4 py-6 md:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-xs text-[var(--text-secondary)] sm:flex-row">
          <span>VidyaLens · Built with AI in India</span>
          <a
            href="mailto:nikhilsinghtech0852@gmail.com"
            className="flex items-center gap-1.5 transition hover:text-[#38BDF8]"
          >
            <Mail size={14} aria-hidden="true" />
            nikhilsinghtech0852@gmail.com
          </a>
        </div>
      </footer>
    </div>
  );
}
