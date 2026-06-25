"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Lock, Clock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useI18n } from "@/i18n";
import type { UnlockResult } from "@/lib/vault-service";
import { EnvelopeReveal } from "@/components/credentials/EnvelopeReveal";

function UnlockContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [result, setResult] = useState<UnlockResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [decryptPassword, setDecryptPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [decryptedVaults, setDecryptedVaults] = useState<
    Array<{ id: string; alias: string; type: string; content: string }>
  >([]);
  const [decrypting, setDecrypting] = useState(false);

  // ──── 申请解锁 ────
  async function handleUnlock() {
    if (!token) { toast.error(t.api.credentialInvalid); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: token }),
      });
      const data = await res.json();
      setResult(data as UnlockResult & { messengerLabel?: string; messengerRelation?: string });
    } catch { toast.error(t.api.serverError); }
    finally { setLoading(false); }
  }

  // ──── 批量解密 ────
  async function decryptAll() {
    if (!result?.vaults || !decryptPassword) return;
    setDecrypting(true);
    const items: typeof decryptedVaults = [];
    let failures = 0;
    for (const vault of result.vaults) {
      try {
        const { decryptContent } = await import("@/lib/crypto");
        const plain = await decryptContent(
          { ciphertext: vault.encryptedContent, salt: vault.encryptionSalt, iv: vault.encryptionIv, version: vault.encryptionVersion },
          decryptPassword
        );
        items.push({ id: vault.id, alias: vault.aliasName || "", type: vault.vaultType, content: plain });
      } catch { failures++; }
    }
    setDecryptedVaults(items);
    setDecrypting(false);

    if (items.length === 0 && failures > 0) {
      toast.error(t.unlock.wrongPassword);
      return;
    }
    if (failures > 0) {
      toast.warning(`${failures} vault(s) couldn't be decrypted.`);
    }
  }

  // Get guide platforms from decrypted vaults
  const guidePlatforms = decryptedVaults
    .filter((v) => v.type === "asset_inventory")
    .map((v) => v.alias)
    .filter(Boolean);

  // Extract messenger info
  const addressee = (result as any)?.messengerLabel || "";
  const relation = (result as any)?.messengerRelation || "";

  // ──── Render ────
  if (!token) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">{t.unlock.title}</h1>
        <p className="text-muted-foreground mb-4">{t.unlock.noCredential}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {!result ? (
        <>
          <div className="text-center mb-8">
            <Lock className="w-10 h-10 text-warm-500 mx-auto mb-3" />
            <h1 className="text-2xl font-bold">{t.unlock.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t.unlock.desc}</p>
          </div>
          <Card className="border-border/60 text-center">
            <CardContent className="py-8">
              <p className="text-muted-foreground mb-4">{t.unlock.desc}</p>
              <Button onClick={handleUnlock} disabled={loading} size="lg">
                <Shield className="w-4 h-4 mr-2" />
                {loading ? t.common.loading : t.unlock.unlock}
              </Button>
            </CardContent>
          </Card>
        </>
      ) : !result.allowed ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-amber-200 bg-amber-50/50 text-center">
            <CardContent className="py-8">
              <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">{result.message}</p>
              {result.remainingDays != null && (
                <p className="text-sm text-muted-foreground">
                  {t.settings.thresholdDesc}{" "}
                  <span className="font-bold text-amber-600">{result.remainingDays} {t.settings.thresholdUnit}</span>
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : decryptedVaults.length > 0 ? (
        /* Envelope ceremony with decrypted content */
        <EnvelopeReveal
          addressee={addressee}
          relation={relation}
          vaults={decryptedVaults.map((v) => ({
            id: v.id,
            vaultType: v.type,
            aliasName: v.alias,
            content: v.content,
          }))}
          guidePlatforms={guidePlatforms}
        />
      ) : (
        /* Password prompt */
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="py-6 text-center">
              <p className="text-lg font-medium mb-1">{result.message}</p>
              <p className="text-sm text-muted-foreground">
                {t.unlock.unlocked}: {result.totalVaults} {t.inventory.title}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="py-4">
              <p className="text-sm font-medium mb-2">{t.unlock.passwordPlaceholder}:</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t.unlock.passwordPlaceholder}
                    value={decryptPassword}
                    onChange={(e) => setDecryptPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && decryptAll()}
                    className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 pr-8 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button onClick={decryptAll} disabled={!decryptPassword || decrypting}>
                  {decrypting ? t.common.loading : t.unlock.unlock}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export default function UnlockPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <UnlockContent />
    </Suspense>
  );
}
