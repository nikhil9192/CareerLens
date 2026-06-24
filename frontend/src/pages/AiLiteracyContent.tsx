import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  ClipboardList,
  RotateCcw,
  XCircle,
} from "lucide-react";
import {
  fetchContentItem,
  fetchLevelContent,
  fetchMyProgress,
  saveProgress,
} from "../services/aiLiteracy.api";
import type {
  AiLiteracyContent,
  AiLiteracyContentSummary,
  AiLiteracyQuizQuestion,
  ContentType,
  CorrectAnswer,
} from "../types/aiLiteracy";
import { useLanguage, pick, type Lang } from "../lib/aiLiteracyLang";
import LanguageToggle from "../components/LanguageToggle";

const TYPE_META: Record<
  ContentType,
  { icon: typeof BookOpen; en: string; hi: string }
> = {
  reading: { icon: BookOpen, en: "Reading", hi: "पठन" },
  quiz: { icon: HelpCircle, en: "Quiz", hi: "क्विज़" },
  task: { icon: ClipboardList, en: "Task", hi: "कार्य" },
};

const LETTERS: CorrectAnswer[] = ["A", "B", "C", "D"];

function optionText(
  q: AiLiteracyQuizQuestion,
  letter: CorrectAnswer,
  lang: Lang
): string {
  switch (letter) {
    case "A":
      return pick(lang, q.option_a, q.option_a_hi);
    case "B":
      return pick(lang, q.option_b, q.option_b_hi);
    case "C":
      return pick(lang, q.option_c, q.option_c_hi);
    case "D":
      return pick(lang, q.option_d, q.option_d_hi);
  }
}

export default function AiLiteracyContent() {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const [lang, setLang] = useLanguage();

  const [content, setContent] = useState<AiLiteracyContent | null>(null);
  const [questions, setQuestions] = useState<AiLiteracyQuizQuestion[]>([]);
  const [siblings, setSiblings] = useState<AiLiteracyContentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Quiz state
  const [answers, setAnswers] = useState<Record<string, CorrectAnswer>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function load() {
      if (!contentId) return;
      setLoading(true);
      setError("");
      setSubmitted(false);
      setAnswers({});
      try {
        const { content: item, questions: qs } =
          await fetchContentItem(contentId);
        setContent(item);
        setQuestions(qs);

        const [sibs, progress] = await Promise.all([
          fetchLevelContent(item.level_id),
          fetchMyProgress(),
        ]);
        setSiblings(sibs);
        setCompleted(
          progress.some(
            (p) => p.content_id === contentId && p.status === "completed"
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load content.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [contentId]);

  const nextItem = useMemo(() => {
    if (!content) return null;
    const idx = siblings.findIndex((s) => s.id === content.id);
    return idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  }, [content, siblings]);

  const score = useMemo(
    () =>
      questions.reduce(
        (acc, q) => acc + (answers[q.id] === q.correct_answer ? 1 : 0),
        0
      ),
    [questions, answers]
  );

  const allAnswered =
    questions.length > 0 && questions.every((q) => answers[q.id]);

  async function markComplete() {
    if (!contentId) return;
    setSaving(true);
    setError("");
    try {
      await saveProgress({ content_id: contentId, status: "completed" });
      setCompleted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save progress.");
    } finally {
      setSaving(false);
    }
  }

  async function submitQuiz() {
    if (!contentId) return;
    setSubmitted(true);
    setSaving(true);
    setError("");
    try {
      await saveProgress({
        content_id: contentId,
        status: "completed",
        score,
        total_questions: questions.length,
      });
      setCompleted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save progress.");
    } finally {
      setSaving(false);
    }
  }

  function retryQuiz() {
    setSubmitted(false);
    setAnswers({});
  }

  function goNext() {
    if (nextItem) {
      navigate(`/ai-literacy/content/${nextItem.id}`);
    } else if (content) {
      navigate(`/ai-literacy/level/${content.level_id}`);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="skeleton-bone mb-4 h-8 w-40" />
        <div className="skeleton-bone h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (error && !content) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-sm text-[var(--error)]">{error}</p>
        <Link
          to="/ai-literacy"
          className="mt-3 inline-block text-sm text-[var(--accent-cyan)]"
        >
          ← {lang === "hi" ? "वापस" : "Back to AI Literacy"}
        </Link>
      </div>
    );
  }

  if (!content) return null;

  const meta = TYPE_META[content.type];
  const Icon = meta.icon;
  const title = pick(lang, content.title, content.title_hi);
  const body = pick(lang, content.body, content.body_hi);
  const backTo = `/ai-literacy/level/${content.level_id}`;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="hero-dark px-4 py-7 md:px-8 md:py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Link
              to={backTo}
              className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] transition hover:text-[var(--accent-cyan)]"
            >
              <ArrowLeft size={16} />
              {lang === "hi" ? "स्तर पर वापस" : "Back to level"}
            </Link>
            <LanguageToggle lang={lang} onChange={setLang} />
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-[rgba(124,58,237,0.15)] px-2.5 py-1 text-xs font-semibold text-[var(--accent-purple)]">
              <Icon size={13} /> {lang === "hi" ? meta.hi : meta.en}
            </span>
            {completed && (
              <span className="flex items-center gap-1 rounded-full bg-[rgba(16,185,129,0.15)] px-2.5 py-1 text-xs font-semibold text-[var(--success)]">
                <CheckCircle2 size={13} /> {lang === "hi" ? "पूर्ण" : "Completed"}
              </span>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
            {title}
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6 md:py-8">
        {error && (
          <p
            className="mb-4 rounded-lg p-3 text-sm text-[var(--error)]"
            style={{ backgroundColor: "var(--color-error-bg)" }}
            role="alert"
          >
            {error}
          </p>
        )}

        {/* Reading / Task body */}
        {body && (
          <div className="card p-5 md:p-6">
            {content.type === "task" && (
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--accent-gold)]">
                {lang === "hi" ? "आपका कार्य" : "Your task"}
              </p>
            )}
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-primary)] md:text-base">
              {body}
            </div>
          </div>
        )}

        {/* Quiz */}
        {content.type === "quiz" && questions.length > 0 && (
          <div className="mt-4 space-y-4">
            {submitted && (
              <div className="card flex items-center justify-between gap-3 border-[var(--accent-cyan)] p-5">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {lang === "hi" ? "आपका स्कोर" : "Your score"}
                  </p>
                  <p className="text-2xl font-bold text-[var(--accent-cyan)]">
                    {score}/{questions.length}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={retryQuiz}
                  className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                >
                  <RotateCcw size={14} />
                  {lang === "hi" ? "फिर से" : "Try again"}
                </button>
              </div>
            )}

            {questions.map((q, qi) => {
              const selected = answers[q.id];
              const questionText = pick(
                lang,
                q.question_text,
                q.question_text_hi
              );
              const explanation = pick(lang, q.explanation, q.explanation_hi);
              return (
                <div key={q.id} className="card p-5">
                  <p className="font-medium text-[var(--text-primary)]">
                    <span className="text-[var(--accent-cyan)]">
                      {lang === "hi" ? "प्र" : "Q"}
                      {qi + 1}.
                    </span>{" "}
                    {questionText}
                  </p>

                  <div className="mt-3 space-y-2">
                    {LETTERS.map((letter) => {
                      const text = optionText(q, letter, lang);
                      const isSelected = selected === letter;
                      const isCorrect = q.correct_answer === letter;

                      let cls =
                        "border-[var(--border)] bg-[var(--input-bg)] text-[var(--text-primary)] hover:border-[var(--accent-cyan)]";
                      if (submitted) {
                        if (isCorrect) {
                          cls =
                            "border-[var(--success)] bg-[rgba(16,185,129,0.12)] text-[var(--success)]";
                        } else if (isSelected) {
                          cls =
                            "border-[var(--error)] bg-[var(--color-error-bg)] text-[var(--error)]";
                        } else {
                          cls =
                            "border-[var(--border)] bg-[var(--input-bg)] text-[var(--text-secondary)]";
                        }
                      } else if (isSelected) {
                        cls =
                          "border-[var(--accent-cyan)] bg-[rgba(0,212,255,0.12)] text-[var(--accent-cyan)]";
                      }

                      return (
                        <button
                          key={letter}
                          type="button"
                          disabled={submitted}
                          onClick={() =>
                            setAnswers((prev) => ({ ...prev, [q.id]: letter }))
                          }
                          className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition disabled:cursor-default ${cls}`}
                        >
                          <span className="font-bold">{letter}</span>
                          <span className="flex-1">{text}</span>
                          {submitted && isCorrect && (
                            <CheckCircle2 size={16} />
                          )}
                          {submitted && isSelected && !isCorrect && (
                            <XCircle size={16} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {submitted && explanation && (
                    <div className="mt-3 rounded-xl border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.06)] p-3 text-sm text-[var(--text-primary)]">
                      <p className="mb-0.5 font-semibold text-[var(--accent-cyan)]">
                        {lang === "hi" ? "व्याख्या" : "Explanation"}
                      </p>
                      <p>{explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Action bar */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {content.type === "quiz" && questions.length > 0 ? (
            !submitted ? (
              <button
                type="button"
                onClick={submitQuiz}
                disabled={!allAnswered || saving}
                className="btn-primary w-full py-3 text-sm font-semibold sm:flex-1"
              >
                {saving
                  ? lang === "hi"
                    ? "जमा हो रहा है..."
                    : "Submitting..."
                  : lang === "hi"
                    ? "उत्तर जमा करें"
                    : "Submit answers"}
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="btn-primary flex w-full items-center justify-center gap-1.5 py-3 text-sm font-semibold sm:flex-1"
              >
                {nextItem
                  ? lang === "hi"
                    ? "अगला"
                    : "Next"
                  : lang === "hi"
                    ? "स्तर पूरा करें"
                    : "Finish level"}
                <ArrowRight size={16} />
              </button>
            )
          ) : (
            <>
              {!completed ? (
                <button
                  type="button"
                  onClick={markComplete}
                  disabled={saving}
                  className="btn-primary flex w-full items-center justify-center gap-1.5 py-3 text-sm font-semibold sm:flex-1"
                >
                  <CheckCircle2 size={16} />
                  {saving
                    ? lang === "hi"
                      ? "सहेज रहा है..."
                      : "Saving..."
                    : lang === "hi"
                      ? "पूर्ण के रूप में चिह्नित करें"
                      : "Mark as complete"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goNext}
                  className="btn-primary flex w-full items-center justify-center gap-1.5 py-3 text-sm font-semibold sm:flex-1"
                >
                  {nextItem
                    ? lang === "hi"
                      ? "अगला"
                      : "Next"
                    : lang === "hi"
                      ? "स्तर पूरा करें"
                      : "Finish level"}
                  <ArrowRight size={16} />
                </button>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
