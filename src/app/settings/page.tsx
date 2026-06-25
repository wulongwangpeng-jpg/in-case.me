"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { BackupPanel } from "@/components/backup/BackupPanel";
import { CredentialManager } from "@/components/credentials/CredentialManager";
import { SubscriptionPanel } from "@/components/settings/SubscriptionPanel";
import { useI18n } from "@/i18n";

export default function SettingsPage() {
  const { t } = useI18n();
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg h-7 gap-1 px-2.5 text-[0.8rem] hover:bg-muted hover:text-foreground transition-all mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> {t.common.back}
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <Shield className="w-7 h-7 text-warm-500" />
          {t.settings.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t.settings.desc}
        </p>
      </div>

      {/* 页面引导 */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-sm text-slate-700 leading-relaxed">
        <strong>{t.settings.valueTipTitle}:</strong> {t.settings.valueTipBody}
      </div>

      <div className="space-y-6">
        {/* 订阅 */}
        <SubscriptionPanel />

        {/* 凭证管理 */}
        <CredentialManager />

        {/* 灾备 */}
        <BackupPanel />
      </div>
    </div>
  );
}
