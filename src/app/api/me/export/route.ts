/**
 * GET /api/me/export
 *
 * 灾备导出：把用户全部密文 + 凭证打包为本地 JSON 备份文件。
 *
 * 安全承诺：
 *  - 导出的 encrypted_content 仍是 AES-256-GCM 密文
 *  - 服务端不注入解密钥，不解密任何内容
 *  - 用户手握自己的解密密码 + 这份 JSON = 行走天涯的终极资产快照
 */

import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { db, users, vaults, credentials } from "@/lib/db";
import { eq, and } from "drizzle-orm";

export async function GET() {
  try {
    const userId = await getOrCreateUser();

    // ── 获取用户信息 ──
    const [user] = await db
      .select({
        id: users.id,
        nickname: users.nickname,
        email: users.email,
        lastActiveTime: users.lastActiveTime,
        safeThresholdDays: users.safeThresholdDays,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // ── 获取全部密文（仍然加密） ──
    const allVaults = await db
      .select({
        id: vaults.id,
        vaultType: vaults.vaultType,
        aliasName: vaults.aliasName,
        memoryHint: vaults.memoryHint,
        categoryTag: vaults.categoryTag,
        encryptedContent: vaults.encryptedContent,
        encryptionSalt: vaults.encryptionSalt,
        encryptionIv: vaults.encryptionIv,
        encryptionVersion: vaults.encryptionVersion,
        createdAt: vaults.createdAt,
        updatedAt: vaults.updatedAt,
      })
      .from(vaults)
      .where(eq(vaults.userId, userId));

    // ── 获取凭证列表 ──
    const allCredentials = await db
      .select({
        id: credentials.id,
        messengerLabel: credentials.messengerLabel,
        humanCode: credentials.humanCode,
        accessToken: credentials.accessToken,
        status: credentials.status,
        createdAt: credentials.createdAt,
      })
      .from(credentials)
      .where(
        and(eq(credentials.userId, userId), eq(credentials.status, "active"))
      );

    // ── 组装灾备包 ──
    const backupPackage = {
      // 元数据
      format_version: "wanyi-backup-v1",
      exported_at: new Date().toISOString(),
      app: "万一呢 — 数字遗产规划",
      website: "https://in-case.me",

      // 用户信息
      user: {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        lastActiveTime: user.lastActiveTime,
        safeThresholdDays: user.safeThresholdDays,
      },

      // 密文保险库（全量导出，加密状态不变）
      vaults: allVaults,
      vaultCount: allVaults.length,

      // 有效信使凭证
      credentials: allCredentials,
      credentialCount: allCredentials.length,

      // 恢复说明
      recovery_guide: {
        title: "如何恢复这份备份？",
        steps: [
          "访问 https://in-case.me/import",
          "上传此 JSON 文件",
          "输入你的解密密码（加密时使用的那个）",
          "系统将密文重新导入你的保险库",
        ],
        warning:
          "此文件包含你的加密资产快照，但仍是密文状态。请妥善保管此文件和解密密码，两者缺一无法恢复。",
        encryption_note:
          "所有 vaults[].encryptedContent 字段均为 AES-256-GCM 密文。" +
          "解密需 encryptionSalt + encryptionIv + 你的密码。服务端从未存储你的密码。",
      },
    };

    // ── 返回 JSON 文件下载 ──
    const jsonStr = JSON.stringify(backupPackage, null, 2);
    const filename = `wanyi-backup-${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(jsonStr, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Export API error:", error);
    return NextResponse.json({ error: "导出失败" }, { status: 500 });
  }
}
