/**
 * POST /api/paypal/capture-order
 * 确认收款（终身计划），写入订阅记录
 */
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { captureOrder } from "@/lib/paypal";
import { db, subscriptions } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const userId = await getOrCreateUser();
    const { orderId } = (await req.json()) as { orderId: string };

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // 幂等：防止用户重复点击
    const [existing] = await db
      .select({ id: subscriptions.id })
      .from(subscriptions)
      .where(eq(subscriptions.paypalSubscriptionId, orderId))
      .limit(1);

    if (existing) {
      return NextResponse.json({ success: true, alreadyCaptured: true });
    }

    const capture = await captureOrder(orderId);

    // 所有权校验：订单 custom_id 中的 userId 必须与当前用户一致
    const purchaseUnit = capture.purchase_units?.[0];
    const customId = purchaseUnit?.custom_id || "";
    const [orderUserId] = customId.split("|");
    if (orderUserId && orderUserId !== userId) {
      return NextResponse.json(
        { error: "Order does not belong to current user" },
        { status: 403 }
      );
    }

    const captureDetails = purchaseUnit?.payments?.captures?.[0];

    if (captureDetails?.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Payment not completed", status: captureDetails?.status },
        { status: 402 }
      );
    }

    // 解析 custom_id 中的 userId|planId
    const [, planId] = customId.split("|");

    const paypalSubscriberId = capture.payer?.payer_id || null;

    await db.insert(subscriptions).values({
      userId,
      paypalSubscriberId,
      paypalSubscriptionId: orderId,
      plan: (planId as "lifetime") || "lifetime",
      status: "active",
      currentPeriodEnd: null, // 终身无过期
    });

    console.log(`✅ PayPal lifetime captured: userId=${userId} order=${orderId}`);

    return NextResponse.json({
      success: true,
      captureId: captureDetails.id,
      amount: captureDetails.amount?.value,
    });
  } catch (error: any) {
    console.error("PayPal capture-order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to capture order" },
      { status: 500 }
    );
  }
}
