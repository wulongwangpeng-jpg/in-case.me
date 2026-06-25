/**
 * 极简用户身份识别 — Cookie 模式
 */

import { cookies } from "next/headers";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "wanyi_user_token";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

export async function getOrCreateUser(): Promise<string> {
  const cookieStore = await cookies();
  let token: string | undefined = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, token))
      .limit(1);

    if (existing.length > 0) {
      return token;
    }
  }

  // 创建新用户（应用层生成 UUID，不依赖数据库扩展）
  const userId = crypto.randomUUID();
  await db
    .insert(users)
    .values({
      id: userId,
      email: null,
      nickname: null,
      lastActiveTime: new Date(),
      safeThresholdDays: 180,
    })
    .returning({ id: users.id });

  token = userId;

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return token;
}

export async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value || null;
}
