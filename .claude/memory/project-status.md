---
name: project-status
description: 万一呢当前阻塞事项和下一步可做的任务
metadata:
  type: project
---

# 当前状态

**版本：** v1.3 已上线
**线上：** https://in-case.me
**英文品牌：** In Case
**GitHub：** https://github.com/wulongwangpeng-jpg/wanyine（私密仓库）
**今天日期：** 2026-06-24
**上次更新：** 2026-06-24（第三轮博客脱毒 + 首页 meta 脱毒 + 海外方案执行进度全面复盘）

## ✅ 2026-06-23 已完成 — 海外方案 P0-P2 修复

| # | 事项 | 文件 | Git |
|:--:|------|------|-----|
| P0-1 | 语言混排修复 | `src/i18n/index.tsx` — `detectLang()` 和 Provider 初始值尊重 `NEXT_PUBLIC_SITE_MODE` | `51d71a0` |
| P0-2 | PayPal 丢单修复 | `src/app/api/paypal/webhook/route.ts` — ACTIVATED 加 UUID 校验，无效返回 500 | `51d71a0` |
| P1-1 | Hero 英文文案 | `src/i18n/en.ts` — Badge/Title/Desc 三行功能性文案 | `51d71a0` |
| P1-2 | 语法错误 | `src/i18n/en.ts` — 两处 `your your` → `your` | `51d71a0` |
| P1-3 | AI 端点限流 | `src/proxy.ts` — `/api/ai/*` 10 req/60s/IP | `51d71a0` |
| P2-1 | Renewal 标题 | `src/i18n/en.ts` — `Rough waters` → `Still here? Let your circle know.` | `51d71a0` |

海外方案 P0~P2 代码部分：**6/9 完成**，P2-2/P2-3 按方案原文"暂缓"，P0-3 未做。

## ✅ 2026-06-23 — 获客冷启动

| 动作 | 平台 | 详情 | 状态 |
|------|------|------|:--:|
| 评论草稿库（5份） | — | `docs/获客-评论草稿.md` | ✅ |
| 第一条评论 | Reddit r/HomeServer | 回复 8fingerlouie（39票） | ✅ |
| 第二条评论 | Reddit r/opensource | 回复 GreenFox1505（8票） | ✅ |
| LastSignal 竞品分析 | — | XChaCha20+Argon2id，自建 Docker | ✅ |

## ✅ 2026-06-23 — SEO 博客基础设施

| 产出 | 位置 | 状态 |
|------|------|:--:|
| Blog 路由 + MDX 渲染 | `src/app/blog/` + `src/mdx-components.tsx` | ✅ |
| Sitemap | `src/app/sitemap.ts` — 自动扫描 `src/content/blog/` | ✅ |
| Header/Footer 入口 | 导航栏 + 法律链接区 "Blog" | ✅ |
| Google Search Console | 已验证 `in-case.me`，sitemap 已提交 | ✅ |

## ✅ 2026-06-24 — 博客脱毒（共三轮）

### 第一轮：博客正文脱毒
| 事项 | Git |
|------|-----|
| GFM 表格修复（remark-gfm + tr/tbody） | `abb856e` |
| 5 篇正文脱毒 + 清单表结构重做 | `c81b86a` |
| 博客列表页 metadata 脱毒 | `ce43dfd` |

### 第二轮：首页 meta + 源码附属文案脱毒
| 文件 | 改动 | Git |
|------|------|-----|
| `src/app/layout.tsx` | title/OG/Twitter + keywords `Digital Legacy` → `Digital Safety Net` | `a87feae` |
| `src/lib/paypal.ts` | 订阅描述脱毒 | `a87feae` |
| `src/app/api/auth/send-code/route.ts` | 邮件页脚脱毒 | `a87feae` |

### 第三轮：博客正文深层脱毒（通读，非 grep）
| 文件 | 改动（gone/dies/dead/death/killed → 替换） | Git |
|------|------|-----|
| `what-happens-to-digital-accounts.mdx` | `"I'm gone"` → `"I can't log in"` | `d618aca` |
| `when-accounts-dont-know-youre-gone.mdx` | `dies with them` → `locked forever`，`was killed` → `passed away` | `d618aca` |
| `digital-asset-inventory-checklist.mdx` | 10 处表格单元格 gone→inaccessible/locked，dies→locks，dead→cancel | `d618aca` |
| `zero-knowledge-encryption-explained.mdx` | `data is gone` → `data is unrecoverable` | `d618aca` |
| `self-hosted-vs-saas-dead-mans-switch.mdx` | `privacy is gone` → `privacy is broken` | `d618aca` |

**保留未动：** SEO 关键词（frontmatter）、专有名词（`Apple Legacy Contact`、`death certificate`）、术语元讨论。

### 脱毒对照表

| 旧用词 | 新用词 |
|--------|--------|
| When You're Gone | When You Can't Log In |
| Dead Man's Switch | Digital Safety Net / Check-in Switch |
| Digital Legacy | Digital Safety Net |
| gone / dies / dead / death / killed（正文） | inaccessible / locked / passed away / unrecoverable |
| fear-mongering | （删除） |

### 博客当前标题（脱毒后）

| # | 文件 | 标题 |
|---|------|------|
| 1 | `what-happens-to-digital-accounts.mdx` | What Happens to Your Digital Accounts When You Can't Log In? |
| 2 | `self-hosted-vs-saas-dead-mans-switch.mdx` | Self-Hosted vs SaaS Digital Safety Net: Which One Actually Works? |
| 3 | `zero-knowledge-encryption-explained.mdx` | Zero-Knowledge Encryption Isn't Magic |
| 4 | `when-accounts-dont-know-youre-gone.mdx` | Your Accounts Won't Know You Can't Log In |
| 5 | `digital-asset-inventory-checklist.mdx` | The Complete Digital Asset Inventory Checklist (2026) |

---

## 🔴 当前阻塞 — P0-3 仓库清洗公开

来源：`docs/海外版修复方案-给DeepSeek执行.md`

**矛盾现场（6 处）：**

| 文件 | 内容 | 问题 |
|------|------|------|
| `src/i18n/en.ts:103` | `"Open Source & Auditable · GitHub"` | 宣称已开源 |
| `src/i18n/en.ts:148` | `"Source code will be available after official launch"` | 又说还没开 |
| `src/app/about/page.tsx:45` | `"Our entire codebase is on GitHub"` | 宣称代码在 GitHub |
| `src/app/about/page.tsx:57` | 直接链接到私密仓库 | 点进去 404 |
| `src/components/layout/footer.tsx:54` | 点 GitHub 弹 toast "即将开源" | 与 footer 文字矛盾 |
| `src/content/blog/zero-knowledge-encryption-explained.mdx:107` | `"The source is on GitHub"` 带链接 | 点进去 404 |

**二选一：** ① 清洗仓库 → 改公开 → 统一文案为"已开源"；② 暂不公开 → 撤掉所有 "Open Source" 字样。

**阻塞原因：** 仓库不公开 → Show HN 发不了 → Product Hunt 更上不去。获客路线后半段全停。

## 📋 海外方案完整执行进度（逐条对照）

详见 [[overseas-plan-progress]]

## 📋 下一步（按优先级排序）

### 🔴 阻塞

| # | 事项 | 来源 | 备注 |
|---|------|------|------|
| 1 | **P0-3 仓库清洗公开** 或撤掉 "Open Source" 字样 | 海外方案 | 二选一，卡死 Show HN |

### 🟢 日常推进

| # | 事项 | 来源 | 备注 |
|---|------|------|------|
| 2 | Search Console 重新索引 | 今日脱毒 | 用户手动操作：7 个 URL 逐个请求编入索引 |
| 3 | 查看 Reddit 两条评论有无新回复 | F2 获客 | 浏览器手动打开，技术问题及时跟进 |
| 4 | 再发一条 Reddit 评论，贴博客链接 | F2 + SEO | 草稿库 5 份就绪，外链加速收录 |
| 5 | 扩充博客至 8-10 篇 | SEO | 选题：平台迁移指南、隐私法规、密码管理器对比 |
| 6 | Paddle 注册备用支付 | 原计划 | support@in-case.me 已配好，合规页面已建好，差 KYC |

### 🟡 暂缓（方案原文明确说上线前不动）

| # | 事项 | 来源 | 原文 |
|---|------|------|------|
| 7 | P2-2 错误处理/结构化日志 | 海外方案 | "现阶段不动，避免分散精力" |
| 8 | P2-3 入站 zod 校验/消 `any` | 海外方案 | "除 P0-2 外，其余不动" |

### 🔵 远期（方案原文"下一步方向"）

| # | 事项 | 来源 |
|---|------|------|
| 9 | F3 密码丢失兜底 — 多信使/Shamir 密钥分割 | 海外方案 |
| 10 | F4 单人 bus factor + 终身版履约风险 → ToS | 海外方案 |
| 11 | 目标 100 付费用户验证需求（F1） | 海外方案 |
| 12 | WebAuthn 登录 | 项目原计划 |

### 🎯 获客路线

```
首页文案 ✅ → Reddit 答题 🟢 → SEO 博客 🟢 → Show HN 🔴 → Product Hunt 🔴
                                      ↑ P0-3 卡在这里
```

---

## ⚠️ 已知坑

| 坑 | 现象 | 解决 |
|------|------|------|
| Supabase 免费计划 inactivity 暂停 | 所有 API 500，守护天数消失 | Supabase Dashboard → Resume project。90天后需升级 |
| TCR 中国工商数据查询收费 | A2P 10DLC 提交时扣 $50 | 已扣费，同一 Brand 可无限重试 |
| Outlook 发中文乱码 | 中文公司名在 Outlook 乱码 | 用拼音或 UTF-8 编码 |
| Email-to-SMS 运营商网关 | 2025-2026 美国三大运营商全关了 | 不可用 |
| Vercel 构建静默失败 | TypeScript 错误本地不报但 build 失败 | 养成 `next build` 验证习惯 |
| 网络波动 git push 偶发超时 | GitHub 443 端口间歇不通 | 等几分钟重试，或用户自己终端推 |

## 💡 工作教训

- **grep 搜关键词 ≠ 通读** — 脱毒类审计必须逐行读正文，搜词会漏掉引号包裹、表格单元格、段中嵌词
- **全站 grep 后再报"完"** — 源码（layout/组件/i18n）和内容（.mdx）都要扫，不能只扫一个目录
- **完工后 commit + push**，本地有等于没有
- **完工后主动说"还差什么才能生效"**，不让用户追问
- **Google 收录要催** — sitemap 是被动等，Search Console 是主动敲门
- **铁律（去晦气）补充**：博客正文里的 gone/dies/dead/death/killed 跟标题一样要清，只有 frontmatter SEO 关键词和专有名词（`Apple Legacy Contact`/`death certificate`）可以留

## 双市场

| | 海外站 | 国内站 |
|---|---|---|
| 域名 | in-case.me | in-case.cn |
| 模式 | 纯付费（$23/年，$198终身） | 完全免费 |
| 部署 | Vercel + Supabase | 阿里云（待建） |
| 支付 | PayPal ✅ | 无 |
| 通知 | 邮件（Resend ✅）+ SMS（Twilio A2P 🔴） | 未建 |
