import type { GpaAnalytics } from "../../types/analytics";

interface GPACardProps {
  data: GpaAnalytics;
}

function TrendIcon({ trend }: { trend: GpaAnalytics["trend"] }) {
  if (trend === "up") {
    return (
      <span className="text-[var(--color-good)]" aria-label="Trending up">
        ↑
      </span>
    );
  }
  if (trend === "down") {
    return (
      <span className="text-[var(--color-fail)]" aria-label="Trending down">
        ↓
      </span>
    );
  }
  return (
    <span className="text-[var(--color-text-muted)]" aria-label="Stable">
      →
    </span>
  );
}

export default function GPACard({ data }: GPACardProps) {
  const latestSemester =
    data.semesterBreakdown[data.semesterBreakdown.length - 1]?.semester ??
    "N/A";

  return (
    <div className="text-center text-white">
      <p className="text-sm font-medium opacity-90">Overall GPA</p>
      <div className="mt-2 flex items-center justify-center gap-3">
        <span className="text-6xl font-bold tracking-tight sm:text-7xl">
          {data.overallGpa.toFixed(2)}
        </span>
        <div className="flex flex-col items-start gap-1">
          <span className="flex items-center gap-1 text-2xl font-semibold">
            <TrendIcon trend={data.trend} />
            {data.change !== 0 && (
              <span className="text-sm font-medium opacity-90">
                {data.change > 0 ? "+" : ""}
                {data.change.toFixed(2)}
              </span>
            )}
          </span>
          <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium backdrop-blur-sm">
            {latestSemester}
          </span>
        </div>
      </div>
    </div>
  );
}
