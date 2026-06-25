/**
 * i18n server utilities — NO "use client"
 *
 * For use in API routes, lib functions, and server components.
 * Client components should use the useI18n() hook from @/i18n.
 */
import zh from "./zh";
import en from "./en";
import type { I18nStrings } from "./zh";

type Lang = "zh" | "en";

const packs: Record<Lang, I18nStrings> = { zh, en };

/** Get strings pack for a given language. Server-safe version. */
export function getStrings(lang?: Lang | string): I18nStrings {
  if (lang === "en") return en;
  return zh;
}

/** Detect language from request (cookie + Accept-Language header) */
export function getLangFromRequest(request: Request): Lang {
  const cookie = request.headers.get("cookie") || "";
  const langMatch = cookie.match(/lang=(zh|en)/);
  if (langMatch) return langMatch[1] as Lang;

  const acceptLang = request.headers.get("accept-language") || "";
  if (acceptLang.toLowerCase().includes("zh")) return "zh";
  if (acceptLang.toLowerCase().includes("en")) return "en";

  return "zh";
}
