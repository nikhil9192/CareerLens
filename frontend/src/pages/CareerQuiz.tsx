import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchCareerQuestions, submitCareerAssessment } from "../services/career.api";
import type { CareerAnswer, CareerQuestion } from "../types/career";

const QUESTIONS_PER_PAGE = 5;
const TOTAL_PAGES = 3;

const PAGE_LABELS = ["Question 1–5 of 15", "Question 6–10 of 15", "Question 11–15 of 15"];

function categoryColor(category: string): string {
  const map: Record<string, string> = {
    Interest: "bg-[rgba(0,212,255,0.15)] text-[var(--accent-cyan)]",
    Skills: "bg-[rgba(124,58,237,0.15)] text-[var(--accent-purple)]",
    Communication: "bg-[rgba(0,212,255,0.12)] text-[var(--accent-cyan)]",
    WorkStyle: "bg-[rgba(245,166,35,0.15)] text-[var(--accent-gold)]",
    Values: "bg-[rgba(16,185,129,0.15)] text-[var(--success)]",
  };
  return map[category] ?? "bg-[var(--bg-card-hover)] text-[var(--text-secondary)]";
}

function QuizSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="card p-6 shadow-sm"
        >
          <div className="skeleton-bone mb-3 h-5 w-24" />
          <div className="skeleton-bone mb-4 h-6 w-full" />
          <div className="space-y-2">
            <div className="skeleton-bone h-12 w-full" />
            <div className="skeleton-bone h-12 w-full" />
            <div className="skeleton-bone h-12 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CareerQuiz() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<CareerQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchCareerQuestions()
      .then(setQuestions)
      .catch(() => setError("Failed to load questions. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  const pageQuestions = useMemo(() => {
    const start = page * QUESTIONS_PER_PAGE;
    return questions.slice(start, start + QUESTIONS_PER_PAGE);
  }, [questions, page]);

  const progressPercent = ((page + 1) / TOTAL_PAGES) * 100;

  const pageComplete = pageQuestions.every((q) => answers[q.id]);

  function selectOption(questionId: number, option: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  function goToPage(nextPage: number) {
    setAnimating(true);
    setTimeout(() => {
      setPage(nextPage);
      setAnimating(false);
    }, 200);
  }

  function handleNext() {
    if (!pageComplete) return;
    if (page < TOTAL_PAGES - 1) {
      goToPage(page + 1);
    } else {
      handleSubmit();
    }
  }

  function handleBack() {
    if (page > 0) {
      goToPage(page - 1);
    }
  }

  async function handleSubmit() {
    if (questions.length !== 15) return;

    const payload: CareerAnswer[] = questions.map((q) => ({
      question_number: q.id,
      question_text: q.text,
      selected_option: answers[q.id] ?? "",
      cluster_tag: q.cluster_tag,
    }));

    if (payload.some((a) => !a.selected_option)) {
      setError("Please answer all 15 questions before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await submitCareerAssessment(payload);
      setAnalysing(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      navigate("/career-results");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to submit assessment. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
      setAnalysing(false);
    }
  }

  if (analysing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] px-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-brand)] border-t-transparent" />
        <p className="mt-6 text-lg font-semibold text-[var(--color-text)]">
          Analysing your profile...
        </p>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Matching your interests with career paths
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="text-sm font-medium text-[var(--color-brand)] hover:underline"
          >
            ← Dashboard
          </Link>
          <p className="text-lg font-bold text-[var(--color-brand)]">CareerLens</p>
        </div>

        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm font-medium text-[var(--color-text-muted)]">
            <span>{PAGE_LABELS[page]}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--color-border)]">
            <div
              className="h-full rounded-full bg-[var(--color-brand)] transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <h1 className="mb-6 text-2xl font-bold text-[var(--color-text)]">
          Career Assessment Quiz
        </h1>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg p-3 text-sm text-[var(--color-fail)]"
            style={{ backgroundColor: "var(--color-error-bg)" }}
          >
            {error}
          </div>
        )}

        {loading && <QuizSkeleton />}

        {!loading && !error && questions.length > 0 && (
          <div
            className={`space-y-5 transition-opacity duration-200 ease-in-out ${
              animating ? "opacity-0" : "opacity-100"
            }`}
          >
            {pageQuestions.map((question) => (
              <div
                key={question.id}
                className="card p-6 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryColor(question.category)}`}
                  >
                    {question.category}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    Q{question.id}
                  </span>
                </div>

                <p className="mb-4 text-base font-medium text-[var(--color-text)]">
                  {question.text}
                </p>

                <div className="space-y-2">
                  {question.options.map((option) => {
                    const selected = answers[question.id] === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => selectOption(question.id, option)}
                        className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                          selected
                            ? "border-[var(--accent-cyan)] bg-[rgba(0,212,255,0.12)] font-medium text-[var(--accent-cyan)]"
                            : "border-[var(--color-border)] bg-[var(--input-bg)] text-[var(--color-text)] hover:border-[var(--accent-cyan)] hover:bg-[rgba(0,212,255,0.06)]"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && questions.length > 0 && (
          <div className="mt-8 flex gap-3">
            {page > 0 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--bg-card)] py-3 font-semibold text-[var(--color-text)] transition hover:bg-[var(--bg-card-hover)] disabled:opacity-50"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!pageComplete || submitting}
              className="btn-primary flex-1 py-3 font-semibold disabled:cursor-not-allowed"
            >
              {submitting
                ? "Submitting..."
                : page === TOTAL_PAGES - 1
                  ? "Submit & See Results"
                  : "Next"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
