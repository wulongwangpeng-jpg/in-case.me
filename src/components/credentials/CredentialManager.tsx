"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, QrCode, Eye, EyeOff, Shield, Clock, RefreshCw, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { QRShare } from "./QRShare";
import { PreviewModal } from "./PreviewModal";
import { useI18n } from "@/i18n";

interface Credential {
  id: string;
  accessToken: string;
  messengerLabel?: string | null;
  messengerPhone?: string | null;
  messengerPhone2?: string | null;
  messengerEmail?: string | null;
  messengerRelation?: string | null;
  unlockUrl: string;
  status: string;
  accessCount: number;
  lastAccessedAt?: string | null;
  createdAt: string;
}

export function CredentialManager() {
  const { t } = useI18n();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [messengerLabel, setMessengerLabel] = useState("");
  const [messengerPhone, setMessengerPhone] = useState("");
  const [messengerPhone2, setMessengerPhone2] = useState("");
  const [messengerEmail, setMessengerEmail] = useState("");
  const [messengerRelation, setMessengerRelation] = useState("");
  const [showToken, setShowToken] = useState<Record<string, boolean>>({});
  const [qrCredential, setQrCredential] = useState<Credential | null>(null);
  const [previewCredential, setPreviewCredential] = useState<Credential | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // ──── 密文选择 ────
  const [vaults, setVaults] = useState<Array<{ id: string; vaultType: string; aliasName: string | null }>>([]);
  const [selectedVaultIds, setSelectedVaultIds] = useState<Set<string>>(new Set());
  const [showVaultSelect, setShowVaultSelect] = useState(false);

  // ──── 加载凭证列表 ────
  const loadCredentials = useCallback(async () => {
    try {
      const res = await fetch("/api/credentials");
      const data = await res.json();
      setCredentials(data.items || []);
    } catch {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCredentials();
    loadVaults();
  }, [loadCredentials]);

  async function loadVaults() {
    try {
      const res = await fetch("/api/vaults");
      const data = await res.json();
      setVaults(data.items || []);
    } catch {}
  }

  // ──── 打开确认弹窗 ────
  function openConfirm() {
    if (!messengerLabel.trim()) {
      toast.error(t.credential.namePlaceholder);
      return;
    }
    setShowConfirm(true);
  }

  // ──── 创建凭证 ────
  async function handleCreate() {
    setShowConfirm(false);
    setCreating(true);
    try {
      const res = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messengerLabel: messengerLabel.trim(),
          messengerPhone: messengerPhone.trim() || null,
          messengerPhone2: messengerPhone2.trim() || null,
          messengerEmail: messengerEmail.trim() || null,
          messengerRelation: messengerRelation.trim() || null,
          vaultIds: Array.from(selectedVaultIds),
        }),
      });

      if (!res.ok) throw new Error();

      const cred = await res.json();
      setCredentials((prev) => [cred, ...prev]);
      setMessengerLabel("");
      setMessengerPhone("");
      setMessengerPhone2("");
      setMessengerEmail("");
      setMessengerRelation("");
      toast.success(t.credential.created);

      // 自动弹出二维码
      setQrCredential({
        ...cred,
        accessCount: 0,
        status: "active",
        createdAt: cred.createdAt,
      });
    } catch {
      toast.error(t.common.error);
    } finally {
      setCreating(false);
    }
  }

  // ──── 吊销凭证 ────
  async function handleRevoke(id: string) {
    setRevoking(id);
    try {
      const res = await fetch(`/api/credentials/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();

      setCredentials((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "revoked" } : c))
      );
      toast.success(t.credential.revoked);
    } catch {
      toast.error(t.common.error);
    } finally {
      setRevoking(null);
    }
  }

  // ──── 恢复凭证 ────
  async function handleRestore(id: string) {
    setRevoking(id);
    try {
      const res = await fetch(`/api/credentials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      });
      if (!res.ok) throw new Error();

      setCredentials((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "active" } : c))
      );
      toast.success(t.credential.updated);
    } catch {
      toast.error(t.common.error);
    } finally {
      setRevoking(null);
    }
  }

  // ──── 彻底删除凭证 ────
  async function handleDeletePermanent(id: string) {
    if (!confirm(t.credential.deleteConfirm)) return;
    setRevoking(id);
    try {
      const res = await fetch(`/api/credentials/${id}?permanent=true`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();

      setCredentials((prev) => prev.filter((c) => c.id !== id));
      toast.success(t.credential.revoked);
    } catch {
      toast.error(t.common.error);
    } finally {
      setRevoking(null);
    }
  }

  const activeCredentials = credentials.filter((c) => c.status === "active");

  return (
    <div className="space-y-4">
      {/* 创建新凭证 */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-warm-500" />
            {t.settings.messengerTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {t.credential.vaultScopeDesc}
            <br />
            <span className="text-red-600 font-medium text-xs">
              {t.crypto.passwordHint}
            </span>
          </p>
          {/* 信使称呼 + 关系 */}
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <Input
              placeholder={t.credential.namePlaceholder}
              value={messengerLabel}
              onChange={(e) => setMessengerLabel(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder={t.credential.relationPlaceholder}
              value={messengerRelation}
              onChange={(e) => setMessengerRelation(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* 手机号 + 备用手机号 + 邮箱 */}
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <Input
              placeholder={t.credential.phonePlaceholder}
              type="tel"
              value={messengerPhone}
              onChange={(e) => setMessengerPhone(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder={t.credential.phoneLabel}
              type="tel"
              value={messengerPhone2}
              onChange={(e) => setMessengerPhone2(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder={t.credential.emailPlaceholder}
              type="email"
              value={messengerEmail}
              onChange={(e) => setMessengerEmail(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* 密文选择 */}
          {vaults.length > 0 && (
            <div className="mb-3">
              <button
                type="button"
                onClick={() => setShowVaultSelect(!showVaultSelect)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  showVaultSelect
                    ? "bg-warm-50 border border-warm-200 text-warm-800"
                    : "border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-warm-300"
                }`}
              >
                <span>{t.credential.vaultScopeLabel}（{selectedVaultIds.size} {t.common.optional}）</span>
                <span className="text-[11px]">{showVaultSelect ? t.common.close : t.common.more}</span>
              </button>
              {showVaultSelect && (
                <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedVaultIds.size === vaults.length) {
                        setSelectedVaultIds(new Set());
                      } else {
                        setSelectedVaultIds(new Set(vaults.map((v) => v.id)));
                      }
                    }}
                    className="text-[11px] text-muted-foreground hover:text-foreground px-1"
                  >
                    {selectedVaultIds.size === vaults.length ? t.credential.deselectAll : t.credential.selectAll}
                  </button>
                  {vaults.map((v) => (
                    <label
                      key={v.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/60 cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={selectedVaultIds.has(v.id)}
                        onChange={() => {
                          const next = new Set(selectedVaultIds);
                          next.has(v.id) ? next.delete(v.id) : next.add(v.id);
                          setSelectedVaultIds(next);
                        }}
                        className="rounded"
                      />
                      <span className="text-muted-foreground text-[11px] shrink-0">
                        {v.vaultType === "asset_inventory" ? "📋" : "💌"}
                      </span>
                      <span className="truncate">{v.aliasName || t.common.noData}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <Button
            onClick={openConfirm}
            disabled={creating || !messengerLabel.trim()}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-1" />
            {creating ? t.common.loading : t.credential.createButton}
          </Button>
        </CardContent>
      </Card>

      {/* 已有凭证列表 */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">
            {t.settings.messengerCount.replace("{n}", String(activeCredentials.length))}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t.common.loading}
            </p>
          ) : credentials.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t.settings.noMessengers}
            </p>
          ) : (
            <div className="space-y-3">
              {credentials.map((cred) => (
                <div
                  key={cred.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border ${
                    cred.status === "revoked"
                      ? "bg-muted/30 border-muted opacity-60"
                      : "bg-muted/40 border-border/40"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-bold">
                        {cred.messengerLabel || t.credential.namePlaceholder}
                      </span>
                      <Badge
                        variant={
                          cred.status === "active" ? "default" : "secondary"
                        }
                        className="text-[11px]"
                      >
                        {cred.status === "active" ? t.settings.credentialStatus.active : t.settings.credentialStatus.revoked}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {cred.messengerRelation && <span>{cred.messengerRelation} · </span>}
                      {cred.messengerPhone && <span>{cred.messengerPhone}</span>}
                      {cred.messengerPhone2 && <span> / {cred.messengerPhone2}</span>}
                      {cred.messengerEmail && <span> · {cred.messengerEmail}</span>}
                      {!cred.messengerPhone && !cred.messengerEmail && t.credential.namePlaceholder}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {t.settings.exportTitle} {cred.accessCount} {t.common.optional}
                      </span>
                      {cred.lastAccessedAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {t.renewal.lastCheckin}：{new Date(cred.lastAccessedAt).toLocaleDateString("zh-CN")}
                        </span>
                      )}
                    </div>
                  </div>

                  {cred.status === "active" && (
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewCredential(cred)}
                        title="Preview what this contact can see"
                      >
                        <FileSearch className="w-4 h-4 text-emerald-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setShowToken((prev) => ({
                            ...prev,
                            [cred.id]: !prev[cred.id],
                          }))
                        }
                        title={t.credential.createTitle}
                      >
                        {showToken[cred.id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQrCredential(cred)}
                        title={t.credential.createButton}
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevoke(cred.id)}
                        disabled={revoking === cred.id}
                        title={t.credential.deleteButton}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  )}

                  {cred.status === "revoked" && (
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(cred.id)}
                        disabled={revoking === cred.id}
                        title={t.credential.updateButton}
                      >
                        <RefreshCw className="w-4 h-4 text-emerald-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePermanent(cred.id)}
                        disabled={revoking === cred.id}
                        title={t.common.delete}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  )}

                  {/* 展开显示链接 */}
                  {showToken[cred.id] && (
                    <div className="sm:col-span-full w-full mt-1 p-2 bg-background rounded-lg">
                      <p className="text-[11px] text-muted-foreground mb-1">
                        {t.credential.vaultScopeLabel}：
                      </p>
                      <p className="text-xs font-mono break-all select-all">
                        {cred.unlockUrl}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 确认弹窗 — 信函风格 */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="max-w-md w-full p-8 sm:p-10 relative"
            style={{
              background: "linear-gradient(135deg, #fdfaf3 0%, #f8f0e0 50%, #faf3e6 100%)",
              border: "2px solid #d4c5a0",
              borderRadius: 4,
              boxShadow: "0 8px 40px rgba(0,0,0,0.25), inset 0 0 80px rgba(180,160,120,0.08)",
              fontFamily: "'Noto Serif SC', 'Source Han Serif SC', 'STSong', 'Songti SC', Georgia, serif",
            }}
          >
            {/* 顶部装饰线 */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, #c4a970, #d4b980, #c4a970, transparent)" }} />
                <span className="text-xs tracking-[0.3em] uppercase" style={{ color: "#8b7355" }}>{t.common.appName}</span>
                <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, #c4a970, #d4b980, #c4a970, transparent)" }} />
              </div>
              <h3 className="text-xl font-bold tracking-widest" style={{ color: "#4a3728" }}>
                {t.credential.createTitle}
              </h3>
            </div>

            {/* 致 */}
            <div className="mb-6 space-y-3 text-base" style={{ color: "#4a3728" }}>
              <p className="text-center tracking-wider">
                {t.credential.createTitle} <strong className="text-xl" style={{ color: "#2c1810" }}>{messengerLabel.trim()}</strong>
              </p>
              {messengerRelation.trim() && (
                <p className="text-center text-sm" style={{ color: "#8b7355" }}>
                  （{messengerRelation.trim()}）
                </p>
              )}
              <div className="w-10 mx-auto h-px" style={{ background: "#d4c5a0" }} />
              <div className="text-center text-sm space-y-1" style={{ color: "#8b7355" }}>
                {messengerPhone.trim() && (
                  <p>{t.credential.phoneLabel}：{messengerPhone.trim()}</p>
                )}
                {messengerPhone2.trim() && (
                  <p>{t.credential.phoneLabel}：{messengerPhone2.trim()}</p>
                )}
                {messengerEmail.trim() && (
                  <p>{t.credential.emailLabel}：{messengerEmail.trim()}</p>
                )}
              </div>
            </div>

            {/* 权限范围 */}
            <div className="border-t border-dashed mb-6 pt-5" style={{ borderColor: "#c4b896" }}>
              <p className="text-sm tracking-wider mb-3 text-center" style={{ color: "#8b7355" }}>
                {t.credential.vaultScopeLabel}
              </p>
              {selectedVaultIds.size > 0 && vaults.length > 0 ? (
                <div className="space-y-2.5">
                  {vaults.filter((v) => selectedVaultIds.has(v.id)).map((v) => (
                    <div key={v.id} className="flex items-center gap-2.5 text-sm" style={{ color: "#5c4a3a" }}>
                      <span className="shrink-0">◆</span>
                      <span>{v.aliasName || t.common.noData}</span>
                      <span className="text-xs ml-auto" style={{ color: "#a09080" }}>
                        {v.vaultType === "asset_inventory" ? t.inventory.title : t.letters.title}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-center" style={{ color: "#8b7355" }}>
                  {t.credential.vaultScopeDesc}
                </p>
              )}
            </div>

            {/* 重要提示 */}
            <div className="border-t border-dashed pt-5 mb-7" style={{ borderColor: "#c4b896" }}>
              <p className="text-sm tracking-wider mb-2.5 text-center" style={{ color: "#8b7355" }}>
                {t.crypto.passwordHint}
              </p>
              <p className="text-sm leading-relaxed text-center" style={{ color: "#8b4513" }}>
                {t.letters.encryptNotice}
              </p>
            </div>

            {/* 按钮 */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 text-sm tracking-wider border transition-colors"
                style={{
                  background: "transparent",
                  borderColor: "#c4b896",
                  color: "#8b7355",
                  borderRadius: 2,
                }}
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 py-3 text-sm tracking-wider text-white transition-colors"
                style={{
                  background: "linear-gradient(135deg, #5c3d2e, #4a2c1a)",
                  border: "none",
                  borderRadius: 2,
                  opacity: creating ? 0.6 : 1,
                }}
              >
                {creating ? t.common.loading : t.credential.createButton}
              </button>
            </div>

            {/* 底部装饰 */}
            <div className="text-center mt-6">
              <div className="h-px w-full" style={{ background: "linear-gradient(to right, transparent, #c4a970, transparent)" }} />
              <p className="text-[11px] mt-2 tracking-widest" style={{ color: "#c4b896" }}>
                {t.common.appName} · {t.common.appTagline}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* QR Code 弹窗 */}
      {qrCredential && (
        <QRShare
          unlockUrl={qrCredential.unlockUrl}
          messengerLabel={qrCredential.messengerLabel}
          onClose={() => setQrCredential(null)}
        />
      )}

      {/* 预览弹窗 — 信使视角预览 */}
      {previewCredential && (
        <PreviewModal
          credentialId={previewCredential.id}
          credentialLabel={previewCredential.messengerLabel}
          onClose={() => setPreviewCredential(null)}
        />
      )}
    </div>
  );
}
