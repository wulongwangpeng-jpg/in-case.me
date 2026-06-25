"use client";

import { useState, useEffect, useCallback } from "react";
import { Lock, Eye, EyeOff, Loader2, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { decryptContent } from "@/lib/crypto";
import { useI18n } from "@/i18n";

interface VaultEntry {
  id: string;
  vaultType: string;
  aliasName?: string | null;
  memoryHint?: string | null;
  categoryTag?: string | null;
  encryptedContent: string;
  encryptionSalt: string;
  encryptionIv: string;
  encryptionVersion: number;
  createdAt: string;
  updatedAt: string;
}

interface VaultListProps {
  vaultType: "asset_inventory" | "farewell_letter" | "wishlist";
  emptyMessage?: string;
}

export function VaultList({ vaultType, emptyMessage }: VaultListProps) {
  const { t } = useI18n();
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [decrypting, setDecrypting] = useState<Record<string, boolean>>({});
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [decryptedContent, setDecryptedContent] = useState<Record<string, string>>({});
  const [showContent, setShowContent] = useState<Record<string, boolean>>({});

  const loadEntries = useCallback(async () => {
    try {
      const res = await fetch(`/api/vaults?type=${vaultType}`);
      const data = await res.json();
      setEntries(data.items || []);
    } catch {
      // 静默处理
    } finally {
      setLoading(false);
    }
  }, [vaultType]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  async function handleDecrypt(entry: VaultEntry) {
    const pwd = passwords[entry.id];
    if (!pwd || pwd.length < 4) {
      toast.error(t.vault.decryptPrompt);
      return;
    }

    setDecrypting((prev) => ({ ...prev, [entry.id]: true }));
    try {
      const plain = await decryptContent(
        {
          ciphertext: entry.encryptedContent,
          salt: entry.encryptionSalt,
          iv: entry.encryptionIv,
          version: entry.encryptionVersion,
        },
        pwd
      );
      setDecryptedContent((prev) => ({ ...prev, [entry.id]: plain }));
      setShowContent((prev) => ({ ...prev, [entry.id]: true }));
    } catch {
      toast.error(t.vault.decryptError);
    } finally {
      setDecrypting((prev) => ({ ...prev, [entry.id]: false }));
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/vaults/${id}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success(t.vault.deleteSuccess);
    } catch {
      toast.error(t.vault.deleteError);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-6">
        <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  if (entries.length === 0) {
    return emptyMessage ? (
      <p className="text-sm text-muted-foreground text-center py-6">{emptyMessage}</p>
    ) : null;
  }

  return (
    <div className="space-y-2 mt-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-medium">
          {t.vault.entryCount.replace("{n}", String(entries.length))}
        </p>
        <p className="text-[11px] text-emerald-600/70 flex items-center gap-1">
          <Lock className="w-3 h-3" />
          {t.crypto.storedEncrypted}
        </p>
      </div>
      {entries.map((entry) => (
        <Card key={entry.id} className="border-border/60">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-3.5 h-3.5 text-warm-500 shrink-0" />
              <span className="text-sm font-medium flex-1 truncate">
                {entry.aliasName || t.vault.unnamed}
              </span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0">
                <Clock className="w-3 h-3" />
                {new Date(entry.createdAt).toLocaleDateString("zh-CN")}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                onClick={() => handleDelete(entry.id)}
              >
                <Trash2 className="w-3 h-3 text-muted-foreground" />
              </Button>
            </div>

            {entry.memoryHint && (
              <p className="text-xs text-muted-foreground mb-2">
                💡 {entry.memoryHint}
              </p>
            )}

            {/* 解密区域 */}
            {!showContent[entry.id] ? (
              <div className="flex gap-2 mt-2">
                <Input
                  type="password"
                  placeholder={t.vault.decryptPlaceholder}
                  className="h-8 text-xs"
                  value={passwords[entry.id] || ""}
                  onChange={(e) =>
                    setPasswords((p) => ({ ...p, [entry.id]: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleDecrypt(entry)}
                />
                <Button
                  size="sm"
                  className="h-8 text-xs shrink-0"
                  onClick={() => handleDecrypt(entry)}
                  disabled={decrypting[entry.id]}
                >
                  {decrypting[entry.id] ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </Button>
              </div>
            ) : (
              <div className="mt-2">
                <pre className="text-xs whitespace-pre-wrap leading-relaxed bg-muted/40 rounded-lg p-2 max-h-32 overflow-y-auto">
                  {decryptedContent[entry.id]}
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-6 text-xs"
                  onClick={() =>
                    setShowContent((p) => ({ ...p, [entry.id]: false }))
                  }
                >
                  <EyeOff className="w-3 h-3 mr-1" /> {t.vault.hide}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
