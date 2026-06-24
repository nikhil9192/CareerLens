import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Pencil, Trash2, X } from "lucide-react";
import {
  adminGetContent,
  adminCreateContent,
  adminUpdateContent,
  adminCreateQuizQuestion,
  adminUpdateQuizQuestion,
  adminDeleteQuizQuestion,
} from "../../services/aiLiteracy.admin.api";
import type {
  AiLiteracyQuizQuestion,
  ContentType,
  CorrectAnswer,
  QuizQuestionInput,
} from "../../types/aiLiteracy";

const CONTENT_TYPES: ContentType[] = ["reading", "quiz", "task"];

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
          className="input-dark min-h-32"
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

// ============================================================
// Quiz question form (add / edit)
// ============================================================
const EMPTY_QUESTION: QuizQuestionInput = {
  question_text: "",
  question_text_hi: "",
  option_a: "",
  option_a_hi: "",
  option_b: "",
  option_b_hi: "",
  option_c: "",
  option_c_hi: "",
  option_d: "",
  option_d_hi: "",
  correct_answer: "A",
  explanation: "",
  explanation_hi: "",
};

function QuestionForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: QuizQuestionInput;
  onSave: (q: QuizQuestionInput) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [q, setQ] = useState<QuizQuestionInput>(initial);
  const set = (patch: Partial<QuizQuestionInput>) =>
    setQ((prev) => ({ ...prev, ...patch }));

  function submit(e: FormEvent) {
    e.preventDefault();
    onSave(q);
  }

  const optionRows: { key: CorrectAnswer; en: keyof QuizQuestionInput; hi: keyof QuizQuestionInput }[] =
    [
      { key: "A", en: "option_a", hi: "option_a_hi" },
      { key: "B", en: "option_b", hi: "option_b_hi" },
      { key: "C", en: "option_c", hi: "option_c_hi" },
      { key: "D", en: "option_d", hi: "option_d_hi" },
    ];

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-[var(--accent-cyan)] bg-[var(--bg-card-hover)] p-4"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Question (English)"
          value={(q.question_text as string) ?? ""}
          onChange={(v) => set({ question_text: v })}
          textarea
        />
        <Field
          label="Question (हिंदी)"
          value={(q.question_text_hi as string) ?? ""}
          onChange={(v) => set({ question_text_hi: v })}
          textarea
        />
      </div>

      <div className="mt-4 space-y-3">
        {optionRows.map((row) => (
          <div
            key={row.key}
            className="grid items-end gap-3 md:grid-cols-[auto_1fr_1fr]"
          >
            <label className="flex items-center gap-2 pb-2.5 text-sm font-semibold">
              <input
                type="radio"
                name="correct_answer"
                checked={q.correct_answer === row.key}
                onChange={() => set({ correct_answer: row.key })}
                className="accent-[var(--accent-cyan)]"
              />
              {row.key}
            </label>
            <Field
              label={`Option ${row.key} (English)`}
              value={(q[row.en] as string) ?? ""}
              onChange={(v) => set({ [row.en]: v } as Partial<QuizQuestionInput>)}
            />
            <Field
              label={`Option ${row.key} (हिंदी)`}
              value={(q[row.hi] as string) ?? ""}
              onChange={(v) => set({ [row.hi]: v } as Partial<QuizQuestionInput>)}
            />
          </div>
        ))}
      </div>

      <p className="mt-2 text-xs text-[var(--text-secondary)]">
        Select the radio next to the correct option.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Field
          label="Explanation (English)"
          value={(q.explanation as string) ?? ""}
          onChange={(v) => set({ explanation: v })}
          textarea
        />
        <Field
          label="Explanation (हिंदी)"
          value={(q.explanation_hi as string) ?? ""}
          onChange={(v) => set({ explanation_hi: v })}
          textarea
        />
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Save size={14} /> {saving ? "Saving..." : "Save question"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ============================================================
// Quiz questions manager
// ============================================================
function QuizManager({ contentId }: { contentId: string }) {
  const [questions, setQuestions] = useState<AiLiteracyQuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { questions: list } = await adminGetContent(contentId);
      setQuestions(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load questions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId]);

  async function handleCreate(input: QuizQuestionInput) {
    setSaving(true);
    setError("");
    try {
      await adminCreateQuizQuestion({
        ...input,
        content_id: contentId,
        position: questions.length,
      });
      setAdding(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add question.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string, input: QuizQuestionInput) {
    setSaving(true);
    setError("");
    try {
      await adminUpdateQuizQuestion(id, input);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update question.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this question?")) return;
    try {
      await adminDeleteQuizQuestion(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete question.");
    }
  }

  return (
    <section className="card p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Quiz questions</h2>
        {!adding && editingId === null && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Plus size={16} /> Add question
          </button>
        )}
      </div>

      {error && (
        <p className="mb-3 text-sm text-[var(--error)]" role="alert">
          {error}
        </p>
      )}

      {adding && (
        <div className="mb-4">
          <QuestionForm
            initial={EMPTY_QUESTION}
            onSave={handleCreate}
            onCancel={() => setAdding(false)}
            saving={saving}
          />
        </div>
      )}

      {loading ? (
        <div className="skeleton-bone h-20 w-full rounded-xl" />
      ) : questions.length === 0 && !adding ? (
        <p className="py-4 text-center text-sm text-[var(--text-secondary)]">
          No questions yet.
        </p>
      ) : (
        <ol className="space-y-3">
          {questions.map((question, idx) => (
            <li key={question.id}>
              {editingId === question.id ? (
                <QuestionForm
                  initial={question}
                  onSave={(input) => handleUpdate(question.id, input)}
                  onCancel={() => setEditingId(null)}
                  saving={saving}
                />
              ) : (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card-hover)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      <span className="text-[var(--accent-cyan)]">Q{idx + 1}.</span>{" "}
                      {question.question_text}
                    </p>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(question.id)}
                        className="rounded-lg border border-[var(--accent-cyan)] p-1.5 text-[var(--accent-cyan)] transition hover:bg-[rgba(0,212,255,0.08)]"
                        aria-label="Edit question"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(question.id)}
                        className="rounded-lg border border-[var(--border)] p-1.5 text-[var(--text-secondary)] transition hover:border-[var(--error)] hover:text-[var(--error)]"
                        aria-label="Delete question"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm">
                    {(
                      [
                        ["A", question.option_a],
                        ["B", question.option_b],
                        ["C", question.option_c],
                        ["D", question.option_d],
                      ] as const
                    ).map(([key, text]) => (
                      <li
                        key={key}
                        className={
                          question.correct_answer === key
                            ? "font-semibold text-[var(--success)]"
                            : "text-[var(--text-secondary)]"
                        }
                      >
                        {key}. {text}
                        {question.correct_answer === key && " ✓"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

// ============================================================
// Main content editor
// ============================================================
export default function AdminContentEditor() {
  const { levelId, contentId } = useParams<{
    levelId?: string;
    contentId?: string;
  }>();
  const navigate = useNavigate();
  const isEdit = Boolean(contentId);

  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [resolvedLevelId, setResolvedLevelId] = useState<string | null>(
    levelId ?? null
  );

  const [type, setType] = useState<ContentType>("reading");
  const [title, setTitle] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [body, setBody] = useState("");
  const [bodyHi, setBodyHi] = useState("");
  const [published, setPublished] = useState(false);

  useEffect(() => {
    async function load() {
      if (!contentId) return;
      setLoading(true);
      try {
        const { content } = await adminGetContent(contentId);
        setType(content.type);
        setTitle(content.title);
        setTitleHi(content.title_hi ?? "");
        setBody(content.body ?? "");
        setBodyHi(content.body_hi ?? "");
        setPublished(content.published);
        setResolvedLevelId(content.level_id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load content.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [contentId]);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSavedMsg("");
    try {
      if (isEdit && contentId) {
        await adminUpdateContent(contentId, {
          type,
          title: title.trim(),
          title_hi: titleHi.trim() || null,
          body: body.trim() || null,
          body_hi: bodyHi.trim() || null,
          published,
        });
        setSavedMsg("Content saved.");
        setTimeout(() => setSavedMsg(""), 2500);
      } else if (levelId) {
        const created = await adminCreateContent({
          level_id: levelId,
          type,
          title: title.trim(),
          title_hi: titleHi.trim() || null,
          body: body.trim() || null,
          body_hi: bodyHi.trim() || null,
          published,
        });
        navigate(`/admin/ai-literacy/content/${created.id}`, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save content.");
    } finally {
      setSaving(false);
    }
  }

  const backTo = resolvedLevelId
    ? `/admin/ai-literacy/level/${resolvedLevelId}`
    : "/admin/ai-literacy";

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton-bone h-8 w-40" />
        <div className="skeleton-bone h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] transition hover:text-[var(--accent-cyan)]"
      >
        <ArrowLeft size={16} /> Back to level
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

      <section className="card p-5 md:p-6">
        <h1 className="mb-4 text-lg font-bold md:text-xl">
          {isEdit ? "Edit content" : "New content"}
        </h1>

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            Type
          </label>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition ${
                  type === t
                    ? "border-[var(--accent-cyan)] bg-[rgba(0,212,255,0.12)] text-[var(--accent-cyan)]"
                    : "border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title (English)" value={title} onChange={setTitle} />
          <Field label="Title (हिंदी)" value={titleHi} onChange={setTitleHi} />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field
            label={
              type === "task"
                ? "Task description (English)"
                : "Body (English)"
            }
            value={body}
            onChange={setBody}
            textarea
          />
          <Field
            label={type === "task" ? "Task description (हिंदी)" : "Body (हिंदी)"}
            value={bodyHi}
            onChange={setBodyHi}
            textarea
          />
        </div>

        <div className="mt-4 flex items-center gap-2.5">
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
          <span className="text-sm font-medium">
            {published ? "Published" : "Draft"}
          </span>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm"
          >
            <Save size={16} />{" "}
            {saving ? "Saving..." : isEdit ? "Save content" : "Create content"}
          </button>
          {savedMsg && (
            <span className="text-sm text-[var(--success)]">{savedMsg}</span>
          )}
        </div>

        {type === "quiz" && !isEdit && (
          <p className="mt-4 flex items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card-hover)] p-3 text-xs text-[var(--text-secondary)]">
            <X size={14} className="mt-0.5 shrink-0 text-[var(--accent-gold)]" />
            Save this quiz first, then you can add questions below.
          </p>
        )}
      </section>

      {isEdit && type === "quiz" && contentId && (
        <QuizManager contentId={contentId} />
      )}
    </div>
  );
}
