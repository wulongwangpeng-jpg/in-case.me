/**
 * 中文语言包 — 万一呢
 * 所有面向用户的中文文案集中于此
 */

const zh = {
  // ============================================================
  // 公共
  // ============================================================
  common: {
    appName: "万一呢",
    appTagline: "温暖地交代一切",
    skip: "跳过引导 →",
    continue: "继续 →",
    startGuard: "开始守护",
    cancel: "取消",
    confirm: "确认",
    expand: "展开编辑",
    save: "保存",
    delete: "删除",
    edit: "编辑",
    copy: "复制",
    back: "返回",
    loading: "加载中…",
    error: "出了点问题",
    retry: "重试",
    done: "完成",
    close: "关闭",
    sendCode: "发送验证码",
    verify: "验证",
    logout: "退出登录",
    login: "登录",
    bound: "已绑定",
    boundTooltip: "已绑定手机号/邮箱",
    export_: "导出",
    import_: "导入",
    more: "更多",
    optional: "可选",
    required: "必填",
    noData: "暂无数据",
    noAccess: "暂无访问权限",
  },

  // ============================================================
  // 首页 Hero
  // ============================================================
  home: {
    heroBadge: "✨ 温暖地交代一切",
    heroTitle: "万一呢",
    heroDesc: "帮你把想说的话、想做的事、想留的东西，都准备好。",

    // 信任三按钮
    trustEncryptLabel: "离开前加密",
    trustEncryptTitle: "数据在出门前就锁好了",
    trustEncryptSubtitle:
      "AES-256-GCM — 全球银行、军队、情报机构使用的同款加密标准",
    trustEncryptMetaphor:
      "就像你把信装进保险箱，设好只有你知道的密码，然后把保险箱交给快递员。快递员打不开——我们也打不开。",
    trustEncryptPoint1:
      "你输入的任何内容，在你的浏览器里就已经完成加密",
    trustEncryptPoint2: "你的密码从不上传——它只存在你的设备里",
    trustEncryptPoint3:
      "服务器收到的是一串无法解读的随机字符，称之为「密文」",

    trustBlindLabel: "不见明文",
    trustBlindTitle: "我们连你存了什么都不知道",
    trustBlindSubtitle: "零知识架构 — 从技术根源上杜绝了任何人偷看的可能",
    trustBlindMetaphor:
      "好比你在银行租了个保险柜，只有你手里那把钥匙能打开。银行不知道柜子里是房契、金条，还是一张空白纸条。",
    trustBlindPoint1: "加密和解密的过程，只在你自己的设备上完成",
    trustBlindPoint2:
      "即使数据库被黑客攻破、全部数据被拖走——也只能看到无法破解的密文",
    trustBlindPoint3: "没有任何后门，没有任何特权账号能够查看你的内容",

    trustExportLabel: "一键导出",
    trustExportTitle: "你的东西，永远属于你",
    trustExportSubtitle: "随时打包带走 · 随时彻底删除 · 不做数据绑架",
    trustExportMetaphor:
      "租房子可能被房东赶走，但你的行李随时可以打包带走。我们不锁门、不设限——你的数据，你做主。",
    trustExportPoint1: "随时一键导出你的全部内容为可读格式",
    trustExportPoint2: "随时彻底删除账号及所有数据，不留下任何痕迹",
    trustExportPoint3:
      "如果我们停止运营，承诺提前通知你完整导出——不会让你措手不及",

    // 功能卡片
    feature1Title: "数字资产盘点",
    feature1Desc:
      "梳理你的所有数字账号——社交、支付、游戏、创作……AI 引导式问答，像朋友聊天一样轻松。",
    feature1Badge: "步骤①",
    feature1Cta: "开始盘点",

    feature2Title: "心底话",
    feature2Desc:
      "给重要的人写封信。那些埋在心底的话，写下来，它们会被妥帖保管，直到对的人打开。",
    feature2Badge: "步骤②",
    feature2Cta: "写一封信",

    feature3Title: "安全设置",
    feature3Desc:
      "设置信使——把提取链接和解密密码交给你信任的人。你安好时他们打不开，你不在时才能提取。",
    feature3Badge: "步骤③",
    feature3Cta: "去设置",

    // 底部
    footerTagline: "由 {appName} 生成 · 温暖地交代一切",
    footerGitHub: "开源可审计 · GitHub",
    footerAuthor: "由全栈工程师独立开发并维护 · 2026",
    footerDisclaimer:
      "本产品不构成法律建议，重大权益事项请咨询专业律师。",
    footerTaglineBefore: "由 ",
    footerTaglineAfter: " 生成 · ",
    footerCollapse: "收起",
    footerPrivacyLabel: "隐私与安全",
    footerPrivacyDesc: "我们如何保护你的数据",

    // 侧边安全浮窗
    trustSlideshowLabel: "数据安全吗",
    trustSlideshowHint: "点击左右箭头翻页 · 点击背景关闭",
    trustSlides: [
      {
        title: "你在浏览器里写下内容",
        body: "无论是资产盘点还是心底话——所有内容只存在于你的设备上。在你按下「加密保存」之前，任何文字都从未离开过你的浏览器。",
      },
      {
        title: "加密在离开设备前完成",
        body: "按下保存那一刻，AES-256-GCM 加密算法在你的浏览器里把内容锁上。就像把信放进保险箱、设好密码、再交给快递员——快递员打不开，我们也打不开。",
      },
      {
        title: "服务器只存密文",
        body: "传到我们服务器的是一串毫无意义的乱码。即使数据库被黑客攻破、全部数据被拖走——能看到的也只是一堆无法破解的密文。没有任何后门，没有任何特权账户能偷看。",
      },
      {
        title: "你定期续期，证明安好",
        body: "每隔一段时间，你点击「一切安好」续期。只要你在续期，任何人拿着提取链接来都会被拒绝。只有当连续 90 天未续期，系统才判定你可能出事了——信使的链接才会生效。",
      },
      {
        title: "信使用链接 + 密码解密",
        body: "你提前把提取链接和解密密码交给信使。当守护超时后，信使打开链接拿到密文包，输入密码，在信使自己浏览器里解密——看到你想留给 TA 的一切。整个过程，我们从未看到过明文。",
      },
    ],

    // 底部信任卡片（footer trust items）
    footerTrust1Title: "数据在离开设备前已加密",
    footerTrust1Desc:
      "所有敏感内容在发送至服务器前，已通过 AES-256-GCM 加密算法在您的设备上完成加密。服务器仅存储无法解读的密文，即使数据库被攻击，您的数据也无法被破解。",
    footerTrust2Title: "你拥有数据的绝对所有权",
    footerTrust2Desc:
      "我们采用零知识架构（Zero-Knowledge Architecture）。您的解密密码从未、也永远不会上传至服务器。这意味着没有任何人——包括「万一呢」的开发者和运营者——能够查看您的明文内容。您可以随时导出、删除您的所有数据。",
    footerTrust3Title: "Supabase 数据库直连，无任何第三方追踪",
    footerTrust3Desc:
      "您的加密数据直接存储在我们唯一信任的云数据库 Supabase 中。本平台不接入任何第三方分析工具、广告追踪器或用户行为监控系统。没有 Google Analytics，没有埋点 SDK。你的每一次访问，只有你和服务器知道。",
    footerTrust4Title: "开源可审计",
    footerTrust4Desc:
      "我们的全部代码已在 GitHub 开源。安全研究人员和用户可以随时审查我们的加密实现、数据库结构和 API 逻辑。信任不是靠承诺建立的，是靠透明。",
    openSourceSoon: "在 GitHub 查看源代码",
  },

  // ============================================================
  // 引导页（4 页全屏首次访问）
  // ============================================================
  onboarding: {
    slide1Title: "欢迎来到万一呢",
    slide1Subtitle: "帮你整理数字人生\n守护你在意的人和事",

    slide2Title: "盘点数字资产",
    slide2Subtitle:
      "社交账号、订阅、游戏、创作\n整理清楚，才知道有什么要守护",

    slide3Title: "但更重要的是——",
    slide3Subtitle:
      "万一哪天你暂时无法处理这些事\n你希望谁帮你？你希望他们知道什么？",

    slide4Title: "三步，就够了",
    slide4Subtitle: "把钥匙交给你最信任的人",

    assetVisualLabel: "你信任的人",
    step1Label: "盘资产",
    step2Label: "写心底话",
    step3Label: "设信使",
  },

  // ============================================================
  // 续期签到 RenewalCheckin
  // ============================================================
  renewal: {
    cardTitle: "守护续期",
    title: "略有波澜，续期守护",
    desc: "定期回来确认你安好，保持守护有效。",
    lastCheckin: "上次确认",
    daysAgo: "{n} 天前",
    thresholdDays: "守护阈值：{n} 天无登录将启动通知",
    checkinNow: "一切安好，续期守护",
    checkinSuccess: "已续期 ✓ 守护如故",
    bindReminder: "绑定身份后，换设备也能查看续期状态",
    goBind: "去绑定",
    vaultLabel: "密文",
    credLabel: "信使",
  },

  // ============================================================
  // 身份绑定 BindModal
  // ============================================================
  bind: {
    modalTitle: "绑定身份",
    modalDesc: "清缓存、换设备都不影响。数据加密存储在云端，密码不上传。",
    phoneLabel: "手机号",
    phonePlaceholder: "请输入手机号",
    emailLabel: "邮箱",
    emailPlaceholder: "请输入邮箱",
    codeLabel: "验证码",
    codePlaceholder: "请输入验证码",
    codeSent: "验证码已发送",
    phoneOptional: "绑定手机号，数据不会丢",
    bindSuccess: "绑定成功 ✓",
    bindError: "绑定失败，请重试",
    boundTitle: "您已绑定账户",
    boundDesc: "换设备、清缓存后登录即可恢复全部数据",
    changeBind: "更换绑定方式",
    unbindTitle: "解除绑定",
    unbindConfirm: "解除绑定后换设备将无法恢复数据，确定解除？",
    switchToPhone: "用手机号",
    switchToEmail: "用邮箱",
    codeSentToPhone: "验证码已发送至 {target}",
    codeSentToEmail: "验证码已发送至 {target}，请注意查收",
  },

  // ============================================================
  // 资产盘点 inventory
  // ============================================================
  inventory: {
    aiGreeting: "我是你的数字资产盘点助手。我会一步一步帮你梳理在各个平台上留下的账号和资产——不着急，想到什么就说什么。",
    title: "数字资产盘点",
    navTitle: "资产盘点",
    desc: "梳理你的所有数字账号，弄清楚有什么要守护。",
    startButton: "开始盘点",
    chatPlaceholder: "输入你的回答…",
    send: "发送",
    regenerating: "重新生成中…",
    regenerate: "换一版",
    saveToVault: "保存到保险库",
    saveSuccess: "已保存到保险库 ✓",
    savedAssets: "已盘点 {n} 个资产",
    noAssets: "还没有盘点任何资产",
    // 大类标签
    categories: {
      finance: "金融",
      investment: "投资",
      creator: "创作",
      gaming: "游戏",
    },
    categoryTabs: {
      finance: "💰 金融",
      investment: "📈 投资",
      creator: "🎬 创作",
      gaming: "🎮 游戏",
    },

    // 金融类
    financeLabel: "平台/机构",
    financePlaceholder: "如：支付宝、招商银行、工商银行…",
    financeAccountLabel: "账号/卡号（脱敏）",
    financeAccountPlaceholder: "如：尾号 xxxx，绑手机 138xxxx",
    financeChannelNote: "无需填写处理流程。信使提取时，平台将根据各机构最新规则自动生成提取指南。",
    financeActions: {
      withdraw: "提取",
      undecided: "待定",
      custom: "自定义",
    },

    // 投资类
    investmentLabel: "平台/券商",
    investmentPlaceholder: "如：雪盈证券、富途牛牛、币安…",
    investmentTypeLabel: "品种",
    investmentTypePlaceholder: "如：A股、美股、港股、基金、加密货币",
    investmentScaleLabel: "大致规模（区间即可）",
    investmentScalePlaceholder: "如：5-10万，或 0.5 BTC",
    investmentChannelNote: "无需填写处理流程。信使提取时，平台将根据各机构最新规则自动生成提取指南。",
    investmentActions: {
      cashOut: "变现",
      hold: "持有不动",
      undecided: "待定",
      custom: "自定义",
    },

    // 创作类
    creatorLabel: "平台",
    creatorPlaceholder: "如：B站、抖音、YouTube、公众号…",
    creatorAudienceLabel: "粉丝 / 影响力",
    creatorAudiencePlaceholder: "如：B站10万粉丝，月均播放50万",
    creatorIncomeLabel: "收入关联",
    creatorIncomePlaceholder: "如：广告分成绑了招行6214****，商单通过微信结算",
    creatorBusinessLabel: "商务合作",
    creatorBusinessPlaceholder: "如：A品牌 联系人张先生 138xxxx，合同在百度网盘",
    creatorAssetsLabel: "内容资产",
    creatorAssetsPlaceholder: "如：视频工程文件在阿里云盘，音乐版权已购买",
    creatorDisposalLabel: "处置建议",
    creatorDisposalPlaceholder: "如：交人运营、持续运营或注销",
    creatorActions: {
      transfer: "交人运营",
      continue: "持续运营",
      delete: "注销",
      undecided: "待定",
      custom: "自定义",
    },

    // 游戏类
    gamingLabel: "平台/游戏名",
    gamingPlaceholder: "如：Steam、梦幻西游、王者荣耀…",
    gamingValueLabel: "账号价值（大致）",
    gamingValuePlaceholder: "如：库存约3000元，或累计充值约5万",
    gamingBindLabel: "绑定方式",
    gamingBindPlaceholder: "如：Steam令牌、手机号、邮箱",
    gamingDisposalLabel: "处置建议",
    gamingDisposalPlaceholder: "如：转让、出售、纪念或注销",
    gamingActions: {
      transfer: "转交",
      sell: "出售",
      memorialize: "纪念",
      delete: "注销",
      undecided: "待定",
      custom: "自定义",
    },

    // 通用
    customActionPlaceholder: "输入你想设置的方式…",
    actions: {
      keep: "保留",
      transfer: "移交",
      delete: "注销",
      undecided: "待定",
    },
    exportCSV: "导出为 CSV",
    summary: "盘点摘要",
    hintText: "记录线索，不是余额——家属拿着线索走法律继承流程",
    valueTipTitle: "💡 这页在做什么",
    valueTipBody: "画一张资产分布图。你记录的是线索（哪个平台、什么账号），不是余额。万一呢帮你把线索分门别类保管好。金融和投资类，信使提取时平台自动生成操作指南；创作和游戏类，你把登录信息留给信使即可。你只管留线索，剩下的交给我们和你最信任的TA。",
    directMode: "直接录入",
    aiMode: "AI 辅助",
    notesLabel: "留给信使的话（可选）",
    notesPlaceholderFinance: "如：主卡绑微信，余额宝约xx，联系客服 95188 提取",
    notesPlaceholderInvestment: "如：雪球账户有 A 股持仓，联系券商客服办理过户",
    notesPlaceholderCreator: "如：B站账号有广告分成，合同存在百度网盘，联系商务对接人 xxx",
    notesPlaceholderGaming: "如：Steam 库存价值约 xx，游戏账号绑了手机 138xxxx",
    savedHint: "已加密保存！继续添加下一个",
    unnamedPlatform: "未命名",
    saveTriggerLabel: "🔒 加密保存",
    platformRequired: "请先填写平台名称",
    addedToList: "已加入列表",
    aiChatPlaceholder: "输入你想说的话…",
    aiChatHint: "按 Enter 发送 · 聊天结束后可加密保存",
    saveAllLabel: "🔒 加密保存全部到保险库",
    saveAllSuffix: "资产盘点",
    nextStepLetters: "下一步：写一封心底话",
    savedCountHint: "共 {n} 个账号已梳理",
  },

  // ============================================================
  // 心底话 letters
  // ============================================================
  letters: {
    aiGreeting: "我是你的文字陪伴者。不用紧张——你不是在写一封要寄出去的信，你只是把心里想说的话写下来。我会陪你一起。",
    title: "心底话",
    valueTipTitle: "💡 这页在做什么",
    valueTipBody: "写一封信给你重要的人。两种方式：自己写，随手写几句心里话；或让AI陪你聊着写，像朋友聊天一样轻松。写完加密保存——密码从不上传，只有你和信使知道。平时谁也打不开，直到守护到期，信使用密码在TA自己的浏览器里解密，看到你留给TA的心里话。",
    desc: "写给重要的人。那些埋在心底的话，写下来。",
    startButton: "写一封信",
    chatPlaceholder: "输入你想说的话…",
    draftReady: "我帮你写了一封初稿，看看怎么样？💌",
    draftDesc: "你可以编辑、复制，或者让我重新写一版。",
    recipient: "收信人",
    relationship: "关系",
    saveDraft: "保存草稿",
    letterSaved: "信已保存 ✓",
    noLetters: "还没有写过信",
    lettersCount: "已写 {n} 封信",
    editDraft: "编辑草稿",
    deleteDraft: "删除草稿",
    deleteConfirm: "确定删除这封信吗？",
    encryptNotice: "此内容将在你的浏览器中加密，密码从不上传。",
    directMode: "直接书写",
    aiMode: "AI 辅助",
    recipientLabel: "写给谁",
    recipientPlaceholder: "如：老妈、未来的自己、信使…",
    bodyLabel: "想说的话",
    bodyPlaceholder: "写下你想说的话。那些埋在心底的话，写下来，它们会被妥帖保管，直到对的人打开。",
    savedHint: "已加密保存",
    aiDraftLabel: "AI 草稿",
    aiChatPlaceholder: "说说你想写给谁…",
    importantPerson: "重要的人",
    saveTriggerLabel: "🔒 加密保存",
  },

  // ============================================================
  // 安全设置 settings
  // ============================================================
  settings: {
    title: "安全设置",
    navTitle: "安全",
    valueTipTitle: "💡 这页在做什么",
    valueTipBody: "三步设置好你的安全守护：① 添加信使——把提取链接和解密密码交给你信任的人，TA会收到通知确认；② 调好守护阈值——超过多少天没登录，平台才会启动通知流程；③ 导出加密备份——你的数据，随时带走。这三步做完，守护就生效了。",
    desc: "管理你的信使、安全阈值和导出数据。",

    // 阈值
    thresholdTitle: "安全守护阈值",
    thresholdDesc: "超过此天数未登录，将启动信使通知流程。",
    thresholdUnit: "天",
    thresholdOptions: {
      30: "30 天",
      60: "60 天",
      90: "90 天",
      180: "180 天",
      365: "365 天",
    },
    thresholdSaved: "阈值已更新 ✓",
    subscribedToast: "订阅已激活！",

    // 信使管理
    messengerTitle: "信使管理",
    messengerDesc: "设置你信任的人，他们在你无法登录时可以提取数字资产。",
    addMessenger: "添加信使",
    messengerName: "称呼",
    messengerNamePlaceholder: "如：妈妈、老王",
    messengerEmail: "邮箱",
    messengerPhone: "手机号（可选）",
    messengerRelation: "关系",
    messengerRelationPlaceholder: "如：家人、挚友",
    messengerCreated: "信使已创建，已发送邀请通知。",
    messengerDeleted: "信使已撤销。",
    noMessengers: "还没有设置信使",
    messengerCount: "已设 {n} 位信使",
    messengerNotifyNotice:
      "设好信使后，我们会给他们发一条短信，告诉他们被设为守护信使——现在什么都不用做。",
    credentialStatus: {
      active: "有效",
      revoked: "已撤销",
      delivered: "已交付",
    },

    // 加密演示
    encryptionTitle: "加密演示",
    encryptionDesc:
      "输入任意文字，看看它被加密后是什么样子——然后解密还原。",
    encryptInput: "输入要加密的文字…",
    encrypt: "加密",
    encryptedResult: "加密结果（密文）",
    decryptPassword: "输入密码解密…",
    decrypt: "解密",
    decryptedResult: "解密结果",
    encryptDone: "已加密 ✓",
    encryptHttpsRequired: "加密演示需要 HTTPS 环境（上线后自动启用）",
    encryptRealtimeLabel: "AES-256-GCM 实时加密",
    encryptServerView:
      "☝ 这就是服务器「看到」的全部内容——即便数据库被拖库，也只是一堆无法破解的乱码",

    // 导出
    exportTitle: "数据导出",
    exportDesc: "随时导出你的全部内容。你的数据永远属于你。",
    exportButton: "导出全部数据",
    exportSuccess: "导出成功",
    deleteAccount: "删除账号",
    deleteAccountDesc: "删除所有数据，不留下任何痕迹。此操作不可撤销。",
    deleteAccountButton: "永久删除账号",
    deleteAccountConfirm: "我确定要永久删除我的账号和所有数据",

    // 备份
    backupTitle: "备份与恢复",
    backupDesc: "下载加密备份文件，或从备份恢复。",
    backupDownload: "下载加密备份",
    backupRestore: "从备份恢复",
    backupRestoreDesc: "选择备份文件并输入密码。",
    exporting: "导出中...",
    exportBtn: "导出 JSON",
    importing: "导入中...",
    importBtn: "上传恢复",
    exportFail: "导出失败，请重试",
    exportDone: "灾备文件已下载！请妥善保管。",
    importDone: "灾备恢复完成！",
    importFail: "文件解析失败，请确认上传的是「万一呢」灾备 JSON 文件。",
    importFormatError: "文件格式错误",
    importGenericFail: "导入失败",
  },

  // ============================================================
  // 解锁页 unlock
  // ============================================================
  unlock: {
    title: "提取数字资产",
    desc: "请输入你收到的密码，解密查看委托给你的内容。",
    passwordPlaceholder: "输入解密密码",
    unlock: "解锁",
    unlocking: "解锁中…",
    wrongPassword: "密码错误，请重试。",
    tooManyAttempts: "尝试次数过多，请稍后再试。",
    noCredential: "链接无效或已过期。",
    unlocked: "解密成功",
    copyContent: "复制内容",
    downloadContent: "下载",
    aiGuideTitle: "各平台提取指南",
    aiGuideDesc:
      "以下是各平台账号提取/注销的操作流程，由 AI 根据你的资产清单自动生成。",
    aiGuideGenerating: "正在生成提取指南…",
    aiGuideDisclaimer:
      "此指南由 AI 生成，仅供参考。实际操作以各平台最新规则为准。",

    // 指引卡片
    envelopeSealHint: "点击开启",
    envelopeSubtitle: "一封留给你的信",
    envelopePreviewSubtitle: "预览 — 信使将看到的内容",
    letterGreetingHasName: "亲爱的 {name}{relation}，",
    letterGreetingNoName: "你正在看的这封信，来自一个信任你的人。有些话想说给你听，有些事想托付给你。",
    letterBodyHasName: "你正在看的这封信，来自一个把你放在心底最重要位置的人。有些话只想说给你听，有些事只想托付给你。不是因为你能处理什么——而是因为你值得被信任。",
    letterBody2: "下面的内容，是TA一笔一笔亲手写下来的。我们从未看过，也永远不会看。现在，它是你的了。",
    letterClosing: "—— In Case",
    letterContentsLabel: "TA留给你的",
    letterGuideTransition: "这事不用你一个人来。每个平台都有专门的工作人员帮你处理——下面是联络方式和具体步骤，一步一步来就好。",
    letterGuideBtn: "查看各平台联络指南",
    letterGuideLoading: "正在整理指南…",
    letterFinalLine: "就这些了。剩下的，你知道该怎么做。",
    letterFinalBrand: "In Case",

    guideSteps: "操作步骤",
    guideNotes: "注意事项",
    guideTime: "预计耗时",
    guideDifficulty: "难度",
  },

  // ============================================================
  // 信使接受页 accept
  // ============================================================
  accept: {
    title: "你被设为数字守护信使",
    subtitle: "别紧张，你的朋友一切安好。",
    body: "你的朋友把你设为他的「数字信使」——因为你是他最信任的人。\n\n这只是一份预先的安排，不代表任何紧急情况。现在什么都不用做。\n\n如果有一天他很久没有登录，平台才会通知你查看他委托的数字资产。到那时，你只需要用他留给你的密码打开即可。",
    confirmButton: "确认接受",
    confirmSuccess: "已确认 ✓ 守护如故",
    confirmError: "确认失败，请重试。",
    invalidLink: "链接无效或已过期。",
    whatIsThis: "这是什么？",
    whatIsThisAnswer:
      "万一呢是一个数字资产规划平台，帮助人们提前整理数字账号和重要信息，并委托给信任的人。",
    alsoPrepare: "你也要为自己准备一份吗？",
    alsoPrepareCta: "去万一呢看看 →",
  },

  // ============================================================
  // 信使管理 CredentialManager
  // ============================================================
  credential: {
    createTitle: "添加信使",
    editTitle: "编辑信使",
    nameLabel: "称呼",
    namePlaceholder: "如：妈妈、老王",
    emailLabel: "邮箱",
    emailPlaceholder: "信使的邮箱",
    phoneLabel: "手机号（可选）",
    phonePlaceholder: "信使的手机号",
    relationLabel: "关系",
    relationPlaceholder: "如：家人、挚友",
    vaultScopeLabel: "可提取的内容",
    vaultScopeDesc: "选择这位信使可以解密查看的密文。",
    selectAll: "全选",
    deselectAll: "取消全选",
    createButton: "创建信使",
    updateButton: "保存修改",
    deleteButton: "撤销信使",
    deleteConfirm: "确定撤销这位信使吗？撤销后对方将无法再提取你的内容。",
    created: "信使已创建，已发送邀请通知 ✓",
    updated: "信使已更新 ✓",
    revoked: "信使已撤销 ✓",

    // QR 信使凭证分享
    qrShareLinkCopied: "链接已复制",
    qrShareTitle: "信使凭证 · 已生成",
    qrShareTo: "致",
    qrShareMessenger: "信使",
    qrShareLinkSection: "其 一 · 提 取 链 接",
    qrShareLinkDesc: "此链为信使提取数据之凭证，请妥善交予信使收存。",
    qrSharePwdSection: "其 二 · 解 密 密 码",
    qrSharePwdPart1: "即存入内容时所设之密码。",
    qrSharePwdPart2: "信使开启链接后须输入此码方能阅览。",
    qrShareBothRequired: "以上两样凭证，缺一不可。",
    qrShareBothDesc: "有链无密，如持钥匙而不得其门。",
    qrShareAcknowledged: "知 晓 了",
    qrShareCopiedLabel: "已复制",
    qrShareCopyLink: "复制链接",
  },

  // ============================================================
  // 保险库 VaultList
  // ============================================================
  vault: {
    decryptPrompt: "请输入解密密码",
    decryptError: "密码错误，无法解密",
    deleteSuccess: "已删除",
    deleteError: "删除失败",
    entryCount: "📦 保险库 · {n} 条已保存",
    unnamed: "未命名",
    decryptPlaceholder: "输入解密密码查看",
    hide: "隐藏",
  },

  // ============================================================
  // 加密相关 crypto
  // ============================================================
  crypto: {
    encrypting: "加密中…",
    decrypting: "解密中…",
    passwordTooShort: "密码至少需要 4 个字符",
    passwordsDontMatch: "两次密码不一致",
    setPassword: "设置密码",
    confirmPassword: "确认密码",
    passwordHint: "请牢记你的密码。密码不会上传，忘记后无法恢复。",
    generatingKey: "生成密钥中…",
    keyGenerated: "密钥已生成 ✓",
    generatePassword: "已生成随机密码，请务必保存！",
    saved: "已保存",
    encryptTitle: "加密保存",
    encryptDesc: "你的内容将在浏览器端用 AES-256-GCM 加密后再上传。服务端永远看不到明文。",
    generateBtn: "生成随机复杂密码",
    orManual: "或手动输入",
    setPwdLabel: "设定解密密码",
    pwdReuse: "（复用上次密码）",
    pwdPlaceholder: "至少 4 个字符",
    confirmPlaceholder: "再次输入密码",
    pwdWarning: "⚠️ 请牢记此密码。信使解密时需要它。万一呢服务端从未存储你的密码。如果遗忘，包括你自己在内的任何人都无法解密这些内容。",
    saving: "加密并保存中...",
    saveBtn: "加密保存",
    storedEncrypted: "已加密存储 · 仅你可见",
  },

  // ============================================================
  // 通知模板 notification-templates
  // ============================================================
  notify: {
    // 信使邀请
    messengerInviteSMS: `您好，这是一条来自万一呢的通知：
您的朋友{label}将您设为数字资产守护信使——
因为您是他最信任的人。

现在什么都不用做。
如果有一天他很久没登录，平台才会通知您查看。
这只是一份预先的安排，不代表任何紧急情况。

确认链接：{acceptUrl}`,

    messengerInviteEmailSubject: "【万一呢】您被设为数字资产守护信使",
    messengerInviteEmailBody: `您好，

这是一条来自万一呢的通知。
您的朋友{label}将您设为数字资产守护信使——因为您是他最信任的人。

现在什么都不用做。如果有一天他很久没登录，平台才会通知您查看数字资产。
这只是一份预先的安排，不代表任何紧急情况。

确认链接：{acceptUrl}

万一呢 · 温暖地交代一切`,

    // 死信通知
    deadLetterSMS: `您好，这是一条来自万一呢的通知：
您的朋友为您留下一份数字资产——
因为您是他最信任的人。
现已到达约定的查看时间。

回复 1：他一切安好，只是忘记登录
回复 2：我确实联系不上他

72小时内无回复，将自动交付。`,

    deadLetterReminder24h: `【万一呢】提示：您的朋友委托您保管一份数字资产，
现已到达约定的查看时间。

回复 1：他一切安好，只是忘记登录
回复 2：我确实联系不上他

48小时内无回复，将自动交付。`,

    deadLetterReminder48h: `【万一呢】这是最后一条提醒：您朋友的数字资产
等待交付中。

回复 1：他安好，自动续期
回复 2：联系不上，交付资产

24小时内无回复，将按约定自动交付。`,

    messengerReply1SMS: "【万一呢】收到，感谢您的确认。他已自动续期，守护如故。祝您生活愉快。",
    messengerReply2SMS: "【万一呢】收到。以下是他的数字资产：\n{unlockUrl}\n请使用他留给您的密码解密查看。",
    messengerAutoDeliverSMS: "【万一呢】您的朋友委托的数字资产已到期，\n现按约定交付给您：\n{unlockUrl}\n请使用他留给您的密码解密查看。",
    userRenewedByMessengerSMS: "【万一呢】你的信使已确认你安好，安全守护已自动续期。守护如故，一切如常。",

    // 用户预警（阈值前提醒）
    userPreExpiryWarning: "【万一呢】温馨提醒：你的数字守护已进入预警期，仅剩 {daysRemaining} 天。请尽快登录续期，以免你的数字资产被自动交付给信使。",
    userPreExpiryWarningSubject: "【万一呢】你的数字守护即将到期",
    userPreExpiryWarningBody: `你好，

你的数字守护已进入预警期，仅剩 {daysRemaining} 天。
请尽快登录 {appUrl} 进行续期操作，以确保你的数字资产安全。

万一呢 · 温暖地交代一切`,

    // 发送通道
    smsChannel: "短信",
    emailChannel: "邮件",
    notifySentTo: "{channel} 通知发送至 {target}",
    demoMode: "Demo 模式：{channel} 通知已输出到控制台",
  },

  // ============================================================
  // AI 对话 — 资产盘点
  // ============================================================
  aiInventory: {
    start: `嗨 👋 你来了。

做这件事需要一点勇气——愿意停下来，认真想想「我的数字生活会留下什么」。这很了不起。

在开始之前，我想先问一个简单的问题：

**你平时花时间最多的 App 或平台是哪一个？**

（比如微信、抖音、小红书、B站、Steam……随便说一个就好）`,

    askCategory: `我了解了！那我们从这个方向开始——

你可以从这些类别里选一个最想先整理的：

📱 **社交媒体** — 微信、微博、小红书、抖音、QQ…
💰 **支付/金融** — 支付宝、银行App、证券…
🎮 **娱乐资产** — 游戏账号、视频会员、网盘…
✍️ **创作资产** — 公众号、B站频道、博客…
📦 **其他** — 域名、加密货币、相册…

你想先梳理哪一类？`,

    inventorySocial: `好的，先从社交媒体开始！

我们一个个来。**微信**——你最主要的微信号，你希望它以后怎么处理？

• 转给家人/朋友继续用？
• 纪念化（保留但不登录）？
• 直接注销？
• 或者……还没想好？

（不用有压力，选「还没想好」也完全OK）`,

    inventorySocial2: `明白了。那**小红书**呢？你的账号主要是用来——

• 发自己的生活分享？
• 看别人的内容为主？
• 还是做内容创作？

这会影响怎么处理它。`,

    inventoryPayment: `好，社交媒体这边先记下了。接下来是钱相关的 💰

**支付宝和微信支付**——这些涉及实名的支付账号，你希望谁来处理？

大多数人会选择最信任的家人。你呢？`,

    inventoryEntertainment: `记下了 ✍️ 我们再来看看好玩的——

你玩不玩游戏？Steam、Switch、手游（王者/原神/蛋仔）……有没有哪个账号是你特别珍视的？

（比如「我的Steam库存值好几千」或者「我的王者皮肤不能浪费」😄）`,

    inventoryOther: `哈哈，了解！那手机上还有——

• 网盘（百度网盘/阿里云盘里的照片、文档）
• 邮箱（QQ邮箱/163/Gmail）
• 各种会员订阅（视频/音乐/云服务）

这些里面有没有你觉得特别重要的？`,

    summary:
      "太棒了！你完成了一件很重要的事 ✨ 来看看你的数字资产清单：",
    summaryText:
      "你看，你在至少 8 个平台上留下了足迹。有的承载着回忆，有的关系着钱，有的只是习惯——但它们都是你在这个数字世界里真实活过的痕迹。整理好了，心里是不是踏实了一点？",
    suggestions:
      "建议把这份清单告诉一个你信任的人，每半年更新一次。有些平台的「账号继承」功能可以提前设置。",
  },

  // ============================================================
  // AI 对话 — 心底话
  // ============================================================
  aiLetter: {
    start: `写一封信给重要的人——这件事你想了很久了吧。

不用担心写得好不好。我们先从最简单的开始：

**你想写给谁？**

（可以是任何人——家人、朋友、伴侣、甚至未来的自己）`,

    askRelationship: `嗯。那你们之间是什么关系呢？

不用太正式，用你自己的话说就好。
比如：「从小一起长大的闺蜜」「一直不太会表达感情的爸爸」「大学时最照顾我的那个老师」`,

    askMemory: `谢谢你告诉我这些。

现在，试着回忆一下：**你们之间最难忘的一件事是什么？**

不用是什么惊天动地的大事。可能只是一起吃过的一顿饭，一句无心的话，一个很小的瞬间。但这么多年过去了，你还记得。`,

    askUnsaid: `那个瞬间真的很珍贵。谢谢你和我说这些。

那么，我接下来想问你一个更难一点的问题——

**有什么话是你一直想对TA说，但从来没说出口的？**

可能是一句「谢谢你」，一句「对不起」，一句「其实我一直很崇拜你」，或者任何别的。`,

    draftReady: "我帮你写了一封初稿，看看怎么样？💌 你可以编辑、复制，或者让我重新写一版。",
    regenerateMessage: "换了一种风格重新写了，看看这次怎么样？",
  },

  // ============================================================
  // API 错误消息
  // ============================================================
  api: {
    // 通用
    notFound: "未找到",
    unauthorized: "未授权，请先登录",
    badRequest: "请求参数错误",
    serverError: "服务器错误，请稍后重试",
    rateLimit: "操作太频繁，请稍后再试",

    // 认证
    codeSent: "验证码已发送",
    codeExpired: "验证码已过期",
    codeInvalid: "验证码错误",
    codeSentTooFrequent: "验证码发送太频繁，请稍后再试",
    loginSuccess: "登录成功",
    bindSuccess: "绑定成功",
    alreadyBound: "该手机号/邮箱已被绑定",

    // 密文
    vaultNotFound: "密文不存在",
    vaultCreated: "密文已创建",
    vaultUpdated: "密文已更新",
    vaultDeleted: "密文已删除",
    encryptionFailed: "加密失败",
    decryptionFailed: "解密失败",

    // 信使/凭据
    credentialNotFound: "凭据不存在",
    credentialRevoked: "凭据已撤销",
    credentialCreated: "凭据已创建",
    credentialUpdated: "凭据已更新",
    tooManyAttempts: "尝试次数过多",
    accessDenied: "访问被拒绝",

    // 死信
    deadlineNotReached: "尚未到达死信时间",
    deadLetterTriggered: "死信通知已触发",
    renewalConfirmed: "续期已确认",
    autoDelivered: "已自动交付",

    // 导入导出
    exportSuccess: "导出成功",
    importSuccess: "导入成功",
    importFailed: "导入失败，文件格式不正确",
    importPartial:
      "部分导入成功：{success} 条成功，{failed} 条失败",

    // 验证
    credentialInvalid: "凭据无效或已过期",
    passwordRequired: "请提供解密密码",
    passwordWrong: "密码错误",
  },
  // ============================================================
  // 法律合规
  // ============================================================
  legal: {
    cookieConsentTitle: "Cookie 使用说明",
    cookieConsentBody:
      "本网站使用必要的 Cookie 来识别你的设备和保持登录状态。我们不使用任何三方追踪或广告 Cookie。继续使用即表示你同意。",
    cookieAccept: "知道了",
    cookieLearnMore: "了解更多",

    // 隐私政策
    privacyTitle: "隐私政策",
    privacyLastUpdated: "最后更新：2026年6月17日",
    privacyIntro:
      "万一呢（以下简称「我们」）重视你的隐私。本隐私政策说明了我们如何收集、使用和保护你的信息。",
    privacyInfoWeCollect:
      "我们收集的信息：(a) 联系方式——你提供的手机号和/或邮箱，用于身份验证和信使通知；(b) 加密内容——资产清单和心底话草稿，均在浏览器端使用 AES-256-GCM 加密后上传，我们无法也无法访问明文；(c) 账户元数据——订阅状态、守护阈值设置、信使关系；(d) 必要 Cookie——用于识别设备和保持登录的会话令牌。",
    privacyHowWeUse:
      "我们如何使用你的信息：(a) 验证你的身份并在不同设备间恢复账户；(b) 在守护阈值触发时发送信使通知（短信/邮件）；(c) 处理订阅和维护账户；(d) 发送服务更新或重要安全通知。我们不会将你的信息用于广告、用户画像或自动化决策。",
    privacySMSData:
      "短信/文字消息：如果你提供了手机号，我们仅将其用于身份验证和信使通知。获得你的明确同意后，我们可能会发送验证码、信使邀请和守护状态提醒等短信。消息频率不定，通常较低（每月几条）。可能产生运营商短信费用。你可以随时回复 STOP 退订，或在设置中更新偏好。退订后我们仅发送一条确认短信，不再发送除你重新订阅外的任何短信。",
    privacyDataSharing:
      "数据共享与披露：我们不会将你的个人信息（包括手机号、邮箱和短信同意数据）出售、出租、交易或分享给任何第三方用于其营销或推广目的。我们仅在以下情况分享信息：(a) 与服务提供商（如 Twilio 发送短信、Resend 发送邮件、Supabase 托管数据库），这些提供商受合同约束，仅将你的数据用于为我们提供服务；(b) 法律、法院命令或政府法规要求时；(c) 为保护我们的权利、财产或安全。所有服务提供商均符合 GDPR 和 CCPA 合规要求。",
    privacyDataRetention:
      "数据保留：你的账户信息在账户活跃期间保留。加密内容在删除前一直存储。如果你删除账户，所有关联数据将在 30 天内永久删除。日志数据最多保留 90 天。",
    privacyYourRights:
      "你的权利：根据你的所在地法律，你可能有以下权利：访问我们持有的你的个人数据；更正不准确的数据；删除你的账户和所有关联数据；以可移植格式导出你的数据；随时撤回短信/邮件同意；向当地数据保护机构投诉。如需行使这些权利，请联系 privacy@in-case.me。",
    privacyGDPR:
      "GDPR 与 CCPA 合规：我们遵守欧盟《通用数据保护条例》(GDPR) 和《加州消费者隐私法案》(CCPA)。根据 GDPR，我们处理你的联系信息的合法基础是你的明确同意以及我们提供服务的合法利益。我们不出售 CCPA 定义的个人数据。欧盟用户享有数据可移植权和被遗忘权。你可以指定授权代理代表你提交请求。",
    privacyChildren:
      "儿童隐私：万一呢不面向 16 岁以下个人提供服务。我们不会故意收集儿童的个人信息。如果我们发现 16 岁以下儿童向我们提供了个人数据，我们将立即删除。",
    privacyContact: "如有隐私方面的问题，请发送邮件至 privacy@in-case.me。通常在 48 小时内回复。",

    // 服务条款
    termsTitle: "服务条款",
    termsLastUpdated: "最后更新：2026年6月17日",
    termsIntro:
      "欢迎使用万一呢。访问或使用我们的网站和服务即表示你同意受本服务条款的约束。如果你不同意，请立即停止使用。",
    termsEligibility:
      "使用资格：你必须年满 16 岁才能使用万一呢。创建账户即表示你已达到法定年龄并具备签订具有约束力协议的能力。如果你代表组织使用本服务，即表示你有权代表该组织同意本条款。",
    termsAccount:
      "账户与安全：你有责任保护账户凭证和解密密码的机密性。万一呢采用零知识架构——你的密码永不上传服务器，丢失后无法找回。你对账户下的所有活动负责。如发现任何未经授权的使用，请立即通知我们。",
    termsSMS:
      "短信/文字消息：提供手机号即表示你明确书面同意接收万一呢发送的短信，包括：身份验证码、信使邀请和状态更新、守护阈值通知、重要账户提醒。消息频率不定（通常每月 1-10 条）。可能产生运营商短信费用。你并非必须同意接收短信作为购买条件。随时回复 STOP 退订。退订后会收到一条确认短信。如需帮助，回复 HELP 或联系 support@in-case.me。支持的运营商包括但不限于中国移动、中国联通、中国电信及其附属公司。对于因运营商过滤或网络状况导致的延迟或未送达消息，我们不承担责任。",
    termsSubscription:
      "订阅与计费：万一呢提供年费订阅（$23/年）和终身访问（$198 一次性）。所有价格以美元计价。年费订阅在到期前自动续费，除非你在续费日前至少 24 小时取消。你可以在账户设置中随时取消自动续费。已付订阅费用不可退款，除非适用法律要求或退款政策另有说明。我们保留调整价格的权利，价格变动不影响当前订阅周期，续费时生效。",
    termsRefund:
      "退款政策：年费订阅在首次购买或续费后 14 天内可申请全额退款，前提是未触发任何信使通知流程。终身购买为最终交易，不可退款。如需退款，请发送邮件至 support@in-case.me 并提供账户信息。退款将在 5-10 个工作日内退回原支付方式。详见完整退款政策页面。",
    termsDisclaimer:
      "法律免责声明：万一呢是一个数字资产规划和组织工具。它不是律师事务所，不提供法律、财务或税务建议。本产品生成的任何内容（包括资产清单、平台提取指南、心底话草稿）均不构成法律文件、遗嘱或遗嘱文件。涉及重大法律权益或财务义务的事项，请咨询你所在司法管辖区的持证专业人士。",
    termsLiability:
      "责任限制：在适用法律允许的最大范围内，万一呢及其运营者不对因使用本服务而产生或与之相关的任何间接、附带、特殊、后果性或惩罚性损害承担责任，包括但不限于：数据丢失或损坏；信使通知延迟、失败或错误投递；第三方服务中断（如短信运营商、云服务商、支付处理商）；因你未能保护凭证而导致的账户未授权访问。我们的累计责任在任何情况下不超过你在索赔发生前 12 个月内向我们支付的金额。",
    termsTermination:
      "账户终止：你可以在设置页面随时停止使用万一呢并删除账户。如果你违反本条款、从事非法活动，或账户在合理通知后长期不活跃，我们可能暂停或终止你的账户。终止后，你的加密数据将在 30 天内永久删除。",
    termsChanges:
      "条款变更：我们可能不时更新本条款。重大变更将通过邮件或服务内通知提前至少 30 天告知。在生效日期后继续使用即表示接受更新后的条款。最新版本始终可在 in-case.me/terms 查看。",
    termsContact: "如有关于本条款的问题，请联系 support@in-case.me。",

    // 退款政策
    refundTitle: "退款政策",
    refundLastUpdated: "最后更新：2026年6月17日",
    refundIntro: "我们希望你对万一呢满意。本政策说明了何时以及如何退款。",
    refundAnnual:
      "年费订阅（$23/年）：首次购买或续费后 14 个日历日内可申请全额退款，前提是你账户尚未触发任何信使通知流程。14 天后的退款请求由我们酌情处理。",
    refundLifetime:
      "终身访问（$198）：终身购买为最终交易，不可退款。这是一次性付款，在服务存续期间提供访问权限。购买终身访问即表示你知悉并接受本政策。",
    refundProcess:
      "如何申请退款：发送邮件至 support@in-case.me，提供你的注册邮箱和申请原因。已批准的退款将在 5-10 个工作日内退回原支付方式。退款完成后你将收到邮件确认。",
    refundExceptions:
      "例外情形：本政策不限制你根据所在司法管辖区适用消费者保护法享有的任何法定退款权利。如果你认为根据当地法律你有权获得退款，请联系我们，我们将审查你的请求。",
    refundContact: "有问题？联系 support@in-case.me。",

    // FAQ
    faqTitle: "常见问题",
    faqLastUpdated: "最后更新：2026年6月",
  },
} as const;

export default zh;
type Widen<T> = T extends string ? string : T extends object ? { [K in keyof T]: Widen<T[K]> } : T;
export type I18nStrings = Widen<typeof zh>;
