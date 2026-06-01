import type { RankingAnalytics } from "../../types/analytics";

interface RankingBadgeProps {
  data: RankingAnalytics;
}

export default function RankingBadge({ data }: RankingBadgeProps) {
  const topPercent = Math.round(100 - data.percentile);
  const ringPercent = data.percentile;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset =
    circumference - (ringPercent / 100) * circumference;

  return (
    <div className="card chart-enter flex flex-col items-center p-6">
      <h2 className="text-lg font-bold text-[var(--color-text)]">
        Batch Ranking
      </h2>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        {data.batch}
      </p>

      <div className="relative mt-6">
        <svg width="140" height="140" viewBox="0 0 120 120" aria-hidden="true">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="var(--accent-cyan)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset 300ms ease-in" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-[var(--accent-cyan)]">
            {data.percentile}%
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">
            percentile
          </span>
        </div>
      </div>

      <p className="mt-4 text-center text-xl font-bold text-[var(--color-text)]">
        Top {topPercent > 0 ? topPercent : 1}% in your batch
      </p>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Rank {data.rank} of {data.totalStudents} students
      </p>
    </div>
  );
}
