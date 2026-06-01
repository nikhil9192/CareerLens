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
          className="card p-4 shadow-sm md:p-6"
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

  const currentQuestionNum = Math.min(
    pageQuestions.find((q) => !answers[q.id])?.id ??
      pageQuestions[pageQuestions.length - 1]?.id ??
      page * QUESTIONS_PER_PAGE + 1,
    15
  );

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
    <div className="min-h-screen w-full bg-[var(--color-bg)] px-4 py-6 md:py-8">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-4 flex items-center justify-between md:mb-6">
          <Link
            to="/dashboard"
            className="text-xs font-medium text-[var(--color-brand)] hover:underline md:text-sm"
          >
            ← Dashboard
          </Link>
          <p className="text-base font-bold text-[var(--color-brand)] md:text-lg">
            CareerLens
          </p>
        </div>

        <div className="mb-6 md:mb-8">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-[var(--color-text-muted)] md:text-sm">
            <span className="md:hidden">Q{currentQuestionNum} of 15</span>
            <span className="hidden md:inline">{PAGE_LABELS[page]}</span>
            <span className="hidden md:inline">{Math.round(progressPercent)}%</span>
          </div>
          <div className="hidden h-2 overflow-hidden rounded-full bg-[var(--color-border)] md:block">
            <div
              className="h-full rounded-full bg-[var(--color-brand)] transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-1 text-center text-xs font-medium text-[var(--accent-cyan)] md:hidden">
            Page {page + 1} of {TOTAL_PAGES}
          </p>
        </div>

        <h1 className="mb-4 text-xl font-bold text-[var(--color-text)] md:mb-6 md:text-2xl">
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
                className="card p-4 shadow-sm md:p-6"
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

                <p className="mb-3 text-sm font-medium text-[var(--color-text)] md:mb-4 md:text-base">
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
                        className={`w-full rounded-xl border px-3 py-2.5 text-left text-xs transition md:px-4 md:py-3 md:text-sm ${
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
          <div className="mt-6 flex flex-col gap-3 sm:flex-row md:mt-8">
            {page > 0 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--bg-card)] py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--bg-card-hover)] disabled:opacity-50 sm:flex-1 md:text-base"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!pageComplete || submitting}
              className="btn-primary w-full py-3 text-sm font-semibold disabled:cursor-not-allowed sm:flex-1 md:text-base"
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
