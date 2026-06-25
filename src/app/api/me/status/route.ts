/**
 * GET /api/me/status
 * 返回当前用户的安全性状态
 */

import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { db, users, vaults, credentials } from "@/lib/db";
import { eq, and, count } from "drizzle-orm";

export async function GET() {
  try {
    const userId = await getOrCreateUser();

    // 三个查询并行
    const [[user], [vaultCountResult], [credCountResult]] = await Promise.all([
      db.select().from(users).where(eq(users.id, userId)).limit(1),
      db.select({ c: count() }).from(vaults).where(eq(vaults.userId, userId)),
      db.select({ c: count() }).from(credentials).where(and(eq(credentials.userId, userId), eq(credentials.status, "active"))),
    ]);

    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    const thresholdTime = new Date(
      user.lastActiveTime.getTime() + user.safeThresholdDays * 86400 * 1000
    );
    const daysRemaining = Math.ceil(
      (thresholdTime.getTime() - Date.now()) / 86400000
    );

    // 预警级别：基于已流逝天数占阈值的百分比
    const elapsedDays = user.safeThresholdDays - daysRemaining;
    const elapsedPct = (elapsedDays / user.safeThresholdDays) * 100;
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

    // 脱敏联系方式（前端展示用）
    let maskedContact: string | null = null;
    if (user.phone) {
      maskedContact = user.phone.slice(0, 3) + "****" + user.phone.slice(-4);
    } else if (user.email) {
      const at = user.email.indexOf("@");
      maskedContact = user.email.slice(0, 3) + "***" + user.email.slice(at);
    }

    return NextResponse.json({
      activeUntil: thresholdTime.toISOString(),
      daysRemaining: Math.max(0, daysRemaining),
      isUrgent: daysRemaining <= 14,
      thresholdDays: user.safeThresholdDays,
      elapsedDays: Math.max(0, elapsedDays),
      elapsedPct: Math.round(elapsedPct),
      warningLevel,
      hasPhone: !!user.phone,
      hasEmail: !!user.email,
      maskedContact,
      vaultCount: vaultCountResult?.c ?? 0,
      credentialCount: credCountResult?.c ?? 0,
    });
  } catch (error) {
    console.error("Status API error:", error);
    return NextResponse.json(
      { error: "获取状态失败，请稍后重试" },
      { status: 500 }
    );
  }
}
