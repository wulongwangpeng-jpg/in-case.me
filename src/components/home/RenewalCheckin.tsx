"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Shield, Heart, Loader2, FileText, Users, Phone } from "lucide-react";
import { toast } from "sonner";
import { renewStatus, getUserStatus } from "@/lib/vault-service";
import { BindModal } from "@/components/auth/BindModal";
import { useI18n } from "@/i18n";

const THRESHOLD_OPTIONS = [30, 60, 90, 180, 365] as const;

interface StatusData {
  daysRemaining: number;
  isUrgent: boolean;
  thresholdDays: number;
  elapsedDays: number;
  elapsedPct: number;
  warningLevel: "normal" | "warning_80" | "warning_90" | "critical";
  hasPhone: boolean;
  hasEmail: boolean;
  vaultCount: number;
  credentialCount: number;
}

// 默认占位值——卡片立即可渲染，不等 API
const DEFAULT_STATUS: StatusData = {
  daysRemaining: 180,
  isUrgent: false,
  thresholdDays: 180,
  elapsedDays: 0,
  elapsedPct: 0,
  warningLevel: "normal",
  hasPhone: false,
  hasEmail: false,
  vaultCount: 0,
  credentialCount: 0,
};

const STATUS_CACHE_KEY = "wanyi_user_status";

function readCachedStatus(): StatusData | null {
  try {
    const raw = sessionStorage.getItem(STATUS_CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function writeCachedStatus(status: StatusData) {
  try {
    sessionStorage.setItem(STATUS_CACHE_KEY, JSON.stringify(status));
  } catch {}
}

export function RenewalCheckin() {
  const { t } = useI18n();
  const [status, setStatus] = useState<StatusData>(DEFAULT_STATUS);
  const [ready, setReady] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [showThresholdPicker, setShowThresholdPicker] = useState(false);
  const [showBindModal, setShowBindModal] = useState(false);
  const [bindPurpose, setBindPurpose] = useState<"bind" | "login">("bind");
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 同步读取缓存——避免 hydration mismatch
    const cached = readCachedStatus();
    if (cached) setStatus(cached);

    async function load() {
      try {
        const data = await getUserStatus();
        setStatus(data);
        writeCachedStatus(data);
        setLoaded(true);
      } catch {}
    }
    load();
  }, []);

  // 点击外部关闭阈值选择器
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowThresholdPicker(false);
      }
    }
    if (showThresholdPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showThresholdPicker]);

  async function handleRenew(days: number) {
    // 先乐观更新——卡片立刻变化，不用等 API
    const optimisticDays = Math.max(0, days - (status?.elapsedDays ?? 0));
    setStatus((prev) =>
      ({ ...prev, daysRemaining: optimisticDays, isUrgent: false, thresholdDays: days, warningLevel: "normal" as const })
    );
    setRenewing(true);
    try {
      const result = await renewStatus(days);
      if (result) {
        setStatus((prev) =>
          ({ ...prev, daysRemaining: result.daysRemaining, isUrgent: result.isUrgent, thresholdDays: days })
        );
        toast.success(t.renewal.checkinSuccess);
      }
    } catch {
      toast.error(t.common.error);
    } finally {
      setRenewing(false);
    }
  }

  async function handleChangeThreshold(days: number) {
    // 乐观更新
    const optimisticDaysRemaining = Math.max(0, days - (status?.elapsedDays ?? 0));
    setStatus((prev) =>
      ({ ...prev, thresholdDays: days, daysRemaining: optimisticDaysRemaining })
    );
    setShowThresholdPicker(false);

    try {
      const res = await fetch("/api/me/threshold", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ safe_threshold_days: days }),
      });
      if (res.ok) {
        const freshStatus = await res.json();
        setStatus(freshStatus);
        toast.success(t.settings.thresholdSaved);
      } else {
        const rollback = await getUserStatus();
        setStatus(rollback);
        toast.error(t.common.error);
      }
    } catch {
      const rollback = await getUserStatus();
      setStatus(rollback);
      toast.error(t.common.error);
    }
  }

  // ──── 新用户：还没有密文和信使 ────
  // 只有 API 确认后才展示新手引导，避免加载时误闪
  const isNewUser = loaded && status.vaultCount === 0 && status.credentialCount === 0;

  const thresholdDays = status.thresholdDays || 180;
  const fullDays = thresholdDays;
  const halfDays = Math.round(thresholdDays / 2);

  // 预警状态映射
  const warningConfig = {
    normal: { bg: "border-[#E8E5DF] bg-[#FBFBFD]", title: t.renewal.cardTitle, subtitle: t.renewal.desc, shieldBg: "bg-emerald-50", shieldColor: "text-emerald-600", ringColor: "#10b981" },
    warning_80: { bg: "border-amber-200/80 bg-amber-50/40", title: t.renewal.checkinNow, subtitle: t.renewal.desc, shieldBg: "bg-amber-100", shieldColor: "text-amber-600", ringColor: "#f59e0b" },
    warning_90: { bg: "border-orange-200/80 bg-orange-50/40", title: t.renewal.cardTitle, subtitle: t.renewal.checkinNow, shieldBg: "bg-orange-100", shieldColor: "text-orange-600", ringColor: "#f97316" },
    critical: { bg: "border-red-200/80 bg-red-50/40", title: t.renewal.checkinNow, subtitle: t.renewal.checkinNow, shieldBg: "bg-red-100", shieldColor: "text-red-600", ringColor: "#ef4444" },
  };
  const wc = warningConfig[status.warningLevel] || warningConfig.normal;
  const isWarning = status.warningLevel !== "normal";
  const progressPct = Math.max(3, Math.min(100, status.elapsedPct || ((thresholdDays - status.daysRemaining) / thresholdDays * 100)));

  // ──── 新用户引导卡片 ────
  if (isNewUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border border-emerald-200 bg-emerald-50/30 rounded-2xl p-6 sm:p-7 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-800">{t.common.startGuard}</h3>
            <p className="text-xs text-emerald-600/80">{t.onboarding.slide4Title}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700 shrink-0">①</span>
            {t.inventory.title} → {t.renewal.goBind}
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700 shrink-0">②</span>
            {t.letters.title} → {t.home.feature2Desc}
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700 shrink-0">③</span>
            {t.credential.createTitle} → {t.onboarding.slide4Subtitle}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`
        border rounded-2xl p-6 sm:p-7
        shadow-sm hover:shadow-md transition-shadow duration-300
        ${wc.bg}
      `}
    >
      {/* 预警横幅 */}
      <AnimatePresence>
        {ready && isWarning && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`mb-4 -mx-3 px-4 py-2 rounded-lg text-xs font-medium text-center overflow-hidden ${
              status.warningLevel === "warning_80" ? "bg-amber-100/60 text-amber-800" :
              status.warningLevel === "warning_90" ? "bg-orange-100/60 text-orange-800" :
              "bg-red-100/60 text-red-800"
            }`}
          >
            {status.warningLevel === "warning_80" && t.renewal.thresholdDays.replace("{n}", String(Math.round(thresholdDays * 0.8)))}
            {status.warningLevel === "warning_90" && t.renewal.thresholdDays.replace("{n}", String(Math.round(thresholdDays * 0.9)))}
            {status.warningLevel === "critical" && t.renewal.checkinNow}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 标题行 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-500 ${wc.shieldBg}`}>
            <Shield className={`w-5 h-5 transition-colors duration-500 ${wc.shieldColor}`} />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-800 tracking-wide transition-colors duration-500">
              {wc.title}
            </h3>
            <p className="text-xs text-neutral-400 tracking-wider transition-colors duration-500">
              {wc.subtitle}
            </p>
          </div>
        </div>

        {/* 统计 + 圆环 */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-xs text-neutral-400 tracking-wide">
            <Link href="/inventory" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <FileText className="w-3.5 h-3.5" />
              <motion.span key={status.vaultCount} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                {ready ? status.vaultCount : "--"}
              </motion.span>
              {" "}{t.renewal.vaultLabel}
            </Link>
            <Link href="/settings" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Users className="w-3.5 h-3.5" />
              <motion.span key={status.credentialCount} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                {ready ? status.credentialCount : "--"}
              </motion.span>
              {" "}{t.renewal.credLabel}
            </Link>
          </div>

          {/* 可点击圆环 → 阈值选择 */}
          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => ready && setShowThresholdPicker(!showThresholdPicker)}
              className={`relative w-16 h-16 shrink-0 rounded-full
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 focus-visible:ring-offset-2
                         ${ready ? "group cursor-pointer hover:shadow-md" : "cursor-default"}
                         transition-shadow duration-200`}
              title={ready ? t.settings.thresholdTitle : t.common.loading}
            >
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#E8E5DF" strokeWidth="5" />
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke={wc.ringColor}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressPct / 100)}`}
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  key={status.daysRemaining}
                  initial={ready ? { scale: 1.1 } : false}
                  animate={{ scale: 1 }}
                  className={`text-lg font-bold leading-none transition-colors duration-500 ${
                    ready ? "group-hover:scale-110 transition-transform" : ""
                  } ${isWarning ? wc.shieldColor : "text-neutral-700"}`}
                >
                  {ready ? status.daysRemaining : "--"}
                </motion.span>
                <span className="text-[11px] text-neutral-400 leading-tight">{t.settings.thresholdUnit}</span>
              </div>
              {ready && (
                <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-neutral-300/40 transition-colors" />
              )}
            </button>

            {/* 阈值下拉菜单 */}
            {showThresholdPicker && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-[#E8E5DF] rounded-xl shadow-lg p-1 z-10 min-w-[130px]">
                <div className="px-3 py-1.5 text-[11px] text-neutral-400 uppercase tracking-wider">{t.settings.thresholdTitle}</div>
                {THRESHOLD_OPTIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => handleChangeThreshold(d)}
                    className={`block w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      d === thresholdDays
                        ? "bg-emerald-50 text-emerald-700 font-semibold"
                        : "text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {t.settings.thresholdOptions[d as keyof typeof t.settings.thresholdOptions]}{d === 180 ? t.common.optional : ""}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 绑定状态：未绑定引导 / 已绑定确认，始终展示保持布局稳定 */}
      {ready && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-4"
        >
          {status.hasPhone || status.hasEmail ? (
            /* —— 已绑定：绿色确认态 —— */
            <div className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl
                           bg-emerald-50/60 border border-emerald-200/60">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-emerald-800">
                  {t.bind.boundTitle}
                </p>
                <p className="text-[11px] text-emerald-600/80">
                  {t.bind.boundDesc}
                </p>
              </div>
            </div>
          ) : (
            /* —— 未绑定：琥珀色引导态 —— */
            <button
              onClick={() => { setBindPurpose("bind"); setShowBindModal(true); }}
              className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl
                         bg-amber-50/60 border border-amber-200/60
                         hover:bg-amber-50 hover:border-amber-300
                         transition-colors duration-200 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-amber-800">
                    {t.bind.phoneOptional}
                  </p>
                  <p className="text-[11px] text-amber-600/80">
                    {t.bind.modalDesc}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-medium text-amber-600 group-hover:translate-x-0.5 transition-transform whitespace-nowrap">
                {t.renewal.goBind} →
              </span>
            </button>
          )}
        </motion.div>
      )}

      {/* 按钮行 */}
      <div className="flex flex-col gap-2.5 pt-4 border-t border-[#E8E5DF]/60">
        <button
          onClick={() => handleRenew(fullDays)}
          disabled={renewing || !ready}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5
                     rounded-xl bg-emerald-500 text-white text-sm font-semibold tracking-wide
                     hover:bg-emerald-600 active:scale-[0.98] transition-all duration-200
                     disabled:opacity-50 shadow-sm shadow-emerald-200"
        >
          {renewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Heart className="w-3.5 h-3.5" />}
          {t.renewal.checkinNow} · {fullDays}{t.settings.thresholdUnit}
        </button>
        <button
          onClick={() => handleRenew(halfDays)}
          disabled={renewing || !ready}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5
                     rounded-xl border border-amber-300 bg-amber-50 text-amber-700
                     text-sm font-semibold tracking-wide
                     hover:bg-amber-100 hover:border-amber-400
                     active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
        >
          {renewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
          {t.renewal.title} · {halfDays}{t.settings.thresholdUnit}
        </button>
      </div>

      {/* 绑定弹窗 */}
      <BindModal
        open={showBindModal}
        onClose={() => setShowBindModal(false)}
        purpose={bindPurpose}
        onSuccess={() => {
          // 绑定成功后刷新状态
          getUserStatus().then(setStatus);
        }}
      />
    </motion.div>
  );
}
