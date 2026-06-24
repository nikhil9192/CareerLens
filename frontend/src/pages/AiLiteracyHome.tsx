import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BrainCircuit, Lock, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import {
  fetchLiteracyOverview,
  UNLOCK_THRESHOLD,
  type LevelOverview,
} from "../services/aiLiteracy.api";
import { useLanguage, pick } from "../lib/aiLiteracyLang";
import LanguageToggle from "../components/LanguageToggle";

export default function AiLiteracyHome() {
  const [lang, setLang] = useLanguage();
  const [levels, setLevels] = useState<LevelOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { levels: data } = await fetchLiteracyOverview();
        setLevels(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load AI Literacy."
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="hero-dark px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.08)] px-3 py-1 text-xs font-semibold text-[var(--accent-cyan)]">
              <Sparkles size={13} />
              {lang === "hi" ? "एआई साक्षरता" : "AI Literacy"}
            </span>
            <LanguageToggle lang={lang} onChange={setLang} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] md:text-4xl">
              {lang === "hi" ? (
                <>
                  एआई को समझें,{" "}
                  <span className="gradient-text-cyan">कदम दर कदम</span>
                </>
              ) : (
                <>
                  Understand AI,{" "}
                  <span className="gradient-text-cyan">step by step</span>
                </>
              )}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)] md:text-base">
              {lang === "hi"
                ? "पढ़ें, क्विज़ हल करें और कार्य पूरे करें। हर स्तर को पूरा करके अगला अनलॉक करें।"
                : "Read, take quizzes, and complete tasks. Finish each level to unlock the next."}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-6 md:py-8">
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
          <div className="grid gap-4 md:grid-cols-3">
            <div className="skeleton-bone h-56 rounded-2xl" />
            <div className="skeleton-bone h-56 rounded-2xl" />
            <div className="skeleton-bone h-56 rounded-2xl" />
          </div>
        ) : levels.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 p-10 text-center">
            <BrainCircuit size={32} className="text-[var(--text-secondary)]" />
            <p className="text-sm text-[var(--text-secondary)]">
              {lang === "hi"
                ? "अभी कोई स्तर उपलब्ध नहीं है। जल्द ही वापस आएं।"
                : "No levels are available yet. Check back soon."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {levels.map((level) => (
              <LevelCard key={level.id} level={level} lang={lang} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function LevelCard({
  level,
  lang,
}: {
  level: LevelOverview;
  lang: "en" | "hi";
}) {
  const title = pick(lang, level.title, level.title_hi);
  const description = pick(lang, level.description, level.description_hi);
  const isComplete = level.total > 0 && level.completed === level.total;

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${
            level.locked
              ? "bg-[var(--bg-card-hover)] text-[var(--text-secondary)]"
              : "bg-[rgba(0,212,255,0.12)] text-[var(--accent-cyan)]"
          }`}
        >
          {level.locked ? <Lock size={18} /> : level.level_number}
        </span>
        {isComplete ? (
          <span className="flex items-center gap-1 rounded-full bg-[rgba(16,185,129,0.15)] px-2.5 py-1 text-xs font-semibold text-[var(--success)]">
            <CheckCircle2 size={13} />
            {lang === "hi" ? "पूर्ण" : "Done"}
          </span>
        ) : (
          <span className="rounded-full bg-[var(--bg-card-hover)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">
            {level.total}{" "}
            {lang === "hi"
              ? "विषय"
              : level.total === 1
                ? "item"
                : "items"}
          </span>
        )}
      </div>

      <div className="mt-3 flex-1">
        <h3 className="font-bold text-[var(--text-primary)]">{title}</h3>
        {description && (
          <p className="mt-1 line-clamp-3 text-sm text-[var(--text-secondary)]">
            {description}
          </p>
        )}
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs font-medium">
          <span className="text-[var(--text-secondary)]">
            {lang === "hi" ? "प्रगति" : "Progress"}
          </span>
          <span className="text-[var(--accent-cyan)]">{level.pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="h-full rounded-full bg-[var(--accent-cyan)] transition-all duration-500"
            style={{ width: `${level.pct}%` }}
          />
        </div>
      </div>

      {level.locked ? (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <Lock size={12} />
          {lang === "hi"
            ? `पिछला स्तर ${UNLOCK_THRESHOLD}% पूरा करें`
            : `Complete ${UNLOCK_THRESHOLD}% of the previous level`}
        </p>
      ) : (
        <span className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-[var(--accent-cyan)] py-2 text-sm font-semibold text-[var(--accent-cyan)] transition group-hover:bg-[rgba(0,212,255,0.08)]">
          {level.pct > 0
            ? lang === "hi"
              ? "जारी रखें"
              : "Continue"
            : lang === "hi"
              ? "शुरू करें"
              : "Start"}
          <ArrowRight size={15} />
        </span>
      )}
    </>
  );

  if (level.locked) {
    return (
      <div className="card flex cursor-not-allowed flex-col p-5 opacity-70">
        {inner}
      </div>
    );
  }

  return (
    <Link
      to={`/ai-literacy/level/${level.id}`}
      className="card group flex flex-col p-5"
    >
      {inner}
    </Link>
  );
}
