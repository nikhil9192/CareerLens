import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { BrainCircuit, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import GPACard from "../components/analytics/GPACard";
import SubjectBarChart from "../components/analytics/SubjectBarChart";
import SemesterLineChart from "../components/analytics/SemesterLineChart";
import StrengthWeaknessCards from "../components/analytics/StrengthWeaknessCards";
import RankingBadge from "../components/analytics/RankingBadge";
import SkeletonLoader from "../components/analytics/SkeletonLoader";
import ErrorCard from "../components/analytics/ErrorCard";
import {
  fetchAnalyticsSummary,
  fetchAnalyticsRanking,
} from "../services/analytics";
import { getStudentId } from "../services/auth";

function CardShell({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="card p-4 md:p-6">
      {title && (
        <h2 className="mb-3 text-base font-bold text-[var(--color-text)] md:mb-4 md:text-lg">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-[var(--accent-cyan)] md:text-2xl">
        {value}
      </p>
      {detail && (
        <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">
          {detail}
        </p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const studentId = getStudentId();

  const summaryQuery = useQuery({
    queryKey: ["analytics-summary", studentId],
    queryFn: () => fetchAnalyticsSummary(studentId!),
    enabled: Boolean(studentId),
  });

  const rankingQuery = useQuery({
    queryKey: ["analytics-ranking", studentId],
    queryFn: () => fetchAnalyticsRanking(studentId!),
    enabled: Boolean(studentId),
  });

  if (!studentId) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <ErrorCard message="Student ID not found. Please register or sign in again." />
      </div>
    );
  }

  const summary = summaryQuery.data;
  const ranking = rankingQuery.data;
  const topSubject = summary?.subjects.topSubjects[0];

  return (
    <div className="min-h-screen w-full bg-[var(--color-bg)]">
      <header className="hero-dark px-4 py-8 md:px-8 md:py-12 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 md:mb-6">
            <p className="gradient-text text-base font-bold md:text-lg">
              CareerLens
            </p>
          </div>

          {summaryQuery.isLoading && (
            <div className="mx-auto max-w-md">
              <SkeletonLoader rows={3} />
            </div>
          )}

          {summaryQuery.isError && (
            <ErrorCard
              message={
                (summaryQuery.error as Error)?.message ||
                "Failed to load GPA data."
              }
            />
          )}

          {summaryQuery.isSuccess && <GPACard data={summaryQuery.data.gpa} />}
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-8 lg:px-16">
        <Link
          to="/ai-literacy"
          className="card mb-6 flex items-center gap-4 p-4 md:p-5"
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ background: "linear-gradient(135deg, #00d4ff, #7c3aed)" }}
          >
            <BrainCircuit size={22} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-[var(--color-text)] md:text-lg">
              AI Literacy
            </h2>
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)] md:text-sm">
              Learn how AI works — readings, quizzes, and tasks in English &
              हिंदी.
            </p>
          </div>
          <ArrowRight
            size={20}
            className="shrink-0 text-[var(--accent-cyan)]"
            aria-hidden="true"
          />
        </Link>

        {(summaryQuery.isLoading || rankingQuery.isLoading) && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-bone h-20 rounded-2xl" />
            ))}
          </div>
        )}

        {summaryQuery.isSuccess && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Overall GPA"
              value={summary.gpa.overallGpa.toFixed(2)}
              detail={`Trend: ${summary.gpa.trend}`}
            />
            <StatCard
              label="Subjects"
              value={String(summary.subjects.all.length)}
              detail="Tracked in analytics"
            />
            <StatCard
              label="Top Strength"
              value={topSubject ? `${topSubject.score}%` : "—"}
              detail={topSubject?.name ?? "No data yet"}
            />
            <StatCard
              label="Batch Rank"
              value={
                rankingQuery.isSuccess
                  ? `#${ranking.rank}`
                  : rankingQuery.isLoading
                    ? "…"
                    : "—"
              }
              detail={
                rankingQuery.isSuccess
                  ? `Top ${Math.max(1, Math.round(100 - ranking.percentile))}% · ${ranking.totalStudents} students`
                  : undefined
              }
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          {summaryQuery.isLoading && (
            <CardShell title="Subject Performance">
              <SkeletonLoader rows={6} />
            </CardShell>
          )}
          {summaryQuery.isError && (
            <CardShell title="Subject Performance">
              <ErrorCard message="Could not load subject analytics." />
            </CardShell>
          )}
          {summaryQuery.isSuccess && (
            <SubjectBarChart subjects={summaryQuery.data.subjects.all} />
          )}

          {summaryQuery.isLoading && (
            <CardShell title="GPA Trend">
              <SkeletonLoader rows={5} />
            </CardShell>
          )}
          {summaryQuery.isError && (
            <CardShell title="GPA Trend">
              <ErrorCard message="Could not load semester trend." />
            </CardShell>
          )}
          {summaryQuery.isSuccess && (
            <SemesterLineChart
              semesters={summaryQuery.data.gpa.semesterBreakdown}
            />
          )}

          <div className="col-span-1 lg:col-span-2">
            {summaryQuery.isLoading && (
              <CardShell title="Strengths & Weaknesses">
                <SkeletonLoader rows={6} />
              </CardShell>
            )}
            {summaryQuery.isError && (
              <CardShell title="Strengths & Weaknesses">
                <ErrorCard message="Could not load subject breakdown." />
              </CardShell>
            )}
            {summaryQuery.isSuccess && (
              <StrengthWeaknessCards
                strong={summaryQuery.data.subjects.topSubjects}
                weak={summaryQuery.data.subjects.weakSubjects}
              />
            )}
          </div>

          {rankingQuery.isLoading && (
            <CardShell title="Batch Ranking">
              <div className="flex flex-col items-center py-4 md:py-6">
                <div className="skeleton-bone h-28 w-28 rounded-full md:h-32 md:w-32" />
                <div className="skeleton-bone mt-4 h-4 w-40 md:w-48" />
              </div>
            </CardShell>
          )}
          {rankingQuery.isError && (
            <CardShell title="Batch Ranking">
              <ErrorCard message="Could not load ranking data." />
            </CardShell>
          )}
          {rankingQuery.isSuccess && (
            <div className="col-span-1 lg:col-span-2">
              <RankingBadge data={rankingQuery.data} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
