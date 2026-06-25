"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, X, FileText, Shield, Key } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";
import { EnvelopeReveal } from "./EnvelopeReveal";

interface VaultItem {
  id: string;
  vaultType: string;
  aliasName: string | null;
  memoryHint: string | null;
  encryptedContent: string;
  encryptionSalt: string;
  encryptionIv: string;
  encryptionVersion: number;
}

interface Props {
  credentialId: string;
  credentialLabel?: string | null;
  onClose: () => void;
}

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } } as const;

export function PreviewModal({ credentialId, credentialLabel, onClose }: Props) {
  const { t } = useI18n();
  const [step, setStep] = useState<"lock" | "envelope">("lock");
  const [vaults, setVaults] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [decrypted, setDecrypted] = useState<Record<string, string>>({});
  const [decrypting, setDecrypting] = useState(false);
  const [error, setError] = useState("");
  const [credentialRelation, setCredentialRelation] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/credentials/${credentialId}/preview`)
      .then((r) => r.json())
      .then((data) => {
        setVaults(data.vaults || []);
        setCredentialRelation(data.credentialRelation || null);
        setError("");
      })
      .catch(() => setError(t.common.error))
      .finally(() => setLoading(false));
  }, [credentialId]);

  async function unlockAll() {
    if (!password) return;
    setDecrypting(true);
    const result: Record<string, string> = {};
    let successCount = 0;
    for (const v of vaults) {
      try {
        const { decryptContent } = await import("@/lib/crypto");
        result[v.id] = await decryptContent(
          { ciphertext: v.encryptedContent, salt: v.encryptionSalt, iv: v.encryptionIv, version: v.encryptionVersion },
          password
        );
        successCount++;
      } catch {
        result[v.id] = "";
      }
    }
    setDecrypted(result);
    setDecrypting(false);

    if (successCount === 0) {
      toast.error("Wrong password. Please try again.");
      return;
    }
    if (successCount < vaults.length) {
      toast.warning(`${vaults.length - successCount} vault(s) couldn't be decrypted.`);
    }
    setStep("envelope");
  }

  const viewItems = useMemo(() => vaults
    .filter((v) => decrypted[v.id]) // only show successfully decrypted vaults
    .map((v) => ({
      id: v.id,
      vaultType: v.vaultType,
      aliasName: v.aliasName,
      memoryHint: v.memoryHint,
      content: decrypted[v.id],
    })), [vaults, decrypted]);

  const guidePlatforms = viewItems
    .filter((v) => v.vaultType === "asset_inventory")
    .map((v) => v.aliasName)
    .filter(Boolean) as string[];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-[20px] shadow-2xl ring-1 ring-black/5 w-full max-w-[680px] max-h-[88vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-2 shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-[10px] bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-amber-700" />
                </div>
                <h3 className="text-[15px] font-bold text-neutral-800 tracking-tight">
                  {credentialLabel || "Trusted Contact"}
                </h3>
              </div>
              {step === "lock" && (
                <p className="text-[13px] text-neutral-500 ml-9">
                  Preview what your trusted contact would receive
                </p>
              )}
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-neutral-400" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 overflow-y-auto flex-1">
            {loading ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 mx-auto rounded-full border-2 border-neutral-200 border-t-amber-400 animate-spin" />
              </div>
            ) : error ? (
              <p className="text-sm text-red-500 text-center py-16">{error}</p>
            ) : vaults.length === 0 ? (
              <div className="py-16 text-center">
                <FileText className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
                <p className="text-sm text-neutral-400">No vaults assigned to this contact.</p>
              </div>
            ) : step === "lock" ? (
              <motion.div key="lock" className="flex flex-col items-center py-10 gap-6" {...fadeIn}>
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center shadow-lg shadow-neutral-200"
                >
                  <Lock className="w-7 h-7 text-white" />
                </motion.div>
                <div className="text-center max-w-xs">
                  <p className="text-[15px] font-semibold text-neutral-800 mb-1">Unlock Preview</p>
                  <p className="text-[13px] text-neutral-500 leading-relaxed">
                    Enter your password to preview {vaults.length} vault{vaults.length > 1 ? "s" : ""} this contact can access
                  </p>
                </div>
                <div className="w-full max-w-[280px]">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Decryption password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && unlockAll()}
                      className="w-full h-11 rounded-xl border border-neutral-200 bg-neutral-50 px-4 pr-10 text-sm outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-50 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={unlockAll}
                    disabled={!password || decrypting}
                    className="mt-3 w-full h-11 rounded-xl bg-neutral-800 text-white text-sm font-semibold hover:bg-neutral-700 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
                  >
                    {decrypting ? (
                      <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Decrypting…</>
                    ) : (
                      <><Key className="w-4 h-4" /> Decrypt All</>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <EnvelopeReveal
                addressee={credentialLabel}
                relation={credentialRelation}
                vaults={viewItems}
                guidePlatforms={guidePlatforms}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
