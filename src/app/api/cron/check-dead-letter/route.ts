/**
 * GET /api/cron/check-dead-letter?secret=xxx
 *
 * 死信通知 + 信使核验 全链路：
 *   1. 扫描超阈值用户
 *   2. 对每个信使凭证 → 检查通知阶段
 *   3. 0h 发首条 → 24h 提醒 → 48h 最后提醒
 *   4. 信使回复 1 → 自动续期 | 回复 2 → 下发提取链接
 *   5. 72h 无回复 → 自动交付
 *
 * 通过 access_logs 追踪通知阶段（无额外表）
 */

import { NextRequest, NextResponse } from "next/server";
import { db, users, credentials, accessLogs, vaults, subscriptions } from "@/lib/db";
import { eq, and, desc, lt, sql } from "drizzle-orm";
import {
  getDeadLetterSMS,
  getDeadLetterReminder24h,
  getDeadLetterReminder48h,
  getMessengerReply1SMS,
  getMessengerReply2SMS,
  getMessengerAutoDeliverSMS,
  getUserPreExpiryWarning,
  getUserPreExpiryWarningEmail,
  sendNotification,
} from "@/lib/notify";

const CRON_SECRET = process.env.CRON_SECRET;

if (!CRON_SECRET) {
  console.warn("⚠️ CRON_SECRET not set — dead-letter check will be skipped");
}

interface MessengerState {
  credentialId: string;
  userId: string;
  messengerPhone: string | null;
  messengerEmail: string | null;
  elapsedDays: number;
  thresholdDays: number;
  stage: "none" | "first_sent" | "reminder_24h" | "reminder_48h" | "replied_1" | "replied_2" | "auto_delivered";
  lastNotifiedAt: Date | null;
  replyValue: string | null;
}

export async function GET(req: NextRequest) {
  try {
    const secret = req.nextUrl.searchParams.get("secret");
    if (secret !== CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://in-case.me";
    const actions: string[] = [];
    const warnings: string[] = [];

    // ════════════════════════════════════════════════════════
    // 0. 用户预警：阈值前主动提醒本人续期
    // ════════════════════════════════════════════════════════

    // 查找有活跃信使、且已进入 80% 预警期的用户
    const nearExpiryUsers = await db
      .selectDistinct({
        userId: users.id,
        email: users.email,
        phone: users.phone,
        lastActiveTime: users.lastActiveTime,
        safeThresholdDays: users.safeThresholdDays,
      })
      .from(users)
      .innerJoin(credentials, eq(credentials.userId, users.id))
      .where(
        and(
          eq(credentials.status, "active"),
          lt(users.lastActiveTime, new Date(now.getTime() - 1 * 86400 * 1000))
        )
      );

    for (const u of nearExpiryUsers) {
      const elapsedDays =
        (now.getTime() - u.lastActiveTime.getTime()) / 86400000;
      const thresholdDays = u.safeThresholdDays;
      const elapsedPct = (elapsedDays / thresholdDays) * 100;
      const daysRemaining = Math.max(0, Math.ceil(thresholdDays - elapsedDays));

      // 仅在 80%±3% 和 90%±3% 两个节点触发
      const is80Node = elapsedPct >= 77 && elapsedPct < 83;
      const is90Node = elapsedPct >= 87 && elapsedPct < 93;
      if (!is80Node && !is90Node) continue;

      const warnEventType = is90Node ? "user_warned_90pct" : "user_warned_80pct";

      // 幂等：已预警过该节点则跳过
      const [existingWarning] = await db
        .select({ id: accessLogs.id })
        .from(accessLogs)
        .where(
          and(
            eq(accessLogs.userId, u.userId),
            eq(accessLogs.eventType, warnEventType)
          )
        )
        .limit(1);

      if (existingWarning) continue;

      if (!u.email && !u.phone) continue;

      // 发送通知
      if (u.email) {
        const emailContent = getUserPreExpiryWarningEmail(daysRemaining, baseUrl);
        await sendNotification(
          "email",
          u.email,
          emailContent,
          u.userId,
          `用户预警：距阈值还剩 ${daysRemaining} 天`
        );
      } else if (u.phone) {
        const sms = getUserPreExpiryWarning(daysRemaining);
        await sendNotification(
          "sms",
          u.phone,
          sms,
          u.userId,
          `用户预警：距阈值还剩 ${daysRemaining} 天`
        );
      }

      // 记录预警事件（幂等锁）
      await db.insert(accessLogs).values({
        userId: u.userId,
        eventType: warnEventType as any,
        result: "allowed",
        reason: `预警提醒：已过 ${Math.round(elapsedPct)}%，剩余 ${daysRemaining} 天`,
      });

      warnings.push(`${u.userId.slice(0, 8)}: warned at ${Math.round(elapsedPct)}% (${daysRemaining}d left)`);
    }

    // ════════════════════════════════════════════════════════
    // 1. 查找所有超阈值的用户及其活跃信使
    // ════════════════════════════════════════════════════════
    const expiredCredentials = await db
      .select({
        credentialId: credentials.id,
        userId: users.id,
        messengerPhone: credentials.messengerPhone,
        messengerPhone2: credentials.messengerPhone2,
        messengerEmail: credentials.messengerEmail,
        lastActiveTime: users.lastActiveTime,
        safeThresholdDays: users.safeThresholdDays,
        accessToken: credentials.accessToken,
        humanCode: credentials.humanCode,
      })
      .from(credentials)
      .innerJoin(users, eq(users.id, credentials.userId))
      .where(
        and(
          eq(credentials.status, "active"),
          lt(
            users.lastActiveTime,
            new Date(now.getTime() - 1 * 86400 * 1000) // 至少1天未活跃才检查
          )
        )
      );

    // ──── 2. 过滤：仅处理确实超阈值的 ────
    const expired = expiredCredentials.filter((c) => {
      const thresholdTime = new Date(
        c.lastActiveTime.getTime() + c.safeThresholdDays * 86400 * 1000
      );
      return thresholdTime <= now;
    });

    if (expired.length === 0) {
      return NextResponse.json({
        checkedAt: now.toISOString(),
        totalChecked: expiredCredentials.length,
        expired: 0,
        warnings,
        actions: [],
        message: "无超阈值用户",
      });
    }

    // ──── 2b. 海外站：过滤未订阅用户 ────
    const isOverseas =
      process.env.NEXT_PUBLIC_SITE_MODE === "overseas" ||
      (process.env.NEXT_PUBLIC_APP_URL &&
        !process.env.NEXT_PUBLIC_APP_URL.includes("in-case.cn"));

    const mustNotify: typeof expired = [];
    if (isOverseas) {
      for (const cred of expired) {
        const [sub] = await db
          .select({ id: subscriptions.id })
          .from(subscriptions)
          .where(
            and(
              eq(subscriptions.userId, cred.userId),
              eq(subscriptions.status, "active")
            )
          )
          .limit(1);
        if (sub) mustNotify.push(cred);
      }
    } else {
      mustNotify.push(...expired);
    }

    if (mustNotify.length === 0) {
      return NextResponse.json({
        checkedAt: now.toISOString(),
        totalChecked: expiredCredentials.length,
        expired: expired.length,
        skippedNoSubscription: isOverseas ? expired.length : 0,
        warnings,
        actions: [],
        message: isOverseas
          ? "无超阈值且已订阅用户"
          : "无超阈值用户",
      });
    }

    // ──── 3. 查询每个凭证的通知阶段 ────

    for (const cred of mustNotify) {
      // 查询最新的死信相关日志
      const recentLogs = await db
        .select()
        .from(accessLogs)
        .where(
          and(
            eq(accessLogs.credentialId, cred.credentialId),
            eq(accessLogs.userId, cred.userId)
          )
        )
        .orderBy(desc(accessLogs.createdAt))
        .limit(10);

      // 判断当前阶段
      const stage = determineStage(recentLogs);
      const elapsedDays = Math.ceil(
        (now.getTime() - cred.lastActiveTime.getTime()) / 86400000
      );

      // 如果已经回复过或已交付，跳过
      if (stage === "replied_1" || stage === "replied_2" || stage === "auto_delivered") {
        continue;
      }

      // 信使尚未接受邀请 → 不发通知（防止骚扰未确认的信使）
      const hasAccepted = recentLogs.some(
        (l) => l.eventType === "credential_accepted"
      );
      if (!hasAccepted) {
        continue;
      }

      const unlockUrl = `${baseUrl}/unlock?token=${cred.accessToken}`;

      // ──── 阶段处理 ────
      if (stage === "none") {
        // 首次通知
        await sendToMessenger(cred, getDeadLetterSMS(), "messenger_notify_0h", cred.credentialId, cred.userId);
        actions.push(`${cred.humanCode}: first_sent → ${cred.messengerPhone || cred.messengerEmail}`);
      } else if (stage === "first_sent") {
        const firstSent = recentLogs.find((l) => l.eventType === "messenger_notify_0h");
        const hoursSinceFirst = firstSent
          ? (now.getTime() - firstSent.createdAt.getTime()) / 3600000
          : 0;

        if (hoursSinceFirst >= 24 && hoursSinceFirst < 48) {
          await sendToMessenger(cred, getDeadLetterReminder24h(), "messenger_notify_24h", cred.credentialId, cred.userId);
          actions.push(`${cred.humanCode}: reminder_24h`);
        } else if (hoursSinceFirst >= 48 && hoursSinceFirst < 72) {
          await sendToMessenger(cred, getDeadLetterReminder48h(), "messenger_notify_48h", cred.credentialId, cred.userId);
          actions.push(`${cred.humanCode}: reminder_48h`);
        } else if (hoursSinceFirst >= 72) {
          // 72h 无回复 → 自动交付
          const sms = getMessengerAutoDeliverSMS(unlockUrl);
          await sendToMessenger(cred, sms, "messenger_auto_deliver", cred.credentialId, cred.userId);
          // 更新凭证状态为已交付
          await db
            .update(credentials)
            .set({ status: "delivered" as any })
            .where(eq(credentials.id, cred.credentialId));
          actions.push(`${cred.humanCode}: auto_delivered`);
        }
      } else if (stage === "reminder_24h") {
        const reminderSent = recentLogs.find((l) => l.eventType === "messenger_notify_24h");
        const hoursSinceReminder = reminderSent
          ? (now.getTime() - reminderSent.createdAt.getTime()) / 3600000
          : 0;

        if (hoursSinceReminder >= 24 && hoursSinceReminder < 48) {
          await sendToMessenger(cred, getDeadLetterReminder48h(), "messenger_notify_48h", cred.credentialId, cred.userId);
          actions.push(`${cred.humanCode}: reminder_48h (from 24h)`);
        } else if (hoursSinceReminder >= 48) {
          const sms = getMessengerAutoDeliverSMS(unlockUrl);
          await sendToMessenger(cred, sms, "messenger_auto_deliver", cred.credentialId, cred.userId);
          await db
            .update(credentials)
            .set({ status: "delivered" as any })
            .where(eq(credentials.id, cred.credentialId));
          actions.push(`${cred.humanCode}: auto_delivered (from 24h)`);
        }
      } else if (stage === "reminder_48h") {
        const reminder48Sent = recentLogs.find((l) => l.eventType === "messenger_notify_48h");
        const hoursSinceReminder48 = reminder48Sent
          ? (now.getTime() - reminder48Sent.createdAt.getTime()) / 3600000
          : 0;

        if (hoursSinceReminder48 >= 24) {
          const sms = getMessengerAutoDeliverSMS(unlockUrl);
          await sendToMessenger(cred, sms, "messenger_auto_deliver", cred.credentialId, cred.userId);
          await db
            .update(credentials)
            .set({ status: "delivered" as any })
            .where(eq(credentials.id, cred.credentialId));
          actions.push(`${cred.humanCode}: auto_delivered (from 48h)`);
        }
      }
    }

    return NextResponse.json({
      checkedAt: now.toISOString(),
      totalChecked: expiredCredentials.length,
      expired: expired.length,
      warnings,
      warningsCount: warnings.length,
      actions,
      actionsCount: actions.length,
    });
  } catch (error) {
    console.error("Dead-letter check error:", error);
    return NextResponse.json({ error: "检查失败" }, { status: 500 });
  }
}

// ──── 辅助函数 ────

function determineStage(
  logs: Array<{ eventType: string; reason: string | null }>
): MessengerState["stage"] {
  const types = logs.map((l) => l.eventType);

  if (types.includes("messenger_reply_safe")) return "replied_1";
  if (types.includes("messenger_reply_lost")) return "replied_2";
  if (types.includes("messenger_auto_deliver")) return "auto_delivered";
  if (types.includes("messenger_notify_48h")) return "reminder_48h";
  if (types.includes("messenger_notify_24h")) return "reminder_24h";
  if (types.includes("messenger_notify_0h")) return "first_sent";
  return "none";
}

async function sendToMessenger(
  cred: {
    messengerPhone: string | null;
    messengerPhone2: string | null;
    messengerEmail: string | null;
  },
  smsContent: string,
  eventType: string,
  credentialId: string,
  userId: string
) {
  // 短信
  if (cred.messengerPhone) {
    await sendNotification("sms", cred.messengerPhone, smsContent, userId, eventType);
  }
  if (cred.messengerPhone2) {
    await sendNotification("sms", cred.messengerPhone2, smsContent, userId, eventType);
  }
  // 邮件
  if (cred.messengerEmail) {
    await sendNotification(
      "email",
      cred.messengerEmail,
      { subject: "【万一呢】数字资产待查看", body: smsContent },
      userId,
      eventType
    );
  }

  // 记录日志
  await db.insert(accessLogs).values({
    userId,
    credentialId,
    eventType: eventType as any,
    result: "allowed",
    reason: `死信通知 [${eventType}] 发送至 ${cred.messengerPhone || cred.messengerEmail}`,
  });
}
