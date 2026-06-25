# 海外版（in-case.me）全面体检 + 修复方案

> **本文档用途**：这是一份"方案 → 执行"的交接文档。
> 方案由 Opus 出，**执行交给 DeepSeek V4 Pro**。
> 每一项都写到"照做即可、无需自己判断"的颗粒度。
> 改完一项，把开头的 `[ ]` 改成 `[x]`，并在该项下方记一句"已改+结果"。
>
> **决策前提（已由项目主拍板）**：
> - 海外站 in-case.me **纯英文**（保留 Header 里的 EN/中 切换按钮，但默认必须是英文）
> - 体检范围：**全面**（语言 / 代码隐患 / 上线阻塞）
>
> **执行铁律（给 DeepSeek）**：
> 1. 只改本文档明确点名的文件和位置，**不要顺手重构别的**。
> 2. 每改完一个 P0/P1 项，跑一次 `npm run build` 确认不报错再继续。
> 3. 不确定的地方**停下来问项目主**，不要自己猜（这是上一轮踩过的坑）。
> 4. 涉及密钥/数据库的操作，先确认再动手。

---

## 🔴 P0-1：海外站语言混排 Bug（最高优先级，必须最先修）

### 现象
主界面中英文混排：Hero 标题/副标题是英文，但顶部导航（产品介绍/帮助/登录）、续期签到卡按钮（"一切安好，续期守护·180天"）、footer 等是中文。

### 根因（已确诊，有代码为证）
存在**两套独立的语言判断逻辑，默认值不一致**：

| 渲染层 | 文件 | 默认语言 | 结果 |
|--------|------|---------|------|
| 首页 SSR（静态部分） | `src/app/page.tsx:25-32` | `"en"` ✅ | Hero 显示英文 |
| 客户端组件（导航/续期卡/演示等） | `src/i18n/index.tsx` | `"zh"` ❌ | 这些显示中文 |

`src/i18n/index.tsx` 的 `detectLang()` 逻辑是：
`URL ?lang= → cookie → 浏览器语言 → 默认 zh`
**它完全没有读 `NEXT_PUBLIC_SITE_MODE=overseas`**，所以跟着开发者浏览器的中文偏好走，整个客户端渲染成中文。

### 修复方案

**改文件：`src/i18n/index.tsx`**

**改动点 A — `detectLang()` 函数（约第 56-76 行）**
让它优先尊重"海外站强制英文"。把原函数替换为：

```ts
function detectLang(): Lang {
  // 海外站：强制默认英文（优先级最高）
  const isOverseas = process.env.NEXT_PUBLIC_SITE_MODE === "overseas";

  if (typeof window === "undefined") return isOverseas ? "en" : "zh";

  // 1. URL 参数 ?lang=en —— 用户显式指定，永远最高优先
  const params = new URLSearchParams(window.location.search);
  const queryLang = params.get("lang");
  if (queryLang === "en" || queryLang === "zh") return queryLang;

  // 2. Cookie（用户点过切换按钮）
  const cookies = document.cookie.split("; ");
  const langCookie = cookies.find((c) => c.startsWith("lang="));
  if (langCookie) {
    const val = langCookie.split("=")[1];
    if (val === "en" || val === "zh") return val;
  }

  // 3. 海外站：不再看浏览器语言，直接英文
  if (isOverseas) return "en";

  // 4. 国内站：看浏览器语言
  const browserLang = navigator.language?.toLowerCase();
  if (browserLang?.startsWith("zh")) return "zh";
  if (browserLang?.startsWith("en")) return "en";

  // 5. 默认中文（国内站兜底）
  return "zh";
}
```

**改动点 B — Provider 初始 state 和未挂载兜底（约第 86-110 行）**
当前 `useState<Lang>("zh")` 和未挂载时 `value={{ t: zh, lang: "zh", ... }}` 写死中文。
海外站在 SSR/首帧应当是英文，否则会有"先闪一下中文再变英文"的抖动。

把初始值和兜底都改成"按 SITE_MODE 决定"：

```ts
const initialLang: Lang =
  process.env.NEXT_PUBLIC_SITE_MODE === "overseas" ? "en" : "zh";

// ...
const [lang, setLangState] = useState<Lang>(initialLang);

// 未挂载兜底处：
if (!mounted) {
  return (
    <I18nContext.Provider value={{ t: packs[initialLang], lang: initialLang, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}
```

> 注意：`NEXT_PUBLIC_` 前缀的变量在客户端可读，所以 `process.env.NEXT_PUBLIC_SITE_MODE` 在浏览器里能拿到值，放心用。

### 验收标准
- 部署后，**用中文浏览器**访问 in-case.me，**整页全英文**（导航、续期卡、footer 都英文）。
- 点 Header 的"中"按钮能切回中文，刷新后保持（cookie 生效）。
- 没有"先中文闪一下再变英文"的抖动。

- [ ] 已修复

---

## 🔴 P0-2：PayPal Webhook 可能丢订单（钱相关，必修）

### 现象/风险
`src/app/api/paypal/webhook/route.ts` 的 `BILLING.SUBSCRIPTION.ACTIVATED` 分支（约第 73-80 行）：

```ts
await db.insert(subscriptions).values({
  userId: sub.custom_id?.split("|")[0] || "unknown",  // ← 问题在这
  ...
});
```

`subscriptions.userId` 在 schema 里有外键约束（`schema.ts` references users.id）。
当 PayPal 回调里 `custom_id` 缺失/异常时，会写入 `userId: "unknown"` —— 这不是合法 UUID，**数据库插入会直接抛错**。而本文件最外层 `catch` 又 `始终返回 200`（防 PayPal 重试），结果是：**用户付了钱 → 订阅没记上 → PayPal 不再重试 → 钱收了但用户没开通**。

### 修复方案

**改文件：`src/app/api/paypal/webhook/route.ts`，`ACTIVATED` 分支内**

在插入前先校验 `custom_id` 是否含合法 userId，无效则记录错误并**主动返回非 200**（让 PayPal 重试，而不是静默吞掉）：

```ts
case "BILLING.SUBSCRIPTION.ACTIVATED": {
  const sub = event.resource;
  const subscriptionId = sub.id;
  const parts = (sub.custom_id || "").split("|");
  const userId = parts[0];
  const planId = parts[1];
  const subscriberId = sub.subscriber?.payer_id || "";

  // 校验 userId 是合法 UUID，否则这是异常事件，返回 500 让 PayPal 重试
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!userId || !uuidRe.test(userId)) {
    console.error(`[PayPal] ACTIVATED with invalid custom_id: "${sub.custom_id}", sub=${subscriptionId}`);
    return NextResponse.json(
      { error: "Invalid custom_id", subscriptionId },
      { status: 500 }   // ← 关键：非200，PayPal 会重试，不丢单
    );
  }

  // 幂等检查（保持原逻辑）
  const [existing] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.paypalSubscriptionId, subscriptionId))
    .limit(1);

  if (!existing) {
    const nextBilling = sub.billing_info?.next_billing_time
      ? new Date(sub.billing_info.next_billing_time)
      : null;
    await db.insert(subscriptions).values({
      userId,
      paypalSubscriberId: subscriberId,
      paypalSubscriptionId: subscriptionId,
      plan: (planId as "annual") || "annual",
      status: "active",
      currentPeriodEnd: nextBilling,
    });
    console.log(`✅ Subscription activated: ${subscriptionId}`);
  } else {
    console.log(`⏭  Duplicate activation ignored: ${subscriptionId}`);
  }
  break;
}
```

> ⚠️ 同时检查 `create-subscription` / `create-order` 路由，确认它们传给 PayPal 的 `custom_id` 格式确实是 `userId|planId`。如果格式不对，根因在那边，需一并核对。**DeepSeek 执行时请先读 `src/app/api/paypal/create-subscription/route.ts` 确认格式。**

### 验收标准
- PayPal Sandbox 走一遍订阅流程，订阅记录正确写入、userId 是真实 UUID。
- 构造一个 custom_id 缺失的测试事件，确认返回 500 而非静默 200。

- [ ] 已修复

---

## 🔴 P0-3：Show HN / 开源宣传的前置阻塞

### 现象（两处自相矛盾 + 一个 404 风险）
1. `src/app/layout.tsx` 和 footer 都宣传 "Open Source & Auditable · GitHub"。
2. 但 `src/i18n/en.ts:148`：`openSourceSoon: "Source code will be available after official launch"`（说还没开源）。
3. 记忆 `project-status.md` 记录：**GitHub 仓库已设为私密**。

→ 用户/HN 访客点 GitHub 链接会 404，"开源可审计"的核心信任卖点当场崩塌。

### 修复方案（这是运维 + 文案，不全是代码）
**前置（项目主操作，非 DeepSeek）**：决定是否把 `github.com/wulongwangpeng-jpg/wanyine` 改回公开。
- 若改公开 → 执行下面文案修改；
- 若暂不公开 → 把 footer 的 "Open Source & Auditable" 字样**先撤掉**，别挂羊头。

**若决定公开，改文件：`src/i18n/en.ts:148`**
```ts
openSourceSoon: "View the source on GitHub — audit our encryption yourself",
```
中译：在 GitHub 查看源码——亲自审计我们的加密
（`zh.ts` 对应键也同步改）

### 验收标准
- footer 的 GitHub 链接点进去能看到真实公开仓库，不 404。
- 全站不再有"即将开源/上线后开源"与"已开源"并存的矛盾文案。

- [ ] 已处理（需项目主先决定仓库是否公开）

---

## 🟠 P1-1：首页 Hero 文案优化（提升落地页转化）

### 现象
`src/i18n/en.ts:44-46`：
- `heroTitle: "In Case"` —— 大标题就是产品名，没回答"对用户有什么用"。
- `heroDesc` 偏抽象，纯身后事叙事，缺"现在就有用"的钩子。

### 修复方案
**改文件：`src/i18n/en.ts`**

```ts
heroBadge: "Open-source · Zero-knowledge · We can't read your data",
heroTitle: "Your family shouldn't have to guess your passwords after you're gone.",
heroDesc:
  "In Case is an encrypted vault for your accounts, assets, and final messages — shared only with the people you trust, unlocked only if you can no longer check in. Set it up in 10 minutes. Hope they never need it.",
```

中译（供项目主确认语气）：
- Badge：开源 · 零知识 · 我们读不到你的数据
- 标题：你走后，不该让家人去猜你的密码。
- 副标题：In Case 是一个加密保险库，存放你的账户、资产和想留下的话——只分享给你信任的人，只在你再也无法签到时才解锁。10 分钟设置好，但愿他们永远用不上。

> ⚠️ 注意：`heroTitle` 变长后，`page.tsx:79` 的 `<h1>` 在手机上可能换行挤压。改完在手机宽度下目测一下，必要时调 `text-3xl` 等字号。

### 验收标准
- Hero 第一眼能让英文用户 3 秒看懂"这是干嘛、关我什么事"。
- 手机/桌面下标题不溢出、不难看。

- [ ] 已修改（文案最终版需项目主拍板 A/B）

---

## 🟠 P1-2：en.ts 语法/拼写错误

### 现象
`src/i18n/en.ts:246` 和 `:259`，两处都有 `your your` 重复：
> "When your your trusted contact retrieves these..."

### 修复方案
两处都删掉一个 `your`：
> "When your trusted contact retrieves these, the platform auto-generates..."

### 验收标准
- 全文件搜索 `your your`，结果为 0。

- [ ] 已修复

---

## 🟠 P1-3：API 缺速率限制（防滥用 / 防刷费用）

### 现象
项目自述 + 代码确认：除验证码有 60s 限制外，`/api/unlock`、`/api/ai/*` 等端点**没有 IP 级速率限制**。Vercel 免费层无 WAF，被恶意扫描可能刷量、产生 AI 调用费用。

### 修复方案
- 已有 `src/proxy.ts`（Next.js 16 的 middleware 替代）。**DeepSeek 先读 `src/proxy.ts` 看现有速率限制实现到什么程度**（记忆提到 P1 已做过 proxy.ts 速率限制，需确认覆盖范围）。
- 至少要覆盖：`/api/unlock`（信使提取，敏感）、`/api/ai/*`（烧钱）。
- 简单实现：基于内存的 IP 计数（单实例够用），或 Upstash Redis 免费层（跨实例）。

> 此项需先确认现状再决定补多少，**不要盲目重写已有逻辑**。

### 验收标准
- 对 `/api/unlock` 快速连续请求会被限流（返回 429）。

- [ ] 已确认现状 / 已补充

---

## 🟡 P2-1：renewal 标题英文费解

### 现象
`src/i18n/en.ts:175`：`title: "Rough waters, keep watching"` —— "Rough waters"比喻对英文用户突兀。

### 修复方案
```ts
title: "Still here? Let your circle know.",
```
中译：还在吗？让你信任的人知道一声。

- [ ] 已修改

---

## 🟡 P2-2：错误处理 / 可观测性（上规模前再做，非阻塞）

### 现象
全项目用裸 `console.log/warn/error`，无统一 logger、无 trace id、部分端点把内部 `err.message` 直接返回客户端。

### 修复方案（非上线阻塞，记录备查）
- 上线后再做：引入轻量结构化 logger，错误对客户端只返回通用文案、详情进日志。
- 现阶段**不动**，避免分散精力。

- [ ] 暂缓（上线后处理）

---

## 🟡 P2-3：入站数据缺校验（上规模前再做）

### 现象
PayPal webhook、`/api/unlock` 等直接信任入站 JSON 结构，未用 zod 等做 schema 校验。`any` / `as any` 偏多。

### 修复方案（非阻塞，记录备查）
- 上线后：用 zod 给关键入站端点加一层解析，顺带消除 `any`。
- 现阶段除 P0-2 已点名的 webhook 校验外，其余**不动**。

- [ ] 暂缓（上线后处理）

---

## 执行顺序建议（给 DeepSeek）

1. **P0-1**（语言混排）→ 改完 `npm run build` + 本地/预览验证全英文
2. **P0-2**（PayPal 丢单）→ 改完 Sandbox 验证
3. **P0-3**（开源/仓库）→ 等项目主决定仓库是否公开
4. **P1-1 / P1-2 / P1-3**（Hero 文案 / 语法 / 限流）
5. **P2-* 全部暂缓**，上线后再说

每完成一项，更新本文件对应的 `[ ]` → `[x]` 并记结果。

---

## 下一步方向（上线后，本文档之外）

> 这部分是产品/获客方向，不是代码任务，给项目主参考：
> 1. 先用 3 个月 / 目标 100 个付费用户验证需求，验证不过别再加功能。
> 2. 获客顺序：首页文案（本方案 P1-1）→ Reddit 真诚答题 → SEO 博客 → Show HN。
> 3. 想清楚"密码丢失=数据永久丢失"的产品兜底（多信使/Shamir 方案）。
> 4. 正视单人 bus factor + 终身版永久履约风险，ToS 里诚实告知。

---

*方案生成：基于对 demo 项目的实读（crypto.ts / unlock route / schema / paypal webhook / ai-client / layout / page / header / ClientLayout / i18n / en.ts 等）。*
*所有结论有代码依据，无推测。如执行中发现与本文档描述不符，以实际代码为准并反馈。*
