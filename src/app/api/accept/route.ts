/**
 * POST /api/accept
 * 信使点击邀请链接后确认接受，持久化接受状态
 *
 * 接受后：凭证状态不变（仍为 active），但记录已接受日志
 * 创作者可由此知道信使是否已确认
 */
import { NextRequest, NextResponse } from "next/server";
import { db, credentials, accessLogs } from "@/lib/db";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { token } = (await req.json()) as { token: string };

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // 查找凭证
    const [cred] = await db
      .select({
        id: credentials.id,
        userId: credentials.userId,
        status: credentials.status,
      })
      .from(credentials)
      .where(
        and(
          eq(credentials.accessToken, token),
          eq(credentials.status, "active")
        )
      )
      .limit(1);

    if (!cred) {
      return NextResponse.json({ error: "Invalid or revoked token" }, { status: 404 });
    }

    // 幂等：已接受过则跳过
    const [existingAccept] = await db
      .select({ id: accessLogs.id })
      .from(accessLogs)
      .where(
        and(
          eq(accessLogs.credentialId, cred.id),
          eq(accessLogs.eventType, "credential_accepted")
        )
      )
      .limit(1);

    if (!existingAccept) {
      // 记录接受事件
      await db.insert(accessLogs).values({
        userId: cred.userId,
        credentialId: cred.id,
        eventType: "credential_accepted",
        result: "allowed",
        reason: "信使确认接受守护邀请",
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null,
        userAgent: req.headers.get("user-agent") || null,
      });
    }

    return NextResponse.json({ accepted: true });
  } catch (error) {
    console.error("Accept API error:", error);
    return NextResponse.json({ error: "Failed to record acceptance" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
