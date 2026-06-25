---
name: quick-reference
description: 万一呢技术栈、部署、关键链接速查
metadata:
  type: reference
---

# 速查

## 技术栈

| 层 | 技术 | 版本 |
|---|---|---|
| 框架 | Next.js (App Router) | 16.2.6 |
| UI | React + Tailwind CSS v4 + shadcn/ui | 19 / 4 / 4.8 |
| 数据库 | PostgreSQL (Supabase) + Drizzle ORM | 15 / 0.45 |
| AI | DeepSeek V4 Pro (OpenAI 兼容) | — |
| 短信 | Twilio | 6.0 |
| 邮件 | Resend | 6.12 |
| 支付 | PayPal (Orders v2 + Subscriptions v1) | — |
| 部署 | Vercel (美国东部) | — |

## 部署流程
```
git push → GitHub master → Vercel 自动构建 → demo-gamma-ten.vercel.app
```

## 关键链接
- 线上：https://in-case.me
- GitHub：https://github.com/wulongwangpeng-jpg/wanyine
- Vercel Dashboard：vercel.com → wulongwangpeng-jpgs-projects → demo
- Supabase Dashboard：supabase.com → 新加坡项目
- Resend Dashboard：resend.com → notify@in-case.me
- Cloudflare DNS：cloudflare.com → in-case.me
- Twilio Console：console.twilio.com → +18566996228
- TCR A2P Onboarding：https://console.twilio.com/us1/develop/sms/regulatory-compliance/a2p-onboarding

## 环境变量（13+1个）
全部配在 Vercel 生产环境。本地 `.env.local` 有副本。
PayPal Webhook ID 待审核后配置。

## 安全模型
- PBKDF2 + AES-256-GCM，浏览器端加密，服务端只存密文
- 纯时间戳访问控制：NOW() > lastActiveTime + safeThresholdDays
- 我们自己也打不开用户数据

## 重要文件
- 完整项目介绍：`docs/万一呢-完整项目介绍.md`
- 部署计划：`docs/deployment-plan.md`
- Pitch Deck：`docs/pitch-deck.md`
- 加密管线：`src/lib/crypto.ts`
- 通知抽象层：`src/lib/notify.ts`
- AI 客户端：`src/lib/ai-client.ts`
