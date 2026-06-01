import type { SubjectScore } from "../../types/analytics";

interface StrengthWeaknessCardsProps {
  strong: SubjectScore[];
  weak: SubjectScore[];
}

function SubjectList({
  title,
  subjects,
  variant,
}: {
  title: string;
  subjects: SubjectScore[];
  variant: "strong" | "weak";
}) {
  const accent =
    variant === "strong" ? "var(--accent-cyan)" : "var(--accent-gold)";
  const bg =
    variant === "strong"
      ? "rgba(0, 212, 255, 0.08)"
      : "rgba(245, 166, 35, 0.08)";

  return (
    <div className="card chart-enter p-4 md:p-5">
      <h3
        className="text-sm font-semibold uppercase tracking-wide"
        style={{ color: accent }}
      >
        {title}
      </h3>
      <ul className="mt-4 space-y-3">
        {subjects.length === 0 ? (
          <li className="text-sm text-[var(--color-text-muted)]">
            No data yet
          </li>
        ) : (
          subjects.map((subject, index) => (
            <li
              key={subject.name}
              className="flex items-center justify-between rounded-xl px-3 py-2"
              style={{ backgroundColor: bg }}
            >
              <span className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)]">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: accent }}
                >
                  {index + 1}
                </span>
                {subject.name}
              </span>
              <span className="text-sm font-semibold text-[var(--color-text)]">
                {subject.score}% · {subject.grade}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default function StrengthWeaknessCards({
  strong,
  weak,
}: StrengthWeaknessCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <SubjectList title="Top Strengths" subjects={strong} variant="strong" />
      <SubjectList title="Areas to Improve" subjects={weak} variant="weak" />
    </div>
  );
}
