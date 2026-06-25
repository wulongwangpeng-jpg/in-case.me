"use client";

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { useI18n } from "@/i18n";

export default function TermsPage() {
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
        <FileText className="w-6 h-6 text-warm-500" />
        {t.legal.termsTitle}
      </h1>
      <p className="text-sm text-muted-foreground mb-8">{t.legal.termsLastUpdated}</p>

      <section className="space-y-6">
        {/* Intro */}
        <div>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.legal.termsIntro}</p>
        </div>

        {/* 1. Eligibility */}
        <div>
          <h2 className="text-base font-semibold mb-2">1. Eligibility</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.legal.termsEligibility}</p>
        </div>

        {/* 2. Account & Security */}
        <div>
          <h2 className="text-base font-semibold mb-2">2. Account & Security</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.legal.termsAccount}</p>
        </div>

        {/* 3. SMS / Text Messaging */}
        <div>
          <h2 className="text-base font-semibold mb-2">3. SMS / Text Messaging</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.legal.termsSMS}</p>
        </div>

        {/* 4. Subscriptions & Billing */}
        <div>
          <h2 className="text-base font-semibold mb-2">4. Subscriptions & Billing</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.legal.termsSubscription}</p>
        </div>

        {/* 5. Refund Policy */}
        <div>
          <h2 className="text-base font-semibold mb-2">5. Refund Policy</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.legal.termsRefund}</p>
        </div>

        {/* 6. Legal Disclaimer */}
        <div>
          <h2 className="text-base font-semibold mb-2">6. Legal Disclaimer</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.legal.termsDisclaimer}</p>
        </div>

        {/* 7. Limitation of Liability */}
        <div>
          <h2 className="text-base font-semibold mb-2">7. Limitation of Liability</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.legal.termsLiability}</p>
        </div>

        {/* 8. Termination */}
        <div>
          <h2 className="text-base font-semibold mb-2">8. Termination</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.legal.termsTermination}</p>
        </div>

        {/* 9. Changes to Terms */}
        <div>
          <h2 className="text-base font-semibold mb-2">9. Changes to Terms</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.legal.termsChanges}</p>
        </div>

        {/* 10. Contact */}
        <div>
          <h2 className="text-base font-semibold mb-2">10. Contact</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.legal.termsContact}</p>
        </div>
      </section>
    </div>
  );
}
