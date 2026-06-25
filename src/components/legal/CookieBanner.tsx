"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n";

const STORAGE_KEY = "wanyi_cookie_consent";

export function CookieBanner() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consented = localStorage.getItem(STORAGE_KEY);
    if (!consented) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-lg mx-auto"
        >
          <div className="bg-white border border-border/60 rounded-2xl shadow-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <Cookie className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-neutral-700 mb-0.5">
                  {t.legal.cookieConsentTitle}
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t.legal.cookieConsentBody}{" "}
                  <Link
                    href="/privacy"
                    className="underline underline-offset-2 hover:text-foreground transition-colors"
                  >
                    {t.legal.cookieLearnMore}
                    <ChevronRight className="w-3 h-3 inline ml-0.5" />
                  </Link>
                </p>
              </div>
            </div>
            <button
              onClick={accept}
              className="shrink-0 px-4 py-1.5 rounded-lg bg-neutral-800 text-white text-xs font-medium hover:bg-neutral-700 active:scale-95 transition-all whitespace-nowrap"
            >
              {t.legal.cookieAccept}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
