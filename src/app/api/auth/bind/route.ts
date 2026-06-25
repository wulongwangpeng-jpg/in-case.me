/**
 * POST /api/auth/bind
 * 验证码绑定手机号/邮箱到当前 Cookie UUID 用户
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { db, users, verificationCodes } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getOrCreateUser();
    const { target, code } = await req.json();

    if (!target || !code) {
      return NextResponse.json(
        { error: "缺少参数" },
        { status: 400 }
      );
    }

    const isPhone = /^1[3-9]\d{9}$/.test(target);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target);
    if (!isPhone && !isEmail) {
      return NextResponse.json(
        { error: "手机号或邮箱格式不正确" },
        { status: 400 }
      );
    }

    // 校验验证码
    const hashed = hashCode(code);
    const records = await db
      .select()
      .from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.target, target),
          eq(verificationCodes.purpose, "bind"),
          eq(verificationCodes.used, 0)
        )
      )
      .orderBy(verificationCodes.createdAt)
      .limit(1);

    if (records.length === 0) {
      return NextResponse.json(
        { error: "请先发送验证码" },
        { status: 400 }
      );
    }

    const record = records[0];

    // 检查过期
    if (record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "验证码已过期，请重新发送" },
        { status: 400 }
      );
    }

    // 检查哈希
    if (record.codeHash !== hashed) {
      return NextResponse.json(
        { error: "验证码错误" },
        { status: 400 }
      );
    }

    // 标记已使用
    await db
      .update(verificationCodes)
      .set({ used: 1 })
      .where(eq(verificationCodes.id, record.id));

    // 检查是否已被其他用户绑定
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(
        isPhone ? eq(users.phone, target) : eq(users.email, target)
      )
      .limit(1);

    if (existing.length > 0 && existing[0].id !== userId) {
      return NextResponse.json(
        { error: isPhone ? "该手机号已被其他账号绑定" : "该邮箱已被其他账号绑定" },
        { status: 409 }
      );
    }

    // 绑定
    const now = new Date();
    await db
      .update(users)
      .set({
        ...(isPhone ? { phone: target } : { email: target }),
        updatedAt: now,
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      bound: isPhone ? "phone" : "email",
      masked: isPhone
        ? target.slice(0, 3) + "****" + target.slice(-4)
        : target.slice(0, 3) + "***" + target.slice(target.indexOf("@")),
    });
  } catch (error) {
    console.error("Bind error:", error);
    return NextResponse.json(
      { error: "绑定失败，请稍后重试" },
      { status: 500 }
    );
  }
}
