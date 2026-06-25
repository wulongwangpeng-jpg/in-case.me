/**
 * Demo 模式 AI 模拟器 — 中英文双版本
 * 无需 API Key，提供真实的对话体验用于：
 * - 开发调试 / 产品演示 / UI/UX 测试
 * v1.1: 支持 en/zh 双语言，平台列表按地区本地化
 */

import type {
  InventoryAnalysis,
  LetterDraft,
  WishlistAnalysis,
} from "@/types";

type Lang = "zh" | "en";

// ============================================================
// 对话状态追踪
// ============================================================

const conversationStates = new Map<
  string,
  { stage: string; turnCount: number; context: string[] }
>();

function getOrCreateState(
  sessionId: string
): { stage: string; turnCount: number; context: string[] } {
  if (!conversationStates.has(sessionId)) {
    conversationStates.set(sessionId, {
      stage: "start",
      turnCount: 0,
      context: [],
    });
  }
  return conversationStates.get(sessionId)!;
}

async function delay(ms = 800): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms + Math.random() * 600));
}

// ============================================================
// 公共接口
// ============================================================

export type DemoAction = "start" | "chat" | "regenerate";

export interface DemoResponse {
  message: string;
  assets?: InventoryAnalysis["assets"];
  summary?: string;
  suggestions?: string | string[];
  done?: boolean;
  draft?: string;
  tone?: string;
  items?: WishlistAnalysis["items"];
  nextStep?: string;
  topPriority?: WishlistAnalysis["topPriority"];
}

// ============================================================
// ❶ 资产盘点 Demo
// ============================================================

function getInventoryConversation(lang: Lang): Record<string, { message: string; nextStage: string }> {
  if (lang === "en") {
    return {
      start: {
        message: `Hey there 👋

It takes courage to do this — to pause and really think about what your digital life will leave behind. That's genuinely admirable.

Before we dive in, let me ask a simple question:

**Which app or platform do you spend the most time on?**

(Instagram? TikTok? YouTube? Steam? Discord? Just name one — no pressure.)`,
        nextStage: "ask_category",
      },
      ask_category: {
        message: `Got it! Let's go from there —

Pick a category you'd like to start with:

📱 **Social Media** — Instagram, Twitter/X, TikTok, Facebook, Discord, LinkedIn…
💰 **Finance & Payments** — PayPal, Venmo, banking apps, Robinhood, Coinbase…
🎮 **Entertainment** — Steam, Epic Games, Netflix, Spotify, Google Drive, iCloud…
✍️ **Creative Work** — YouTube, Substack, Medium, Patreon, podcast, portfolio…
📦 **Other** — Domains, crypto, photo libraries, email accounts, subscriptions…

Where do you want to start?`,
        nextStage: "inventory_social",
      },
      inventory_social: {
        message: `Great, let's start with social media!

Let's go one by one. **Instagram** — your main account. What would you want to happen with it?

• Transfer to family or a friend?
• Memorialize (keep visible but frozen)?
• Delete entirely?
• Or… not sure yet?

(No pressure — "not sure yet" is perfectly fine.)`,
        nextStage: "inventory_social_2",
      },
      inventory_social_2: {
        message: `Got it. What about **Twitter/X**? Your account there — would you say it's mainly for —

• Sharing your own thoughts and life?
• Consuming content from others?
• Or more of a creative/business outlet?

This affects how to handle it.`,
        nextStage: "inventory_payment",
      },
      inventory_payment: {
        message: `Good, I've noted all that. Now the money stuff 💰

**PayPal and your banking apps** — these involve real identity. Who would you trust to handle them?

Most people choose their closest family member. What about you?`,
        nextStage: "inventory_entertainment",
      },
      inventory_entertainment: {
        message: `Noted ✍️ Now the fun stuff —

Do you game? Steam, Epic, PlayStation, Switch, mobile games… any accounts you'd genuinely care about?

("My Steam library is worth a fortune" or "I've been building this Minecraft world for years" 😄)`,
        nextStage: "inventory_other",
      },
      inventory_other: {
        message: `Ha, I get it! What about —

• Cloud storage (Google Drive, Dropbox, iCloud — photos, documents)
• Email accounts (Gmail, Outlook)
• Subscriptions (Netflix, Spotify, Disney+, cloud services)

Anything in there that feels important?`,
        nextStage: "summary",
      },
      summary: {
        message: null as unknown as string,
        nextStage: "done",
      },
    };
  }

  // zh (default)
  return {
    start: {
      message: `嗨 👋 你来了。

做这件事需要一点勇气——愿意停下来，认真想想「我的数字生活会留下什么」。这很了不起。

在开始之前，我想先问一个简单的问题：

**你平时花时间最多的 App 或平台是哪一个？**

（比如微信、抖音、小红书、B站、Steam……随便说一个就好）`,
      nextStage: "ask_category",
    },
    ask_category: {
      message: `我了解了！那我们从这个方向开始——

你可以从这些类别里选一个最想先整理的：

📱 **社交媒体** — 微信、微博、小红书、抖音、QQ…
💰 **支付/金融** — 支付宝、银行App、证券…
🎮 **娱乐资产** — 游戏账号、视频会员、网盘…
✍️ **创作资产** — 公众号、B站频道、博客…
📦 **其他** — 域名、加密货币、相册…

你想先梳理哪一类？`,
      nextStage: "inventory_social",
    },
    inventory_social: {
      message: `好的，先从社交媒体开始！

我们一个个来。**微信**——你最主要的微信号，你希望它以后怎么处理？

• 转给家人/朋友继续用？
• 纪念化（保留但不登录）？
• 直接注销？
• 或者……还没想好？

（不用有压力，选「还没想好」也完全OK）`,
      nextStage: "inventory_social_2",
    },
    inventory_social_2: {
      message: `明白了。那**小红书**呢？你的账号主要是用来——

• 发自己的生活分享？
• 看别人的内容为主？
• 还是做内容创作？

这会影响怎么处理它。`,
      nextStage: "inventory_payment",
    },
    inventory_payment: {
      message: `好，社交媒体这边先记下了。接下来是钱相关的 💰

**支付宝和微信支付**——这些涉及实名的支付账号，你希望谁来处理？

大多数人会选择最信任的家人。你呢？`,
      nextStage: "inventory_entertainment",
    },
    inventory_entertainment: {
      message: `记下了 ✍️ 我们再来看看好玩的——

你玩不玩游戏？Steam、Switch、手游（王者/原神/蛋仔）……有没有哪个账号是你特别珍视的？

（比如「我的Steam库存值好几千」或者「我的王者皮肤不能浪费」😄）`,
      nextStage: "inventory_other",
    },
    inventory_other: {
      message: `哈哈，了解！那手机上还有——

• 网盘（百度网盘/阿里云盘里的照片、文档）
• 邮箱（QQ邮箱/163/Gmail）
• 各种会员订阅（视频/音乐/云服务）

这些里面有没有你觉得特别重要的？`,
      nextStage: "summary",
    },
    summary: {
      message: null as unknown as string,
      nextStage: "done",
    },
  };
}

function generateInventorySummary(_userMessages: string[], lang: Lang): {
  assets: InventoryAnalysis["assets"];
  summary: string;
  suggestions: string;
} {
  if (lang === "en") {
    return {
      assets: [
        { id: "1", category: "social", platform: "Instagram", accountName: "Main account", action: "transfer", notes: "" },
        { id: "2", category: "social", platform: "Twitter/X", accountName: "Personal account", action: "memorialize", notes: "" },
        { id: "3", category: "social", platform: "TikTok", accountName: "8-year-old account", action: "memorialize", notes: "" },
        { id: "4", category: "payment", platform: "PayPal", accountName: "Verified account", action: "transfer", notes: "" },
        { id: "5", category: "payment", platform: "Venmo", accountName: "Regular transfers", action: "transfer", notes: "" },
        { id: "6", category: "entertainment", platform: "Steam", accountName: "100+ games library", action: "transfer", notes: "Library worth ~$400" },
        { id: "7", category: "entertainment", platform: "Google Drive", accountName: "Photos + documents backup", action: "transfer", notes: "Family photos, ~50GB" },
        { id: "8", category: "other", platform: "Gmail", accountName: "Primary email", action: "undecided", notes: "" },
      ],
      summary: "Look at that — you've left footprints across at least 8 platforms. Some hold memories, some hold money, some are just habits — but they're all traces of a life lived digitally. Feels a bit more organized now, doesn't it?",
      suggestions: "Consider sharing this inventory with someone you trust, and updating it every six months. Some platforms have legacy contact features you can set up right now.",
    };
  }
  return {
    assets: [
      { id: "1", category: "social", platform: "微信", accountName: "主微信号", action: "transfer", notes: "" },
      { id: "2", category: "social", platform: "小红书", accountName: "个人账号", action: "memorialize", notes: "" },
      { id: "3", category: "social", platform: "微博", accountName: "用了8年的账号", action: "memorialize", notes: "" },
      { id: "4", category: "payment", platform: "支付宝", accountName: "实名账户", action: "transfer", notes: "" },
      { id: "5", category: "payment", platform: "微信支付", accountName: "零钱通+理财", action: "transfer", notes: "" },
      { id: "6", category: "entertainment", platform: "Steam", accountName: "游戏库存100+", action: "transfer", notes: "库存价值约3000元" },
      { id: "7", category: "entertainment", platform: "百度网盘", accountName: "照片+文档备份", action: "transfer", notes: "家庭照片，约50GB" },
      { id: "8", category: "other", platform: "Gmail", accountName: "主力邮箱", action: "undecided", notes: "" },
    ],
    summary: "你看，你在至少 8 个平台上留下了足迹。有的承载着回忆，有的关系着钱，有的只是习惯——但它们都是你在这个数字世界里真实活过的痕迹。整理好了，心里是不是踏实了一点？",
    suggestions: "建议把这份清单告诉一个你信任的人，每半年更新一次。有些平台的「账号继承」功能可以提前设置。",
  };
}

export async function demoInventoryChat(
  action: "start" | "chat",
  userMessages: string[],
  lang: Lang = "zh"
): Promise<DemoResponse> {
  await delay();
  const conversation = getInventoryConversation(lang);
  const sessionId = `inventory_demo_${lang}`;
  const state = getOrCreateState(sessionId);

  if (action === "start") {
    state.stage = "start";
    state.turnCount = 0;
    const entry = conversation["start"];
    return { message: entry.message };
  }

  const isWrappingUp = userMessages.length >= 5;

  if (isWrappingUp || state.stage === "summary") {
    const summaryData = generateInventorySummary(userMessages, lang);
    const defaultMsg = lang === "en"
      ? "Amazing work! You've done something genuinely important ✨ Here's your digital asset inventory:"
      : "太棒了！你完成了一件很重要的事 ✨ 来看看你的数字资产清单：";
    return {
      message: summaryData.summary || defaultMsg,
      assets: summaryData.assets,
      summary: summaryData.summary,
      suggestions: summaryData.suggestions,
      done: true,
    };
  }

  const entry = conversation[state.stage];
  if (!entry || !entry.message) {
    const summaryData = generateInventorySummary(userMessages, lang);
    return { message: summaryData.summary || "", assets: summaryData.assets, summary: summaryData.summary, done: true };
  }

  state.stage = entry.nextStage;
  return { message: entry.message };
}

// ============================================================
// ❷ 心底话 Demo
// ============================================================

function getLetterConversation(lang: Lang): Record<string, { message: string; nextStage: string }> {
  if (lang === "en") {
    return {
      start: {
        message: `Writing a letter to someone important — you've probably been thinking about this for a while.

Don't worry about getting it perfect. Let's start with the basics:

**Who is this letter for?**

(Anyone — family, a friend, a partner, even your future self)`,
        nextStage: "ask_relationship",
      },
      ask_relationship: {
        message: `Okay. And what's your relationship to them?

No need to be formal — just say it your way.
Like: "My childhood best friend," "My dad, who I've never quite known how to talk to," "The teacher who changed everything."`,
        nextStage: "ask_memory",
      },
      ask_memory: {
        message: `Thank you for sharing that.

Now, think back: **What's one moment with them you'll never forget?**

It doesn't have to be dramatic. Maybe a meal you shared. A throwaway comment. A tiny gesture. But years later, it's still with you.`,
        nextStage: "ask_unsaid",
      },
      ask_unsaid: {
        message: `That moment really matters. Thank you for telling me about it.

Now I'd like to ask something a little harder —

**What's something you've always wanted to say to them, but never have?**

Maybe it's "Thank you." Maybe it's "I'm sorry." Maybe it's "I've always looked up to you." Or something else entirely.`,
        nextStage: "draft",
      },
      draft: {
        message: null as unknown as string,
        nextStage: "done",
      },
    };
  }
  return {
    start: {
      message: `写一封信给重要的人——这件事你想了很久了吧。

不用担心写得好不好。我们先从最简单的开始：

**你想写给谁？**

（可以是任何人——家人、朋友、伴侣、甚至未来的自己）`,
      nextStage: "ask_relationship",
    },
    ask_relationship: {
      message: `嗯。那你们之间是什么关系呢？

不用太正式，用你自己的话说就好。
比如：「从小一起长大的闺蜜」「一直不太会表达感情的爸爸」「大学时最照顾我的那个老师」`,
      nextStage: "ask_memory",
    },
    ask_memory: {
      message: `谢谢你告诉我这些。

现在，试着回忆一下：**你们之间最难忘的一件事是什么？**

不用是什么惊天动地的大事。可能只是一起吃过的一顿饭，一句无心的话，一个很小的瞬间。但这么多年过去了，你还记得。`,
      nextStage: "ask_unsaid",
    },
    ask_unsaid: {
      message: `那个瞬间真的很珍贵。谢谢你和我说这些。

那么，我接下来想问你一个更难一点的问题——

**有什么话是你一直想对TA说，但从来没说出口的？**

可能是一句「谢谢你」，一句「对不起」，一句「其实我一直很崇拜你」，或者任何别的。`,
      nextStage: "draft",
    },
    draft: {
      message: null as unknown as string,
      nextStage: "done",
    },
  };
}

function generateLetterDraft(_userMessages: string[], isRegenerate: boolean, lang: Lang): LetterDraft {
  if (lang === "en") {
    return isRegenerate
      ? {
          draft: `Dear Mom,

Writing this, I keep thinking about that night when I was sick as a kid and you carried me to the hospital in the rain. You were so thin — but I've never felt safer.

As I grew up, we started talking less. Every call became "Have you eaten?" "Take care of yourself" "Don't work too hard" — but what I really wanted to say was so much more than that.

Thank you. For giving me the best of everything. For saying "try one more time" every time I wanted to give up. For never, ever comparing me to anyone else's kid.

And — I love you. We hardly say those three words out loud, but I want you to know.

Also — please stop saving everything "for later." Some things don't have a "later." Eat the good food. Go places. You deserve to be good to yourself.

If there's a next life, I'd still want to be your kid.

Your child`,
          tone: "Warm, honest — like someone who finally found the courage to speak",
          suggestions: [
            "Adding a photo of the two of you would make it more personal",
            "More details about that rainy night — what you remember most",
            "End with something light, so it doesn't feel too heavy",
          ],
        }
      : {
          draft: `Hey,

I don't know why I felt like writing this today. Maybe it was a movie. Maybe I walked past that place we used to go.

You know the owner still remembers us? Said "You two haven't been here together in a while."

It's true. It's been a while.

Just wanted to say — those years with you were the happiest I've known. Not because of anything you did in particular. Just that you were there. When I needed it. When I was happy. When I had nothing to say — you being there was enough.

I hope you're doing well. I hope you think of me sometimes, the way I think of you.

No need to reply. This letter was never meant to be sent. It's just — I wanted you to know. You were in my life, and you left a beautiful mark.

Take care.`,
          tone: "Gentle, light — like catching up with an old friend",
          suggestions: [
            "Adding their name would make it warmer",
            "A little personal memory just the two of you share",
            "Start even lighter — just say hi before diving in",
          ],
        };
  }

  // zh (default)
  return isRegenerate
    ? {
        draft: `亲爱的妈妈：

写这封信的时候，我想起了小时候生病你背我去医院的那个雨夜。你的背很瘦，但我觉得特别安全。

长大以后，我们之间的话好像越来越少了。每次打电话都是「吃了没」「注意身体」「别太累」——其实我想说的远不止这些。

我想说谢谢你。谢谢你把最好的都给了我。谢谢你在我每次想要放弃的时候说「再试试」。谢谢你从来没有拿我跟别人家的孩子比较。

我也想说我爱你。这三个字我们很少说出口，但我想让你知道。

还有——别太省了。你总说「攒着以后用」，可是很多东西现在不用就没有「以后」了。想吃的东西就去吃，想去的地方就去。你值得对自己好一点。

如果有下辈子，我还想做你的孩子。

你的孩子`,
        tone: "温暖、真诚，像一个终于鼓起勇气说话的年轻人",
        suggestions: [
          "可以加一张你们的合照，信会更加个人化",
          "回忆的细节再多一些——那个雨夜的更多画面",
          "结尾可以加一句轻松的，不要太沉重",
        ],
      }
    : {
        draft: `嗨，

不知道为什么，今天突然想写这封信。也许是因为看了一部电影，也许是路过了一家我们一起吃过的店。

你知道吗？那家店的老板还记得我们。他说「你们好久没一起来了」。

是的，好久没见了。

想跟你说，那些年和你一起的日子，是我最开心的时光。不是你做了什么特别的事，就是你刚好在。在我需要的时候，在我开心的时候，在我什么都不想说的时候——你在，就够了。

我希望你过得好。希望你偶尔也能想起我，就像我偶尔想起你一样。

不用回这封信。它本来就不是要寄出去的。它只是——我想让你知道，你来过我的生命里，留下了很好的痕迹。

保重。`,
        tone: "温柔、轻轻松松，像跟老朋友聊天",
        suggestions: [
          "如果加上收信人的名字会更亲切",
          "可以加一段你们之间独有的小故事",
          "开头可以更轻松——先问个好再进入正文",
        ],
      };
}

export async function demoLetterChat(
  action: "start" | "chat" | "regenerate",
  userMessages: string[],
  lang: Lang = "zh"
): Promise<DemoResponse> {
  await delay();
  const conversation = getLetterConversation(lang);
  const sessionId = `letter_demo_${lang}`;
  const state = getOrCreateState(sessionId);

  if (action === "start") {
    state.stage = "start";
    state.turnCount = 0;
    return { message: conversation["start"].message };
  }

  if (action === "regenerate") {
    await delay(500);
    const regenDraft = generateLetterDraft(userMessages, true, lang);
    const msg = lang === "en" ? "Here's a different version — let me know what you think." : "换了一种风格重新写了，看看这次怎么样？";
    return { message: msg, draft: regenDraft.draft, suggestions: regenDraft.suggestions };
  }

  const isReadyForDraft = userMessages.length >= 4;

  if (isReadyForDraft || state.stage === "draft") {
    const draft = generateLetterDraft(userMessages, false, lang);
    const msg = lang === "en"
      ? "Here's a draft for you 💌 Edit, copy, or ask me to write another version."
      : "我帮你写了一封初稿，看看怎么样？💌 你可以编辑、复制，或者让我重新写一版。";
    return { message: msg, draft: draft.draft, tone: draft.tone, suggestions: draft.suggestions };
  }

  const entry = conversation[state.stage];
  if (!entry || !entry.message) {
    const draft = generateLetterDraft(userMessages, false, lang);
    const msg = lang === "en" ? "Here's the letter I wrote for you 💌" : "好了，来看看我帮你写的信吧 💌";
    return { message: msg, draft: draft.draft, suggestions: draft.suggestions };
  }

  state.stage = entry.nextStage;
  return { message: entry.message };
}

// ============================================================
// ❸ 遗愿清单 Demo
// ============================================================

function getWishlistConversation(lang: Lang): Record<string, { message: string; nextStage: string }> {
  if (lang === "en") {
    return {
      start: {
        message: `✨ Everyone has a list in their heart — it just hasn't been written down yet.

Don't worry. This isn't some heavy "100 things to do before you die." It's just — things that would make you happy just thinking about them.

So let's start with something easy:

**If you suddenly had three completely free days — no work, no obligations, no one to answer to — how would you spend them?**`,
        nextStage: "ask_travel",
      },
      ask_travel: {
        message: `That sounds wonderful!

Speaking of which — **is there a place you've always wanted to go, but haven't yet?**

Could be a faraway country. Could be the café around the corner. Where is it?`,
        nextStage: "ask_say",
      },
      ask_say: {
        message: `Noted 📝 One day you'll get there.

Shifting gears — **is there something you've always wanted to say to someone, but haven't yet?**

You don't have to tell me who. Just — what kind of thing is it? Thank you? I'm sorry? I love you? Something else?`,
        nextStage: "ask_do",
      },
      ask_do: {
        message: `Those words, when you finally say them, will be beautiful.

Now — **is there something you've always wanted to do but keep telling yourself "not yet"?**

Learn a skill. Run a marathon. Cook a meal for someone. Write a book. Anything counts.`,
        nextStage: "ask_learn",
      },
      ask_learn: {
        message: `Your list is already starting to feel warm ☺️

One last direction — **what do you want to learn?**

A language. An instrument. A recipe. A sport. A piece of software. Anything you've ever admired someone else for knowing.`,
        nextStage: "summary",
      },
      summary: {
        message: null as unknown as string,
        nextStage: "done",
      },
    };
  }
  return {
    start: {
      message: `✨ 每个人心里都有一份清单，只是还没来得及写下来。

别紧张，这不是什么沉重的「人生必做100件事」。它就是一份——**让你一想到就开心的事**。

那，先从最简单的开始吧：

**如果现在突然有三天完全自由的时间，不用管工作、不用管任何人——你会怎么过？**`,
      nextStage: "ask_travel",
    },
    ask_travel: {
      message: `那种感觉一定很棒！

说到这儿，我好奇了——**你有没有一个特别想去、但一直没去的地方？**

可以是远方的国度，也可以是隔壁城市的一家小店。是哪里？`,
      nextStage: "ask_say",
    },
    ask_say: {
      message: `记下了 📝 有一天一定要去。

换个方向——**有没有什么话，是你一直想对某个人说，但还没说出口的？**

不用告诉我具体是谁。就说说，那是一句什么样的话？感谢？道歉？表白？还是别的什么？`,
      nextStage: "ask_do",
    },
    ask_do: {
      message: `这些话被你说出来的时候，一定很动人。

来，再想想——**有没有什么事，你一直想做但总觉得「还不到时候」？**

学一门手艺、跑一场马拉松、给妈妈做一顿饭、写一本书……什么都算。`,
      nextStage: "ask_learn",
    },
    ask_learn: {
      message: `真好。你的清单已经开始有温度了 ☺️

最后一个方向——**你想学什么？**

一门语言、一样乐器、一道菜、一项运动、一个软件……或者任何你羡慕过别人会但自己不会的东西。`,
      nextStage: "summary",
    },
    summary: {
      message: null as unknown as string,
      nextStage: "done",
    },
  };
}

function generateWishlist(lang: Lang): WishlistAnalysis & { nextStep: string } {
  if (lang === "en") {
    const items: WishlistAnalysis["items"] = [
      { id: "1", content: "See the Northern Lights in Iceland", category: "travel", priority: 5, status: "pending" },
      { id: "2", content: 'Tell my parents "I love you" out loud', category: "say", priority: 5, status: "pending" },
      { id: "3", content: "Learn to make mom's signature pasta", category: "learn", priority: 4, status: "pending" },
      { id: "4", content: "Run a half-marathon", category: "do", priority: 3, status: "pending" },
      { id: "5", content: "Watch a hanabi festival in Japan", category: "travel", priority: 4, status: "pending" },
      { id: "6", content: "Write a long handwritten letter to my best friend", category: "say", priority: 3, status: "pending" },
      { id: "7", content: "Learn to play a full song on guitar or piano", category: "learn", priority: 2, status: "pending" },
      { id: "8", content: "Spend a week alone in a city I've never been to", category: "travel", priority: 2, status: "pending" },
      { id: "9", content: "Plant a tree that will outlive me", category: "do", priority: 3, status: "pending" },
    ];
    return {
      summary: "You've written down 9 wishes — from the Northern Lights in Iceland to your mom's pasta recipe. A wish doesn't have to be big to matter. The only thing that matters is that they're written down now. Here they are.",
      items,
      topPriority: items[0],
      nextStep: "Start with the easiest one — maybe try that pasta recipe this weekend? 😋",
    };
  }
  const items: WishlistAnalysis["items"] = [
    { id: "1", content: "去冰岛看一次极光", category: "travel", priority: 5, status: "pending" },
    { id: "2", content: "跟爸妈说一句「我爱你们」", category: "say", priority: 5, status: "pending" },
    { id: "3", content: "学会做妈妈最拿手的那道红烧肉", category: "learn", priority: 4, status: "pending" },
    { id: "4", content: "跑一次半程马拉松", category: "do", priority: 3, status: "pending" },
    { id: "5", content: "去日本看一场花火大会", category: "travel", priority: 4, status: "pending" },
    { id: "6", content: "给最好的朋友手写一封长长的信", category: "say", priority: 3, status: "pending" },
    { id: "7", content: "学会弹一首完整的曲子（吉他或钢琴）", category: "learn", priority: 2, status: "pending" },
    { id: "8", content: "一个人去陌生的城市过一周", category: "travel", priority: 2, status: "pending" },
    { id: "9", content: "种一棵能活很久的树", category: "do", priority: 3, status: "pending" },
  ];
  return {
    summary: "你写了9个愿望——有远方的冰岛，也有身边的那道菜。愿望不怕小，就怕从来没写下来。现在它们在这里了。",
    items,
    topPriority: items[0],
    nextStep: "先做最简单的那件事吧——这周末就试着做那道红烧肉？😋",
  };
}

export async function demoWishlistChat(
  action: "start" | "chat",
  userMessages: string[],
  lang: Lang = "zh"
): Promise<DemoResponse> {
  await delay();
  const conversation = getWishlistConversation(lang);
  const sessionId = `wishlist_demo_${lang}`;
  const state = getOrCreateState(sessionId);

  if (action === "start") {
    state.stage = "start";
    state.turnCount = 0;
    return { message: conversation["start"].message };
  }

  const isWrappingUp = userMessages.length >= 5;

  if (isWrappingUp || state.stage === "summary") {
    const summaryData = generateWishlist(lang);
    const defaultMsg = lang === "en"
      ? "A beautiful list ✨ Now go make them happen, one by one."
      : "很美的清单 ✨ 从现在开始，一个一个实现吧";
    return {
      message: summaryData.summary || defaultMsg,
      items: summaryData.items,
      summary: summaryData.summary,
      nextStep: summaryData.nextStep,
    };
  }

  const entry = conversation[state.stage];
  if (!entry || !entry.message) {
    const summaryData = generateWishlist(lang);
    const defaultMsg = lang === "en" ? "Here's your wishlist ✨" : "来看看你的遗愿清单吧 ✨";
    return { message: defaultMsg, items: summaryData.items, summary: summaryData.summary };
  }

  state.stage = entry.nextStage;
  return { message: entry.message };
}

// ============================================================
// 重置 Demo 状态
// ============================================================

export function resetDemoState(sessionId?: string): void {
  if (sessionId) {
    conversationStates.delete(sessionId);
  } else {
    conversationStates.clear();
  }
}
