/**
 * POST /api/me/renew
 * 用户情感续期：点「挺好」→ 续 90 天 / 点「不太好」→ 续 45 天
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { db, users, accessLogs } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const userId = await getOrCreateUser();
    const { active_days } = await req.json();

    if (typeof active_days !== "number" || active_days < 1 || active_days > 365) {
      return NextResponse.json(
        { error: "active_days 必须为 1-365 之间的正整数" },
        { status: 400 }
      );
    }

    const now = new Date();
    const activeUntil = new Date(now.getTime() + active_days * 86400 * 1000);

    // 更新用户活跃时间 + 阈值
    await db
      .update(users)
      .set({
        lastActiveTime: now,
        safeThresholdDays: active_days,
        updatedAt: now,
      })
      .where(eq(users.id, userId));

    // 记录审计日志
    await db.insert(accessLogs).values({
      userId,
      eventType: "user_renewal",
      result: "allowed",
      reason: `续期 ${active_days} 天，新截止：${activeUntil.toISOString()}`,
    });

    const daysRemaining = Math.ceil(
      (activeUntil.getTime() - Date.now()) / 86400000
    );

    return NextResponse.json({
      activeUntil: activeUntil.toISOString(),
      daysRemaining,
      isUrgent: daysRemaining <= 14,
    });
  } catch (error) {
    console.error("Renew API error:", error);
    return NextResponse.json(
      { error: "续期失败" },
      { status: 500 }
    );
  }
}
