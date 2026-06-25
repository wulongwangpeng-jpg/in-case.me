/**
 * POST /api/paypal/create-subscription
 * 创建 PayPal 订阅（年费计划 / 循环扣款）
 */
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { createSubscription } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  try {
    const userId = await getOrCreateUser();

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const subscription = await createSubscription({
      userId,
      returnUrl: `${origin}/settings?subscribed=true`,
      cancelUrl: `${origin}/settings?canceled=true`,
    });

    // 返回审批链接，前端跳转
    const approvalUrl = subscription.links?.find(
      (l: any) => l.rel === "approve"
    )?.href;

    return NextResponse.json({
      subscriptionId: subscription.id,
      approvalUrl: approvalUrl || null,
    });
  } catch (error: any) {
    console.error("PayPal create-subscription error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create subscription" },
      { status: 500 }
    );
  }
}
