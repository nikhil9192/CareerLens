import { useEffect, useMemo, useState } from "react";
import { Download, Search, Users } from "lucide-react";
import { adminListProgress } from "../../services/aiLiteracy.admin.api";
import type { AdminProgressRow } from "../../types/aiLiteracy";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

function levelLabel(row: AdminProgressRow): string {
  const lvl = row.ai_literacy_content?.ai_literacy_levels;
  if (!lvl) return "—";
  return `L${lvl.level_number ?? "?"} · ${lvl.title ?? ""}`.trim();
}

function csvCell(value: string | number | null): string {
  const s = value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export default function AdminProgress() {
  const [rows, setRows] = useState<AdminProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        setRows(await adminListProgress());
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load progress."
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const levelOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rows) {
      const lvl = r.ai_literacy_content?.ai_literacy_levels;
      if (lvl?.level_number != null) {
        map.set(String(lvl.level_number), levelLabel(r));
      }
    }
    return [...map.entries()].sort(
      (a, b) => Number(a[0]) - Number(b[0])
    );
  }, [rows]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((r) => {
      const name = r.students?.name?.toLowerCase() ?? "";
      const matchesSearch = !term || name.includes(term);
      const lvlNum =
        r.ai_literacy_content?.ai_literacy_levels?.level_number ?? null;
      const matchesLevel =
        levelFilter === "all" || String(lvlNum) === levelFilter;
      const matchesStatus =
        statusFilter === "all" || r.status === statusFilter;
      return matchesSearch && matchesLevel && matchesStatus;
    });
  }, [rows, search, levelFilter, statusFilter]);

  function exportCsv() {
    const header = [
      "Student",
      "Class",
      "School",
      "Level",
      "Content",
      "Type",
      "Status",
      "Score",
      "Total Questions",
      "Completed At",
    ];
    const lines = filtered.map((r) =>
      [
        csvCell(r.students?.name ?? ""),
        csvCell(r.students?.class_grade ?? ""),
        csvCell(r.students?.schools?.name ?? ""),
        csvCell(levelLabel(r)),
        csvCell(r.ai_literacy_content?.title ?? ""),
        csvCell(r.ai_literacy_content?.type ?? ""),
        csvCell(r.status),
        csvCell(r.score),
        csvCell(r.total_questions),
        csvCell(r.completed_at ?? ""),
      ].join(",")
    );
    const csv = [header.map(csvCell).join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ai-literacy-progress-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Student progress</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {filtered.length} of {rows.length} records
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student..."
            className="input-dark pl-9"
          />
        </div>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="input-dark"
        >
          <option value="all">All levels</option>
          {levelOptions.map(([num, label]) => (
            <option key={num} value={num}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-dark"
        >
          <option value="all">All statuses</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In progress</option>
        </select>
      </div>

      {error && (
        <p
          className="mb-4 rounded-lg p-3 text-sm text-[var(--error)]"
          style={{ backgroundColor: "var(--color-error-bg)" }}
          role="alert"
        >
          {error}
        </p>
      )}

      {loading ? (
        <div className="skeleton-bone h-64 w-full rounded-2xl" />
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <Users size={32} className="text-[var(--text-secondary)]" />
          <p className="text-sm text-[var(--text-secondary)]">
            No progress records match your filters.
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--text-secondary)]">
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">Class</th>
                <th className="px-4 py-3 font-semibold">School</th>
                <th className="px-4 py-3 font-semibold">Level</th>
                <th className="px-4 py-3 font-semibold">Content</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Score</th>
                <th className="px-4 py-3 font-semibold">Completed</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-card-hover)]"
                >
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                    {r.students?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {r.students?.class_grade ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {r.students?.schools?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {levelLabel(r)}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {r.ai_literacy_content?.title ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        r.status === "completed"
                          ? "bg-[rgba(16,185,129,0.15)] text-[var(--success)]"
                          : "bg-[rgba(245,166,35,0.15)] text-[var(--accent-gold)]"
                      }`}
                    >
                      {r.status === "completed" ? "Completed" : "In progress"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {r.score != null && r.total_questions != null
                      ? `${r.score}/${r.total_questions}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {formatDate(r.completed_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
