import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye, EyeOff, BookOpen } from "lucide-react";
import {
  adminListLevels,
  adminCreateLevel,
  adminDeleteLevel,
} from "../../services/aiLiteracy.admin.api";
import type { AiLiteracyLevel } from "../../types/aiLiteracy";

export default function AdminAiLiteracy() {
  const [levels, setLevels] = useState<AiLiteracyLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      setLevels(await adminListLevels());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load levels.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    setError("");
    try {
      const nextNumber =
        levels.reduce((max, l) => Math.max(max, l.level_number), 0) + 1;
      await adminCreateLevel({
        level_number: nextNumber,
        title: newTitle.trim(),
        published: false,
      });
      setNewTitle("");
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create level.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(level: AiLiteracyLevel) {
    if (
      !window.confirm(
        `Delete "${level.title}"? This removes all its content, quizzes, and student progress.`
      )
    ) {
      return;
    }
    try {
      await adminDeleteLevel(level.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete level.");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Levels</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage AI Literacy levels, content, and quizzes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Plus size={16} /> Add Level
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="card mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
              New level title
            </label>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="input-dark"
              placeholder="e.g. Foundations of AI"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={creating || !newTitle.trim()}
            className="btn-primary px-4 py-2.5 text-sm"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </form>
      )}

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
        <div className="space-y-3">
          <div className="skeleton-bone h-24 w-full rounded-2xl" />
          <div className="skeleton-bone h-24 w-full rounded-2xl" />
        </div>
      ) : levels.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <BookOpen size={32} className="text-[var(--text-secondary)]" />
          <p className="text-sm text-[var(--text-secondary)]">
            No levels yet. Create your first level to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {levels.map((level) => (
            <div key={level.id} className="card flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(0,212,255,0.12)] text-sm font-bold text-[var(--accent-cyan)]">
                  {level.level_number}
                </span>
                <span
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    level.published
                      ? "bg-[rgba(16,185,129,0.15)] text-[var(--success)]"
                      : "bg-[var(--bg-card-hover)] text-[var(--text-secondary)]"
                  }`}
                >
                  {level.published ? <Eye size={12} /> : <EyeOff size={12} />}
                  {level.published ? "Published" : "Draft"}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">
                  {level.title}
                </h3>
                {level.title_hi && (
                  <p className="text-sm text-[var(--text-secondary)]">
                    {level.title_hi}
                  </p>
                )}
                {level.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-[var(--text-secondary)]">
                    {level.description}
                  </p>
                )}
              </div>

              <div className="mt-auto flex gap-2 pt-2">
                <Link
                  to={`/admin/ai-literacy/level/${level.id}`}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--accent-cyan)] py-2 text-sm font-semibold text-[var(--accent-cyan)] transition hover:bg-[rgba(0,212,255,0.08)]"
                >
                  <Pencil size={14} /> Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(level)}
                  className="flex items-center justify-center rounded-lg border border-[var(--border)] px-3 py-2 text-[var(--text-secondary)] transition hover:border-[var(--error)] hover:text-[var(--error)]"
                  aria-label={`Delete ${level.title}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
