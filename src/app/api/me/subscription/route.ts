/**
 * GET /api/me/subscription
 * 当前用户订阅状态
 */
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { getActiveSubscription } from "@/lib/subscription";

function isOverseas(req: NextRequest): boolean {
  if (process.env.NEXT_PUBLIC_SITE_MODE === "overseas") return true;
  if (process.env.NEXT_PUBLIC_SITE_MODE === "domestic") return false;
  const host = req.headers.get("host") || "";
  if (host.includes("in-case.cn")) return false;
  if (host.includes("in-case.me")) return true;
  return false;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getOrCreateUser();
    const sub = await getActiveSubscription(userId);

    return NextResponse.json({
      subscribed: sub !== null,
      subscription: sub
        ? {
            plan: sub.plan,
            status: sub.status,
            currentPeriodEnd: sub.currentPeriodEnd,
            createdAt: sub.createdAt,
          }
        : null,
      plans: {
        annual: { price: 23, currency: "usd" },
        lifetime: { price: 198, currency: "usd" },
      },
      isOverseas: isOverseas(req),
    });
  } catch (error) {
    console.error("Subscription API error:", error);
    return NextResponse.json(
      { error: "Failed to get subscription status" },
      { status: 500 }
    );
  }
}
