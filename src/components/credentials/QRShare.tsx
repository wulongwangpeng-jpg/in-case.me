"use client";

import { useState } from "react";
import { Copy, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";

interface QRShareProps {
  unlockUrl: string;
  messengerLabel?: string | null;
  onClose: () => void;
}

const paperStyle = {
  background: "linear-gradient(135deg, #fdfaf3 0%, #f8f0e0 50%, #faf3e6 100%)",
  border: "2px solid #d4c5a0",
  borderRadius: 4,
  boxShadow: "0 8px 40px rgba(0,0,0,0.25), inset 0 0 80px rgba(180,160,120,0.08)",
  fontFamily: "'Noto Serif SC', 'Source Han Serif SC', 'STSong', 'Songti SC', Georgia, serif",
};

export function QRShare({
  unlockUrl,
  messengerLabel,
  onClose,
}: QRShareProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(unlockUrl);
    setCopied(true);
    toast.success(t.credential.qrShareLinkCopied);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="max-w-sm w-full p-6 sm:p-7 relative" style={paperStyle}>
        {/* 关闭 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 transition-colors"
          style={{ color: "#8b7355" }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* 顶部 */}
        <div className="text-center mb-5">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, #c4a970, #d4b980, #c4a970, transparent)" }} />
            <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "#8b7355" }}>{t.common.appName}</span>
            <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, #c4a970, #d4b980, #c4a970, transparent)" }} />
          </div>
          <h3 className="text-base font-bold tracking-wider" style={{ color: "#4a3728" }}>
            {t.credential.qrShareTitle}
          </h3>
        </div>

        {/* 致 */}
        <div className="text-center mb-5">
          <p className="text-sm tracking-wider" style={{ color: "#4a3728" }}>
            {t.credential.qrShareTo} <strong className="text-base">{messengerLabel || t.credential.qrShareMessenger}</strong>
          </p>
        </div>

        {/* ① 提取链接 */}
        <div className="border-t border-dashed pt-4 mb-4" style={{ borderColor: "#c4b896" }}>
          <p className="text-xs tracking-wider mb-2 text-center" style={{ color: "#8b7355" }}>
            {t.credential.qrShareLinkSection}
          </p>
          <p className="text-[11px] leading-relaxed mb-2 text-center" style={{ color: "#5c4a3a" }}>
            {t.credential.qrShareLinkDesc}
          </p>
          <div
            className="p-2.5 mb-2 text-center"
            style={{ background: "rgba(255,255,255,0.5)", border: "1px dashed #d4c5a0", borderRadius: 2 }}
          >
            <p className="text-[11px] font-mono break-all leading-relaxed select-all" style={{ color: "#4a3728" }}>
              {unlockUrl}
            </p>
          </div>
          <button
            onClick={copyLink}
            className="w-full py-2 text-xs tracking-wider transition-colors"
            style={{
              background: copied ? "#e8f5e9" : "rgba(255,255,255,0.6)",
              border: `1px solid ${copied ? "#a5d6a7" : "#c4b896"}`,
              color: copied ? "#2e7d32" : "#5c4a3a",
              borderRadius: 2,
            }}
          >
            {copied ? (
              <span className="flex items-center justify-center gap-1">
                <Check className="w-3 h-3" /> {t.credential.qrShareCopiedLabel}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1">
                <Copy className="w-3 h-3" /> {t.credential.qrShareCopyLink}
              </span>
            )}
          </button>
        </div>

        {/* ② 解密密码 */}
        <div className="border-t border-dashed pt-4 mb-5" style={{ borderColor: "#c4b896" }}>
          <p className="text-xs tracking-wider mb-2 text-center" style={{ color: "#8b7355" }}>
            {t.credential.qrSharePwdSection}
          </p>
          <p className="text-[11px] leading-relaxed text-center" style={{ color: "#5c4a3a" }}>
            {t.credential.qrSharePwdPart1}<br />{t.credential.qrSharePwdPart2}
          </p>
        </div>

        {/* 缺一不可 */}
        <div
          className="text-center py-3 px-4 mb-5"
          style={{
            background: "rgba(200,50,30,0.06)",
            border: "1px solid rgba(200,50,30,0.2)",
            borderRadius: 2,
          }}
        >
          <p className="text-[11px] leading-relaxed" style={{ color: "#8b4513" }}>
            <strong>{t.credential.qrShareBothRequired}</strong>
            <br />{t.credential.qrShareBothDesc}
          </p>
        </div>

        {/* 底部 */}
        <button
          onClick={onClose}
          className="w-full py-2.5 text-xs tracking-wider text-white transition-colors"
          style={{
            background: "linear-gradient(135deg, #5c3d2e, #4a2c1a)",
            border: "none",
            borderRadius: 2,
          }}
        >
          {t.credential.qrShareAcknowledged}
        </button>

        <div className="text-center mt-4">
          <div className="h-px w-full" style={{ background: "linear-gradient(to right, transparent, #c4a970, transparent)" }} />
          <p className="text-[9px] mt-1.5 tracking-widest" style={{ color: "#c4b896" }}>
            {t.common.appName} · {t.common.appTagline}
          </p>
        </div>
      </div>
    </div>
  );
}
