/**
 * POST /api/credentials — 创建信使凭证
 * GET  /api/credentials — 列出当前用户的全部凭证
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { db, credentials, accessLogs } from "@/lib/db";
import { eq, and, desc, count } from "drizzle-orm";
import { generateHumanCode, generateAccessToken } from "@/lib/crypto";
import {
  getMessengerInviteSMS,
  getMessengerInviteEmail,
  sendNotification,
} from "@/lib/notify";
import { isSubscribed, isOverseas } from "@/lib/subscription";

// ──── POST：创建凭证 ────
export async function POST(req: NextRequest) {
  try {
    const userId = await getOrCreateUser();

    // 海外站免费用户限制：最多 1 个信使
    if (isOverseas(req)) {
      const subscribed = await isSubscribed(userId);
      if (!subscribed) {
        const [result] = await db
          .select({ count: count() })
          .from(credentials)
          .where(
            and(
              eq(credentials.userId, userId),
              eq(credentials.status, "active")
            )
          );
        if ((result?.count ?? 0) >= 1) {
          return NextResponse.json(
            {
              error:
                "Free tier includes 1 trusted contact. Subscribe to add more.",
            },
            { status: 402 }
          );
        }
      }
    }

    const { messengerEmail, messengerPhone, messengerPhone2, messengerRelation, messengerLabel, vaultIds } = await req.json();

    // 生成双码
    const humanCode = generateHumanCode();
    const accessToken = await generateAccessToken(userId, humanCode);

    const [cred] = await db
      .insert(credentials)
      .values({
        userId,
        messengerEmail: messengerEmail || null,
        messengerPhone: messengerPhone || null,
        messengerPhone2: messengerPhone2 || null,
        messengerRelation: messengerRelation || null,
        messengerLabel: messengerLabel || null,
        humanCode,
        accessToken,
        status: "active",
      })
      .returning({
        id: credentials.id,
        humanCode: credentials.humanCode,
        accessToken: credentials.accessToken,
        messengerLabel: credentials.messengerLabel,
        messengerEmail: credentials.messengerEmail,
        messengerPhone: credentials.messengerPhone,
        messengerPhone2: credentials.messengerPhone2,
        messengerRelation: credentials.messengerRelation,
        status: credentials.status,
        createdAt: credentials.createdAt,
      });

    // 审计日志
    await db.insert(accessLogs).values({
      userId,
      credentialId: cred.id,
      eventType: "credential_created",
      result: "allowed",
      reason: `创建凭证 ${humanCode}，信使：${messengerLabel || "未标注"}`,
    });

    // 关联密文（如果指定了范围）
    if (vaultIds && Array.isArray(vaultIds) && vaultIds.length > 0) {
      const { credentialVaults: cv } = await import("@/lib/db");
      await db.insert(cv).values(
        vaultIds.map((vaultId: string) => ({
          credentialId: cred.id,
          vaultId,
        }))
      );
    }

    // 构造分享链接
    const baseUrl = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "https://in-case.me";
    const unlockUrl = `${baseUrl}/unlock?token=${accessToken}`;
    const acceptUrl = `${baseUrl}/accept?token=${accessToken}`;

    // ──── 发送信使邀请通知 ────
    const userLabel = messengerLabel || "你的朋友";
    const notifyResults: string[] = [];

    if (messengerPhone) {
      await sendNotification(
        "sms",
        messengerPhone,
        getMessengerInviteSMS(messengerLabel, acceptUrl),
        userId,
        `信使邀请短信发送至 ${messengerPhone}`
      );
      notifyResults.push("sms");
    }
    if (messengerPhone2) {
      await sendNotification(
        "sms",
        messengerPhone2,
        getMessengerInviteSMS(messengerLabel, acceptUrl),
        userId,
        `信使邀请短信(备用)发送至 ${messengerPhone2}`
      );
      notifyResults.push("sms2");
    }
    if (messengerEmail) {
      const emailContent = getMessengerInviteEmail(messengerLabel, acceptUrl);
      await sendNotification(
        "email",
        messengerEmail,
        emailContent,
        userId,
        `信使邀请邮件发送至 ${messengerEmail}`
      );
      notifyResults.push("email");
    }

    return NextResponse.json(
      {
        id: cred.id,
        humanCode: cred.humanCode,
        accessToken: cred.accessToken,
        messengerLabel: cred.messengerLabel,
        messengerPhone: cred.messengerPhone,
        messengerPhone2: cred.messengerPhone2,
        messengerEmail: cred.messengerEmail,
        messengerRelation: cred.messengerRelation,
        status: cred.status,
        unlockUrl,
        createdAt: cred.createdAt,
        notified: notifyResults.length > 0 ? notifyResults : undefined,
        message: "凭证已创建。请将提取码或链接分享给你的信使。",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Credentials POST error:", error);
    return NextResponse.json({ error: "创建凭证失败" }, { status: 500 });
  }
}

// ──── GET：列出凭证 ────
export async function GET() {
  try {
    const userId = await getOrCreateUser();

    const creds = await db
      .select({
        id: credentials.id,
        messengerLabel: credentials.messengerLabel,
        messengerPhone: credentials.messengerPhone,
        messengerPhone2: credentials.messengerPhone2,
        messengerEmail: credentials.messengerEmail,
        messengerRelation: credentials.messengerRelation,
        humanCode: credentials.humanCode,
        accessToken: credentials.accessToken,
        status: credentials.status,
        accessCount: credentials.accessCount,
        lastAccessedAt: credentials.lastAccessedAt,
        createdAt: credentials.createdAt,
      })
      .from(credentials)
      .where(eq(credentials.userId, userId))
      .orderBy(desc(credentials.createdAt));

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://in-case.me";

    return NextResponse.json({
      items: creds.map((c) => ({
        ...c,
        unlockUrl: `${baseUrl}/unlock?token=${c.accessToken}`,
      })),
      total: creds.length,
    });
  } catch (error) {
    console.error("Credentials GET error:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
