/**
 * POST /api/me/import
 *
 * 灾备恢复：上传之前导出的 JSON 备份文件，将密文重新写入保险库。
 *
 * 安全约束：
 *  - 只导入属于当前用户的备份（user.id 必须匹配）
 *  - 密文直接入库，不解密
 *  - 导入后用户仍需用原始密码在前端解密
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { db, vaults, credentials } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const userId = await getOrCreateUser();

    // ── 解析上传的 JSON ──
    let backup: any;
    try {
      backup = await req.json();
    } catch {
      return NextResponse.json(
        { error: "无效的 JSON 文件，请确认上传的是万一呢灾备文件。" },
        { status: 400 }
      );
    }

    // ── 格式校验 ──
    if (backup.format_version !== "wanyi-backup-v1") {
      return NextResponse.json(
        { error: "不支持的备份格式。请使用「万一呢」导出的灾备文件。" },
        { status: 400 }
      );
    }

    if (!backup.vaults || !Array.isArray(backup.vaults)) {
      return NextResponse.json(
        { error: "备份文件中没有找到密文数据。" },
        { status: 400 }
      );
    }

    // ── 用户身份校验 ──
    if (backup.user?.id !== userId) {
      return NextResponse.json(
        {
          error: "这份备份属于另一个账户。请使用导出该备份的账户登录后重试。",
        },
        { status: 403 }
      );
    }

    // ── 逐条导入密文 ──
    let importedVaults = 0;
    let skippedVaults = 0;

    for (const vault of backup.vaults) {
      // 校验必填密文字段
      if (
        !vault.encryptedContent ||
        !vault.encryptionSalt ||
        !vault.encryptionIv
      ) {
        skippedVaults++;
        continue;
      }

      await db.insert(vaults).values({
        userId,
        vaultType: vault.vaultType || "asset_inventory",
        aliasName: vault.aliasName || null,
        memoryHint: vault.memoryHint || null,
        categoryTag: vault.categoryTag || null,
        encryptedContent: vault.encryptedContent,
        encryptionSalt: vault.encryptionSalt,
        encryptionIv: vault.encryptionIv,
        encryptionVersion: vault.encryptionVersion || 1,
      });

      importedVaults++;
    }

    // ── 导入凭证（可选） ──
    let importedCredentials = 0;
    if (backup.credentials && Array.isArray(backup.credentials)) {
      for (const cred of backup.credentials) {
        if (!cred.accessToken || !cred.humanCode) continue;

        // 检查是否已存在
        const existing = await db
          .select({ id: credentials.id })
          .from(credentials)
          .where(eq(credentials.accessToken, cred.accessToken))
          .limit(1);

        if (existing.length > 0) {
          continue; // 跳过已存在的凭证
        }

        await db.insert(credentials).values({
          userId,
          messengerLabel: cred.messengerLabel || null,
          humanCode: cred.humanCode,
          accessToken: cred.accessToken,
          status: "active",
        });

        importedCredentials++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `灾备恢复完成。导入 ${importedVaults} 条密文，跳过 ${skippedVaults} 条无效记录，恢复 ${importedCredentials} 个凭证。`,
      importedVaults,
      skippedVaults,
      importedCredentials,
    });
  } catch (error) {
    console.error("Import API error:", error);
    return NextResponse.json({ error: "导入失败" }, { status: 500 });
  }
}
