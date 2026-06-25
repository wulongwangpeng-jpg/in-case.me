---
name: acquisition-strategy
description: 海外获客策略：Reddit 答题 → SEO 博客 → Show HN → Product Hunt
metadata:
  type: project
---

# 获客策略

**建立时间：** 2026-06-23
**来源：** 海外优化方案"下一步方向" + 实际执行反馈
**原则：** 先回答问题再顺带提产品，不硬推，不自己开广告帖

## 获客顺序

```
首页文案 ✅ → Reddit/HN 真诚答题 🟢 → SEO 博客 🟢 → Show HN 🔴 → Product Hunt 🔴
```

| 阶段 | 状态 | 关键产出 |
|------|:--:|------|
| ① 首页文案 | ✅ | Hero Badge/Title/Desc 功能性英文文案已上线 |
| ② Reddit 答题 | 🟢 | 已发 2 条评论，5 份草稿库就绪 |
| ③ SEO 博客 | 🟢 | 路由+sitemap+Header入口全自动，5篇已上线，Search Console已验证 |
| ④ Show HN | 🔴 阻塞 | 需先仓库清洗公开 |
| ⑤ Product Hunt | 🔴 阻塞 | 需先完成 ②③④ |

## 已发评论追踪

| 平台 | 帖子 | 回复谁 | 日期 | 反馈 |
|------|------|------|------|------|
| Reddit r/HomeServer | "Here's why I've installed a Dead Man's Switch..." (472票/53评论) | 8fingerlouie (39票) | 6/23 | 待观察 |
| Reddit r/opensource | "I built LastSignal..." (566票/94评论) | GreenFox1505 (8票) | 6/23 | 待观察 |

**加速收录技巧：** 下次 Reddit 回复时随手贴博客链接，Google 发现高权重外链会优先来爬。

## 竞品分析

| 竞品 | 加密 | 部署 | 致命弱点 |
|------|------|------|------|
| **LastSignal** | XChaCha20+Argon2id | 自建 Docker | 服务器谁续费？家人不会维护 |
| **Afterkey** | AES-256+Shamir | CLI | 家人会敲终端吗 |
| **DeadSwitch** | AES-256-GCM | USB | 物理介质丢失/损坏 |
| **Cipherwill** | AES-256 | SaaS | HN 用户质疑安全模型 |
| **PingVaults** | AES-256 | SaaS+Arweave | 较新 |

## In Case 差异化一句话

> 唯一一个纯网页端零知识工具，信使只需点链接即可解密——不需要装软件、敲终端、插 USB、管服务器。

## 评论草稿库

见 `F:\demo\docs\获客-评论草稿.md` — 5 份草稿覆盖不同场景：
- 草稿 A：CLI 工具家人用不了
- 草稿 B：USB 方案丢失风险
- 草稿 C：SaaS 信任问题
- 草稿 D：通用推荐问答
- 草稿 E：Show HN 主帖（待仓库公开）

## SEO 博客

见 `F:\demo\docs\SEO博客-策略与大纲.md` — 策略+3篇大纲
见 `F:\demo\src\content\blog\` — 5 篇文章已上线：

| # | 文件 | 定位 |
|---|------|------|
| 1 | `what-happens-to-digital-accounts.mdx` | 平台原生工具实用指南 |
| 2 | `self-hosted-vs-saas-dead-mans-switch.mdx` | 技术人向诚实对比 |
| 3 | `zero-knowledge-encryption-explained.mdx` | 加密原理科普 |
| 4 | `when-accounts-dont-know-youre-gone.mdx` | 真实案例（Steam/Instagram/抖音/梦幻西游） |
| 5 | `digital-asset-inventory-checklist.mdx` | 10 大类清单模板 |

**自动运转：** 新文章丢 `src/content/blog/` → URL 自动生成 → sitemap 自动更新 → Google 自动来爬
**加速收录：** Search Console 已验证+提交，下次 Reddit 回复贴链接
**目标：** 扩充至 8-10 篇，3-6 个月见搜索流量

**Why:** 方案明确指出"先 Reddit 建立存在感 → SEO 博客养流量 → 再 Show HN/PH"。直接冲 PH 会冷场。
**How to apply:** 按顺序推进，每阶段完成后评估数据再决定下一步。
