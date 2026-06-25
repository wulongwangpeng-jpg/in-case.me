/**
 * i18n — 多语言支持
 *
 * 用法：
 *   import { useI18n } from "@/i18n";
 *   const { t, lang, setLang } = useI18n();
 *   <h1>{t.home.heroTitle}</h1>
 *
 * 切换语言：
 *   ?lang=en  或  ?lang=zh
 *   或 cookie: lang=en
 *   默认：zh（中文）
 */

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import zh from "./zh";
import en from "./en";
import type { I18nStrings } from "./zh";

type Lang = "zh" | "en";

const packs: Record<Lang, I18nStrings> = { zh, en };

// ============================================================
// Context
// ============================================================

interface I18nContextValue {
  t: I18nStrings;
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nContextValue>({
  t: zh,
  lang: "zh",
  setLang: () => {},
});

// ============================================================
// 语言检测
// ============================================================

function detectLang(): Lang {
  // 海外站：强制默认英文（优先级最高）
  const isOverseas = process.env.NEXT_PUBLIC_SITE_MODE === "overseas";

  if (typeof window === "undefined") return isOverseas ? "en" : "zh";

  // 1. URL 参数 ?lang=en —— 用户显式指定，永远最高优先
  const params = new URLSearchParams(window.location.search);
  const queryLang = params.get("lang");
  if (queryLang === "en" || queryLang === "zh") return queryLang;

  // 2. Cookie（用户点过切换按钮）
  const cookies = document.cookie.split("; ");
  const langCookie = cookies.find((c) => c.startsWith("lang="));
  if (langCookie) {
    const val = langCookie.split("=")[1];
    if (val === "en" || val === "zh") return val;
  }

  // 3. 海外站：不再看浏览器语言，直接英文
  if (isOverseas) return "en";

  // 4. 国内站：看浏览器语言
  const browserLang = navigator.language?.toLowerCase();
  if (browserLang?.startsWith("zh")) return "zh";
  if (browserLang?.startsWith("en")) return "en";

  // 5. 默认中文（国内站兜底）
  return "zh";
}

// ============================================================
// Provider
// ============================================================

const initialLang: Lang =
  process.env.NEXT_PUBLIC_SITE_MODE === "overseas" ? "en" : "zh";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLangState(detectLang());
    setMounted(true);
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    // 写入 cookie（1 年有效）
    document.cookie = `lang=${newLang}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  }, []);

  // 避免 hydration mismatch
  if (!mounted) {
    return (
      <I18nContext.Provider value={{ t: packs[initialLang], lang: initialLang, setLang }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ t: packs[lang], lang, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

// ============================================================
// Hook
// ============================================================

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}

// ============================================================
// 服务端/非组件环境使用（API 路由、lib）
// Re-export from server module to avoid "use client" boundary
// ============================================================

export { getStrings, getLangFromRequest } from "./server";
