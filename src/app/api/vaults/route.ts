/**
 * POST /api/vaults — 存入加密内容到保险库
 * GET  /api/vaults — 列出当前用户的所有密文条目
 *
 * 服务端只存密文 + 盐 + IV，永不解密
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { db, vaults, users } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";

// ──── POST：存入密文 ────
export async function POST(req: NextRequest) {
  try {
    const userId = await getOrCreateUser();
    const body = await req.json();

    const {
      vaultType,
      aliasName,
      memoryHint,
      categoryTag,
      encryptedContent,
      encryptionSalt,
      encryptionIv,
      encryptionVersion = 1,
    } = body;

    // 校验必填字段
    if (!vaultType || !encryptedContent || !encryptionSalt || !encryptionIv) {
      return NextResponse.json(
        { error: "缺少必填字段：vaultType, encryptedContent, encryptionSalt, encryptionIv" },
        { status: 400 }
      );
    }

    if (!["asset_inventory", "farewell_letter", "wishlist"].includes(vaultType)) {
      return NextResponse.json(
        { error: "无效的 vaultType" },
        { status: 400 }
      );
    }

    // 插入密文（服务端不验证内容，只存）
    const [vault] = await db
      .insert(vaults)
      .values({
        userId,
        vaultType,
        aliasName: aliasName || null,
        memoryHint: memoryHint || null,
        categoryTag: categoryTag || null,
        encryptedContent,
        encryptionSalt,
        encryptionIv,
        encryptionVersion,
      })
      .returning({ id: vaults.id });

    return NextResponse.json(
      { id: vault.id, message: "密文已安全存入保险库" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Vault POST error:", error);
    return NextResponse.json(
      { error: "存入失败" },
      { status: 500 }
    );
  }
}

// ──── GET：列出密文 ────
export async function GET(req: NextRequest) {
  try {
    const userId = await getOrCreateUser();
    const url = new URL(req.url);
    const vaultType = url.searchParams.get("type") as string | null;

    // 构建查询
    const conditions = [eq(vaults.userId, userId)];
    if (
      vaultType &&
      ["asset_inventory", "farewell_letter", "wishlist"].includes(vaultType)
    ) {
      conditions.push(eq(vaults.vaultType, vaultType as "asset_inventory" | "farewell_letter" | "wishlist"));
    }

    const entries = await db
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
      .where(and(...conditions))
      .orderBy(desc(vaults.updatedAt));

    return NextResponse.json({
      items: entries,
      total: entries.length,
    });
  } catch (error) {
    console.error("Vault GET error:", error);
    return NextResponse.json(
      { error: "获取失败" },
      { status: 500 }
    );
  }
}
