---
name: pre-launch-checklist
description: 正式上线前必须完成的关键事项
metadata:
  type: project
---

# 正式上线前必做

## 🔴 密钥轮换（上线前必须）

`scripts/set-vercel-env.cjs` 曾被提交到 Git 历史（提交 `5046c4f`、`79a9d91`）。虽然后来仓库改为了私有，但为了安全起见，正式上线前应该轮换所有密钥：

| 平台 | 操作 | 新值更新到 |
|------|------|-----------|
| Twilio | 重新生成 Auth Token | Vercel 环境变量 `TWILIO_AUTH_TOKEN` |
| Resend | 创建新 API Key | Vercel 环境变量 `RESEND_API_KEY` |
| PayPal | 重新生成 Client Secret | Vercel 环境变量 `PAYPAL_CLIENT_SECRET` |
| PayPal Webhook | 重新注册 Webhook URL | Vercel 环境变量 `PAYPAL_WEBHOOK_ID` |
| DeepSeek AI | 重新生成 API Key | Vercel 环境变量 `AI_API_KEY` |
| CRON_SECRET | 更换一个更强的随机值 | Vercel 环境变量 `CRON_SECRET` |

**流程：** 先在平台生成新密钥 → 更新 Vercel 环境变量 → 确认服务正常 → 后在平台吊销旧密钥。

**为什么：** 仓库曾是公开的，Git 历史中包含了所有密钥明文。即使现在改成私有了，Git 历史里的密钥仍然存在。上线前轮换是最佳安全实践。

## 🟡 上线前确认

- [ ] 设置 `PAYPAL_PLAN_ID` 环境变量（PayPal Dashboard 找到 Plan ID → Vercel env），防止冷启动重复创建
- [ ] 确认 Vercel Cron Job 正常工作（`vercel.json` 已配置，需 Vercel Pro）
- [ ] 最终英文文案打磨
