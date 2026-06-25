"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, EyeOff, Download } from "lucide-react";
import { OnboardingGuide } from "@/components/home/OnboardingGuide";
import type { I18nStrings } from "@/i18n/zh";

interface Props {
  t: I18nStrings;
}

export function HomeClientIslands({ t }: Props) {
  const [activePill, setActivePill] = useState<number | null>(null);

  const trustPills = [
    {
      label: t.home.trustEncryptLabel,
      icon: Shield,
      title: t.home.trustEncryptTitle,
      subtitle: t.home.trustEncryptSubtitle,
      metaphor: t.home.trustEncryptMetaphor,
      points: [
        t.home.trustEncryptPoint1,
        t.home.trustEncryptPoint2,
        t.home.trustEncryptPoint3,
      ],
    },
    {
      label: t.home.trustBlindLabel,
      icon: EyeOff,
      title: t.home.trustBlindTitle,
      subtitle: t.home.trustBlindSubtitle,
      metaphor: t.home.trustBlindMetaphor,
      points: [
        t.home.trustBlindPoint1,
        t.home.trustBlindPoint2,
        t.home.trustBlindPoint3,
      ],
    },
    {
      label: t.home.trustExportLabel,
      icon: Download,
      title: t.home.trustExportTitle,
      subtitle: t.home.trustExportSubtitle,
      metaphor: t.home.trustExportMetaphor,
      points: [
        t.home.trustExportPoint1,
        t.home.trustExportPoint2,
        t.home.trustExportPoint3,
      ],
    },
  ];

  return (
    <>
      <OnboardingGuide />

      {/* 信任三按钮 */}
      <div className="shrink-0 text-center py-1 px-4 relative">
        <div className="inline-flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
          {trustPills.map((pill, i) => (
            <button
              key={pill.label}
              onClick={() => setActivePill(activePill === i ? null : i)}
              className={`group inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] sm:text-xs font-medium transition-all duration-200 ${
                activePill === i
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm"
                  : i === 0
                    ? "border-emerald-200/60 bg-emerald-50/50 text-emerald-700/70 hover:text-emerald-800 hover:border-emerald-300 hover:shadow-sm active:scale-[0.97]"
                  : i === 1
                    ? "border-sky-200/60 bg-sky-50/50 text-sky-700/70 hover:text-sky-800 hover:border-sky-300 hover:shadow-sm active:scale-[0.97]"
                    : "border-amber-200/60 bg-amber-50/50 text-amber-700/70 hover:text-amber-800 hover:border-amber-300 hover:shadow-sm active:scale-[0.97]"
              }`}
            >
              <pill.icon className={`w-3.5 h-3.5 ${activePill === i ? "text-emerald-500" : "text-muted-foreground/60 group-hover:text-foreground/70"}`} />
              {pill.label}
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${activePill === i ? "rotate-180 text-emerald-400" : "text-muted-foreground/40 group-hover:text-foreground/50"}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {activePill !== null && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-background/30 backdrop-blur-[2px]"
                onClick={() => setActivePill(null)}
              />
              <motion.div
                key={activePill}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-[calc(100vw-2rem)] max-w-xl"
              >
                <div className="bg-white border border-border/30 rounded-xl p-4 sm:p-5 text-left shadow-lg ring-1 ring-black/5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {(() => {
                        const Icon = trustPills[activePill].icon;
                        return <Icon className="w-4 h-4" />;
                      })()}
                    </div>
                    <div className="min-w-0 space-y-2">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">
                          {trustPills[activePill].title}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-muted-foreground">
                          {trustPills[activePill].subtitle}
                        </p>
                      </div>
                      <p className="text-[11px] sm:text-xs text-foreground/80 leading-relaxed italic border-l-2 border-warm-300 pl-2.5 sm:pl-3">
                        💡 {trustPills[activePill].metaphor}
                      </p>
                      <ul className="space-y-1">
                        {trustPills[activePill].points.map((point, j) => (
                          <li key={j} className="text-[11px] sm:text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-emerald-500 mt-0.5 shrink-0 text-[11px]">✓</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
