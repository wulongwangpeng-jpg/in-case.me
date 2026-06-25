"use client";

import { useState, useEffect } from "react";
import { Shield, Lock, CheckCircle2, Loader2, Wand2, Eye, EyeOff, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useI18n } from "@/i18n";
import { saveToVault } from "@/lib/vault-service";

interface SaveToVaultProps {
  vaultType: "asset_inventory" | "farewell_letter" | "wishlist";
  aliasName: string;
  memoryHint?: string;
  categoryTag?: string;
  content: unknown;
  triggerLabel?: string;
  onSaved?: () => void;
}

const PASSWORD_CACHE_KEY = "wanyi_vault_password";

function generatePassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const symbols = "!@#$%^&*_-";
  let pwd = "";
  for (let i = 0; i < 14; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  // 插入两个符号
  const pos1 = Math.floor(Math.random() * 7);
  const pos2 = Math.floor(Math.random() * 7) + 7;
  pwd = pwd.slice(0, pos1) + symbols[Math.floor(Math.random() * symbols.length)] + pwd.slice(pos1);
  pwd = pwd.slice(0, pos2 + 1) + symbols[Math.floor(Math.random() * symbols.length)] + pwd.slice(pos2 + 1);
  return pwd;
}

export function SaveToVault({
  vaultType,
  aliasName,
  memoryHint,
  categoryTag,
  content,
  triggerLabel,
  onSaved,
}: SaveToVaultProps) {
  const { t } = useI18n();
  const label = triggerLabel ?? t.crypto.saveBtn;
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [cachedPassword, setCachedPassword] = useState<string | null>(null);

  // 读取缓存的密码
  useEffect(() => {
    if (open) {
      try {
        const cached = sessionStorage.getItem(PASSWORD_CACHE_KEY);
        if (cached) {
          setCachedPassword(cached);
          setPassword(cached);
          setConfirmPassword(cached);
        }
      } catch {}
    }
  }, [open]);

  async function handleSave() {
    if (password.length < 4) {
      toast.error(t.crypto.passwordTooShort);
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t.crypto.passwordsDontMatch);
      return;
    }

    setSaving(true);
    const result = await saveToVault({
      vaultType,
      aliasName,
      memoryHint,
      categoryTag,
      content,
      password,
    });

    setSaving(false);

    if (result.success) {
      // 缓存密码（同会话后续保存自动填充）
      try {
        sessionStorage.setItem(PASSWORD_CACHE_KEY, password);
        setCachedPassword(password);
      } catch {}
      setSaved(true);
      toast.success(t.inventory.saveSuccess);
      onSaved?.();
      setTimeout(() => {
        setOpen(false);
        setSaved(false);
      }, 1500);
    } else {
      toast.error(result.error || t.common.error);
    }
  }

  function handleGenerate() {
    const pwd = generatePassword();
    setPassword(pwd);
    setConfirmPassword(pwd);
    toast.success(t.crypto.generatePassword, { duration: 5000 });
  }

  if (saved) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-1">
        <CheckCircle2 className="w-4 h-4 text-green-500" />
        {t.crypto.saved}
      </Button>
    );
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1">
        <Shield className="w-4 h-4" />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-warm-500" />
              {t.crypto.encryptTitle}
            </DialogTitle>
          </DialogHeader>

          {/* 加密信任条 */}
          <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-xs text-emerald-800/80 leading-relaxed -mt-1">
            <Server className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>{t.crypto.encryptDesc}</span>
          </div>

          <div className="space-y-3 py-2">
            {/* 密码生成按钮 */}
            <button
              type="button"
              onClick={handleGenerate}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-border hover:border-warm-400 hover:bg-warm-50/50 text-xs text-muted-foreground hover:text-warm-700 transition-all"
            >
              <Wand2 className="w-3.5 h-3.5" />
              {t.crypto.generateBtn}
            </button>

            {/* 分隔线 */}
            <div className="flex items-center gap-2">
              <div className="flex-1 border-t border-border/40" />
              <span className="text-[11px] text-muted-foreground">{t.crypto.orManual}</span>
              <div className="flex-1 border-t border-border/40" />
            </div>

            {/* 密码输入 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">
                  {t.crypto.setPwdLabel}
                  {cachedPassword && password === cachedPassword && (
                    <span className="text-[11px] text-emerald-600 font-normal ml-2">{t.crypto.pwdReuse}</span>
                  )}
                </p>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder={t.crypto.pwdPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={saving}
                  className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 pr-8 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">{t.crypto.confirmPassword}</p>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder={t.crypto.confirmPlaceholder}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={saving}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 pr-8 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="bg-amber-50 text-amber-800 rounded-xl p-3 text-xs">
              {t.crypto.pwdWarning}
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              {saving ? t.crypto.saving : t.crypto.saveBtn}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
