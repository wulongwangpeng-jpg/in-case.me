/**
 * 通知服务
 *
 * 海外站：Twilio 短信 + Resend 邮件
 * 国内站：阿里云短信 + 阿里云邮件推送（待接入）
 * Demo 模式：环境变量未配置时自动降级为 console.log
 */

import { db, accessLogs } from "@/lib/db";
import { getStrings } from "@/i18n/server";
import twilio from "twilio";
import { Resend } from "resend";

type Lang = "zh" | "en";

// ──── Provider 初始化 ────

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const resendClient = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function isSmsLive(): boolean {
  return !!(twilioClient && process.env.TWILIO_PHONE_NUMBER);
}

function isEmailLive(): boolean {
  return !!(resendClient && process.env.RESEND_FROM);
}

// ──── 信使邀请通知 ────

export function getMessengerInviteSMS(userLabel: string, acceptUrl?: string, lang?: Lang): string {
  const t = getStrings(lang);
  return t.notify.messengerInviteSMS
    .replace("{label}", userLabel ? `（${userLabel}）` : "")
    .replace("{acceptUrl}", acceptUrl || "");
}

export function getMessengerInviteEmail(
  userLabel: string,
  acceptUrl: string,
  lang?: Lang
): { subject: string; body: string } {
  const t = getStrings(lang);
  return {
    subject: t.notify.messengerInviteEmailSubject,
    body: t.notify.messengerInviteEmailBody
      .replace("{label}", userLabel ? `（${userLabel}）` : "")
      .replace("{acceptUrl}", acceptUrl),
  };
}

// ──── 死信核验短信 ────

export function getDeadLetterSMS(lang?: Lang): string {
  return getStrings(lang).notify.deadLetterSMS;
}

export function getDeadLetterReminder24h(lang?: Lang): string {
  return getStrings(lang).notify.deadLetterReminder24h;
}

export function getDeadLetterReminder48h(lang?: Lang): string {
  return getStrings(lang).notify.deadLetterReminder48h;
}

export function getMessengerReply1SMS(lang?: Lang): string {
  return getStrings(lang).notify.messengerReply1SMS;
}

export function getMessengerReply2SMS(unlockUrl: string, lang?: Lang): string {
  return getStrings(lang).notify.messengerReply2SMS.replace("{unlockUrl}", unlockUrl);
}

export function getMessengerAutoDeliverSMS(unlockUrl: string, lang?: Lang): string {
  return getStrings(lang).notify.messengerAutoDeliverSMS.replace("{unlockUrl}", unlockUrl);
}

export function getUserRenewedByMessengerSMS(lang?: Lang): string {
  return getStrings(lang).notify.userRenewedByMessengerSMS;
}

// ──── 用户预警（阈值前提醒） ────

export function getUserPreExpiryWarning(daysRemaining: number, lang?: Lang): string {
  const t = getStrings(lang);
  return t.notify.userPreExpiryWarning.replace("{daysRemaining}", String(daysRemaining));
}

export function getUserPreExpiryWarningEmail(
  daysRemaining: number,
  appUrl: string,
  lang?: Lang
): { subject: string; body: string } {
  const t = getStrings(lang);
  return {
    subject: t.notify.userPreExpiryWarningSubject,
    body: t.notify.userPreExpiryWarningBody
      .replace("{daysRemaining}", String(daysRemaining))
      .replace("{appUrl}", appUrl),
  };
}

// ──── 发送接口 ────

export type NotifyChannel = "sms" | "email";

export interface NotifyResult {
  channel: NotifyChannel;
  target: string;
  success: boolean;
  message: string;
  provider: "twilio" | "resend" | "demo";
}

async function sendSms(target: string, content: string): Promise<{ success: boolean; message: string }> {
  if (!isSmsLive()) {
    console.log(`\n📱 [SMS DEMO → ${target}] ${content}\n`);
    return { success: true, message: "Demo: SMS output to console (TWILIO_ACCOUNT_SID not set)" };
  }

  try {
    await twilioClient!.messages.create({
      body: content,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: target,
    });
    console.log(`📱 [SMS ✓ → ${target}] sent via Twilio`);
    return { success: true, message: "SMS sent via Twilio" };
  } catch (err: any) {
    console.error(`📱 [SMS ✗ → ${target}] ${err.message}`);
    return { success: false, message: `Twilio error: ${err.message}` };
  }
}

async function sendEmail(
  target: string,
  content: { subject: string; body: string; html?: string }
): Promise<{ success: boolean; message: string }> {
  if (!isEmailLive()) {
    console.log(`\n📧 [Email DEMO → ${target}] ${content.subject}\n${content.body}\n`);
    return { success: true, message: "Demo: Email output to console (RESEND_API_KEY not set)" };
  }

  try {
    await resendClient!.emails.send({
      from: process.env.RESEND_FROM!,
      to: [target],
      subject: content.subject,
      text: content.body,
      ...(content.html ? { html: content.html } : {}),
    });
    console.log(`📧 [Email ✓ → ${target}] sent via Resend`);
    return { success: true, message: "Email sent via Resend" };
  } catch (err: any) {
    console.error(`📧 [Email ✗ → ${target}] ${err.message}`);
    return { success: false, message: `Resend error: ${err.message}` };
  }
}

export async function sendNotification(
  channel: NotifyChannel,
  target: string,
  content: string | { subject: string; body: string; html?: string },
  userId?: string,
  reason?: string,
  eventType?: string
): Promise<NotifyResult> {
  let result: { success: boolean; message: string };

  if (channel === "sms") {
    result = await sendSms(target, content as string);
  } else {
    result = await sendEmail(target, content as { subject: string; body: string });
  }

  // 记录审计日志
  if (userId) {
    try {
      await db.insert(accessLogs).values({
        userId,
        eventType: (eventType as any) || "data_delivered",
        result: result.success ? "allowed" : "denied",
        reason: reason || `${channel} notification → ${target}: ${result.message}`,
      });
    } catch {}
  }

  return {
    channel,
    target,
    success: result.success,
    message: result.message,
    provider:
      channel === "sms"
        ? isSmsLive() ? "twilio" : "demo"
        : isEmailLive() ? "resend" : "demo",
  };
}
