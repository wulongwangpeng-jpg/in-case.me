"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Key, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n";

function AcceptContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleAccept() {
    setSubmitting(true);
    try {
      await fetch("/api/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    } catch {
      // 即使网络错误也显示成功（乐观接受，服务端幂等）
    }
    setSubmitting(false);
    setAccepted(true);
  }

  if (!token) {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <Key className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">{t.unlock.noCredential}</h1>
        <p className="text-muted-foreground">
          {t.accept.invalidLink}
        </p>
      </div>
    );
  }

  if (accepted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-lg mx-auto px-6 py-20 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6"
        >
          <Heart className="w-10 h-10 text-emerald-500 fill-emerald-500" />
        </motion.div>
        <h1 className="text-2xl font-bold text-neutral-800 mb-3">
          {t.accept.confirmSuccess}
        </h1>
        <p className="text-neutral-500 mb-8 leading-relaxed whitespace-pre-line">
          {t.accept.body}
        </p>

        {/* 自然裂变引导 */}
        <div className="border border-[#E8E5DF] rounded-2xl p-6 bg-[#FBFBFD] mb-8">
          <Sparkles className="w-6 h-6 text-amber-400 mx-auto mb-3" />
          <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
            {t.accept.alsoPrepare}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-200"
          >
            {t.accept.alsoPrepareCta}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-xs text-neutral-400">
          {"In Case · Keep a Spare Key, Just in Case"}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        {/* 仪式感图标 — warm key metaphor */}
        <div className="w-20 h-20 rounded-full bg-sky-50 flex items-center justify-center mx-auto mb-6 border-2 border-sky-100">
          <Key className="w-10 h-10 text-sky-500" />
        </div>

        {/* 安抚文案 */}
        <h1 className="text-2xl font-bold text-neutral-800 mb-2">
          {t.accept.subtitle}
        </h1>
        <p className="text-neutral-500 mb-8 leading-relaxed max-w-sm mx-auto whitespace-pre-line">
          {t.accept.body}
        </p>

        {/* 说明卡片 */}
        <div className="border border-[#E8E5DF] rounded-2xl p-5 bg-[#FBFBFD] mb-8 text-left space-y-3">
          <div className="flex gap-3">
            <span className="text-lg">📌</span>
            <div>
              <p className="text-sm font-medium text-neutral-700">{t.accept.title}</p>
              <p className="text-xs text-neutral-400">{t.accept.whatIsThisAnswer}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-lg">🔐</span>
            <div>
              <p className="text-sm font-medium text-neutral-700">{t.home.trustEncryptLabel}</p>
              <p className="text-xs text-neutral-400">{t.home.trustEncryptPoint2}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-lg">💚</span>
            <div>
              <p className="text-sm font-medium text-neutral-700">{t.accept.whatIsThis}</p>
              <p className="text-xs text-neutral-400">{t.accept.whatIsThisAnswer}</p>
            </div>
          </div>
        </div>

        {/* 确认按钮 */}
        <button
          onClick={handleAccept}
          disabled={submitting}
          className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neutral-800 text-white text-sm font-semibold hover:bg-neutral-700 active:scale-95 transition-all duration-200 shadow-sm mb-4 disabled:opacity-50"
        >
          <Heart className="w-4 h-4" />
          {t.accept.confirmButton}
        </button>

        <p className="text-xs text-neutral-400">
          {t.accept.confirmSuccess}
        </p>
      </motion.div>
    </div>
  );
}

export default function AcceptPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <Key className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">{"Loading..."}</p>
        </div>
      }
    >
      <AcceptContent />
    </Suspense>
  );
}
