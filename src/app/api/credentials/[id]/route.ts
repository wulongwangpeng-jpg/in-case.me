/**
 * GET    /api/credentials/[id]          — 获取单个凭证
 * PATCH  /api/credentials/[id]          — 恢复凭证 { action: "restore" }
 * DELETE /api/credentials/[id]          — 吊销凭证（软删除）
 * DELETE /api/credentials/[id]?permanent=true — 彻底删除
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { db, credentials, accessLogs } from "@/lib/db";
import { eq, and } from "drizzle-orm";

// ──── GET：单个凭证详情 ────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getOrCreateUser();
    const { id } = await params;

    const [cred] = await db
      .select()
      .from(credentials)
      .where(and(eq(credentials.id, id), eq(credentials.userId, userId)))
      .limit(1);

    if (!cred) {
      return NextResponse.json({ error: "凭证不存在" }, { status: 404 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://in-case.me";

    return NextResponse.json({
      ...cred,
      unlockUrl: `${baseUrl}/unlock?token=${cred.accessToken}`,
    });
  } catch (error) {
    console.error("Credential GET error:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// ──── PATCH：恢复凭证 ────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getOrCreateUser();
    const { id } = await params;
    const body = await req.json();

    if (body.action !== "restore") {
      return NextResponse.json({ error: "无效操作" }, { status: 400 });
    }

    const [restored] = await db
      .update(credentials)
      .set({ status: "active" })
      .where(and(eq(credentials.id, id), eq(credentials.userId, userId)))
      .returning({ id: credentials.id, humanCode: credentials.humanCode });

    if (!restored) {
      return NextResponse.json(
        { error: "凭证不存在或无权操作" },
        { status: 404 }
      );
    }

    await db.insert(accessLogs).values({
      userId,
      credentialId: id,
      eventType: "credential_restored",
      result: "allowed",
      reason: `恢复凭证 ${restored.humanCode}`,
    });

    return NextResponse.json({
      message: "凭证已恢复",
      humanCode: restored.humanCode,
    });
  } catch (error) {
    console.error("Credential PATCH error:", error);
    return NextResponse.json({ error: "恢复失败" }, { status: 500 });
  }
}

// ──── DELETE：吊销或删除凭证 ────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getOrCreateUser();
    const { id } = await params;
    const url = new URL(req.url);
    const permanent = url.searchParams.get("permanent") === "true";

    if (permanent) {
      // 彻底删除
      const [deleted] = await db
        .delete(credentials)
        .where(and(eq(credentials.id, id), eq(credentials.userId, userId)))
        .returning({ id: credentials.id, humanCode: credentials.humanCode });

      if (!deleted) {
        return NextResponse.json(
          { error: "凭证不存在或无权操作" },
          { status: 404 }
        );
      }

      await db.insert(accessLogs).values({
        userId,
        credentialId: null,
        eventType: "credential_revoked",
        result: "allowed",
        reason: `彻底删除凭证 ${deleted.humanCode}`,
      });

      return NextResponse.json({
        message: "凭证已彻底删除",
        humanCode: deleted.humanCode,
      });
    }

    // 软吊销
    const [revoked] = await db
      .update(credentials)
      .set({ status: "revoked" })
      .where(and(eq(credentials.id, id), eq(credentials.userId, userId)))
      .returning({ id: credentials.id, humanCode: credentials.humanCode });

    if (!revoked) {
      return NextResponse.json(
        { error: "凭证不存在或无权操作" },
        { status: 404 }
      );
    }

    // 审计日志
    await db.insert(accessLogs).values({
      userId,
      credentialId: id,
      eventType: "credential_revoked",
      result: "allowed",
      reason: `吊销凭证 ${revoked.humanCode}`,
    });

    return NextResponse.json({
      message: "凭证已吊销",
      humanCode: revoked.humanCode,
    });
  } catch (error) {
    console.error("Credential DELETE error:", error);
    return NextResponse.json({ error: "吊销失败" }, { status: 500 });
  }
}
