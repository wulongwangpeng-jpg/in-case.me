---
name: overseas-plan-progress
description: 海外优化方案 9 项 P0-P2 + 4 项"下一步方向"完整执行进度
metadata:
  type: project
---

# 海外优化方案执行进度

来源：`docs/海外版修复方案-给DeepSeek执行.md`
上次复盘：2026-06-24

## P0-P2 执行清单（方案原文 9 项）

| # | 事项 | 方案要求 | 状态 | Git |
|:--:|------|------|:--:|-----|
| P0-1 | 语言混排 Bug | `detectLang()` + Provider 初始值尊重 `NEXT_PUBLIC_SITE_MODE` | ✅ | `51d71a0` |
| P0-2 | PayPal 丢单 | ACTIVATED 加 UUID 校验，无效返回 500 让 PayPal 重试 | ✅ | `51d71a0` |
| **P0-3** | **仓库清洗公开** | 二选一：公开并统一文案，或撤掉 "Open Source" 字样 | ❌ | — |
| P1-1 | Hero 英文文案 | Badge 三要素 + 功能性标题 + 10 分钟钩子 | ✅ | `51d71a0` |
| P1-2 | en.ts 语法错误 | 两处 `your your` → `your` | ✅ | `51d71a0` |
| P1-3 | API 缺限流 | `/api/unlock` + `/api/ai/*` 加 IP 限制 | ✅ | `51d71a0` |
| P2-1 | Renewal 标题 | `"Rough waters"` → `"Still here?"` | ✅ | `51d71a0` |
| P2-2 | 错误处理/日志 | 方案原文："现阶段不动，避免分散精力" | 🟡 | 遵嘱 |
| P2-3 | 入站 zod 校验 | 方案原文："除 P0-2 外，其余不动" | 🟡 | 遵嘱 |

**代码完成率：6/9，P2-2/P2-3 主动暂缓，P0-3 唯一未做项。**

## P0-3 矛盾现场（2026-06-24 确认仍存在）

| 文件 | 行 | 内容 | 问题 |
|------|-----|------|------|
| `src/i18n/en.ts` | 103 | `"Open Source & Auditable · GitHub"` | 宣称已开源 |
| `src/i18n/en.ts` | 148 | `"Source code will be available after official launch"` | 又说还没开 |
| `src/app/about/page.tsx` | 45 | `"Our entire codebase is on GitHub"` | 宣称代码在 GitHub |
| `src/app/about/page.tsx` | 57 | `<a href="https://github.com/...">` | 链接指向私密仓库，404 |
| `src/components/layout/footer.tsx` | 54 | `toast(t.home.openSourceSoon)` | 点击弹出"即将开源"（但与 footer 文字矛盾） |
| `src/content/blog/zero-knowledge-encryption-explained.mdx` | 107 | `[The source is on GitHub](https://github.com/...)` | 点击 404 |

**验收标准（方案原文）：**
- footer 的 GitHub 链接点进去能看到真实公开仓库，不 404
- 全站不再有"即将开源/上线后开源"与"已开源"并存的矛盾文案

## 方案原文-下一步方向（4 项，P0-P2 表之外）

| # | 原文 | 状态 |
|:--:|------|:--:|
| F1 | "先用 3 个月 / 目标 100 个付费用户验证需求，验证不过别再加功能" | 🟢 0 付费用户 |
| F2 | "获客顺序：首页文案 → Reddit 真诚答题 → SEO 博客 → Show HN" | 🟢 前 3 步完成，Show HN 被 P0-3 卡 |
| F3 | "想清楚密码丢失=数据永久丢失的产品兜底（多信使/Shamir 方案）" | 🔵 未开始 |
| F4 | "正视单人 bus factor + 终身版永久履约风险，ToS 里诚实告知" | 🔵 未开始 |

## 方案原文-执行顺序

```
① P0-1 ✅ → ② P0-2 ✅ → ③ P0-3 ❌ → ④ P1-1/2/3 ✅ → ⑤ P2-* 暂缓
```

P0-3 是唯一打断执行顺序的未完成项。

## 脱毒审计教训（2026-06-24）

脱毒前后做了三轮才干净，根因：前两轮靠 grep 搜关键词，第三轮通读才发现漏网之鱼。
**以后内容审计类任务：通读全文 > grep，搜完必须逐行验证。**

**Why:** 每次唤醒需要快速定位"海外方案到底还有哪些没做"，不用再翻原始文档。
**How to apply:** 唤醒时先读 [[project-status]]，再读本文件，得到完整未完成清单。
