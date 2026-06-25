/**
 * GET /api/credentials/[id]/preview
 *
 * 创建者视角预览：返回该信使被授权查看的所有密文列表
 * 不含解密 — 解密在浏览器端由创建者自己的密码完成
 */
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { db, credentials, vaults, credentialVaults } from "@/lib/db";
import { eq, and, inArray } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getOrCreateUser();
    const { id } = await params;

    // 验证凭证属于当前用户
    const [cred] = await db
      .select({ id: credentials.id, messengerLabel: credentials.messengerLabel, messengerRelation: credentials.messengerRelation })
      .from(credentials)
      .where(and(eq(credentials.id, id), eq(credentials.userId, userId)))
      .limit(1);

    if (!cred) {
      return NextResponse.json({ error: "凭证不存在" }, { status: 404 });
    }

    // 查关联的密文
    const links = await db
      .select({ vaultId: credentialVaults.vaultId })
      .from(credentialVaults)
      .where(eq(credentialVaults.credentialId, id));

    const vaultColumns = {
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
    };

    // 如果设了范围，返回该范围内的；否则返回全部（兼容旧凭证）
    const items = links.length > 0
      ? await db
          .select(vaultColumns)
          .from(vaults)
          .where(
            and(
              eq(vaults.userId, userId),
              inArray(vaults.id, links.map((l) => l.vaultId))
            )
          )
      : await db
          .select(vaultColumns)
          .from(vaults)
          .where(eq(vaults.userId, userId));

    return NextResponse.json({
      credentialLabel: cred.messengerLabel,
      credentialRelation: cred.messengerRelation,
      vaultCount: items.length,
      scopeType: links.length > 0 ? "selected" : "all",
      vaults: items,
    });
  } catch (error) {
    console.error("Preview API error:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
