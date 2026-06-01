import { type ReactNode } from "react";
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
    <div className="card p-6">
      {title && (
        <h2 className="mb-4 text-lg font-bold text-[var(--color-text)]">
          {title}
        </h2>
      )}
      {children}
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

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero */}
      <header className="hero-dark px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <p className="gradient-text text-lg font-bold">CareerLens</p>
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

          {summaryQuery.isSuccess && (
            <GPACard data={summaryQuery.data.gpa} />
          )}
        </div>
      </header>

      {/* Card grid */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Summary: subjects chart */}
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

          {/* Summary: semester line chart */}
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

          {/* Summary: strength / weakness — full width */}
          <div className="md:col-span-2">
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

          {/* Ranking — separate query */}
          {rankingQuery.isLoading && (
            <CardShell title="Batch Ranking">
              <div className="flex flex-col items-center py-6">
                <div className="skeleton-bone h-32 w-32 rounded-full" />
                <div className="skeleton-bone mt-4 h-4 w-48" />
              </div>
            </CardShell>
          )}
          {rankingQuery.isError && (
            <CardShell title="Batch Ranking">
              <ErrorCard message="Could not load ranking data." />
            </CardShell>
          )}
          {rankingQuery.isSuccess && (
            <RankingBadge data={rankingQuery.data} />
          )}
        </div>
      </main>
    </div>
  );
}
