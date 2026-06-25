"use client";

import { useState, useEffect, useCallback } from "react";
import { Lock, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/i18n";

export function EncryptionDemo() {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [encrypted, setEncrypted] = useState("");
  const [demoKey, setDemoKey] = useState<CryptoKey | null>(null);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    const generateKey = async () => {
      try {
        const key = await crypto.subtle.generateKey(
          { name: "AES-GCM", length: 256 },
          true,
          ["encrypt"]
        );
        setDemoKey(key);
      } catch {
        setUnsupported(true);
      }
    };
    generateKey();
  }, []);

  const doEncrypt = useCallback(
    async (text: string) => {
      if (!demoKey || !text.trim()) {
        setEncrypted("");
        return;
      }
      try {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoded = new TextEncoder().encode(text);
        const ciphertext = await crypto.subtle.encrypt(
          { name: "AES-GCM", iv },
          demoKey,
          encoded
        );
        const combined = new Uint8Array(iv.length + ciphertext.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(ciphertext), iv.length);
        const hex = Array.from(combined)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        setEncrypted(hex);
      } catch {
        setEncrypted("");
      }
    },
    [demoKey]
  );

  useEffect(() => {
    const timer = setTimeout(() => doEncrypt(input), 150);
    return () => clearTimeout(timer);
  }, [input, doEncrypt]);

  const hasInput = input.trim().length > 0;

  return (
    <div className="shrink-0 px-4 relative">
      <div className="max-w-xl mx-auto">
        {/* 输入框 — 仅占一行 */}
        <div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.settings.encryptInput}
            className="w-full px-3.5 py-2 text-sm border border-border/60 rounded-xl bg-background
                       placeholder:text-muted-foreground/50
                       focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-50
                       transition-all"
          />
          {hasInput && (
            <span className="absolute right-7 top-2 text-[11px] text-emerald-600 font-medium">
              {t.settings.encryptDone}
            </span>
          )}
        </div>
      </div>

      {/* 加密结果浮层 — 跟在输入框下方 0.3cm */}
      <AnimatePresence>
        {hasInput && !unsupported && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute left-4 right-4 z-40 flex justify-center pointer-events-none mt-[12px]"
          >
            <div className="w-full max-w-xl bg-white/95 backdrop-blur border border-border/60 rounded-2xl shadow-2xl ring-1 ring-black/5 p-3.5 pointer-events-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  <span>{t.settings.encryptRealtimeLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
                <button
                  onClick={() => setInput("")}
                  className="w-5 h-5 rounded-md hover:bg-muted flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <p className="text-[11px] text-slate-400 font-mono break-all leading-relaxed select-all line-clamp-3">
                  {encrypted}
                </p>
              </div>
              <p className="text-center text-[11px] text-muted-foreground/60 mt-1.5">
                {t.settings.encryptServerView}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
