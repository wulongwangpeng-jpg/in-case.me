/**
 * PATCH /api/me/threshold
 * 用户自定义安全阈值天数（30/60/90/180/365）
 * 返回完整状态，避免前端二次请求
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { db, users, vaults, credentials, accessLogs } from "@/lib/db";
import { eq, and, count } from "drizzle-orm";

const ALLOWED_VALUES = [30, 60, 90, 180, 365];

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getOrCreateUser();
    const { safe_threshold_days } = await req.json();

    if (
      typeof safe_threshold_days !== "number" ||
      !ALLOWED_VALUES.includes(safe_threshold_days)
    ) {
      return NextResponse.json(
        { error: `safe_threshold_days 必须为 ${ALLOWED_VALUES.join("/")}` },
        { status: 400 }
      );
    }

    const now = new Date();

    await db
      .update(users)
      .set({
        safeThresholdDays: safe_threshold_days,
        updatedAt: now,
      })
      .where(eq(users.id, userId));

    // 记录审计日志
    await db.insert(accessLogs).values({
      userId,
      eventType: "user_renewal",
      result: "allowed",
      reason: `安全阈值调整为 ${safe_threshold_days} 天`,
    });

    // 重新查询用户——获取最新的 lastActiveTime + 新阈值
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 用最新数据计算全部状态
    const thresholdTime = new Date(
      user.lastActiveTime.getTime() + user.safeThresholdDays * 86400 * 1000
    );
    const daysRemaining = Math.max(0, Math.ceil(
      (thresholdTime.getTime() - Date.now()) / 86400000
    ));
    const elapsedDays = user.safeThresholdDays - daysRemaining;
    const elapsedPct = Math.round((elapsedDays / user.safeThresholdDays) * 100);

    let warningLevel: "normal" | "warning_80" | "warning_90" | "critical";
    if (daysRemaining <= 0) {
      warningLevel = "critical";
    } else if (elapsedPct >= 90) {
      warningLevel = "warning_90";
    } else if (elapsedPct >= 80) {
      warningLevel = "warning_80";
    } else {
      warningLevel = "normal";
    }

    const [vaultCountResult] = await db
      .select({ c: count() })
      .from(vaults)
      .where(eq(vaults.userId, userId));

    const [credCountResult] = await db
      .select({ c: count() })
      .from(credentials)
      .where(and(eq(credentials.userId, userId), eq(credentials.status, "active")));

    return NextResponse.json({
      safeThresholdDays: user.safeThresholdDays,
      activeUntil: thresholdTime.toISOString(),
      daysRemaining,
      isUrgent: daysRemaining <= 14,
      thresholdDays: user.safeThresholdDays,
      elapsedDays: Math.max(0, elapsedDays),
      elapsedPct,
      warningLevel,
      vaultCount: vaultCountResult?.c ?? 0,
      credentialCount: credCountResult?.c ?? 0,
    });
  } catch (error) {
    console.error("Threshold API error:", error);
    return NextResponse.json(
      { error: "更新阈值失败" },
      { status: 500 }
    );
  }
}
