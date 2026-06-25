"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { useI18n } from "@/i18n";

export default function PrivacyPage() {
  const { t } = useI18n();
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 prose prose-sm prose-neutral">
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg h-7 gap-1 px-2.5 text-[0.8rem] hover:bg-muted hover:text-foreground transition-all mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> {t.common.back}
      </Link>
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
        <Shield className="w-6 h-6 text-warm-500" />
        {t.legal.privacyTitle}
      </h1>
      <p className="text-sm text-muted-foreground mb-8">{t.legal.privacyLastUpdated}</p>

      <section className="space-y-6">
        {/* Intro */}
        <div>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.legal.privacyIntro}</p>
        </div>

        {/* 1. Information We Collect */}
        <div>
          <h2 className="text-base font-semibold mb-2">1. Information We Collect</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.legal.privacyInfoWeCollect}</p>
        </div>

        {/* 2. How We Use Your Information */}
        <div>
          <h2 className="text-base font-semibold mb-2">2. How We Use Your Information</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.legal.privacyHowWeUse}</p>
        </div>

        {/* 3. SMS / Text Messaging */}
        <div>
          <h2 className="text-base font-semibold mb-2">3. SMS / Text Messaging</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.legal.privacySMSData}</p>
        </div>

        {/* 4. Data Sharing & Disclosure */}
        <div>
          <h2 className="text-base font-semibold mb-2">4. Data Sharing & Disclosure</h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{t.legal.privacyDataSharing}</p>
        </div>

        {/* 5. Data Retention */}
        <div>
          <h2 className="text-base font-semibold mb-2">5. Data Retention</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.legal.privacyDataRetention}</p>
        </div>

        {/* 6. Your Rights */}
        <div>
          <h2 className="text-base font-semibold mb-2">6. Your Rights</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.legal.privacyYourRights}</p>
        </div>

        {/* 7. GDPR & CCPA */}
        <div>
          <h2 className="text-base font-semibold mb-2">7. GDPR & CCPA Compliance</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.legal.privacyGDPR}</p>
        </div>

        {/* 8. Children's Privacy */}
        <div>
          <h2 className="text-base font-semibold mb-2">8. Children's Privacy</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.legal.privacyChildren}</p>
        </div>

        {/* Contact */}
        <p className="text-sm text-muted-foreground pt-4 border-t">{t.legal.privacyContact}</p>
      </section>
    </div>
  );
}
