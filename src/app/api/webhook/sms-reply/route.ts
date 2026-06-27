/**
 * POST /api/webhook/sms-reply
 *
 * 接收信使回复的短信，处理核验逻辑：
 *   1 → 用户安好，自动续期 180 天
 *   2 → 确认失联，下发提取链接
 *   其他 → 提示请回复 1 或 2
 */

import { NextRequest, NextResponse } from "next/server";
import { db, users, credentials, accessLogs } from "@/lib/db";
import { eq, and, or, desc } from "drizzle-orm";
import {
  getMessengerReply1SMS,
  getMessengerReply2SMS,
  getMessengerAutoDeliverSMS,
  getUserRenewedByMessengerSMS,
  sendNotification,
} from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    // 共享密钥认证（防伪造短信回复）
    const secret = req.nextUrl.searchParams.get("secret");
    const expected = process.env.CRON_SECRET;
    if (!expected || secret !== expected) {
      console.warn("[SMS Reply] Unauthorized request — missing or invalid secret");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 阿里云/Twilio 短信上行推送格式
    const body = await req.json();
    const rawPhone = (body.phone_number || body.from || "").trim();
    const content = (body.content || body.text || "").trim();

    if (!rawPhone || !content) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    }

    // 标准化手机号：去 +86 前缀和空格，统一为 11 位
    const fromPhone = rawPhone.replace(/^\+86/, "").replace(/\s+/g, "");

    // 解析回复
    const isReply1 = content === "1";
    const isReply2 = content === "2";
    const replyValue = isReply1 ? "1" : isReply2 ? "2" : null;

    // ──── 查找该手机号关联的信使凭证 ────
    // 兼容用户输入时可能带 +86 前缀或纯 11 位两种格式
    const phoneWith86 = `+86${fromPhone}`;

    const activeCreds = await db
      .select({
        id: credentials.id,
        userId: credentials.userId,
        humanCode: credentials.humanCode,
        accessToken: credentials.accessToken,
        messengerPhone: credentials.messengerPhone,
        messengerPhone2: credentials.messengerPhone2,
        messengerEmail: credentials.messengerEmail,
      })
      .from(credentials)
      .where(
        and(
          eq(credentials.status, "active"),
          or(
            eq(credentials.messengerPhone, fromPhone),
            eq(credentials.messengerPhone, phoneWith86)
          )
        )
      );

    // 也查备用号码
    const backupCreds = await db
      .select({
        id: credentials.id,
        userId: credentials.userId,
        humanCode: credentials.humanCode,
        accessToken: credentials.accessToken,
        messengerPhone: credentials.messengerPhone,
        messengerPhone2: credentials.messengerPhone2,
        messengerEmail: credentials.messengerEmail,
      })
      .from(credentials)
      .where(
        and(
          eq(credentials.status, "active"),
          or(
            eq(credentials.messengerPhone2, fromPhone),
            eq(credentials.messengerPhone2, phoneWith86)
          )
        )
      );

    const allCreds = [...activeCreds, ...backupCreds];

    if (allCreds.length === 0) {
      console.log(`[SMS Reply] 未匹配信使: ${fromPhone}`);
      return NextResponse.json({ success: true, note: "未匹配到活跃信使" });
    }

    // ──── 处理每个匹配的凭证 ────
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://in-case.me";

    for (const cred of allCreds) {
      // 检查是否在死信通知流程中
      const recentLogs = await db
        .select()
        .from(accessLogs)
        .where(
          and(
            eq(accessLogs.credentialId, cred.id),
            eq(accessLogs.userId, cred.userId)
          )
        )
        .orderBy(desc(accessLogs.createdAt))
        .limit(5);

      const inDeadLetterFlow = recentLogs.some((l) =>
        l.eventType?.startsWith("messenger_notify_") ||
        l.eventType === "messenger_reply_safe" ||
        l.eventType === "messenger_reply_lost"
      );

      if (!inDeadLetterFlow) {
        console.log(`[SMS Reply] ${cred.humanCode} 不在死信流程中，忽略`);
        continue;
      }

      // 检查是否已经回复过
      if (recentLogs.some((l) =>
        l.eventType === "messenger_reply_safe" || l.eventType === "messenger_reply_lost"
      )) {
        console.log(`[SMS Reply] ${cred.humanCode} 已回复过，忽略`);
        continue;
      }

      const unlockUrl = `${baseUrl}/unlock?token=${cred.accessToken}`;

      if (!replyValue) {
        // 无效回复，提示正确格式
        await sendNotification(
          "sms",
          fromPhone,
          "【万一呢】请回复 1（他安好，续期）或 2（联系不上，交付）。感谢配合。",
          cred.userId,
          `信使回复无效: "${content}"`
        );
        continue;
      }

      if (replyValue === "1") {
        // ──── 用户安好 ────
        const now = new Date();
        await db
          .update(users)
          .set({
            lastActiveTime: now,
            updatedAt: now,
          })
          .where(eq(users.id, cred.userId));

        // 记录
        await db.insert(accessLogs).values({
          userId: cred.userId,
          credentialId: cred.id,
          eventType: "messenger_reply_safe" as any,
          result: "allowed",
          reason: `信使回复1（安好），自动续期`,
        });

        // 回复信使
        await sendNotification("sms", fromPhone, getMessengerReply1SMS(), cred.userId, "回复信使：已续期");

        // 如果用户绑了手机号，通知用户
        const [user] = await db
          .select({ phone: users.phone, email: users.email })
          .from(users)
          .where(eq(users.id, cred.userId))
          .limit(1);

        if (user?.phone) {
          await sendNotification("sms", user.phone, getUserRenewedByMessengerSMS(), cred.userId, "通知用户：信使已续期");
        }
      } else if (replyValue === "2") {
        // ──── 确认失联 ────
        await db.insert(accessLogs).values({
          userId: cred.userId,
          credentialId: cred.id,
          eventType: "messenger_reply_lost" as any,
          result: "allowed",
          reason: `信使回复2（失联），下发提取链接`,
        });

        // 发送提取链接
        await sendNotification("sms", fromPhone, getMessengerReply2SMS(unlockUrl), cred.userId, "回复信使：下发提取链接");
      }
    }

    return NextResponse.json({
      success: true,
      matchedCredentials: allCreds.length,
      replyValue,
    });
  } catch (error) {
    console.error("SMS reply error:", error);
    return NextResponse.json({ error: "处理失败" }, { status: 500 });
  }
}
