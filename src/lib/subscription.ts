/**
 * 订阅服务工具
 *
 * 套餐定义 + 状态查询 + 免费额度校验。收款由 @/lib/paypal 处理。
 */

import { db, subscriptions } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { NextRequest } from "next/server";

// —— 套餐 ——

export const PLANS = {
  annual: {
    id: "annual",
    name: "Annual",
    price: 23,
    currency: "usd",
    interval: "year" as const,
    description: "Full access, billed yearly",
  },
  lifetime: {
    id: "lifetime",
    name: "Lifetime",
    price: 198,
    currency: "usd",
    interval: "one_time" as const,
    description: "Pay once, forever",
  },
} as const;

export type PlanId = keyof typeof PLANS;

// —— 检查订阅状态 ——

export async function getActiveSubscription(userId: string) {
  try {
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, "active"),
        )
      )
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    if (!sub) return null;

    // 年费套餐检查是否过期
    if (sub.plan === "annual" && sub.currentPeriodEnd) {
      if (new Date(sub.currentPeriodEnd) < new Date()) {
        await db
          .update(subscriptions)
          .set({ status: "expired", updatedAt: new Date() })
          .where(eq(subscriptions.id, sub.id));
        return null;
      }
    }

    return sub;
  } catch {
    // 表不存在或查询失败 → 降级为未订阅
    return null;
  }
}

export async function isSubscribed(userId: string): Promise<boolean> {
  const sub = await getActiveSubscription(userId);
  return sub !== null;
}

/** 判断当前站点是否为海外站 */
export function isOverseas(req?: NextRequest): boolean {
  if (process.env.NEXT_PUBLIC_SITE_MODE === "overseas") return true;
  if (process.env.NEXT_PUBLIC_SITE_MODE === "domestic") return false;
  // 无环境变量时回退到 Host/URL 探测
  const host = req?.headers.get("host") || process.env.NEXT_PUBLIC_APP_URL || "";
  if (host.includes("in-case.cn")) return false;
  if (host.includes("in-case.me")) return true;
  return false;
}
