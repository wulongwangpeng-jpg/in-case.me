"use client";

import { useState, useRef } from "react";
import { Download, Upload, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useI18n } from "@/i18n";

export function BackupPanel() {
  const { t } = useI18n();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ──── 导出 ────
  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/me/export");
      if (!res.ok) throw new Error(t.settings.exportFail);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wanyi-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(t.settings.exportDone);
    } catch {
      toast.error(t.settings.exportFail);
    } finally {
      setExporting(false);
    }
  }

  // ──── 导入 ────
  async function handleImport(file: File) {
    setImporting(true);
    setImportResult(null);
    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      const res = await fetch("/api/me/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backup),
      });

      const data = await res.json();

      if (res.ok) {
        setImportResult({ success: true, message: data.message });
        toast.success(t.settings.importDone);
      } else {
        setImportResult({ success: false, message: data.error });
        toast.error(data.error || t.settings.importGenericFail);
      }
    } catch {
      setImportResult({
        success: false,
        message: t.settings.importFail,
      });
      toast.error(t.settings.importFormatError);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="w-5 h-5 text-warm-500" />
          {t.settings.backupTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 导出 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-muted/40 rounded-xl">
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">{t.settings.backupDownload}</p>
            <p className="text-xs text-muted-foreground">
              {t.settings.backupDesc}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting}
            className="shrink-0"
          >
            <Download className="w-4 h-4 mr-1" />
            {exporting ? t.settings.exporting : t.settings.exportBtn}
          </Button>
        </div>

        {/* 导入 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-muted/40 rounded-xl">
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">{t.settings.backupRestore}</p>
            <p className="text-xs text-muted-foreground">
              {t.settings.backupRestoreDesc}
            </p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImport(file);
              }}
              className="hidden"
              id="backup-import"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="shrink-0"
            >
              <Upload className="w-4 h-4 mr-1" />
              {importing ? t.settings.importing : t.settings.importBtn}
            </Button>
          </div>
        </div>

        {/* 导入结果 */}
        {importResult && (
          <div
            className={`p-3 rounded-xl text-sm flex items-start gap-2 ${
              importResult.success
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {importResult.success ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            )}
            <span>{importResult.message}</span>
          </div>
        )}

        {/* 安全提示 */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 text-amber-800 rounded-xl text-xs">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            <strong>{t.crypto.passwordHint}</strong>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
