import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  BookOpen,
  HelpCircle,
  ClipboardList,
} from "lucide-react";
import {
  adminListLevels,
  adminUpdateLevel,
  adminListLevelContent,
  adminUpdateContent,
  adminDeleteContent,
} from "../../services/aiLiteracy.admin.api";
import type {
  AiLiteracyLevel,
  AiLiteracyContent,
  ContentType,
} from "../../types/aiLiteracy";

const TYPE_META: Record<ContentType, { label: string; icon: typeof BookOpen }> = {
  reading: { label: "Reading", icon: BookOpen },
  quiz: { label: "Quiz", icon: HelpCircle },
  task: { label: "Task", icon: ClipboardList },
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
        {label}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-dark min-h-24"
          placeholder={placeholder}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-dark"
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export default function AdminLevelEditor() {
  const { levelId } = useParams<{ levelId: string }>();
  const [level, setLevel] = useState<AiLiteracyLevel | null>(null);
  const [content, setContent] = useState<AiLiteracyContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  // Editable level fields
  const [levelNumber, setLevelNumber] = useState(0);
  const [title, setTitle] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionHi, setDescriptionHi] = useState("");
  const [published, setPublished] = useState(false);

  async function load() {
    if (!levelId) return;
    setLoading(true);
    setError("");

    // Load the level first so a content-fetch failure can never be
    // misreported as "Level not found".
    try {
      const levels = await adminListLevels();
      const found = levels.find((l) => l.id === levelId) ?? null;
      setLevel(found);
      if (found) {
        setLevelNumber(found.level_number);
        setTitle(found.title);
        setTitleHi(found.title_hi ?? "");
        setDescription(found.description ?? "");
        setDescriptionHi(found.description_hi ?? "");
        setPublished(found.published);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load level.");
      setLoading(false);
      return;
    }

    // Content loads independently; its errors are shown inline.
    try {
      setContent(await adminListLevelContent(levelId));
    } catch (err) {
      setError(
        err instanceof Error
          ? `Content failed to load: ${err.message}`
          : "Failed to load content."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelId]);

  async function handleSaveLevel() {
    if (!levelId) return;
    setSaving(true);
    setError("");
    setSavedMsg("");
    try {
      await adminUpdateLevel(levelId, {
        level_number: levelNumber,
        title: title.trim(),
        title_hi: titleHi.trim() || null,
        description: description.trim() || null,
        description_hi: descriptionHi.trim() || null,
        published,
      });
      setSavedMsg("Level saved.");
      setTimeout(() => setSavedMsg(""), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save level.");
    } finally {
      setSaving(false);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= content.length) return;
    const a = content[index];
    const b = content[target];
    try {
      await Promise.all([
        adminUpdateContent(a.id, { position: b.position }),
        adminUpdateContent(b.id, { position: a.position }),
      ]);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reorder.");
    }
  }

  async function handleDeleteContent(item: AiLiteracyContent) {
    if (!window.confirm(`Delete content "${item.title}"?`)) return;
    try {
      await adminDeleteContent(item.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete content.");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton-bone h-8 w-40" />
        <div className="skeleton-bone h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!level) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-[var(--text-secondary)]">Level not found.</p>
        <Link
          to="/admin/ai-literacy"
          className="mt-3 inline-block text-sm text-[var(--accent-cyan)]"
        >
          ← Back to levels
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/admin/ai-literacy"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] transition hover:text-[var(--accent-cyan)]"
      >
        <ArrowLeft size={16} /> Back to levels
      </Link>

      {error && (
        <p
          className="rounded-lg p-3 text-sm text-[var(--error)]"
          style={{ backgroundColor: "var(--color-error-bg)" }}
          role="alert"
        >
          {error}
        </p>
      )}

      {/* Level details */}
      <section className="card p-5 md:p-6">
        <h2 className="mb-4 text-lg font-bold">Level details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
              Level number
            </label>
            <input
              type="number"
              value={levelNumber}
              onChange={(e) => setLevelNumber(Number(e.target.value))}
              className="input-dark"
            />
          </div>
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
              <button
                type="button"
                role="switch"
                aria-checked={published}
                onClick={() => setPublished((p) => !p)}
                className={`relative h-6 w-11 rounded-full transition ${
                  published ? "bg-[var(--accent-cyan)]" : "bg-[var(--border)]"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                    published ? "left-[1.375rem]" : "left-0.5"
                  }`}
                />
              </button>
              {published ? "Published" : "Draft"}
            </label>
          </div>
          <Field label="Title (English)" value={title} onChange={setTitle} />
          <Field label="Title (हिंदी)" value={titleHi} onChange={setTitleHi} />
          <Field
            label="Description (English)"
            value={description}
            onChange={setDescription}
            textarea
          />
          <Field
            label="Description (हिंदी)"
            value={descriptionHi}
            onChange={setDescriptionHi}
            textarea
          />
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveLevel}
            disabled={saving || !title.trim()}
            className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm"
          >
            <Save size={16} /> {saving ? "Saving..." : "Save level"}
          </button>
          {savedMsg && (
            <span className="text-sm text-[var(--success)]">{savedMsg}</span>
          )}
        </div>
      </section>

      {/* Content items */}
      <section className="card p-5 md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Content items</h2>
          <Link
            to={`/admin/ai-literacy/level/${level.id}/content/new`}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Plus size={16} /> Add content
          </Link>
        </div>

        {content.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--text-secondary)]">
            No content yet. Add a reading, quiz, or task.
          </p>
        ) : (
          <ul className="space-y-2">
            {content.map((item, index) => {
              const meta = TYPE_META[item.type];
              const Icon = meta.icon;
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card-hover)] p-3"
                >
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      className="text-[var(--text-secondary)] transition hover:text-[var(--accent-cyan)] disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === content.length - 1}
                      className="text-[var(--text-secondary)] transition hover:text-[var(--accent-cyan)] disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  <span className="flex items-center gap-1.5 rounded-full bg-[rgba(124,58,237,0.15)] px-2.5 py-1 text-xs font-semibold text-[var(--accent-purple)]">
                    <Icon size={12} /> {meta.label}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                      {item.title}
                    </p>
                    {item.title_hi && (
                      <p className="truncate text-xs text-[var(--text-secondary)]">
                        {item.title_hi}
                      </p>
                    )}
                  </div>

                  {!item.published && (
                    <span className="rounded-full bg-[var(--bg-card)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                      Draft
                    </span>
                  )}

                  <Link
                    to={`/admin/ai-literacy/content/${item.id}`}
                    className="rounded-lg border border-[var(--accent-cyan)] p-2 text-[var(--accent-cyan)] transition hover:bg-[rgba(0,212,255,0.08)]"
                    aria-label="Edit content"
                  >
                    <Pencil size={14} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDeleteContent(item)}
                    className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] transition hover:border-[var(--error)] hover:text-[var(--error)]"
                    aria-label="Delete content"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
