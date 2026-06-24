import { Languages } from "lucide-react";
import type { Lang } from "../lib/aiLiteracyLang";

export default function LanguageToggle({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (lang: Lang) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg-card)] p-0.5">
      <Languages
        size={14}
        className="ml-1.5 mr-0.5 text-[var(--text-secondary)]"
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={() => onChange("en")}
        className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
          lang === "en"
            ? "bg-[var(--accent-cyan)] text-[#0a0f1e]"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => onChange("hi")}
        className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
          lang === "hi"
            ? "bg-[var(--accent-cyan)] text-[#0a0f1e]"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
      >
        हिंदी
      </button>
    </div>
  );
}
