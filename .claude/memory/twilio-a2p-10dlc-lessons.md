---
name: twilio-a2p-10dlc-lessons
description: 2026-06-17 A2P 10DLC 提交实战记录、TCR 扣费原因、表单坑、明天继续方案
metadata:
  type: feedback
---

# Twilio A2P 10DLC 提交实战记录

**日期：** 2026-06-17
**状态：** 提交中，未完成

## 结论

**中国个体工商户（统一社会信用代码）能否通过 TCR A2P 10DLC？——全网查不到案例，2026-06-17 正在真人验证中。**

## 实操过程

1. 进 Trust Hub → Customer Profiles 试图建 Primary Customer Profile → 表单要求美国地址+邮编，中国地址无法填写 → 跳过
2. 直接进 A2P Onboarding 页面注册 Brand → 选 Low-Volume Standard → Country: China → Registration ID Type: Other → 填入统一社会信用代码 92411282MAKGKCRJ71
3. 提交几次失败（地址校验/邮编格式问题）→ 再尝试多次 → 服务器限流暂停
4. **系统自动扣了 $50** — 这是 TCR（The Campaign Registry）对非预定义国家实体（China not in their pre-integrated list）自动触发的二级背调/手动审查费

## TCR 费用结构

- 品牌注册：$4（一次性）
- Low Volume Mixed Campaign：$15（一次性） + $1.50/月
- **China 实体附加费：$50**（TCR 二级背调，因为要手动查中国工商数据库）← 这笔是意外扣的

## 表单避坑

- Trust Hub Primary Customer Profile **对美国实体设计的**，中国主体跳过
- A2P Onboarding 表单的地址和邮编字段与中国格式不兼容
- 可能需要填拼音地址 + 00000 邮编绕过
- 服务器限流后需要等一段时间再试

## 明天策略

- $50 已扣，同一 Brand 注册可以无限重试
- 尝试不同地址格式（拼音 vs 英文 vs 中文）
- 如果继续失败：放弃 SMS，纯邮件通知（Resend 已通）+ Voice 保留
- 即使 A2P 彻底被拒，$50 验证了一个网上查不到的结论，不亏

## 替代方案（如果 A2P 彻底失败）

- 纯邮件通知：Resend 已配好 `notify@in-case.me`，免费版 3000 封/月
- Voice 保留：+18566996228 Voice 可用
- SMS 不是必须的 — 邮件通知体验可能更好（信使点链接直接确认）
- Toll-Free 同样会遇到 BRN 问题（2026.2 起非美国主体强制），不试了
- [[twilio-account-status]]
