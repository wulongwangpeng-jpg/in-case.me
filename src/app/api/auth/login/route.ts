/**
 * POST /api/auth/login
 * 手机号/邮箱验证码登录 → 将 Cookie UUID 重定向到已有账号
 * 新设备登录后，数据全部恢复
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, users, verificationCodes } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

const COOKIE_NAME = "wanyi_user_token";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { target, code } = await req.json();

    if (!target || !code) {
      return NextResponse.json(
        { error: "缺少参数" },
        { status: 400 }
      );
    }

    const isPhone = /^1[3-9]\d{9}$/.test(target);

    // 校验验证码
    const hashed = hashCode(code);
    const records = await db
      .select()
      .from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.target, target),
          eq(verificationCodes.purpose, "login"),
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

    if (record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "验证码已过期，请重新发送" },
        { status: 400 }
      );
    }

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

    // 查找用户
    const [user] = await db
      .select({ id: users.id, phone: users.phone, email: users.email })
      .from(users)
      .where(
        isPhone ? eq(users.phone, target) : eq(users.email, target)
      )
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "该账号不存在" },
        { status: 404 }
      );
    }

    // 设置 Cookie，指向已有用户的 UUID
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    // 更新活跃时间
    await db
      .update(users)
      .set({
        lastActiveTime: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      success: true,
      message: "登录成功，数据已恢复",
      hasPhone: !!user.phone,
      hasEmail: !!user.email,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "登录失败，请稍后重试" },
      { status: 500 }
    );
  }
}
