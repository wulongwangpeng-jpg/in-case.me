"use client";

import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
import { useI18n } from "@/i18n";

export default function RefundPage() {
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
        <CreditCard className="w-6 h-6 text-warm-500" />
        {t.legal.refundTitle}
      </h1>
      <p className="text-sm text-muted-foreground mb-8">{t.legal.refundLastUpdated}</p>

      <section className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.legal.refundIntro}</p>
        </div>
        <div>
          <h2 className="text-base font-semibold mb-2">Annual Subscriptions</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.legal.refundAnnual}</p>
        </div>
        <div>
          <h2 className="text-base font-semibold mb-2">Lifetime Access</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.legal.refundLifetime}</p>
        </div>
        <div>
          <h2 className="text-base font-semibold mb-2">How to Request a Refund</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.legal.refundProcess}</p>
        </div>
        <div>
          <h2 className="text-base font-semibold mb-2">Statutory Rights</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.legal.refundExceptions}</p>
        </div>
        <p className="text-sm text-muted-foreground pt-4 border-t">{t.legal.refundContact}</p>
      </section>
    </div>
  );
}
