/**
 * POST /api/ai/compliance-guide
 *
 * 信使解密后，根据已解密的资产平台名称，
 * AI 生成各平台的合规提取 / 继承流程指引。
 * v1.1: 支持中英文双版本
 */

import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/ai-client";
import { getOrCreateUser } from "@/lib/auth";
import { getLangFromRequest } from "@/i18n/server";

const USE_DEMO = !process.env.AI_API_KEY;

function getSystemPrompt(lang: "zh" | "en"): string {
  if (lang === "en") {
    return `You are a helpful digital life assistant. Your task is to create simple, friendly guides for how to handle someone's online accounts when they can no longer manage them themselves.

CRITICAL RULES:
- NEVER use words: death, deceased, inheritance, estate, executor, fatal, died, passed away, probate, will, testament, funeral, mortal, dying
- Use instead: "when someone can't manage their accounts anymore", "on behalf of", "assisting with", "account transition", "helping a family member"
- The reader is a trusted friend/family member helping out — not a lawyer

For each platform:
1. Contact phone/website (customer service)
2. What they'll need (ID, relationship proof, etc. — keep it light, don't list "death certificate")
3. How long it usually takes
4. Any tips that make it easier

Format each as:
Platform Name
• Step 1...
• Step 2...

Tone: warm, practical, like a knowledgeable friend walking someone through it. Not legal, not cold, not institutional.`;
  }
  return `你是一个贴心的数字生活助手。你的任务是为用户整理出清晰友好的账户处理指南——当一个人因为各种原因无法亲自管理自己的网络账户时，TA所信任的人可以照着这份指南去处理。

⚠️ 绝对禁止使用以下词汇：死亡、遗产、继承、遗嘱、去世、故、丧、尸、殁、遗物、身后、阴阳相隔。也不要用「遗」「丧」「殡」等偏旁暗示。
✅ 改用：「当本人不方便亲自操作时」「代办」「账户转交」「帮家人处理」「协助办理」「账户后续事宜」

对每个平台，请提供：
1. 官方客服电话或联系入口
2. 需要准备什么（尽量轻松化表述，比如「关系证明文件」而不是「死亡证明」）
3. 大概需要多长时间
4. 有没有什么小技巧能让事情更顺利

输出格式：
【平台名】
· 第一步……
· 第二步……

语气：温暖、实用，像一个懂行的朋友在陪你一起处理，而不是冰冷的客服话术。不要加「法律建议」之类的免责声明，避免任何法律暗示。`;
}

export async function POST(req: NextRequest) {
  try {
    await getOrCreateUser(); // 认证：仅登录用户可生成指南
    const { platforms } = await req.json();

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      const lang = getLangFromRequest(req);
      const errMsg = lang === "en"
        ? "Please provide a list of platform names"
        : "请提供平台名称列表";
      return NextResponse.json({ error: errMsg }, { status: 400 });
    }

    const unique = [...new Set(platforms.filter(Boolean))] as string[];
    const lang = getLangFromRequest(req);

    // ==================== Demo 模式 ====================
    if (USE_DEMO) {
      const guide = demoGuide(unique, lang);
      return NextResponse.json({ guide, platforms: unique, demo: true });
    }

    // ==================== 真实 AI 模式 ====================
    try {
      const userMessage = lang === "en"
        ? `Please generate asset access/inheritance process guides for the following platforms:\n${unique.map((p, i) => `${i + 1}. ${p}`).join("\n")}`
        : `请为以下平台生成资产提取/继承流程指引：\n${unique.map((p, i) => `${i + 1}. ${p}`).join("\n")}`;

      const guide = await chat({
        systemPrompt: getSystemPrompt(lang),
        userMessage,
        temperature: 0.3,
        maxTokens: 3000,
      });

      return NextResponse.json({ guide, platforms: unique, demo: false });
    } catch (aiError) {
      console.warn("AI call failed, falling back to demo mode:", aiError);
      const guide = demoGuide(unique, lang);
      return NextResponse.json({ guide, platforms: unique, demo: true, fallback: true });
    }
  } catch (error) {
    console.error("Compliance guide error:", error);
    const errMsg = "Generation failed, please try again later";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

// ──── Demo 模式：内置常见平台指引 ────

function demoGuide(platforms: string[], lang: "zh" | "en") {
  if (lang === "en") {
    return generateEnglishGuide(platforms);
  }
  return generateChineseGuide(platforms);
}

function generateChineseGuide(platforms: string[]) {
  const known: Record<string, string> = {
    "支付宝": `【支付宝】
· 拨打客服 95188，选「账户管理」→「账户协助」
· 需要准备：本人身份证明、关系证明文件（如户口本）、你本人的身份证
· 根据客服指引提交材料，约 7-15 个工作日完成
· 小提示：支付宝余额、余额宝、花呗、借呗需要分别处理，跟客服一次性问清楚`,

    "微信支付": `【微信支付】
· 拨打客服 95017，按语音提示转人工
· 需要准备：本人身份证明、关系证明文件、你本人的身份证
· 通过「腾讯客服」小程序提交申请
· 约 10-20 个工作日完成`,

    "招商银行": `【招商银行】
· 拨打客服 95555，转人工说明需要代办账户业务
· 需要准备：本人身份证明、关系证明文件、相关公证书、你本人的身份证
· 携带原件前往任意网点办理
· 小提示：定期存款、理财、保险箱可能需要分别办理，建议提前打电话预约`,

    "工商银行": `【工商银行】
· 拨打客服 95588
· 所需材料同上，建议先到公证处办好公证再前往银行
· 持公证书和证件到开户行办理`,

    "建设银行": `【建设银行】
· 拨打客服 95533
· 流程和招行类似，建议提前问清楚是否需要预约`,

    "中国银行": `【中国银行】
· 拨打客服 95566
· 流程和招行类似`,

    "Steam": `【Steam】
· Steam 的官方政策：账号和内容是个人专属的，不能直接转交
· 但可以联系客服 support@steampowered.com 说明情况
· 如果你能提供账号相关信息（购买记录、支付凭证），他们可能会协助
· 小提示：如果能提前知道账号密码和 Steam Guard 会更顺利`,

    "Apple": `【Apple / iCloud】
· 访问 Apple 的专属页面：digital-legacy.apple.com
· 如果对方提前设置了遗产联系人，你会收到一个专门的访问密钥
· 如果没有设置：需要提供本人身份证明和相关法律文件
· 客服电话：400-666-8800`,

    "Google": `【Google 账户】
· 访问 Google 的闲置账户管理页面
· 如果对方提前设了闲置账户联系人，系统会按设定时间通知你
· 如果没有设置：需要通过法律途径申请，Google 不提供直接的账户访问服务
· 小提示：建议提醒身边人提前设好闲置账户联系人`,

    "Microsoft": `【Microsoft / Outlook】
· 联系客服：support.microsoft.com
· 需要：本人身份证明和相关法律文件
· 支持亲属提交申请协助处理账户`,

    "抖音": `【抖音】
· 打开抖音 App → 我 → 右上角三条杠 → 设置 → 反馈与帮助
· 搜索「账号协助」或联系在线客服
· 需要准备：本人身份证明、你本人的身份证、关系证明
· 小提示：如果账号还在运营中，可以先保留下来继续做`,

    "梦幻西游": `【梦幻西游】
· 访问网易游戏客服中心：gm.163.com
· 选择梦幻西游 → 账号问题 → 在线客服
· 需要准备：账号绑定的手机号或邮箱、身份验证信息
· 小提示：如果账号绑定了手机号，可以通过手机验证快捷处理`,
  };

  const results: string[] = [];
  for (const p of platforms) {
    const key = Object.keys(known).find((k) => p.includes(k) || k.includes(p));
    if (key) {
      results.push(known[key]);
    } else {
      results.push(`【${p}】
· 搜索「${p} 账号代办」或「${p} 客服电话」查找官方帮助文档
· 拨打官方客服电话直接咨询——他们每天都会接到类似的请求，不用紧张
· 通常需要准备：本人身份证明、关系证明、你的身份证`);
    }
  }

  return `═══ 账户处理参考（信息来自公开资料，具体方式以官方最新说明为准）═══\n\n${results.join("\n\n---\n\n")}\n\n💡 上面这些平台都有专门的客服团队处理这类情况。打电话的时候不用紧张，直接说「我需要帮一位家人办理账户后续事宜」就行——他们知道该怎么做。`;
}

function generateEnglishGuide(platforms: string[]) {
  const known: Record<string, string> = {
    "PayPal": `[PayPal]
· Contact support via help.paypal.com
· They'll ask for: your ID, documentation showing your relationship, and relevant account details
· PayPal will assist with transferring the remaining balance to you
· Usually takes 10-30 business days`,

    "Venmo": `[Venmo]
· Contact Venmo support through the app or venmo.com
· Similar process to PayPal (same company)
· They'll need your ID and relationship documentation`,

    "Chase": `[Chase Bank]
· Call 1-800-935-9935 or visit any branch
· They'll ask for: your photo ID and court documentation
· Joint accounts typically transfer directly
· Individual accounts require documentation — call ahead to confirm what's needed`,

    "Bank of America": `[Bank of America]
· Call Estate Servicing: 1-888-689-4466
· Needed: your ID, tax ID for the estate, court documentation
· Accounts with named beneficiaries transfer directly
· Usually 7-14 business days after all documents received`,

    "Wells Fargo": `[Wells Fargo]
· Call Estate Care Center: 1-877-445-3659
· They'll need: relevant documentation and your ID
· Safe deposit boxes have separate procedures — ask when you call`,

    "Steam": `[Steam]
· Steam accounts are personal and can't be formally transferred
· But you can email support@steampowered.com explaining the situation
· If you have purchase history or payment records, that helps a lot
· Tip: having the account password and Steam Guard info makes everything easier`,

    "Apple": `[Apple / iCloud]
· Visit digital-legacy.apple.com
· If a Legacy Contact was set beforehand, you'll have a dedicated access key
· If not: contact 1-800-275-2273 or visit an Apple Store with relevant documentation`,

    "Google": `[Google Account]
· Visit Google's Inactive Account Manager settings page
· If the person set you as a contact there, Google will reach out to you directly
· If not: court documentation is needed
· Tip: it's worth setting up Inactive Account Manager before it's needed`,

    "Instagram": `[Instagram]
· Instagram offers two paths: memorialize or close the account
· Submit a request at help.instagram.com with documentation
· Memorialized accounts stay visible — no one logs in, but the posts remain`,

    "Facebook": `[Facebook]
· Visit facebook.com/help/contact for account management
· If a Legacy Contact was set, they can help manage the account
· Otherwise, verified family can request account closure`,

    "Twitter/X": `[Twitter/X]
· Submit a request via help.twitter.com
· They'll need: your government ID and documentation showing your authority
· Usually processed in 5-10 business days`,

    "Dropbox": `[Dropbox]
· Email support@dropbox.com
· With proper documentation, they can assist with file access
· Tip: shared folder links set up beforehand make this much smoother`,

    "Coinbase": `[Coinbase]
· Contact via help.coinbase.com
· They'll need: your government ID and court documentation
· Crypto transfers require verification — expect 4-8 weeks`,

    "Discord": `[Discord]
· Submit a request via support.discord.com
· They'll need documentation showing your relationship
· Standard accounts can be closed; partner accounts may have additional considerations`,

    "TikTok": `[TikTok]
· In-app: Profile → Settings → Report a Problem → Account
· Or visit tiktok.com/legal/report
· They'll guide you through what's needed based on the situation`,
  };

  const results: string[] = [];
  for (const p of platforms) {
    const key = Object.keys(known).find((k) => p.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(p.toLowerCase()));
    if (key) {
      results.push(known[key]);
    } else {
      results.push(`[${p}]
· Search "${p} account support" or "${p} customer service" for official help
· Call their customer service line — they handle these situations regularly
· Generally you'll need: your ID and documentation showing your relationship`);
    }
  }

  return `═══════════════════════════════════════════\n  Account Access Reference\n  (Check official channels for the latest info)\n═══════════════════════════════════════════\n\n${results.join("\n\n---\n\n")}\n\n💡 Every platform above has a team dedicated to helping people through these situations. When you call, just say "I need to help a family member with their account" — they'll know what to do.`;
}
