"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Lock, Database, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { useI18n } from "@/i18n";

export function Footer() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [showTrust, setShowTrust] = useState(false);

  const trustItems = [
    {
      icon: Lock,
      title: t.home.footerTrust1Title,
      description: t.home.footerTrust1Desc,
    },
    {
      icon: Shield,
      title: t.home.footerTrust2Title,
      description: t.home.footerTrust2Desc,
    },
    {
      icon: Database,
      title: t.home.footerTrust3Title,
      description: t.home.footerTrust3Desc,
    },
    {
      icon: Eye,
      title: t.home.footerTrust4Title,
      description: t.home.footerTrust4Desc,
    },
  ];

  // 首页由 page.tsx 底部信息栏覆盖，不重复渲染
  if (pathname === "/") return null;

  return (
    <footer className="border-t border-border/30 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground space-y-2">
        {/* 品牌 */}
        <p>
          {t.home.footerTaglineBefore}<span className="font-medium text-foreground">{t.common.appName}</span>{t.home.footerTaglineAfter}{t.common.appTagline}
        </p>

        {/* 开源 */}
        <p className="text-xs">
          <a
            href="https://github.com/wulongwangpeng-jpg/in-case.me"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            {t.home.footerGitHub}
          </a>
        </p>

        {/* 运营者 */}
        <p className="text-xs text-muted-foreground/60">
          {t.home.footerAuthor}
        </p>

        {/* 法律链接 */}
        <p className="text-xs text-muted-foreground/50 flex items-center justify-center gap-3 flex-wrap">
          <Link href="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
          <span>·</span>
          <Link href="/pricing" className="hover:text-foreground transition-colors">
            Pricing
          </Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            {t.legal.termsTitle}
          </Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            {t.legal.privacyTitle}
          </Link>
          <span>·</span>
          <Link href="/refund" className="hover:text-foreground transition-colors">
            {t.legal.refundTitle}
          </Link>
          <span>·</span>
          <Link href="/faq" className="hover:text-foreground transition-colors">
            {t.legal.faqTitle}
          </Link>
          <span>·</span>
          <Link href="/blog" className="hover:text-foreground transition-colors">
            Blog
          </Link>
        </p>

        {/* 法律免责 */}
        <p className="text-[11px] text-muted-foreground/30">
          {t.home.footerDisclaimer}
        </p>

        {/* 隐私与安全折叠区 */}
        <div className="max-w-2xl mx-auto pt-2">
          <button
            onClick={() => setShowTrust(!showTrust)}
            className="inline-flex items-center gap-2 text-sm font-medium text-warm-600 hover:text-warm-700 transition-colors mb-3"
          >
            <Shield className="w-4 h-4" />
            {showTrust ? t.home.footerCollapse : t.home.footerPrivacyLabel} · {t.home.footerPrivacyDesc}
            {showTrust ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showTrust && (
            <div className="grid sm:grid-cols-2 gap-4 text-left mb-6 animate-fade-in-up">
              {trustItems.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="border border-border/40 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 text-warm-500 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">
                        {title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
