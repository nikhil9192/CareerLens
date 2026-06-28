import { useEffect, useState, useMemo, Component, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchDashboard,
  DashboardData,
  StudentRow,
} from "../../services/schoolOwner.api";

// ─── Error boundary ───────────────────────────────────────────────────────────

interface EBState { hasError: boolean; message: string }
class ErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { hasError: false, message: "" };
  static getDerivedStateFromError(err: unknown): EBState {
    const message = err instanceof Error ? err.message : String(err);
    return { hasError: true, message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          className="rounded-xl p-4 text-sm text-[var(--color-fail)]"
          style={{ backgroundColor: "var(--color-error-bg)" }}
        >
          <strong>Dashboard render error:</strong> {this.state.message}
          <br />
          <button
            className="mt-2 underline"
            onClick={() => this.setState({ hasError: false, message: "" })}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: string;
}) {
  return (
    <div className="card flex items-start gap-3 p-4">
      <span className="mt-0.5 text-2xl">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
        {sub && (
          <p className="text-xs text-[var(--color-text-muted)]">{sub}</p>
        )}
        <p className="mt-0.5 text-xs font-medium text-[var(--color-text-muted)]">
          {label}
        </p>
      </div>
    </div>
  );
}

function ProgressBar({ pct, color = "var(--accent-cyan)" }: { pct: number; color?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: color }}
      />
    </div>
  );
}

function ReportBadge({ status }: { status: string | null }) {
  if (!status) {
    return (
      <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
        —
      </span>
    );
  }
  const isReady = status === "generated" || status === "completed";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        isReady
          ? "bg-green-500/15 text-green-400"
          : "bg-yellow-500/15 text-yellow-400"
      }`}
    >
      {isReady ? "Ready" : status}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const CLASSES = ["all", "6", "7", "8", "9", "10", "11", "12"];
const STATUSES = [
  { value: "all", label: "All Students" },
  { value: "quiz_completed", label: "Quiz Done" },
  { value: "ai_started", label: "AI Started" },
  { value: "has_report", label: "Has Report" },
];

export default function SchoolDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters (client-side over the already-loaded data)
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [teacherFilter, setTeacherFilter] = useState("all");

  useEffect(() => {
    // Debug: confirm the school owner token is present before fetching
    console.log("[SchoolDashboard] school_owner_token:", localStorage.getItem("school_owner_token"));
    console.log("[SchoolDashboard] All localStorage keys:", Object.keys(localStorage));

    fetchDashboard()
      .then((d) => {
        if (!d || !d.school) {
          setError("Dashboard returned empty data — check backend logs.");
        } else {
          setData(d);
        }
      })
      .catch((err: unknown) => {
        const apiMsg =
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
        setError(apiMsg ?? "Failed to load dashboard. Please refresh.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredStudents = useMemo<StudentRow[]>(() => {
    if (!data) return [];
    return (data.students ?? []).filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (classFilter !== "all" && String(s.class_grade) !== classFilter) return false;
      if (teacherFilter !== "all" && s.teacher_id !== teacherFilter) return false;
      if (statusFilter === "quiz_completed" && !s.quiz_completed) return false;
      if (statusFilter === "ai_started" && s.ai_literacy_count === 0) return false;
      if (statusFilter === "has_report" && !s.report_status) return false;
      return true;
    });
  }, [data, search, classFilter, statusFilter, teacherFilter]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton-bone h-20 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton-bone h-24 rounded-xl" />
          ))}
        </div>
        <div className="skeleton-bone h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl p-4 text-sm text-[var(--color-fail)]"
        style={{ backgroundColor: "var(--color-error-bg)" }}
      >
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="rounded-xl p-4 text-sm text-[var(--color-fail)]"
        style={{ backgroundColor: "var(--color-error-bg)" }}
      >
        No dashboard data received. Please check your connection and refresh the page.
      </div>
    );
  }

  const { school, stats, class_breakdown, teachers } = data;
  const safeStats = {
    total_students: stats?.total_students ?? 0,
    quiz_completed: stats?.quiz_completed ?? 0,
    ai_literacy_started: stats?.ai_literacy_started ?? 0,
    reports_generated: stats?.reports_generated ?? 0,
  };
  const safeBreakdown = class_breakdown ?? [];
  const safeTeachers = teachers ?? [];
  const quizPct =
    safeStats.total_students > 0
      ? Math.round((safeStats.quiz_completed / safeStats.total_students) * 100)
      : 0;

  return (
    <ErrorBoundary>
    <div className="space-y-6">
      {/* ── School header ─────────────────────────────────────────────── */}
      <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        {school.logo_url ? (
          <img
            src={school.logo_url}
            alt={school.name}
            className="h-16 w-16 rounded-xl object-cover ring-2 ring-white/10"
          />
        ) : (
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 text-3xl">
            🏫
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-[var(--color-text)] leading-tight">
            {school.name}
          </h1>
          {school.name_hindi && (
            <p className="text-sm text-[var(--color-text-muted)]">
              {school.name_hindi}
            </p>
          )}
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-text-muted)]">
            {school.district && <span>📍 {school.district}</span>}
            {school.principal_name && (
              <span>👤 {school.principal_name}</span>
            )}
            {school.tagline && <span>"{school.tagline}"</span>}
          </div>
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total Students"
          value={safeStats.total_students}
          icon="👥"
        />
        <StatCard
          label="Quiz Completed"
          value={`${quizPct}%`}
          sub={`${safeStats.quiz_completed} of ${safeStats.total_students}`}
          icon="✅"
        />
        <StatCard
          label="AI Literacy Started"
          value={safeStats.ai_literacy_started}
          icon="📚"
        />
        <StatCard
          label="Reports Generated"
          value={safeStats.reports_generated}
          icon="📄"
        />
      </div>

      {/* ── Student progress table ────────────────────────────────────── */}
      <section id="students">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--color-text)]">
            Student Progress
          </h2>
          <span className="text-xs text-[var(--color-text-muted)]">
            {filteredStudents.length} shown
          </span>
        </div>

        {/* Filters */}
        <div className="mb-3 flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark h-8 w-full text-xs sm:w-48"
          />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="h-8 rounded-lg border border-gray-600 bg-gray-800 px-3 text-xs text-white focus:border-[var(--accent-cyan)] focus:outline-none"
          >
            {CLASSES.map((c) => (
              <option key={c} value={c} className="bg-gray-800 text-white">
                {c === "all" ? "All Classes" : `Class ${c}`}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 rounded-lg border border-gray-600 bg-gray-800 px-3 text-xs text-white focus:border-[var(--accent-cyan)] focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value} className="bg-gray-800 text-white">
                {s.label}
              </option>
            ))}
          </select>
          {safeTeachers.length > 0 && (
            <select
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              className="h-8 rounded-lg border border-gray-600 bg-gray-800 px-3 text-xs text-white focus:border-[var(--accent-cyan)] focus:outline-none"
            >
              <option value="all" className="bg-gray-800 text-white">All Teachers</option>
              {safeTeachers.map((t) => (
                <option key={t.id} value={t.id} className="bg-gray-800 text-white">
                  {t.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Table — horizontally scrollable on mobile */}
        <div className="card overflow-x-auto">
          {filteredStudents.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
              No students match the current filters.
            </p>
          ) : (
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-[var(--color-text-muted)]">
                  <th className="pb-2 pl-4 pr-3 text-left font-medium">Name</th>
                  <th className="px-3 pb-2 text-left font-medium">Class</th>
                  <th className="px-3 pb-2 text-left font-medium">Quiz</th>
                  <th className="px-3 pb-2 text-left font-medium">Career Matches</th>
                  <th className="px-3 pb-2 text-left font-medium">AI Literacy</th>
                  <th className="px-3 pb-2 text-left font-medium">Report</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr
                    key={s.id}
                    className="cursor-pointer border-b border-white/5 transition last:border-0 hover:bg-white/5"
                    onClick={() => navigate(`/school/student/${s.id}`)}
                  >
                    <td className="py-3 pl-4 pr-3 font-medium text-[var(--color-text)]">
                      {s.name}
                    </td>
                    <td className="px-3 py-3 text-[var(--color-text-muted)]">
                      {s.class_grade}
                    </td>
                    <td className="px-3 py-3">
                      {s.quiz_completed ? (
                        <span className="text-green-400">✓ Done</span>
                      ) : (
                        <span className="text-[var(--color-text-muted)]">Pending</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {(s.career_top2 ?? []).length === 0 ? (
                        <span className="text-[var(--color-text-muted)]">—</span>
                      ) : (
                        <div className="space-y-0.5">
                          {(s.career_top2 ?? []).slice(0, 2).map((c, i) => (
                            <div
                              key={i}
                              className="text-xs text-[var(--color-text)]"
                            >
                              {c.title}{" "}
                              <span className="text-[var(--color-text-muted)]">
                                {c.match_score}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {s.ai_literacy_count === 0 ? (
                        <span className="text-[var(--color-text-muted)]">Not started</span>
                      ) : (
                        <span className="text-[var(--accent-cyan)]">
                          {s.ai_literacy_count} item
                          {s.ai_literacy_count === 1 ? "" : "s"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <ReportBadge status={s.report_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ── Class-wise quiz completion ─────────────────────────────────── */}
      {safeBreakdown.length > 0 && (
        <section id="class-breakdown">
          <h2 className="mb-3 text-base font-semibold text-[var(--color-text)]">
            Class-wise Quiz Completion
          </h2>
          <div className="card space-y-4 p-5">
            {safeBreakdown.map((row) => {
              const pct =
                row.total > 0
                  ? Math.round((row.completed / row.total) * 100)
                  : 0;
              return (
                <div key={row.class_grade}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-[var(--color-text)]">
                      Class {row.class_grade}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {row.completed}/{row.total} — {pct}%
                    </span>
                  </div>
                  <ProgressBar
                    pct={pct}
                    color={
                      pct >= 80
                        ? "#22c55e"
                        : pct >= 50
                        ? "var(--accent-cyan)"
                        : "#f59e0b"
                    }
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Teachers panel ────────────────────────────────────────────── */}
      {safeTeachers.length > 0 && (
        <section id="teachers">
          <h2 className="mb-3 text-base font-semibold text-[var(--color-text)]">
            Teachers
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {safeTeachers.map((t) => (
              <div key={t.id} className="card flex items-start gap-3 p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-lg">
                  👨‍🏫
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[var(--color-text)]">
                    {t.name}
                  </p>
                  <p className="truncate text-xs text-[var(--color-text-muted)]">
                    {t.email}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {(t.classes ?? []).length > 0 && (
                      <span className="text-xs text-[var(--color-text-muted)]">
                        Class {(t.classes ?? []).join(", ")}
                      </span>
                    )}
                    <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400">
                      {t.student_count} students
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
    </ErrorBoundary>
  );
}
