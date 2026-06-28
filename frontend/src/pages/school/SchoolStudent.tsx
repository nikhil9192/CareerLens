import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchStudentDetail,
  StudentDetail,
  Mark,
  CareerMatch,
  LiteracyProgress,
} from "../../services/schoolOwner.api";

// ─── Helper components ────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-medium text-[var(--color-text-muted)]">{label}</dt>
      <dd className="mt-0.5 text-sm text-[var(--color-text)]">{value}</dd>
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.min(100, Math.max(0, pct))}%`,
          background: pct >= 80 ? "#22c55e" : pct >= 50 ? "var(--accent-cyan)" : "#f59e0b",
        }}
      />
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const colors: Record<number, string> = {
    1: "bg-yellow-400/15 text-yellow-300",
    2: "bg-slate-400/15 text-slate-300",
    3: "bg-orange-400/15 text-orange-300",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
        colors[rank] ?? "bg-white/10 text-[var(--color-text-muted)]"
      }`}
    >
      #{rank}
    </span>
  );
}

// ─── Marks section ────────────────────────────────────────────────────────────

function MarksSection({ marks }: { marks: Mark[] }) {
  if (marks.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">No marks recorded yet.</p>
    );
  }

  // Group by exam_term
  const byTerm = new Map<string, Mark[]>();
  for (const m of marks) {
    const key = m.exam_term ?? "General";
    if (!byTerm.has(key)) byTerm.set(key, []);
    byTerm.get(key)!.push(m);
  }

  return (
    <div className="space-y-4">
      {Array.from(byTerm.entries()).map(([term, rows]) => {
        const totalObtained = rows.reduce((sum, r) => sum + (r.marks ?? 0), 0);
        const totalMax = rows.reduce((sum, r) => sum + (r.total_marks ?? 0), 0);
        const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

        return (
          <div key={term}>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[var(--color-text)]">{term}</h4>
              <span className="text-xs text-[var(--color-text-muted)]">
                {totalObtained}/{totalMax} ({overallPct}%)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] text-sm">
                <tbody>
                  {rows.map((r) => {
                    const pct = r.total_marks > 0 ? Math.round((r.marks / r.total_marks) * 100) : 0;
                    return (
                      <tr key={r.subject} className="border-b border-white/5 last:border-0">
                        <td className="py-2 pr-3 text-[var(--color-text)]">{r.subject}</td>
                        <td className="w-40 py-2 pr-3">
                          <ProgressBar pct={pct} />
                        </td>
                        <td className="py-2 text-right text-xs text-[var(--color-text-muted)]">
                          {r.marks}/{r.total_marks}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Career matches section ───────────────────────────────────────────────────

function CareerMatchesSection({ matches }: { matches: CareerMatch[] }) {
  if (matches.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        Career quiz not completed yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((m) => (
        <div key={m.rank} className="rounded-xl bg-white/5 p-4">
          <div className="mb-1 flex items-center gap-2">
            <RankBadge rank={m.rank} />
            <span className="font-semibold text-[var(--color-text)]">
              {m.careers?.title ?? "Unknown career"}
            </span>
            <span className="ml-auto text-sm font-bold text-[var(--accent-cyan)]">
              {m.match_score}%
            </span>
          </div>
          {m.careers?.description && (
            <p className="mt-1 text-xs text-[var(--color-text-muted)] leading-relaxed">
              {m.careers.description}
            </p>
          )}
          {m.careers?.salary_range && (
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              💰 {m.careers.salary_range}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── AI Literacy section ──────────────────────────────────────────────────────

const TOTAL_LEVELS = 3;

function LiteracySection({ items }: { items: LiteracyProgress[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        AI Literacy module not started yet.
      </p>
    );
  }

  const completedLevels = items.filter((i) => i.completed).length;
  const completedPct = Math.round((completedLevels / TOTAL_LEVELS) * 100);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="text-[var(--color-text-muted)]">
          {completedLevels} of {TOTAL_LEVELS} levels completed
        </span>
        <span className="font-semibold text-[var(--accent-cyan)]">{completedPct}%</span>
      </div>
      <ProgressBar pct={completedPct} />
      <div className="mt-4 space-y-2">
        {[1, 2, 3].map((lvl) => {
          const entry = items.find((i) => i.level === lvl);
          const status = entry?.completed ? "completed" : entry ? "in progress" : "not started";
          return (
            <div key={lvl} className="flex items-center gap-3 text-sm">
              <span
                className={
                  status === "completed"
                    ? "text-green-400"
                    : status === "in progress"
                    ? "text-[var(--accent-cyan)]"
                    : "text-[var(--color-text-muted)]"
                }
              >
                {status === "completed" ? "✓" : status === "in progress" ? "◑" : "○"}
              </span>
              <span className="text-[var(--color-text)]">Level {lvl}</span>
              <span className="ml-auto text-xs capitalize text-[var(--color-text-muted)]">
                {status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SchoolStudent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchStudentDetail(id)
      .then(setData)
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error ?? "Failed to load student";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton-bone h-8 w-40 rounded" />
        <div className="skeleton-bone h-32 w-full rounded-xl" />
        <div className="skeleton-bone h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 text-sm text-[var(--accent-cyan)] hover:underline"
        >
          ← Back
        </button>
        <div
          className="rounded-xl p-4 text-sm text-[var(--color-fail)]"
          style={{ backgroundColor: "var(--color-error-bg)" }}
        >
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { student, marks, career_matches, ai_literacy, report } = data;

  function downloadReport() {
    if (report?.pdf_url) {
      window.open(report.pdf_url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm text-[var(--accent-cyan)] hover:underline"
      >
        ← Back to Dashboard
      </button>

      {/* ── Student profile card ─────────────────────────────────────── */}
      <div className="card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-2xl">
            {student.gender === "female" ? "👩" : "👨"}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[var(--color-text)]">
              {student.name}
            </h1>
            <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
              <InfoRow label="Class" value={student.class_grade} />
              <InfoRow label="Gender" value={student.gender} />
              <InfoRow label="Medium" value={student.medium} />
              <InfoRow label="Mobile" value={student.mobile} />
              <InfoRow
                label="Joined"
                value={
                  student.created_at
                    ? new Date(student.created_at).toLocaleDateString("en-IN")
                    : null
                }
              />
            </dl>
          </div>

          {/* Download report */}
          {report?.pdf_url ? (
            <button
              type="button"
              onClick={downloadReport}
              className="flex items-center gap-2 self-start rounded-xl border border-[var(--accent-cyan)] px-4 py-2 text-sm font-medium text-[var(--accent-cyan)] transition hover:bg-[var(--accent-cyan)] hover:bg-opacity-10"
            >
              <span>📄</span>
              Download Report
            </button>
          ) : (
            <span className="self-start rounded-xl border border-white/10 px-4 py-2 text-sm text-[var(--color-text-muted)]">
              No report yet
            </span>
          )}
        </div>
      </div>

      {/* ── Career matches ───────────────────────────────────────────── */}
      <div className="card p-5">
        <h2 className="mb-4 text-base font-semibold text-[var(--color-text)]">
          Career Matches
        </h2>
        <CareerMatchesSection matches={career_matches} />
      </div>

      {/* ── AI Literacy ──────────────────────────────────────────────── */}
      <div className="card p-5">
        <h2 className="mb-4 text-base font-semibold text-[var(--color-text)]">
          AI Literacy Progress
        </h2>
        <LiteracySection items={ai_literacy} />
      </div>

      {/* ── Marks ───────────────────────────────────────────────────── */}
      <div className="card p-5">
        <h2 className="mb-4 text-base font-semibold text-[var(--color-text)]">
          Academic Marks
        </h2>
        <MarksSection marks={marks} />
      </div>
    </div>
  );
}
