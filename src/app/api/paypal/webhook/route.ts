/**
 * POST /api/paypal/webhook
 * 接收 PayPal 事件，处理订阅状态变更
 *
 * PayPal 订阅事件：
 * - BILLING.SUBSCRIPTION.ACTIVATED    → 首次扣款成功，激活
 * - BILLING.SUBSCRIPTION.PAYMENT.FAILED → 扣款失败
 * - BILLING.SUBSCRIPTION.CANCELLED    → 取消
 * - BILLING.SUBSCRIPTION.EXPIRED      → 过期
 * - PAYMENT.SALE.COMPLETED            → 一次性付款完成（兜底）
 */
import { NextRequest, NextResponse } from "next/server";
import { db, subscriptions } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { verifyWebhookSignature } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // 签名验证（PAYPAL_WEBHOOK_ID 不配置时跳过，方便本地测试）
  const verified = await verifyWebhookSignature(
    {
      "paypal-auth-algo": req.headers.get("paypal-auth-algo") || "",
      "paypal-cert-url": req.headers.get("paypal-cert-url") || "",
      "paypal-transmission-id": req.headers.get("paypal-transmission-id") || "",
      "paypal-transmission-sig": req.headers.get("paypal-transmission-sig") || "",
      "paypal-transmission-time": req.headers.get("paypal-transmission-time") || "",
    },
    rawBody
  );

  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (webhookId) {
    if (!verified) {
      console.warn("[PayPal] Webhook signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else {
    console.log("[PayPal] Webhook ID not configured, skipping signature verification");
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.event_type;
  console.log(`[PayPal] Webhook received: ${eventType}`);

  try {
    switch (eventType) {
      // —— 订阅激活（首次/续费扣款成功） ——
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        const sub = event.resource;
        const subscriptionId = sub.id;
        const parts = (sub.custom_id || "").split("|");
        const userId = parts[0];
        const planId = parts[1];
        const subscriberId = sub.subscriber?.payer_id || "";

        // 校验 userId 是合法 UUID，否则这是异常事件，返回 500 让 PayPal 重试
        const uuidRe =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!userId || !uuidRe.test(userId)) {
          console.error(
            `[PayPal] ACTIVATED with invalid custom_id: "${sub.custom_id}", sub=${subscriptionId}`
          );
          return NextResponse.json(
            { error: "Invalid custom_id", subscriptionId },
            { status: 500 }
          );
        }

        // 幂等：已存在则跳过
        const [existing] = await db
          .select({ id: subscriptions.id })
          .from(subscriptions)
          .where(eq(subscriptions.paypalSubscriptionId, subscriptionId))
          .limit(1);

        if (!existing) {
          const nextBilling = sub.billing_info?.next_billing_time
            ? new Date(sub.billing_info.next_billing_time)
            : null;

          await db.insert(subscriptions).values({
            userId,
            paypalSubscriberId: subscriberId,
            paypalSubscriptionId: subscriptionId,
            plan: (planId as "annual") || "annual",
            status: "active",
            currentPeriodEnd: nextBilling,
          });

          console.log(`✅ Subscription activated: ${subscriptionId}`);
        } else {
          console.log(`⏭  Duplicate activation ignored: ${subscriptionId}`);
        }
        break;
      }

      // —— 扣款失败（首次失败先标 past_due，等 PayPal 3 次重试） ——
      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED": {
        const sub = event.resource;
        const subscriptionId = sub.id;

        await db
          .update(subscriptions)
          .set({ status: "past_due", updatedAt: new Date() })
          .where(eq(subscriptions.paypalSubscriptionId, subscriptionId));

        console.log(`⚠️ Payment failed, marked past_due: ${subscriptionId}`);
        break;
      }

      // —— 用户/系统取消 ——
      case "BILLING.SUBSCRIPTION.CANCELLED": {
        const sub = event.resource;
        const subscriptionId = sub.id;

        await db
          .update(subscriptions)
          .set({ status: "canceled", updatedAt: new Date() })
          .where(eq(subscriptions.paypalSubscriptionId, subscriptionId));

        console.log(`❌ Subscription canceled: ${subscriptionId}`);
        break;
      }

      // —— 订阅过期（不覆盖已取消的订阅） ——
      case "BILLING.SUBSCRIPTION.EXPIRED": {
        const sub = event.resource;
        const subscriptionId = sub.id;

        // 仅 active/past_due 标 expired；canceled 是终端状态不做覆盖
        await db
          .update(subscriptions)
          .set({ status: "expired", updatedAt: new Date() })
          .where(
            and(
              eq(subscriptions.paypalSubscriptionId, subscriptionId),
              eq(subscriptions.status, "active")
            )
          );

        console.log(`⏰ Subscription expired: ${subscriptionId}`);
        break;
      }

      // —— 一次性付款完成（终身计划兜底，正常走 capture-order） ——
      case "PAYMENT.SALE.COMPLETED": {
        console.log(`💰 Payment completed (sale): ${event.resource.id}`);
        break;
      }

      default:
        console.log(`[PayPal] Unhandled event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[PayPal] Webhook error:", err);
    // 始终返回 200，防 PayPal 重试
    return NextResponse.json({ received: true, error: err.message });
  }
}

export const dynamic = "force-dynamic";
