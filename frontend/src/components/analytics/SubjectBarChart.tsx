import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { SubjectScore } from "../../types/analytics";

interface SubjectBarChartProps {
  subjects: SubjectScore[];
}

function scoreColor(score: number): string {
  if (score >= 70) return "var(--color-good)";
  if (score >= 40) return "var(--color-average)";
  return "var(--color-fail)";
}

export default function SubjectBarChart({ subjects }: SubjectBarChartProps) {
  const data = subjects.map((s) => ({
    name: s.name,
    score: s.score,
    fill: scoreColor(s.score),
  }));

  return (
    <div className="chart-enter rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
      <h2 className="text-lg font-bold text-[var(--color-text)]">
        Subject Performance
      </h2>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Scores by subject
      </p>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              horizontal={false}
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
                color: "var(--color-text)",
              }}
              formatter={(value) => [`${value}%`, "Score"]}
            />
            <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={18}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--color-text-muted)]">
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: "var(--color-good)" }}
          />
          Good (≥70)
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: "var(--color-average)" }}
          />
          Average (40–69)
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: "var(--color-fail)" }}
          />
          Fail (&lt;40)
        </span>
      </div>
    </div>
  );
}
