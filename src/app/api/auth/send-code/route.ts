/**
 * POST /api/auth/send-code
 * 发送手机号/邮箱验证码
 * purpose: "bind" | "login"
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { db, users, verificationCodes } from "@/lib/db";
import { sendNotification } from "@/lib/notify";
import { eq, lt, and } from "drizzle-orm";
import crypto from "crypto";

// ──── 生成 6 位验证码 ────
function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ──── 简单哈希存储（不存明文） ────
function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { target, purpose } = await req.json();

    if (!target || !["bind", "login"].includes(purpose)) {
      return NextResponse.json(
        { error: "参数不合法" },
        { status: 400 }
      );
    }

    // 校验 target 格式
    const isPhone = /^1[3-9]\d{9}$/.test(target);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target);
    if (!isPhone && !isEmail) {
      return NextResponse.json(
        { error: "请输入有效的手机号或邮箱" },
        { status: 400 }
      );
    }

    // 绑定场景：检查是否已被其他账号绑定
    if (purpose === "bind") {
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(
          isPhone ? eq(users.phone, target) : eq(users.email, target)
        )
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json(
          { error: isPhone ? "该手机号已被绑定" : "该邮箱已被绑定" },
          { status: 409 }
        );
      }
    }

    // 登录场景：检查目标是否存在
    if (purpose === "login") {
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(
          isPhone ? eq(users.phone, target) : eq(users.email, target)
        )
        .limit(1);

      if (existing.length === 0) {
        return NextResponse.json(
          { error: isPhone ? "该手机号未注册" : "该邮箱未注册" },
          { status: 404 }
        );
      }
    }

    // 检查发送频率（同一 target 60 秒内只能发一次）
    const recent = await db
      .select()
      .from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.target, target),
          eq(verificationCodes.purpose, purpose)
        )
      )
      .orderBy(verificationCodes.createdAt)
      .limit(1);

    if (recent.length > 0) {
      const elapsed = Date.now() - recent[0].createdAt.getTime();
      if (elapsed < 60_000) {
        const waitSeconds = Math.ceil((60_000 - elapsed) / 1000);
        return NextResponse.json(
          { error: `请 ${waitSeconds} 秒后再试` },
          { status: 429 }
        );
      }
    }

    // 生成验证码
    const code = generateCode();
    const hashed = hashCode(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 分钟有效

    // 存储哈希
    await db.insert(verificationCodes).values({
      target,
      codeHash: hashed,
      purpose,
      expiresAt,
    });

    // 清理该 target 的旧验证码 + 全局过期验证码
    await db
      .delete(verificationCodes)
      .where(
        and(
          eq(verificationCodes.target, target.trim()),
          eq(verificationCodes.purpose, "bind")
        )
      );
    await db
      .delete(verificationCodes)
      .where(lt(verificationCodes.expiresAt, new Date()));

    // ──── 发送验证码 ────
    const codeMessage = `【In Case】${code} is your verification code. Valid for 5 minutes.`;
    const isDev = process.env.NODE_ENV === "development";

    // HTML 邮件模板
    const emailHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0">
<tr><td align="center">
  <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06)">
    <tr>
      <td style="padding:32px 36px 0;text-align:center">
        <span style="font-size:20px;font-weight:700;color:#1a1a1a">In Case</span>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 36px 0;text-align:center;">
        <p style="font-size:14px;color:#666;margin:0;line-height:1.6">Your verification code</p>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 36px;text-align:center">
        <span style="display:inline-block;font-size:36px;font-weight:800;letter-spacing:12px;color:#059669;background:#ecfdf5;padding:14px 24px;border-radius:10px;font-family:'SF Mono','Monaco','Menlo',monospace">${code}</span>
      </td>
    </tr>
    <tr>
      <td style="padding:0 36px 32px;text-align:center">
        <p style="font-size:12px;color:#999;margin:0">
          This code expires in 5 minutes.<br>
          If you didn't request this code, you can safely ignore this email.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 36px;background:#fafafa;text-align:center">
        <p style="font-size:11px;color:#bbb;margin:0">
          In Case Digital · Your safety net, just in case.
        </p>
      </td>
    </tr>
  </table>
</td></tr>
</table>
</body>
</html>`;

    let sendResult;
    if (isPhone) {
      sendResult = await sendNotification("sms", target, codeMessage, undefined, "send-code");
    } else {
      sendResult = await sendNotification(
        "email",
        target,
        { subject: "In Case — Verification Code", body: codeMessage, html: emailHtml },
        undefined,
        "send-code"
      );
    }

    // 验证码不在生产日志中输出明文
    if (isDev) {
      console.log(`\n📱 [验证码] ${target} (${purpose}): ${code} → ${sendResult.provider}\n`);
    } else {
      console.log(`📱 [验证码] ${target} (${purpose}): → ${sendResult.provider}`);
    }

    if (!sendResult.success) {
      return NextResponse.json(
        { error: "验证码发送失败，请稍后重试" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      masked: isPhone
        ? target.slice(0, 3) + "****" + target.slice(-4)
        : target.slice(0, 3) + "***" + target.slice(target.indexOf("@")),
      expiresIn: 300,
      ...(isDev ? { code, note: "Dev 模式：验证码同时返回，生产环境不返回此字段" } : {}),
    });
  } catch (error) {
    console.error("Send code error:", error);
    return NextResponse.json(
      { error: "发送失败，请稍后重试" },
      { status: 500 }
    );
  }
}
