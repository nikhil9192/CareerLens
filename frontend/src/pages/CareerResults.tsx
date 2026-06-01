import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { fetchCareerResults, retakeCareerQuiz } from "../services/career.api";
import { fetchMe } from "../services/auth.api";
import { getStudentName } from "../services/auth";
import type { CareerMatch } from "../types/career";

const RANK_LABELS = ["1st Match", "2nd Match", "3rd Match"];
const RANK_MEDALS = ["🥇", "🥈", "🥉"];

function matchScoreColor(score: number): string {
  if (score > 75) return "var(--color-good)";
  if (score >= 50) return "var(--color-average)";
  return "var(--color-fail)";
}

function growthTrendStyle(trend: string): string {
  const lower = trend.toLowerCase();
  if (lower.includes("ris")) return "bg-[rgba(16,185,129,0.15)] text-[var(--success)]";
  if (lower.includes("declin")) return "bg-[rgba(239,68,68,0.15)] text-[var(--error)]";
  return "bg-[rgba(245,166,35,0.15)] text-[var(--accent-gold)]";
}

function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="skeleton-bone h-10 w-64" />
      <div className="skeleton-bone h-64 w-full rounded-2xl" />
      <div className="skeleton-bone h-48 w-full rounded-2xl" />
    </div>
  );
}

function CareerMatchCard({
  match,
  featured,
}: {
  match: CareerMatch;
  featured?: boolean;
}) {
  const career = match.career;
  if (!career) return null;

  const scoreColor = matchScoreColor(match.match_score);

  return (
    <div
      className={`card p-6 shadow-sm ${
        featured
          ? "border-[var(--accent-gold)] ring-2 ring-[rgba(245,166,35,0.25)] md:p-8"
          : ""
      }`}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[var(--accent-cyan)] px-3 py-1 text-sm font-bold text-[#0A0F1E]">
          {RANK_MEDALS[match.rank - 1]} {RANK_LABELS[match.rank - 1]}
        </span>
        <span className="rounded-full bg-[rgba(124,58,237,0.15)] px-3 py-1 text-xs font-semibold text-[var(--accent-purple)]">
          {career.cluster}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${growthTrendStyle(career.growth_trend)}`}
        >
          {career.growth_trend}
        </span>
      </div>

      <h3
        className={`font-bold text-[var(--color-text)] ${featured ? "text-2xl md:text-3xl" : "text-xl"}`}
      >
        {career.title}
      </h3>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-sm font-medium">
          <span className="text-[var(--color-text-muted)]">Match score</span>
          <span style={{ color: scoreColor }}>{match.match_score}% match</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-[var(--color-border)]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${match.match_score}%`,
              backgroundColor: scoreColor,
            }}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <p className="font-medium text-[var(--color-text-muted)]">Salary range</p>
          <p className="text-[var(--color-text)]">{career.salary_range}</p>
        </div>
        <div>
          <p className="font-medium text-[var(--color-text-muted)]">Entry path</p>
          <p className="text-[var(--color-text)]">{career.entry_path}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-muted)]">
        {career.description}
      </p>

      <div
        className="mt-4 rounded-xl border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.06)] p-4 text-sm text-[var(--color-text)]"
      >
        <p className="mb-1 font-semibold text-[var(--accent-cyan)]">
          Why this matches you
        </p>
        <p>{match.reasoning}</p>
      </div>
    </div>
  );
}

export default function CareerResults() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<CareerMatch[]>([]);
  const [studentName, setStudentName] = useState(getStudentName() ?? "Student");
  const [retaking, setRetaking] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [results, me] = await Promise.all([
          fetchCareerResults(),
          fetchMe().catch(() => null),
        ]);

        if (!results.hasResults || !results.matches?.length) {
          navigate("/career-quiz", { replace: true });
          return;
        }

        setMatches(results.matches);

        const profile = me as { name?: string } | null;
        if (profile?.name) {
          setStudentName(profile.name);
        }

        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        navigate("/career-quiz", { replace: true });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  async function handleRetake() {
    setRetaking(true);
    try {
      await retakeCareerQuiz();
      navigate("/career-quiz");
    } catch {
      setRetaking(false);
    }
  }

  const [first, ...rest] = matches;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="hero-dark px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="gradient-text text-lg font-bold">CareerLens</p>
          {loading ? (
            <div className="mx-auto mt-6 max-w-md">
              <div className="skeleton-bone mx-auto h-8 w-48" />
            </div>
          ) : (
            <>
              <h1 className="mt-4 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
                Your Career Matches Are{" "}
                <span className="gradient-text-cyan">Ready!</span>
              </h1>
              <p className="mt-2 text-lg text-[var(--text-secondary)]">
                {studentName}, here are your top 3 career paths
              </p>
            </>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {loading && <ResultsSkeleton />}

        {!loading && first && (
          <div className="space-y-6">
            <CareerMatchCard match={first} featured />

            {rest.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2">
                {rest.map((match) => (
                  <CareerMatchCard key={match.id ?? match.rank} match={match} />
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={handleRetake}
                disabled={retaking}
                className="flex-1 rounded-xl border border-[var(--accent-cyan)] bg-[var(--bg-card)] py-3 font-semibold text-[var(--accent-cyan)] transition hover:bg-[rgba(0,212,255,0.08)] disabled:opacity-50"
              >
                {retaking ? "Resetting..." : "Retake Quiz"}
              </button>
              <Link
                to="/dashboard"
                className="btn-primary flex-1 py-3 text-center font-semibold"
              >
                View Dashboard
              </Link>
              <button
                type="button"
                disabled
                title="Coming in Module 5"
                className="flex-1 cursor-not-allowed rounded-xl border border-[var(--color-border)] bg-[var(--bg-card)] py-3 font-semibold text-[var(--color-text-muted)] opacity-60"
              >
                Download Report
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
