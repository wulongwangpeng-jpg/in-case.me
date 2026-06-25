/**
 * POST /api/paypal/create-order
 * 创建 PayPal 订单（终身计划 / 一次性支付）
 * 返回 approvalUrl，前端重定向用户到 PayPal 付款
 */
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { createOrder } from "@/lib/paypal";
import { PLANS, type PlanId } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  try {
    const userId = await getOrCreateUser();
    const { planId } = (await req.json()) as { planId: PlanId };

    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan || plan.interval !== "one_time") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const order = await createOrder({
      amount: plan.price,
      description: plan.description,
      userId,
      planId,
      returnUrl: `${origin}/settings?subscribed=true`,
      cancelUrl: `${origin}/settings?canceled=true`,
    });

    const approvalUrl =
      order.links?.find((l: any) => l.rel === "approve")?.href ||
      order.links?.find((l: any) => l.rel === "payer-action")?.href ||
      null;

    return NextResponse.json({
      orderId: order.id,
      approvalUrl,
    });
  } catch (error: any) {
    console.error("PayPal create-order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
