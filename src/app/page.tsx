/**
 * Homepage — Server Component for SEO
 *
 * Static content rendered server-side so search engines can crawl it.
 * Interactive islands (renewal, encryption demo, trust slideshow) are
 * lazy-loaded client components wrapped in Suspense.
 */
import { Suspense } from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowRight, ClipboardList, Mail, Shield, EyeOff, Download, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import zh from "@/i18n/zh";
import en from "@/i18n/en";

// ──── Client islands (code-split, loaded after static HTML) ────
import { RenewalCheckin } from "@/components/home/RenewalCheckin";
import { HomeClientIslands } from "@/components/home/HomeClientIslands";
import { ClientSections } from "@/components/home/ClientSections";

// ──── Types ────
type Lang = "zh" | "en";

// ──── Server: detect language ────
async function detectLang(): Promise<Lang> {
  try {
    const cookieStore = await cookies();
    const langCookie = cookieStore.get("lang")?.value;
    if (langCookie === "en" || langCookie === "zh") return langCookie;
  } catch {}
  return "en"; // 海外站默认英文
}

// ──── Page ────
export default async function HomePage() {
  const lang = await detectLang();
  const t = lang === "en" ? en : zh;

  const features = [
    {
      icon: ClipboardList,
      title: t.home.feature1Title,
      description: t.home.feature1Desc,
      href: "/inventory",
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      badge: t.home.feature1Badge,
      cta: t.home.feature1Cta,
    },
    {
      icon: Mail,
      title: t.home.feature2Title,
      description: t.home.feature2Desc,
      href: "/letters",
      color: "text-rose-500",
      bgColor: "bg-rose-50",
      badge: t.home.feature2Badge,
      cta: t.home.feature2Cta,
    },
    {
      icon: Settings,
      title: t.home.feature3Title,
      description: t.home.feature3Desc,
      href: "/settings",
      color: "text-slate-500",
      bgColor: "bg-slate-50",
      badge: t.home.feature3Badge,
      cta: t.home.feature3Cta,
    },
  ];

  return (
    <div className="flex flex-col py-1.5 sm:py-2 relative origin-top" style={{ transform: "scale(1.1)", transformOrigin: "top center" }}>
      {/* ── Hero (纯静态, SSR) ── */}
      <section className="shrink-0 text-center px-4 pt-2 sm:pt-3 pb-1" style={{ paddingTop: "2cm" }}>
        <Badge variant="secondary" className="mb-2 sm:mb-3 px-3 py-0.5 text-[11px] sm:text-xs">
          {t.home.heroBadge}
        </Badge>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-1 sm:mb-2">
          {t.home.heroTitle}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {t.home.heroDesc}
        </p>
      </section>

      {/* ── 信任浮层 (客户端交互, Suspense) ── */}
      <Suspense fallback={null}>
        <HomeClientIslands t={t} />
      </Suspense>

      {/* ── 守护续期卡片 (客户端) ── */}
      <section className="shrink-0 max-w-xl mx-auto w-full px-4 pt-2 sm:pt-3 pb-1">
        <Suspense
          fallback={
            <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5">
              <p className="text-sm text-muted-foreground text-center">Loading…</p>
            </div>
          }
        >
          <RenewalCheckin />
        </Suspense>
      </section>

      {/* ── 三步功能卡片 (静态HTML, SSR) ── */}
      <section className="shrink-0 px-4 py-1 mt-[60px]">
        <div className="w-full max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {features.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="block group h-full rounded-xl border border-border/60 bg-card hover:border-warm-300 hover:shadow-md transition-all duration-300 active:scale-[0.98]"
              >
                <div className="p-3 sm:p-4 pb-1 sm:pb-2">
                  <div className="flex items-center gap-3 sm:block">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${feature.bgColor} flex items-center justify-center shrink-0 sm:mb-2`}
                    >
                      <feature.icon
                        className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${feature.color}`}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <h3 className="text-sm sm:text-base font-semibold tracking-tight">
                          {feature.title}
                        </h3>
                        <Badge variant="secondary" className="text-[11px] sm:text-xs font-normal leading-tight">
                          {feature.badge}
                        </Badge>
                      </div>
                      <p className={`text-[11px] sm:text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-3 ${lang === "en" ? "min-h-[24px] sm:min-h-[36px]" : "min-h-[36px] sm:min-h-[48px]"}`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 sm:p-4 pt-0 mt-auto">
                  <span className="text-xs sm:text-sm text-primary font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    {feature.cta} <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 加密演示 + 信任轮播 (客户端) ── */}
      <Suspense fallback={null}>
        <ClientSections />
      </Suspense>

      {/* ── 底部信息 (静态, SSR) ── */}
      <footer className="shrink-0 border-t border-border/30 pb-4 mt-[20px]">
        <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 text-center space-y-2">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t.home.footerTagline.replace("{appName}", t.common.appName)}
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              {t.home.footerGitHub}
            </span>
          </p>
          <p className="text-xs text-muted-foreground/50 flex items-center justify-center gap-3">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <span>·</span>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              {t.legal.privacyTitle}
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              {t.legal.termsTitle}
            </Link>
            <span>·</span>
            <Link href="/refund" className="hover:text-foreground transition-colors">
              {t.legal.refundTitle}
            </Link>
            <span>·</span>
            <Link href="/faq" className="hover:text-foreground transition-colors">
              {t.legal.faqTitle}
            </Link>
          </p>
          <p className="text-xs text-muted-foreground/60">{t.home.footerAuthor}</p>
          <p className="text-[11px] text-muted-foreground/30">{t.home.footerDisclaimer}</p>
        </div>
      </footer>

      {/* ── 移动端底部导航 (静态) ── */}
      <nav className="lg:hidden shrink-0 border-t border-border/30 px-1.5 py-1.5" aria-label="Mobile navigation">
        <div className="flex gap-1 max-w-lg mx-auto">
          {features.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1 rounded-lg hover:bg-muted active:bg-muted transition-colors text-[11px] font-medium"
            >
              <f.icon className={`w-4 h-4 ${f.color}`} />
              {f.cta}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
