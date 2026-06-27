"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Check, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";
import { Card, CardContent } from "@/components/ui/card";

interface SubStatus {
  subscribed: boolean;
  plan: string | null;
  status: string | null;
  currentPeriodEnd: string | null;
  isOverseas: boolean;
}

const PLANS_INFO = {
  annual: {
    name: "Annual",
    nameZh: "年度",
    price: "$23",
    period: "/year",
    periodZh: "/年",
    features: [
      "Unlimited encrypted vaults",
      "Unlimited trusted contacts",
      "Dead-letter monitoring & SMS alerts",
      "Priority support",
    ],
    featuresZh: [
      "无限加密备忘条数",
      "无限信使联系人",
      "死信监控 + 短信/邮件通知",
      "优先客服支持",
    ],
  },
  lifetime: {
    name: "Lifetime",
    nameZh: "终身",
    price: "$198",
    period: "one-time",
    periodZh: "一次付费",
    features: [
      "Everything in Annual, forever",
      "No recurring billing",
      "Early adopter badge",
    ],
    featuresZh: [
      "年度版全部功能，永久有效",
      "无需续费",
      "早期用户徽章",
    ],
  },
};

export function SubscriptionPanel() {
  const { t, lang } = useI18n();
  const [status, setStatus] = useState<SubStatus | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me/subscription")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  // 支付成功回跳
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("subscribed") === "true") {
      toast.success(
        lang === "zh"
          ? "支付完成！你的守护已激活。"
          : "Payment complete! Your guardian is now active."
      );
      window.history.replaceState({}, "", window.location.pathname);
      fetch("/api/me/subscription")
        .then((r) => r.json())
        .then(setStatus);
    }
  }, [lang]);

  async function handleSubscribe(planId: "annual" | "lifetime") {
    setLoading(planId);
    try {
      const endpoint =
        planId === "lifetime"
          ? "/api/paypal/create-order"
          : "/api/paypal/create-subscription";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();

      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        toast.error(data.error || t.common.error);
      }
    } catch {
      toast.error(t.common.error);
    } finally {
      setLoading(null);
    }
  }

  const isZh = lang !== "en";

  // ──── 加载中 ────
  if (!status) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-5 text-center text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
          {t.common.loading}
        </CardContent>
      </Card>
    );
  }

  // ──── 已订阅 ────
  if (status.subscribed) {
    const planInfo = PLANS_INFO[status.plan as keyof typeof PLANS_INFO];
    const planName = isZh ? planInfo?.nameZh || status.plan : status.plan;
    return (
      <Card className="border-emerald-200 bg-emerald-50/40">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Crown className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-800">
                {isZh ? "已激活" : "Active"}
              </h3>
              <p className="text-xs text-emerald-600/80">
                {isZh
                  ? `${planName} · ${status.currentPeriodEnd ? `有效期至 ${new Date(status.currentPeriodEnd).toLocaleDateString("zh-CN")}` : "永不过期"}`
                  : `${planInfo?.name || planName} · ${status.currentPeriodEnd ? `Renews ${new Date(status.currentPeriodEnd).toLocaleDateString("en-US")}` : "Lifetime access"}`}
              </p>
            </div>
            <Check className="w-5 h-5 text-emerald-500 ml-auto shrink-0" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // ──── 国内站：免费 ────
  if (!status.isOverseas) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-800">
                {isZh ? "国内用户 · 免费使用" : "Free in your region"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isZh
                  ? "万一呢国内站免费开放全部功能，无需订阅。"
                  : "Full access is free in your region."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ──── 海外站：未订阅，显示定价 ────
  return (
    <Card className="border-border/60">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Crown className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-800">
              {isZh ? "激活守护" : "Activate Your Guardian"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isZh
                ? "订阅后启用死信监控和信使通知。"
                : "Subscribe to enable dead-letter monitoring and messenger alerts."}
            </p>
          </div>
        </div>

        {/* 两个套餐卡片 */}
        <div className="grid grid-cols-2 gap-3">
          {(["annual", "lifetime"] as const).map((planId) => {
            const plan = PLANS_INFO[planId];
            return (
              <motion.button
                key={planId}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSubscribe(planId)}
                disabled={loading !== null}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-left transition-all ${
                  planId === "lifetime"
                    ? "border-amber-300 bg-amber-50/50 hover:bg-amber-100/50"
                    : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
                }`}
              >
                <span className="text-xs font-bold text-neutral-700">
                  {isZh ? plan.nameZh : plan.name}
                </span>
                <span className="text-2xl font-bold text-neutral-900">
                  {plan.price}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {isZh ? plan.periodZh : plan.period}
                </span>
                <ul className="text-[11px] text-muted-foreground space-y-0.5 text-left w-full mt-1">
                  {(isZh ? plan.featuresZh : plan.features).map((f, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 ${
                    planId === "lifetime" ? "text-amber-700" : "text-neutral-600"
                  }`}
                >
                  {loading === planId ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {isZh ? "跳转中…" : "Redirecting…"}
                    </>
                  ) : (
                    <>
                      {isZh ? "购买" : "Get it"}
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </span>
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
