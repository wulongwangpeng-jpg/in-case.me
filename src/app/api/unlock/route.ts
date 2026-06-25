/**
 * POST /api/unlock
 *
 * 信使携带 access_token 申请解锁。
 * 服务端唯一逻辑：last_active_time + safe_threshold_days < NOW() ?
 *   否 → 🟢 拦截
 *   是 → 🔴 下发密文包（不解密，解密在信使前端）
 */

import { NextRequest, NextResponse } from "next/server";
import { db, credentials, users, vaults, accessLogs, credentialVaults } from "@/lib/db";
import { eq, and, inArray } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { access_token } = await req.json();

    if (!access_token) {
      return NextResponse.json(
        { stage: "credential_invalid", allowed: false, message: "缺少凭证。" },
        { status: 400 }
      );
    }

    // ──── Step 1: 凭证有效性检查 ────
    const [cred] = await db
      .select()
      .from(credentials)
      .where(
        and(
          eq(credentials.accessToken, access_token),
          eq(credentials.status, "active")
        )
      )
      .limit(1);

    if (!cred) {
      return NextResponse.json(
        {
          stage: "credential_invalid",
          allowed: false,
          message: "该凭证无效或已被撤销。如需继续，请联系你的朋友获取新的提取链接。",
        },
        { status: 404 }
      );
    }

    // ──── Step 2: 用户活跃状态检查 ────
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, cred.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { stage: "user_not_found", allowed: false, message: "用户账户异常。" },
        { status: 404 }
      );
    }

    // ★ 核心判断：就这一行 ★
    const thresholdTime = new Date(
      user.lastActiveTime.getTime() + user.safeThresholdDays * 86400 * 1000
    );
    const isStillActive = thresholdTime > new Date();

    // ──── Step 3: 记录日志 ────
    const reasonText = isStillActive
      ? `用户自 ${user.lastActiveTime.toISOString()} 起持续活跃，距阈值还有 ${Math.ceil((thresholdTime.getTime() - Date.now()) / 86400000)} 天`
      : `用户已超过 ${user.safeThresholdDays} 天未活跃（自 ${user.lastActiveTime.toISOString()} 起），准予提取`;

    await db.insert(accessLogs).values({
      credentialId: cred.id,
      userId: user.id,
      eventType: isStillActive ? "blocked_still_active" : "data_delivered",
      result: isStillActive ? "denied" : "allowed",
      reason: reasonText,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    // 更新凭证访问计数
    await db
      .update(credentials)
      .set({
        accessCount: cred.accessCount + 1,
        lastAccessedAt: new Date(),
      })
      .where(eq(credentials.id, cred.id));

    // ──── Step 4: 拦截 or 交付 ────
    if (isStillActive) {
      const remainingDays = Math.ceil(
        (thresholdTime.getTime() - Date.now()) / 86400000
      );

      return NextResponse.json({
        stage: "user_still_active",
        allowed: false,
        message: "你的朋友最近仍在活动，无需担心。",
        detail: `距离安全阈值还有 ${remainingDays} 天。这只是例行检查，请耐心等待。如需确认，可直接联系你的朋友。`,
        remainingDays,
        activeUntil: thresholdTime.toISOString(),
      });
    }

    // 🔴 交付密文包（不解密！）
    // 先查信使被授权查看哪些密文
    const cvLinks = await db
      .select({ vaultId: credentialVaults.vaultId })
      .from(credentialVaults)
      .where(eq(credentialVaults.credentialId, cred.id));

    const vaultColumns = {
      id: vaults.id,
      vaultType: vaults.vaultType,
      aliasName: vaults.aliasName,
      memoryHint: vaults.memoryHint,
      encryptedContent: vaults.encryptedContent,
      encryptionSalt: vaults.encryptionSalt,
      encryptionIv: vaults.encryptionIv,
      encryptionVersion: vaults.encryptionVersion,
    };

    // 如果设了密文范围，只返回对应的；否则返回全部（兼容旧凭证）
    const userVaults = cvLinks.length > 0
      ? await db
          .select(vaultColumns)
          .from(vaults)
          .where(
            and(
              eq(vaults.userId, user.id),
              inArray(vaults.id, cvLinks.map((l) => l.vaultId))
            )
          )
      : await db
          .select(vaultColumns)
          .from(vaults)
          .where(eq(vaults.userId, user.id));

    // 标记凭证为已交付（防重复使用同一 token）
    await db
      .update(credentials)
      .set({ status: "delivered" as any })
      .where(eq(credentials.id, cred.id));

    const silentDays = Math.ceil(
      (Date.now() - user.lastActiveTime.getTime()) / 86400000
    );

    return NextResponse.json({
      stage: "data_released",
      allowed: true,
      message: "你的朋友将这些数字备忘录托付给了你。以下是加密数据包，请在本地解密查看。",
      messengerLabel: cred.messengerLabel,
      messengerRelation: cred.messengerRelation,
      userActiveUntil: user.lastActiveTime.toISOString(),
      silentDays,
      totalVaults: userVaults.length,
      vaults: userVaults,
    });
  } catch (error) {
    console.error("Unlock API error:", error);
    return NextResponse.json(
      { error: "服务异常，请稍后重试" },
      { status: 500 }
    );
  }
}
