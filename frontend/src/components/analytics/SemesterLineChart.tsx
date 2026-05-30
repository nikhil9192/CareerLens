import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { SemesterGpa } from "../../types/analytics";

interface SemesterLineChartProps {
  semesters: SemesterGpa[];
}

export default function SemesterLineChart({
  semesters,
}: SemesterLineChartProps) {
  const data = semesters.map((s) => ({
    semester: s.semester,
    gpa: s.gpa,
  }));

  return (
    <div className="chart-enter rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
      <h2 className="text-lg font-bold text-[var(--color-text)]">
        GPA Trend
      </h2>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Performance across semesters
      </p>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
            />
            <XAxis
              dataKey="semester"
              tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            />
            <YAxis
              domain={[0, 4]}
              tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
                color: "var(--color-text)",
              }}
              formatter={(value) => [Number(value).toFixed(2), "GPA"]}
            />
            <Line
              type="monotone"
              dataKey="gpa"
              stroke="var(--color-brand)"
              strokeWidth={3}
              dot={{ fill: "var(--color-brand)", r: 5 }}
              activeDot={{ r: 7 }}
              isAnimationActive
              animationDuration={300}
              animationEasing="ease-in"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
