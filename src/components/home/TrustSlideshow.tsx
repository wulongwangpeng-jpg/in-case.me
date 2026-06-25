"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { useI18n } from "@/i18n";

const COLORS = [
  { color: "bg-amber-50", accent: "text-amber-600", border: "border-amber-200" },
  { color: "bg-emerald-50", accent: "text-emerald-600", border: "border-emerald-200" },
  { color: "bg-slate-100", accent: "text-slate-700", border: "border-slate-300" },
  { color: "bg-rose-50", accent: "text-rose-600", border: "border-rose-200" },
  { color: "bg-purple-50", accent: "text-purple-600", border: "border-purple-200" },
];

const EMOJIS = ["✍️", "🔐", "🗄️", "💚", "📨"];

export function TrustSlideshow() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const slides = t.home.trustSlides;
  const prev = () => setStep((s) => (s === 0 ? slides.length - 1 : s - 1));
  const next = () => setStep((s) => (s === slides.length - 1 ? 0 : s + 1));

  return (
    <>
      {/* 侧边入口 */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 bg-card border border-border/60 rounded-l-xl shadow-md px-3 py-2.5
                     hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-200
                     group"
        >
          <Shield className="w-4 h-4 text-emerald-500 group-hover:text-emerald-600" />
          <span className="text-[11px] text-muted-foreground group-hover:text-emerald-700 font-medium" style={{ writingMode: "vertical-rl" }}>
            {t.home.trustSlideshowLabel}
          </span>
        </button>
      </div>

      {/* 全屏 PPT 翻页 */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`${COLORS[step].color} ${COLORS[step].border} border rounded-3xl max-w-lg w-full p-8 sm:p-10 relative shadow-2xl`}
            >
              {/* 关闭 */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-background/80 hover:bg-background transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* 插图 */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-background/80 shadow-sm mb-4">
                  <span className="text-5xl">{EMOJIS[step]}</span>
                </div>
              </div>

              {/* 文字 */}
              <h2 className={`text-xl sm:text-2xl font-bold ${COLORS[step].accent} text-center mb-3`}>
                {step + 1}. {slides[step].title}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground text-center leading-relaxed">
                {slides[step].body}
              </p>

              {/* 页码 */}
              <div className="flex items-center justify-center gap-1.5 mt-6">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`rounded-full transition-all ${
                      i === step
                        ? "w-5 h-2 bg-foreground"
                        : "w-2 h-2 bg-muted-foreground/25 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>

              {/* 翻页箭头 */}
              <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none">
                <button
                  onClick={prev}
                  className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-background/80 hover:bg-background shadow-sm transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                </button>
                <button
                  onClick={next}
                  className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-background/80 hover:bg-background shadow-sm transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* 底部提示 */}
              <p className="text-center text-[11px] text-muted-foreground/50 mt-4">
                {t.home.trustSlideshowHint}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
