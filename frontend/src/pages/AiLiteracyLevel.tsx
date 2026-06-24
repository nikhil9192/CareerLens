import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  ClipboardList,
  CheckCircle2,
  Circle,
} from "lucide-react";
import {
  fetchLiteracyOverview,
  type LevelOverview,
} from "../services/aiLiteracy.api";
import type { ContentType, AiLiteracyContentSummary } from "../types/aiLiteracy";
import { useLanguage, pick } from "../lib/aiLiteracyLang";
import LanguageToggle from "../components/LanguageToggle";

const TYPE_META: Record<
  ContentType,
  { icon: typeof BookOpen; en: string; hi: string }
> = {
  reading: { icon: BookOpen, en: "Reading", hi: "पठन" },
  quiz: { icon: HelpCircle, en: "Quiz", hi: "क्विज़" },
  task: { icon: ClipboardList, en: "Task", hi: "कार्य" },
};

export default function AiLiteracyLevel() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const [lang, setLang] = useLanguage();
  const [level, setLevel] = useState<LevelOverview | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!levelId) return;
      setLoading(true);
      try {
        const { levels, completedIds: done } = await fetchLiteracyOverview();
        const found = levels.find((l) => l.id === levelId) ?? null;
        if (found?.locked) {
          navigate("/ai-literacy", { replace: true });
          return;
        }
        setLevel(found);
        setCompletedIds(done);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load level.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [levelId, navigate]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="skeleton-bone mb-4 h-8 w-40" />
        <div className="skeleton-bone h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !level) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-sm text-[var(--text-secondary)]">
          {error || (lang === "hi" ? "स्तर नहीं मिला।" : "Level not found.")}
        </p>
        <Link
          to="/ai-literacy"
          className="mt-3 inline-block text-sm text-[var(--accent-cyan)]"
        >
          ← {lang === "hi" ? "वापस" : "Back to AI Literacy"}
        </Link>
      </div>
    );
  }

  const title = pick(lang, level.title, level.title_hi);
  const description = pick(lang, level.description, level.description_hi);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="hero-dark px-4 py-7 md:px-8 md:py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Link
              to="/ai-literacy"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] transition hover:text-[var(--accent-cyan)]"
            >
              <ArrowLeft size={16} />
              {lang === "hi" ? "सभी स्तर" : "All levels"}
            </Link>
            <LanguageToggle lang={lang} onChange={setLang} />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-cyan)]">
            {lang === "hi" ? "स्तर" : "Level"} {level.level_number}
          </div>
          <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)] md:text-base">
              {description}
            </p>
          )}

          <div className="mt-4 max-w-md">
            <div className="mb-1 flex justify-between text-xs font-medium">
              <span className="text-[var(--text-secondary)]">
                {level.completed}/{level.total}{" "}
                {lang === "hi" ? "पूर्ण" : "completed"}
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
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6 md:py-8">
        {level.content.length === 0 ? (
          <div className="card p-8 text-center text-sm text-[var(--text-secondary)]">
            {lang === "hi"
              ? "इस स्तर में अभी कोई सामग्री नहीं है।"
              : "No content in this level yet."}
          </div>
        ) : (
          <ul className="space-y-3">
            {level.content.map((item, index) => (
              <ContentRow
                key={item.id}
                item={item}
                index={index}
                lang={lang}
                done={completedIds.has(item.id)}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function ContentRow({
  item,
  index,
  lang,
  done,
}: {
  item: AiLiteracyContentSummary;
  index: number;
  lang: "en" | "hi";
  done: boolean;
}) {
  const meta = TYPE_META[item.type];
  const Icon = meta.icon;
  const title = pick(lang, item.title, item.title_hi);

  return (
    <li>
      <Link
        to={`/ai-literacy/content/${item.id}`}
        className="card group flex items-center gap-4 p-4"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(124,58,237,0.15)] text-[var(--accent-purple)]">
          <Icon size={18} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              {lang === "hi" ? meta.hi : meta.en} · {index + 1}
            </span>
          </div>
          <p className="truncate font-medium text-[var(--text-primary)]">
            {title}
          </p>
        </div>

        {done ? (
          <CheckCircle2 size={20} className="shrink-0 text-[var(--success)]" />
        ) : (
          <Circle
            size={20}
            className="shrink-0 text-[var(--text-secondary)] group-hover:text-[var(--accent-cyan)]"
          />
        )}
      </Link>
    </li>
  );
}
