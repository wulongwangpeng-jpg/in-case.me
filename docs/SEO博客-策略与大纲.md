# SEO 博客 — 内容营销策略

> 目标：用实用、诚实的内容获取自然搜索流量，
> 每篇文章最后自然引向 In Case，不做硬广。

---

## 关键词矩阵

| 搜索意图 | 关键词 | 月搜索量（估） |
|------|------|:--:|
| 问题认知 | "what happens to my accounts when I die" | 高 |
| 品类搜索 | "digital estate planning tool" | 中 |
| 技术搜索 | "dead man's switch encrypted" | 中 |
| 安全搜索 | "zero knowledge encryption explained" | 低 |
| 场景搜索 | "password inheritance for family" | 低 |
| 对比搜索 | "self-hosted vs SaaS dead man's switch" | 低 |

---

## 📝 第一篇（主推）

### 标题：What Happens to Your Digital Accounts When You Die? (And How to Prepare)

**目标关键词**：what happens to digital accounts after death, digital legacy

**角度**：实用指南，不是产品推销。先列出各平台的原生工具（Google/Apple/Facebook），再指出这些工具的局限性（各管各的、不跨平台），最后轻提"如果需要一站式方案"。

**提纲**：

1. The numbers nobody talks about — 10.8 亿中国网民、平均 20+ 账户（改编为中英文通用数据）
2. What each platform offers（表格）
   - Google Inactive Account Manager
   - Apple Legacy Contact
   - Facebook Memorialization
   - Instagram / Twitter / LinkedIn
3. The three gaps these tools don't cover
   - 它们不跨平台（你得在每个平台分别设）
   - 它们不覆盖非平台资产（加密钱包、域名、云服务）
   - 联系人不知道你设了什么（除非你告诉他们）
4. What a "digital estate plan" actually needs
   - 资产清单
   - 处置说明
   - 安全传递机制
5. How to start（行动清单）
   - 今天：写下所有平台名称
   - 本周：在每个平台设遗产联系人
   - 额外一步：考虑加密保险库

**CTA**："If you want a single place that covers everything — including the platforms that don't have built-in legacy tools — that's what we built at In Case."

---

## 📝 第二篇

### 标题：Self-Hosted vs SaaS Dead Man's Switch: An Honest Comparison

**目标关键词**：dead man's switch comparison, self-hosted vs SaaS

**角度**：客观对比，两头都不踩。读者大部分是技术人，这篇要写得像架构 doc 而不是营销文。

**提纲**：

1. What's a dead man's switch and why you might want one
2. The self-hosted approach（Afterkey / LastSignal / Aeterna）
   - Pros：完全控制、零第三方信任
   - Cons：服务器运维、域名续费、信用卡过期、家人不会修
3. The SaaS approach（In Case / Cipherwill）
   - Pros：零运维、联系人只需点链接
   - Cons：信任第三方、公司可能倒闭
4. The third way：USB/physical（DeadSwitch）
5. How to decide（决策树）
6. CTA：轻提 In Case

---

## 📝 第三篇

### 标题：Zero-Knowledge Encryption Isn't Magic — Here's How It Actually Works

**目标关键词**：zero knowledge encryption explained, how does AES-256-GCM work

**角度**：纯教育。用 plain English 解释 PBKDF2 + AES-256-GCM + 浏览器端加密。读完的人会自然相信零知识架构。

**提纲**：

1. "We can't read your data" — what that actually means
2. The three steps（用信封比喻）
   - PBKDF2：把你的密码变成密钥
   - AES-256-GCM：用密钥锁上内容
   - 只上传密文：服务器只能看到乱码
3. What happens if the database is hacked？（拿到的是密文，没密钥解不开）
4. What happens if you forget your password？（数据永久丢失——这是代价）
5. Why this matters for digital legacy tools
6. CTA："At In Case, this is exactly how we built our encryption pipeline. Here's our source code."

---

## 🛠️ 技术实现

Next.js App Router 建 `/blog` 路由，MDX 写文章。结构：

```
src/app/blog/
├── page.tsx           # 文章列表
├── layout.tsx         # Blog layout
└── [slug]/
    └── page.tsx       # 单篇文章（MDX）
```

每篇文章是 `src/content/blog/*.mdx`，frontmatter 包含 title / description / date / keywords。

---

## ⚡ 执行节奏

| 时间 | 动作 |
|------|------|
| 今天 | 第一篇出稿 + blog 路由建好 |
| 本周 | 第一篇上线，第二篇出稿 |
| 下周 | 第二篇上线，第三篇出稿 |
| 持续 | 每 2-4 周一篇，等 SEO 爬取（3-6 个月见效） |
