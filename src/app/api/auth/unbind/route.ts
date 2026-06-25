/**
 * POST /api/auth/unbind
 * 解除当前用户的联系方式绑定（清空 phone + email）
 * 解除后数据仍在，可通过 Cookie 继续使用，也可重新绑定
 */
import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const userId = await getOrCreateUser();

    await db
      .update(users)
      .set({ phone: null, email: null, updatedAt: new Date() })
      .where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unbind error:", error);
    return NextResponse.json(
      { error: "解除绑定失败" },
      { status: 500 }
    );
  }
}
