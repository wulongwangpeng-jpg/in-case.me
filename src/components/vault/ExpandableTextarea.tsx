"use client";

import { useState, useRef, useEffect } from "react";
import { Maximize2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n";

interface ExpandableTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
}

export function ExpandableTextarea({
  value,
  onChange,
  placeholder,
  rows = 2,
  label,
}: ExpandableTextareaProps) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState(value);
  const overlayRef = useRef<HTMLDivElement>(null);

  // 打开浮层时同步当前值
  useEffect(() => {
    if (expanded) {
      setDraft(value);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [expanded, value]);

  // Escape 关闭
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && expanded) {
        setExpanded(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [expanded]);

  function handleConfirm() {
    onChange(draft);
    setExpanded(false);
  }

  return (
    <>
      {/* 正常输入框 */}
      <div className="relative group">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="pr-8 resize-none"
        />
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="absolute right-1.5 bottom-1.5 w-6 h-6 rounded-md bg-muted/60 hover:bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus-visible:opacity-100"
          title={t.common.expand}
        >
          <Maximize2 className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>

      {/* 全屏浮层 */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          >
            {/* 虚化背景 */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setExpanded(false)} />

            {/* 浮层卡片 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl ring-1 ring-black/10 overflow-hidden"
            >
              {/* 标签 */}
              {label && (
                <div className="px-5 pt-5 pb-0">
                  <p className="text-sm font-medium text-neutral-500">{label}</p>
                </div>
              )}

              {/* 大文本框 */}
              <div className="p-5">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={placeholder}
                  rows={10}
                  className="resize-none text-base"
                  autoFocus
                />
              </div>

              {/* 底部按钮 */}
              <div className="px-5 pb-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 active:scale-[0.98] transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  {t.common.confirm}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
