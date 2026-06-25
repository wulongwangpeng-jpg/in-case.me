"use client";

/**
 * EnvelopeReveal — Premium wax-seal letter ceremony
 *
 * Shared by unlock page & preview modal.
 * Real SVG wax seal with 3D depth + envelope with paper grain + sequenced opening.
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useI18n } from "@/i18n";
import type { I18nStrings } from "@/i18n/zh";
import { DecryptedVaultView } from "./DecryptedVaultView";

// ═══════════════════════════════════════════
// Types
// ═══════════════════════════════════════════

interface VaultItem {
  id: string;
  vaultType?: string;
  aliasName?: string | null;
  memoryHint?: string | null;
  alias?: string;
  type?: string;
  content: string;
}

interface EnvelopeRevealProps {
  addressee?: string | null;
  relation?: string | null;
  vaults: VaultItem[];
  guidePlatforms: string[];
}

// ═══════════════════════════════════════════
// Wax Seal — SVG with metallic depth
// ═══════════════════════════════════════════

function WaxSeal() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-lg"
      aria-hidden
    >
      <defs>
        {/* Deep crimson radial gradient */}
        <radialGradient id="waxGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#e85050" />
          <stop offset="25%" stopColor="#c0392b" />
          <stop offset="55%" stopColor="#8b1a1a" />
          <stop offset="85%" stopColor="#5a0a0a" />
          <stop offset="100%" stopColor="#3a0404" />
        </radialGradient>
        {/* Specular highlight */}
        <radialGradient id="waxHighlight" cx="30%" cy="25%" r="30%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        {/* Emboss ring gradient */}
        <radialGradient id="ringGrad" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="rgba(0,0,0,0.35)" />
          <stop offset="78%" stopColor="rgba(255,255,255,0.2)" />
          <stop offset="82%" stopColor="rgba(0,0,0,0.5)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
        </radialGradient>
        {/* Drop shadow filter */}
        <filter id="sealShadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Main wax body — slightly irregular circle */}
      <path
        d="M50 6 C68 6 84 18 92 36 C96 46 96 54 92 64 C84 82 68 94 50 94 C35 94 20 86 12 74 C6 64 4 52 7 42 C12 28 28 8 50 6Z"
        fill="url(#waxGrad)"
        filter="url(#sealShadow)"
      />

      {/* Specular highlight */}
      <path
        d="M50 6 C68 6 84 18 92 36 C96 46 96 54 92 64 C84 82 68 94 50 94 C35 94 20 86 12 74 C6 64 4 52 7 42 C12 28 28 8 50 6Z"
        fill="url(#waxHighlight)"
      />

      {/* Embossed ring */}
      <circle cx="50" cy="50" r="32" fill="none" stroke="url(#ringGrad)" strokeWidth="6" />
      <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(180,120,120,0.3)" strokeWidth="0.5" />

      {/* Embossed shield emblem */}
      <path
        d="M50 28 L56 32 L56 40 C56 48 52 54 50 56 C48 54 44 48 44 40 L44 32Z"
        fill="none"
        stroke="rgba(255,220,220,0.5)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Shield center cross */}
      <line x1="50" y1="36" x2="50" y2="48" stroke="rgba(255,220,220,0.4)" strokeWidth="1.2" />

      {/* Wax drips at bottom */}
      <path
        d="M30 88 C28 93 30 98 33 98 C36 98 36 94 35 90"
        fill="url(#waxGrad)"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="0.3"
      />
      <path
        d="M62 90 C60 96 62 99 65 99 C67 99 68 95 67 91"
        fill="url(#waxGrad)"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="0.3"
      />
      <path
        d="M46 92 C45 96 46 97 48 97 C49 97 49 95 48 92"
        fill="url(#waxGrad)"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="0.3"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════
// Envelope — paper grain + folded flaps
// ═══════════════════════════════════════════

function SealEnvelope({ onOpen, t }: { onOpen: () => void; t: I18nStrings }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="flex flex-col items-center justify-center py-8 px-4"
    >
      <motion.button
        onClick={onOpen}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        className="relative w-full max-w-[360px] aspect-[4/3] cursor-pointer group"
      >
        {/* Drop shadow beneath envelope */}
        <div className="absolute -inset-3 rounded-2xl bg-[#d4c5a0]/15 blur-xl" />

        {/* ─── Envelope body ─── */}
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-[14px] overflow-hidden"
          style={{
            background: `
              linear-gradient(155deg, #f8f3e8 0%, #ede2cd 25%, #e6dac0 50%, #f0e6d2 75%, #faf6ee 100%)
            `,
            boxShadow: `
              0 4px 30px rgba(100,80,50,0.10),
              0 1px 4px rgba(0,0,0,0.06),
              inset 0 0 0 0.5px rgba(180,160,130,0.25)
            `,
          }}
        >
          {/* Paper fiber texture (micro-lines) */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `
                repeating-linear-gradient(2deg, transparent, transparent 1px, #8b7355 2px),
                repeating-linear-gradient(92deg, transparent, transparent 3px, #8b7355 4px)
              `,
            }}
          />

          {/* ─── Bottom flap (visible beneath) ─── */}
          <div
            className="absolute bottom-0 left-[12%] right-[12%] h-[35%] rounded-t-lg"
            style={{
              background: "linear-gradient(0deg, #e8dcc8 0%, #dfd1b8 60%, #d9cbb0 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          />

          {/* ─── Left flap ─── */}
          <div
            className="absolute top-[8%] bottom-[35%] left-0 w-[55%] rounded-tr-lg"
            style={{
              background: "linear-gradient(135deg, #f2ead8 0%, #e8dcc4 50%, #dfd1b8 100%)",
              boxShadow: "inset 0 0 0 0.5px rgba(180,160,130,0.2)",
              clipPath: "polygon(0 0, 100% 0, 55% 100%, 0 100%)",
            }}
          />

          {/* ─── Right flap ─── */}
          <div
            className="absolute top-[8%] bottom-[35%] right-0 w-[55%] rounded-tl-lg"
            style={{
              background: "linear-gradient(225deg, #f0e6d2 0%, #e6dac0 50%, #dacbac 100%)",
              boxShadow: "inset 0 0 0 0.5px rgba(180,160,130,0.2)",
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 45% 100%)",
            }}
          />

          {/* ─── Top flap (sealed by wax) ─── */}
          <div
            className="absolute top-0 left-0 right-0 rounded-t-[14px]"
            style={{
              height: "58%",
              background: "linear-gradient(180deg, #fefcf7 0%, #f5efe0 30%, #ede2cc 55%, #e4d7bc 100%)",
              clipPath: "polygon(0 0, 50% 70%, 100% 0)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 2px rgba(0,0,0,0.04)",
            }}
          />

          {/* ─── Center fold crease ─── */}
          <div className="absolute top-[38%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c4a970]/40 to-transparent" />
          <div className="absolute top-[38.5%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </motion.div>

        {/* ─── Wax Seal ─── */}
        <motion.div
          whileHover={{ scale: 1.06 }}
          animate={{ boxShadow: [
            "0 0 12px rgba(180,60,50,0.25)",
            "0 0 20px rgba(180,60,50,0.35)",
            "0 0 12px rgba(180,60,50,0.25)",
          ]}}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rounded-full"
        >
          <WaxSeal />
        </motion.div>

        {/* ─── "Open" hint ─── */}
        <motion.p
          animate={{ opacity: [0.35, 0.75, 0.35] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute bottom-[10%] w-full text-center text-[12px] text-[#a09080] font-serif tracking-[0.25em]"
        >
          {t.unlock.envelopeSealHint}
        </motion.p>
      </motion.button>

      <p className="mt-6 text-[13px] text-neutral-400 tracking-[0.15em] font-serif text-center">
        {t.unlock.envelopeSubtitle}
      </p>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// Animated flap — seal breaks, flap lifts, letter slides up
// ═══════════════════════════════════════════

function AnimatedEnvelope({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"idle" | "sealBreak" | "flapLift" | "crossfade">("idle");

  // Trigger sequence on mount
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("sealBreak"), 200);
    const t2 = setTimeout(() => setPhase("flapLift"), 600);
    const t3 = setTimeout(() => setPhase("crossfade"), 1300);
    const t4 = setTimeout(() => onDone(), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onDone]);

  const sealedVisible = phase === "idle" || phase === "sealBreak";

  return (
    <motion.div
      animate={{ opacity: phase === "crossfade" ? 0 : 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex items-center justify-center py-6 px-4"
    >
      <div className="relative w-full max-w-[360px] aspect-[4/3]">
        {/* Envelope body */}
        <div
          className="absolute inset-0 rounded-[14px]"
          style={{
            background: "linear-gradient(155deg, #f8f3e8 0%, #ede2cd 50%, #f0e6d2 100%)",
            boxShadow: "0 4px 30px rgba(100,80,50,0.10), 0 1px 4px rgba(0,0,0,0.06)",
          }}
        />

        {/* Wax seal — shatter on break */}
        <AnimatePresence>
          {sealedVisible && (
            <motion.div
              key="wax"
              initial={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.4, opacity: 0, filter: "blur(5px)" }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <WaxSeal />
              {phase === "sealBreak" && [0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <motion.div
                  key={angle}
                  initial={{ x: 0, y: 0, opacity: 0.9 }}
                  animate={{ x: Math.cos(angle * Math.PI / 180) * 35, y: Math.sin(angle * Math.PI / 180) * 35, opacity: 0 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-red-800/70"
                  style={{ marginLeft: -3, marginTop: -3 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top flap — lifts open */}
        <motion.div
          animate={{ rotateX: phase === "idle" || phase === "sealBreak" ? 0 : -125 }}
          transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ transformOrigin: "top center", perspective: 800 }}
          className="absolute top-0 left-0 right-0 rounded-t-[14px] z-10"
        >
          <div
            className="w-full"
            style={{
              height: "58%",
              background: "linear-gradient(180deg, #fefcf7 0%, #f5efe0 40%, #ede2cc 100%)",
              clipPath: "polygon(0 0, 50% 70%, 100% 0)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
            }}
          />
        </motion.div>

        {/* Letter sliding up inside envelope */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: phase === "flapLift" || phase === "crossfade" ? -50 : 30, opacity: phase === "flapLift" || phase === "crossfade" ? 1 : 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: phase === "flapLift" ? 0 : 0 }}
          className="absolute top-[20%] left-[8%] right-[8%] z-0"
        >
          <div
            className="w-full aspect-[3/4] rounded-[2px]"
            style={{
              background: "linear-gradient(180deg, #fefcf8 0%, #faf6ee 100%)",
              boxShadow: "0 4px 20px rgba(100,80,50,0.12)",
            }}
          >
            <div className="absolute top-[33%] left-0 right-0 h-px bg-[#e8dcc8]/60" />
            <div className="absolute top-[66%] left-0 right-0 h-px bg-[#e8dcc8]/60" />
            <div className="absolute top-3 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#c4a970]/50 to-transparent" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// Letter paper
// ═══════════════════════════════════════════

function Letter({
  addressee, relation, vaults, guidePlatforms,
  guide, guideLoading, guideSections, collapsedGuides, onToggleGuide, guideExpanded, onGenerateGuide,
  t,
}: {
  addressee?: string | null;
  relation?: string | null;
  vaults: VaultItem[];
  guidePlatforms: string[];
  guide: string;
  guideLoading: boolean;
  guideSections: { platform: string; guide: string }[];
  collapsedGuides: Set<number>;
  onToggleGuide: (i: number) => void;
  guideExpanded: boolean;
  onGenerateGuide: () => void;
  t: I18nStrings;
}) {
  const name = addressee || "";
  const hasName = !!addressee;
  const relationText = relation ? ` · ${relation}` : "";
  const hasInventory = vaults.some(v => (v.vaultType || v.type || "") === "asset_inventory");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="max-w-[620px] mx-auto"
    >
      <div
        className="relative rounded-[10px] overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #fefcf8 0%, #fdfaf3 5%, #faf6ec 50%, #f8f2e4 100%)",
          boxShadow: `
            0 6px 40px rgba(100,80,50,0.08),
            0 1px 3px rgba(0,0,0,0.04),
            inset 0 0 0 0.5px rgba(180,160,130,0.15)
          `,
        }}
      >
        {/* Paper fiber texture */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(1deg, transparent, transparent 2px, #5a4a30 3px),
              repeating-linear-gradient(91deg, transparent, transparent 5px, #5a4a30 6px)
            `,
          }}
        />

        {/* Decorative top line */}
        <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#c4a970]/50 to-transparent" />

        <div className="relative px-6 sm:px-8 pt-8 pb-6 space-y-6">

          {/* ═══ Greeting ═══ */}
          <div className="space-y-3">
            {hasName ? (
              <>
                <p className="text-[15px] sm:text-base font-serif text-[#5a4a30] leading-relaxed tracking-[0.04em]">
                  {t.unlock.letterGreetingHasName.replace("{name}", name).replace("{relation}", relationText)}
                </p>
                <p className="text-[14px] sm:text-[15px] font-serif text-[#7a6a50] leading-[1.85] tracking-[0.03em]">
                  {t.unlock.letterBodyHasName}
                </p>
                <p className="text-[13px] sm:text-[14px] font-serif text-[#7a6a50]/80 leading-[1.85] tracking-[0.03em]">
                  {t.unlock.letterBody2}
                </p>
              </>
            ) : (
              <>
                <p className="text-[14px] sm:text-[15px] font-serif text-[#7a6a50] leading-[1.85] tracking-[0.03em]">
                  {t.unlock.letterGreetingNoName}
                </p>
                <p className="text-[13px] sm:text-[14px] font-serif text-[#7a6a50]/80 leading-[1.85] tracking-[0.03em]">
                  {t.unlock.letterBody2}
                </p>
              </>
            )}
            <p className="text-[15px] font-semibold font-serif text-[#a09080] tracking-[0.2em]">
              {t.unlock.letterClosing}
            </p>
          </div>

          <Divider />

          {/* ═══ Vault cards ═══ */}
          {vaults.length > 0 && (
            <div>
              <div className="mb-4">
                <span className="text-[11px] uppercase tracking-[0.25em] text-[#a09080]/70 font-sans">{t.unlock.letterContentsLabel}</span>
              </div>
              <DecryptedVaultView vaults={vaults} />
            </div>
          )}

          {/* ═══ Guide section ═══ */}
          {hasInventory && guidePlatforms.length > 0 && (
            <div className="space-y-4">
              <Divider />

              <p className="text-[14px] sm:text-[15px] font-serif text-[#7a6a50] leading-[1.85] tracking-[0.03em]">
                {t.unlock.letterGuideTransition}
              </p>

              {!guideExpanded ? (
                <button
                  onClick={onGenerateGuide}
                  disabled={guideLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg border border-dashed border-[#c4a970]/60 bg-[#faf6ee]/60 text-[13px] text-[#8b7355] hover:bg-[#f5efe0] hover:border-[#b89560] transition-all disabled:opacity-40 font-serif tracking-[0.04em]"
                >
                  {guideLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> {t.unlock.letterGuideLoading}</>
                  ) : (
                    t.unlock.letterGuideBtn
                  )}
                </button>
              ) : guideLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-3 text-[#c4a970]" />
                  <p className="text-[13px] text-[#a09080] font-serif">{t.unlock.letterGuideLoading}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {guideSections.map((s, i) => {
                    const collapsed = collapsedGuides.has(i);
                    return (
                      <div key={i} className="rounded-lg border border-[#e8dcc8]/60 bg-white/80 overflow-hidden">
                        <button
                          onClick={() => onToggleGuide(i)}
                          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#faf6ee]/50 transition-colors"
                        >
                          <span className="text-[13px] font-medium text-[#5a4a30]">{s.platform}</span>
                          {collapsed ? <ChevronDown className="w-4 h-4 text-[#c4a970]" /> : <ChevronUp className="w-4 h-4 text-[#c4a970]" />}
                        </button>
                        {!collapsed && (
                          <div className="px-4 pb-3">
                            <pre className="text-[12px] text-[#7a6a50] leading-relaxed whitespace-pre-wrap font-sans">{s.guide}</pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Closing */}
              <div className="pt-4 pb-2 space-y-3">
                <Divider />
                <p className="text-[13px] font-serif text-[#7a6a50]/70 leading-relaxed tracking-[0.05em]">
                  {t.unlock.letterFinalLine}
                </p>
                <p className="text-[15px] font-semibold font-serif text-[#a09080] tracking-[0.2em]">
                  {t.unlock.letterFinalBrand}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom edge shadow */}
        <div className="h-1.5 bg-gradient-to-b from-[#d4c5a0]/15 to-transparent" />
      </div>
    </motion.div>
  );
}

function Divider() {
  return <div className="w-10 h-[1px] bg-[#d4c5a0]/60" />;
}

// ═══════════════════════════════════════════
// Main export
// ═══════════════════════════════════════════

export function EnvelopeReveal({
  addressee,
  relation,
  vaults,
  guidePlatforms,
}: EnvelopeRevealProps) {
  const { t } = useI18n();
  const [phase, setPhase] = useState<"sealed" | "animating" | "letter">("sealed");

  const [guide, setGuide] = useState("");
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideExpanded, setGuideExpanded] = useState(false);
  const [collapsedGuides, setCollapsedGuides] = useState<Set<number>>(new Set());

  const guideSections = useMemo(() => {
    if (!guide) return [];
    const sections: { platform: string; guide: string }[] = [];
    const parts = guide.split(/(?=【[^】]+】)/g);
    for (const part of parts) {
      const match = part.match(/【(.+?)】/);
      if (match) sections.push({ platform: match[1], guide: part.trim() });
    }
    return sections.length > 0 ? sections : [{ platform: "Guide", guide }];
  }, [guide]);

  const onToggleGuide = useCallback((i: number) => {
    setCollapsedGuides(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }, []);

  async function onGenerateGuide() {
    setGuideExpanded(true);
    setGuideLoading(true);
    try {
      const res = await fetch("/api/ai/compliance-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platforms: guidePlatforms }),
      });
      const data = await res.json();
      if (data.guide) setGuide(data.guide);
    } catch { /* keep loading state */ }
    setGuideLoading(false);
  }

  // ──── Keep container width stable throughout ────
  return (
    <motion.div
      layout
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto w-full max-w-[620px]"
    >
      <AnimatePresence mode="wait">
        {phase === "sealed" && (
          <SealEnvelope key="envelope" onOpen={() => setPhase("animating")} t={t} />
        )}
        {phase === "animating" && (
          <AnimatedEnvelope key="animating" onDone={() => setPhase("letter")} />
        )}
        {phase === "letter" && (
          <Letter
            key="letter"
            addressee={addressee}
            relation={relation}
            vaults={vaults}
            guidePlatforms={guidePlatforms}
            guide={guide}
            guideLoading={guideLoading}
            guideSections={guideSections}
            collapsedGuides={collapsedGuides}
            onToggleGuide={onToggleGuide}
            guideExpanded={guideExpanded}
            onGenerateGuide={onGenerateGuide}
            t={t}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
