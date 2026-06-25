"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, X, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";

type Tab = "phone" | "email";

// 海外站默认邮箱，国内站默认手机号
function getDefaultTab(): Tab {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.includes("in-case.cn")) return "phone";
    if (host.includes("in-case.me")) return "email";
  }
  return "phone";
}

interface Props {
  open: boolean;
  onClose: () => void;
  purpose: "bind" | "login";
  onSuccess?: () => void;
}

export function BindModal({ open, onClose, purpose, onSuccess }: Props) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>(getDefaultTab);
  const [target, setTarget] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [smsConsent, setSmsConsent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 倒计时
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // 自动聚焦
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  function reset() {
    setTarget("");
    setCode("");
    setCodeSent(false);
    setCountdown(0);
  }

  async function handleSend() {
    if (!target.trim()) return;
    if (tab === "phone" && !smsConsent) {
      toast.error("Please consent to receive SMS messages before sending a code.");
      return;
    }
    const cleaned = target.trim();
    setSending(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: cleaned, purpose }),
      });
      const data = await res.json();
      if (res.ok) {
        setCodeSent(true);
        setCountdown(60);
        toast.success(
          t.bind.codeSent + " " + data.masked +
            (data.note ? t.common.optional : "")
        );
      } else {
        toast.error(data.error || t.common.error);
      }
    } catch {
      toast.error(t.common.error);
    } finally {
      setSending(false);
    }
  }

  async function handleVerify() {
    if (!code.trim() || !target.trim()) return;
    setVerifying(true);
    try {
      const endpoint = purpose === "bind" ? "/api/auth/bind" : "/api/auth/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: target.trim(), code: code.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          purpose === "bind" ? t.api.bindSuccess : t.api.loginSuccess
        );
        reset();
        onSuccess?.();
        onClose();
      } else {
        toast.error(data.error || t.common.error);
      }
    } catch {
      toast.error(t.common.error);
    } finally {
      setVerifying(false);
    }
  }

  if (!open) return null;

  const isPhone = tab === "phone";
  const placeholder = isPhone ? t.bind.phonePlaceholder : t.bind.emailPlaceholder;
  const isValid = isPhone
    ? /^1[3-9]\d{9}$/.test(target.trim())
    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target.trim());
  const codeValid = /^\d{6}$/.test(code.trim());

  const titles: Record<string, string> = {
    bind: t.bind.modalTitle,
    login: t.api.loginSuccess,
  };
  const subtitles: Record<string, string> = {
    bind: t.bind.modalDesc,
    login: t.bind.modalDesc,
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-[#E8E5DF] overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-neutral-800">
                  {titles[purpose]}
                </h3>
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed">
                {subtitles[purpose]}
              </p>
            </div>

            <div className="flex gap-1 bg-neutral-100 rounded-xl p-1 mb-4">
              <button
                onClick={() => { setTab("phone"); reset(); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tab === "phone"
                    ? "bg-white text-neutral-800 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                {t.bind.phoneLabel}
              </button>
              <button
                onClick={() => { setTab("email"); reset(); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tab === "email"
                    ? "bg-white text-neutral-800 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                {t.bind.emailLabel}
              </button>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                {isPhone ? t.bind.phoneLabel : t.bind.emailLabel}
              </label>
              <input
                ref={inputRef}
                type="text"
                value={target}
                onChange={(e) => { setTarget(e.target.value); setCodeSent(false); }}
                placeholder={placeholder}
                className="w-full h-11 rounded-xl border border-input bg-transparent px-3.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground/40 focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-50"
              />
              {/* SMS consent — A2P 10DLC compliant: unchecked by default, separate from TOS */}
              {isPhone && (
                <label className="flex items-start gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsConsent}
                    onChange={(e) => setSmsConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-input accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-[11px] text-neutral-500 leading-relaxed select-none">
                    I consent to receive SMS messages from Wan1yi, including verification codes and notification alerts. Message frequency varies. Message and data rates may apply. Reply HELP for help, STOP to cancel. Consent is not required for purchase.{' '}
                    <Link href="/privacy" target="_blank" className="text-warm-600 hover:underline">Privacy Policy</Link>
                    {' · '}
                    <Link href="/terms" target="_blank" className="text-warm-600 hover:underline">SMS Terms</Link>
                  </span>
                </label>
              )}
            </div>

            <div className="mb-3">
              <button
                onClick={handleSend}
                disabled={!isValid || sending || countdown > 0}
                className="w-full h-11 rounded-xl bg-neutral-800 text-white text-sm font-medium hover:bg-neutral-700 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {t.common.loading}</>
                ) : countdown > 0 ? (
                  countdown + "s"
                ) : codeSent ? (
                  t.common.sendCode
                ) : (
                  t.common.sendCode
                )}
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                {t.bind.codeLabel}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder={t.bind.codePlaceholder}
                  disabled={!codeSent}
                  className="flex-1 h-11 rounded-xl border border-input bg-transparent px-3.5 py-2 text-base text-center tracking-[0.3em] outline-none transition-colors placeholder:text-neutral-400 focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-50 disabled:bg-neutral-50 disabled:cursor-not-allowed"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && codeValid) handleVerify();
                  }}
                />
                <button
                  onClick={handleVerify}
                  disabled={!codeValid || verifying}
                  className="shrink-0 h-11 px-5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-emerald-200"
                >
                  {verifying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    t.common.confirm
                  )}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed text-center">
              {t.bind.modalDesc}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
