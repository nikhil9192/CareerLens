import type { GpaAnalytics } from "../../types/analytics";

interface GPACardProps {
  data: GpaAnalytics;
}

function TrendIcon({ trend }: { trend: GpaAnalytics["trend"] }) {
  if (trend === "up") {
    return (
      <span className="text-[var(--success)]" aria-label="Trending up">
        ↑
      </span>
    );
  }
  if (trend === "down") {
    return (
      <span className="text-[var(--error)]" aria-label="Trending down">
        ↓
      </span>
    );
  }
  return (
    <span className="text-[var(--text-secondary)]" aria-label="Stable">
      →
    </span>
  );
}

export default function GPACard({ data }: GPACardProps) {
  const latestSemester =
    data.semesterBreakdown[data.semesterBreakdown.length - 1]?.semester ??
    "N/A";

  return (
    <div className="text-center">
      <p className="text-sm font-medium text-[var(--text-secondary)]">
        Overall GPA
      </p>
      <div className="mt-2 flex items-center justify-center gap-3">
        <span
          className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl"
          style={{ color: "var(--accent-cyan)" }}
        >
          {data.overallGpa.toFixed(2)}
        </span>
        <div className="flex flex-col items-start gap-1">
          <span className="flex items-center gap-1 text-2xl font-semibold text-[var(--text-primary)]">
            <TrendIcon trend={data.trend} />
            {data.change !== 0 && (
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                {data.change > 0 ? "+" : ""}
                {data.change.toFixed(2)}
              </span>
            )}
          </span>
          <span className="rounded-full border border-[var(--border)] bg-[rgba(0,212,255,0.1)] px-3 py-0.5 text-xs font-medium text-[var(--accent-cyan)]">
            {latestSemester}
          </span>
        </div>
      </div>
    </div>
  );
}
