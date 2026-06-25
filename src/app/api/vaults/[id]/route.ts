/**
 * GET    /api/vaults/[id] — 获取单个密文
 * DELETE /api/vaults/[id] — 删除密文
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { db, vaults } from "@/lib/db";
import { eq, and } from "drizzle-orm";

// ──── GET：获取单个密文 ────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getOrCreateUser();
    const { id } = await params;

    const [vault] = await db
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
      .where(and(eq(vaults.id, id), eq(vaults.userId, userId)))
      .limit(1);

    if (!vault) {
      return NextResponse.json(
        { error: "密文不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(vault);
  } catch (error) {
    console.error("Vault GET/[id] error:", error);
    return NextResponse.json(
      { error: "获取失败" },
      { status: 500 }
    );
  }
}

// ──── DELETE：删除密文 ────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getOrCreateUser();
    const { id } = await params;

    const [deleted] = await db
      .delete(vaults)
      .where(and(eq(vaults.id, id), eq(vaults.userId, userId)))
      .returning({ id: vaults.id });

    if (!deleted) {
      return NextResponse.json(
        { error: "密文不存在或无权删除" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "已删除", id: deleted.id });
  } catch (error) {
    console.error("Vault DELETE error:", error);
    return NextResponse.json(
      { error: "删除失败" },
      { status: 500 }
    );
  }
}
