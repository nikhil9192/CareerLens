import { useEffect, useState } from "react";

export type Lang = "en" | "hi";

const KEY = "careerlens_lang";
const EVENT = "careerlens-lang-change";

export function getLang(): Lang {
  return localStorage.getItem(KEY) === "hi" ? "hi" : "en";
}

/**
 * Language toggle state persisted in localStorage and synced across mounted
 * components in the same tab via a custom window event.
 */
export function useLanguage(): [Lang, (lang: Lang) => void] {
  const [lang, setLangState] = useState<Lang>(getLang);

  useEffect(() => {
    const handler = () => setLangState(getLang());
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  function setLang(next: Lang) {
    localStorage.setItem(KEY, next);
    setLangState(next);
    window.dispatchEvent(new Event(EVENT));
  }

  return [lang, setLang];
}

/** Returns the Hindi value when language is "hi" and it exists, else English. */
export function pick(
  lang: Lang,
  en: string | null | undefined,
  hi: string | null | undefined
): string {
  if (lang === "hi") {
    const trimmed = hi?.trim();
    if (trimmed) return trimmed;
  }
  return en ?? hi ?? "";
}
