"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/i18n";

const STORAGE_KEY = "wanyi_onboarding_done";

/* ================================================================
   每页的视觉图解（纯 SVG/CSS 动画，不用图片）
   ================================================================ */

function AssetGridVisual() {
  // 模拟资产图标网格逐个出现
  const icons = ["💳","📱","🎮","✍️","📧","🎵","📷","💻","📊"];
  return (
    <div className="grid grid-cols-3 gap-3 w-56 mx-auto">
      {icons.map((icon, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 * i, duration: 0.4, ease: "easeOut" }}
          className="w-14 h-14 rounded-xl bg-white/70 shadow-sm flex items-center justify-center text-2xl"
        >
          {icon}
        </motion.div>
      ))}
    </div>
  );
}

function HeartShieldVisual({ label }: { label: string }) {
  // 心形 → 盾牌渐变，展示守护概念
  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* 外圈 */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute inset-0 rounded-full border-2 border-dashed border-rose-200"
      />
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.6 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="absolute inset-4 rounded-full bg-rose-50"
      />
      {/* 中心图标：心 + 盾交替 */}
      <motion.div
        initial={{ y: 8 }}
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center text-7xl"
      >
        ❤️
      </motion.div>
      {/* 人物连线 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-sm text-muted-foreground font-medium"
      >
        {label}
      </motion.div>
    </div>
  );
}

function StepsVisual({ labels }: { labels: { step1: string; step2: string; step3: string } }) {
  // 三步流程动画
  const steps = [
    { num: "①", label: labels.step1, icon: "📋", color: "bg-amber-100 border-amber-300 text-amber-700" },
    { num: "②", label: labels.step2, icon: "💌", color: "bg-rose-100 border-rose-300 text-rose-700" },
    { num: "③", label: labels.step3, icon: "🔐", color: "bg-emerald-100 border-emerald-300 text-emerald-700" },
  ];
  return (
    <div className="flex items-center gap-3 w-full max-w-sm mx-auto">
      {steps.map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 * i, duration: 0.5, ease: "easeOut" }}
          className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 ${step.color}`}
        >
          <span className="text-2xl">{step.icon}</span>
          <span className="text-xs font-bold">{step.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ================================================================
   页面定义
   ================================================================ */

/* ================================================================
   组件
   ================================================================ */

export function OnboardingGuide() {
  const { t } = useI18n();

  const slides = [
    {
      title: t.onboarding.slide1Title,
      subtitle: t.onboarding.slide1Subtitle,
      visual: null as string | null,
    },
    {
      title: t.onboarding.slide2Title,
      subtitle: t.onboarding.slide2Subtitle,
      visual: "assets",
    },
    {
      title: t.onboarding.slide3Title,
      subtitle: t.onboarding.slide3Subtitle,
      visual: "heart",
    },
    {
      title: t.onboarding.slide4Title,
      subtitle: t.onboarding.slide4Subtitle,
      visual: "steps",
    },
  ];

  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [started, setStarted] = useState(false);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    const force = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("onboarding");
    if (force) localStorage.removeItem(STORAGE_KEY);
    if (!localStorage.getItem(STORAGE_KEY)) {
      // 短延迟让页面先渲染
      setTimeout(() => setVisible(true), 200);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setExiting(true);
    setTimeout(() => setVisible(false), 600);
  }

  function next() {
    if (page < slides.length - 1) {
      setPage(page + 1);
    } else {
      // 最后一步：过渡动画
      localStorage.setItem(STORAGE_KEY, "1");
      setStarted(true);
      setTimeout(() => {
        setExiting(true);
        setTimeout(() => setVisible(false), 800);
      }, 400);
    }
  }

  // 滑动支持
  function handleTouchStart(e: React.TouchEvent) {
    touchStart.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (diff > 60) next();
    else if (diff < -60 && page > 0) setPage(page - 1);
    touchStart.current = null;
  }

  if (!visible) return null;

  const slide = slides[page];
  const isLast = page === slides.length - 1;

  const renderVisual = () => {
    switch (slide.visual) {
      case "assets": return <AssetGridVisual />;
      case "heart": return <HeartShieldVisual label={t.onboarding.assetVisualLabel} />;
      case "steps": return <StepsVisual labels={{ step1: t.onboarding.step1Label, step2: t.onboarding.step2Label, step3: t.onboarding.step3Label }} />;
      default: return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: exiting ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center select-none"
        style={{
          background: "linear-gradient(170deg, #fefcf8 0%, #fdf0db 40%, #fde8e8 100%)",
          backgroundAttachment: "fixed",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* 跳过 */}
        {!exiting && (
          <button
            onClick={dismiss}
            className="absolute top-8 right-8 text-sm text-neutral-400 hover:text-neutral-500 transition-colors tracking-wide z-10"
          >
            {t.common.skip}
          </button>
        )}

        {/* 内容区 */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-lg mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center text-center w-full"
            >
              {/* 视觉图解 */}
              {renderVisual() && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.05, ease: "easeOut" }}
                  className="mb-10"
                >
                  {renderVisual()}
                </motion.div>
              )}

              {/* 首页无图，用大图标 */}
              {!renderVisual() && (
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="text-8xl mb-8"
                >
                  ✨
                </motion.div>
              )}

              {/* 标题 */}
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="text-3xl sm:text-4xl font-bold text-foreground mb-5 tracking-tight"
              >
                {slide.title}
              </motion.h2>

              {/* 副标题 */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="text-lg sm:text-xl text-muted-foreground leading-relaxed whitespace-pre-line"
              >
                {slide.subtitle}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 底部 */}
        {!exiting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="pb-12 flex flex-col items-center gap-8"
          >
            {/* 圆点 */}
            <div className="flex items-center gap-3">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`rounded-full transition-all duration-500 ${
                    i === page
                      ? "bg-neutral-800 w-8 h-2.5"
                      : "bg-neutral-300 hover:bg-neutral-400 w-2.5 h-2.5"
                  }`}
                />
              ))}
            </div>

            {/* 按钮 */}
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              onClick={next}
              className={`px-10 py-3.5 rounded-2xl text-base font-semibold tracking-wide transition-all duration-200 active:scale-95 ${
                isLast
                  ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200/50"
                  : "bg-neutral-800 text-white hover:bg-neutral-700 shadow-lg"
              }`}
            >
              {isLast ? t.common.startGuard : t.common.continue}
            </motion.button>
          </motion.div>
        )}

        {/* 开始守护后的过渡遮罩 */}
        {started && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-6xl"
            >
              ✨
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
