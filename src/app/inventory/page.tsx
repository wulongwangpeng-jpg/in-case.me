"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Send, Loader2, ClipboardList, CheckCircle2, Sparkles,
  ChevronDown, Bot, Pencil, Plus, X, ListPlus,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SaveToVault } from "@/components/vault/SaveToVault";
import { ExpandableTextarea } from "@/components/vault/ExpandableTextarea";
import { useI18n } from "@/i18n";
import { VaultList } from "@/components/vault/VaultList";
import { AIGreeting } from "@/components/vault/AIGreeting";

type Category = "finance" | "investment" | "creator" | "gaming";

const CATEGORIES: Category[] = ["finance", "investment", "creator", "gaming"];

interface Entry {
  id: string;
  platform: string;
  accountDesc: string;
  notes: string;
  action: string;
  category: string;
  extra?: Record<string, string>;
}

interface PendingEntry {
  id: string;
  platform: string;
  accountDesc: string;
  extra1: string;
  extra2: string;
  extra3: string;
  notes: string;
  action: string;
  customAction: string;
  category: Category;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  assets?: Array<{
    category: string;
    platform: string;
    accountName?: string;
    action: string;
    notes?: string;
  }>;
  summary?: string;
  done?: boolean;
}

export default function InventoryPage() {
  const { t, lang } = useI18n();
  const locale = lang === "en" ? "en-US" : "zh-CN";

  // ──── 模式 ────
  const [mode, setMode] = useState<"direct" | "ai">("direct");
  const [tab, setTab] = useState<Category>("finance");

  // ──── 直接录入状态 ────
  const [platform, setPlatform] = useState("");
  const [account, setAccount] = useState("");
  const [extra1, setExtra1] = useState(""); // 渠道/品种/粉丝/价值
  const [extra2, setExtra2] = useState(""); // 额外字段
  const [extra3, setExtra3] = useState(""); // 额外字段
  const [notes, setNotes] = useState("");
  const [action, setAction] = useState("undecided");
  const [customAction, setCustomAction] = useState("");
  const [showActionPicker, setShowActionPicker] = useState(false);
  const [lastSaved, setLastSaved] = useState(false);
  const [pendingEntries, setPendingEntries] = useState<PendingEntry[]>([]);

  // ──── AI 聊天状态 ────
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [aiEntries, setAiEntries] = useState<Entry[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (mode === "ai" && messages.length === 0) {
      startConversation();
    }
  }, [mode]);

  // ──── 切换分类：重置表单 ────
  function switchTab(c: Category) {
    setTab(c);
    setPlatform("");
    setAccount("");
    setExtra1("");
    setExtra2("");
    setExtra3("");
    setNotes("");
    setAction("undecided");
    setCustomAction("");
  }

  // ──── 类别 action labels ────
  function getActions(): Record<string, string> {
    switch (tab) {
      case "finance": return t.inventory.financeActions as unknown as Record<string, string>;
      case "investment": return t.inventory.investmentActions as unknown as Record<string, string>;
      case "creator": return t.inventory.creatorActions as unknown as Record<string, string>;
      case "gaming": return t.inventory.gamingActions as unknown as Record<string, string>;
    }
  }

  // ──── 类别 categoryTag ────
  function getCategoryTag(): string {
    switch (tab) {
      case "finance": return "finance";
      case "investment": return "investment";
      case "creator": return "creator";
      case "gaming": return "gaming";
    }
  }

  // ──── AI category labels ────
  const categoryLabels: Record<string, string> = {
    finance: t.inventory.categories.finance,
    investment: t.inventory.categories.investment,
    creator: t.inventory.categories.creator,
    gaming: t.inventory.categories.gaming,
    social: t.inventory.categories.finance,
    payment: t.inventory.categories.investment,
    entertainment: t.inventory.categories.gaming,
    creative: t.inventory.categories.creator,
    other: t.inventory.actions.undecided,
  };

  const actionLabels: Record<string, string> = {
    keep: t.inventory.actions.keep,
    transfer: t.inventory.actions.transfer,
    delete: t.inventory.actions.delete,
    undecided: t.inventory.actions.undecided,
    withdraw: (t.inventory.financeActions as Record<string, string>).withdraw,
    cashOut: (t.inventory.investmentActions as Record<string, string>).cashOut,
    hold: (t.inventory.investmentActions as Record<string, string>).hold,
    sell: (t.inventory.gamingActions as Record<string, string>).sell,
    memorialize: (t.inventory.gamingActions as Record<string, string>).memorialize,
  };

  // ──── 构建 content ────
  function buildContent() {
    const finalAction = action === "custom" ? customAction : action;
    const base = { platform: platform.trim(), action: finalAction, notes: notes.trim(), category: getCategoryTag() };
    switch (tab) {
      case "finance": return { ...base, accountName: account.trim() };
      case "investment": return { ...base, invType: extra1.trim(), scale: extra2.trim() };
      case "creator": return { ...base, audience: extra1.trim(), income: extra2.trim(), business: extra3.trim(), assets: account.trim() };
      case "gaming": return { ...base, value: extra1.trim(), bind: extra2.trim() };
    }
  }

  function buildAlias(): string {
    const p = platform.trim() || t.inventory.unnamedPlatform;
    return `${p} · ${t.inventory.categories[tab]}`;
  }

  // ──── 加入列表 ────
  function handleAddToList() {
    if (!platform.trim()) {
      toast.error(t.inventory.platformRequired || "请先填写平台名称");
      return;
    }
    const entry: PendingEntry = {
      id: crypto.randomUUID(),
      platform: platform.trim(),
      accountDesc: account.trim(),
      extra1: extra1.trim(),
      extra2: extra2.trim(),
      extra3: extra3.trim(),
      notes: notes.trim(),
      action,
      customAction,
      category: tab,
    };
    setPendingEntries((prev) => [...prev, entry]);
    // 清空表单
    setPlatform("");
    setAccount("");
    setExtra1("");
    setExtra2("");
    setExtra3("");
    setNotes("");
    setAction("undecided");
    setCustomAction("");
    toast.success(t.inventory.addedToList || "已加入列表");
  }

  function handleRemovePending(id: string) {
    setPendingEntries((prev) => prev.filter((e) => e.id !== id));
  }

  // ──── 构建 pending entry 的摘要标签 ────
  function getPendingLabel(e: PendingEntry): string {
    const parts = [e.platform];
    if (e.accountDesc) parts.push(e.accountDesc);
    else if (e.extra1) parts.push(e.extra1);
    return parts.join(" · ");
  }

  function getPendingDetail(e: PendingEntry): string {
    const parts: string[] = [];
    if (e.category === "investment") {
      if (e.extra1) parts.push(e.extra1);
      if (e.extra2) parts.push(e.extra2);
    } else if (e.category === "creator") {
      if (e.extra1) parts.push(e.extra1);
      if (e.extra2) parts.push(e.extra2);
      if (e.extra3) parts.push(e.extra3);
    } else if (e.category === "gaming") {
      if (e.extra1) parts.push(e.extra1);
      if (e.extra2) parts.push(e.extra2);
    }
    return parts.join(" · ");
  }

  // ──── 保存后清空 ────
  function handleDirectSaved() {
    setPlatform("");
    setAccount("");
    setExtra1("");
    setExtra2("");
    setExtra3("");
    setNotes("");
    setAction("undecided");
    setCustomAction("");
    setLastSaved(true);
    setTimeout(() => setLastSaved(false), 3000);
  }

  // ──── AI 聊天 ────
  async function startConversation() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      const data = await res.json();
      setMessages([{ role: "assistant", content: data.message }]);
    } catch { toast.error(t.common.error); }
    finally { setLoading(false); }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "chat", messages: [...messages, { role: "user", content: userMessage }] }),
      });
      const data = await res.json();
      const newMsg: Message = { role: "assistant", content: data.message, assets: data.assets, summary: data.summary, done: data.done };
      setMessages((prev) => [...prev, newMsg]);
      if (data.assets?.length) {
        const converted: Entry[] = data.assets.map((a: { category: string; platform: string; accountName?: string; action: string; notes?: string }) => ({
          id: crypto.randomUUID(), platform: a.platform, accountDesc: a.accountName || "", notes: a.notes || "", action: a.action, category: a.category,
        }));
        setAiEntries((prev) => [...prev, ...converted]);
      }
      if (data.done) setDone(true);
    } catch { toast.error(t.common.error); }
    finally { setLoading(false); }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && mode === "ai") { e.preventDefault(); sendMessage(); }
  }

  const actions = getActions();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center justify-center rounded-lg h-7 gap-1 px-2.5 text-[0.8rem] hover:bg-muted hover:text-foreground transition-all mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> {t.common.back}
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <ClipboardList className="w-7 h-7 text-amber-500" />
          {t.inventory.title}
        </h1>
        <p className="text-muted-foreground mt-1">{t.inventory.hintText}</p>
      </div>

      {/* 价值说明 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800 leading-relaxed">
        <strong>{t.inventory.valueTipTitle}:</strong> {t.inventory.valueTipBody}
      </div>

      {/* 模式切换 */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setMode("direct")} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${mode === "direct" ? "bg-amber-50 border border-amber-200 text-amber-800" : "bg-muted/60 border border-border/40 text-muted-foreground hover:text-foreground"}`}>
          <Pencil className="w-4 h-4 inline mr-1.5" />{t.inventory.directMode}
        </button>
        <button onClick={() => setMode("ai")} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${mode === "ai" ? "bg-amber-50 border border-amber-200 text-amber-800" : "bg-muted/60 border border-border/40 text-muted-foreground hover:text-foreground"}`}>
          <Bot className="w-4 h-4 inline mr-1.5" />{t.inventory.aiMode}
        </button>
      </div>

      {/* ==================== 分类标签 ==================== */}
      {mode === "direct" && (
        <div className="flex gap-1.5 mb-6">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => switchTab(c)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${tab === c ? "bg-amber-100 border border-amber-300 text-amber-800" : "bg-muted/40 border border-border/30 text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              {t.inventory.categoryTabs[c]}
            </button>
          ))}
        </div>
      )}

      {/* ==================== 直接录入 ==================== */}
      {mode === "direct" && (
        <div className="space-y-6">
          {/* 待保存列表 */}
          {pendingEntries.length > 0 && (
            <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-emerald-800">
                  {lang === "en" ? `${pendingEntries.length} item(s) ready` : `待保存 · ${pendingEntries.length} 条`}
                </p>
                <span className="text-[11px] text-emerald-600/70">
                  {lang === "en" ? "add more or save all" : "继续添加或一键保存"}
                </span>
              </div>
              <div className="space-y-2">
                {pendingEntries.map((e) => (
                  <div key={e.id} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-emerald-200/40">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-neutral-700 truncate">{getPendingLabel(e)}</p>
                      {getPendingDetail(e) && (
                        <p className="text-[11px] text-muted-foreground truncate">{getPendingDetail(e)}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[11px] shrink-0">{actions[e.action]}</Badge>
                    <button onClick={() => handleRemovePending(e.id)} className="w-5 h-5 rounded-md hover:bg-red-50 flex items-center justify-center shrink-0 transition-colors">
                      <X className="w-3 h-3 text-muted-foreground hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Card className="border-border/60 overflow-visible">
            <CardContent className="p-4 sm:p-5 space-y-3 overflow-visible">

              {/* === 平台名（所有类别共用） === */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  {tab === "finance" ? t.inventory.financeLabel
                    : tab === "investment" ? t.inventory.investmentLabel
                    : tab === "creator" ? t.inventory.creatorLabel
                    : t.inventory.gamingLabel}
                </label>
                <ExpandableTextarea value={platform} onChange={setPlatform}
                  placeholder={
                    tab === "finance" ? t.inventory.financePlaceholder
                    : tab === "investment" ? t.inventory.investmentPlaceholder
                    : tab === "creator" ? t.inventory.creatorPlaceholder
                    : t.inventory.gamingPlaceholder
                  }
                  rows={2}
                  label={
                    tab === "finance" ? t.inventory.financeLabel
                    : tab === "investment" ? t.inventory.investmentLabel
                    : tab === "creator" ? t.inventory.creatorLabel
                    : t.inventory.gamingLabel
                  }
                />
              </div>

              {/* === 金融类字段 === */}
              {tab === "finance" && (
                <>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.inventory.financeAccountLabel}</label>
                    <ExpandableTextarea value={account} onChange={setAccount} placeholder={t.inventory.financeAccountPlaceholder} rows={2} label={t.inventory.financeAccountLabel} />
                  </div>
                </>
              )}

              {/* === 投资类字段 === */}
              {tab === "investment" && (
                <>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.inventory.investmentTypeLabel}</label>
                    <ExpandableTextarea value={extra1} onChange={setExtra1} placeholder={t.inventory.investmentTypePlaceholder} rows={2} label={t.inventory.investmentTypeLabel} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.inventory.investmentScaleLabel}</label>
                    <ExpandableTextarea value={extra2} onChange={setExtra2} placeholder={t.inventory.investmentScalePlaceholder} rows={2} label={t.inventory.investmentScaleLabel} />
                  </div>
                </>
              )}

              {/* === 创作类字段 === */}
              {tab === "creator" && (
                <>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.inventory.creatorAudienceLabel}</label>
                    <ExpandableTextarea value={extra1} onChange={setExtra1} placeholder={t.inventory.creatorAudiencePlaceholder} rows={2} label={t.inventory.creatorAudienceLabel} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.inventory.creatorIncomeLabel}</label>
                    <ExpandableTextarea value={extra2} onChange={setExtra2} placeholder={t.inventory.creatorIncomePlaceholder} rows={2} label={t.inventory.creatorIncomeLabel} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.inventory.creatorBusinessLabel}</label>
                    <ExpandableTextarea value={extra3} onChange={setExtra3} placeholder={t.inventory.creatorBusinessPlaceholder} rows={2} label={t.inventory.creatorBusinessLabel} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.inventory.creatorAssetsLabel}</label>
                    <ExpandableTextarea value={account} onChange={setAccount} placeholder={t.inventory.creatorAssetsPlaceholder} rows={2} label={t.inventory.creatorAssetsLabel} />
                  </div>
                </>
              )}

              {/* === 游戏类字段 === */}
              {tab === "gaming" && (
                <>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.inventory.gamingValueLabel}</label>
                    <ExpandableTextarea value={extra1} onChange={setExtra1} placeholder={t.inventory.gamingValuePlaceholder} rows={2} label={t.inventory.gamingValueLabel} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.inventory.gamingBindLabel}</label>
                    <ExpandableTextarea value={extra2} onChange={setExtra2} placeholder={t.inventory.gamingBindPlaceholder} rows={2} label={t.inventory.gamingBindLabel} />
                  </div>
                </>
              )}

              {/* === 处理方式（所有类别） === */}
              <div className="flex gap-3 items-end">
                <div className="relative flex-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.inventory.creatorDisposalLabel}</label>
                  <button type="button" onClick={() => setShowActionPicker(!showActionPicker)}
                    className="h-8 w-full flex items-center justify-between gap-1 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <span>{actions[action]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  {showActionPicker && (
                    <div className="absolute top-full mt-1 left-0 z-50 bg-white border border-border/30 rounded-xl shadow-xl ring-1 ring-black/5 py-1 min-w-[130px]">
                      {Object.entries(actions).map(([key, label]) => (
                        <button key={key} onClick={() => { setAction(key); setShowActionPicker(false); }}
                          className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors ${action === key ? "font-medium text-amber-600" : ""}`}
                        >{label}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 自定义输入 */}
              {action === "custom" && (
                <div>
                  <ExpandableTextarea value={customAction} onChange={setCustomAction} placeholder={t.inventory.customActionPlaceholder} rows={2} label={t.inventory.customActionPlaceholder} />
                </div>
              )}

              {/* === 给信使的话 === */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.inventory.notesLabel}</label>
                <ExpandableTextarea value={notes} onChange={setNotes} placeholder={
                  tab === "finance" ? t.inventory.notesPlaceholderFinance
                  : tab === "investment" ? t.inventory.notesPlaceholderInvestment
                  : tab === "creator" ? t.inventory.notesPlaceholderCreator
                  : t.inventory.notesPlaceholderGaming
                } rows={3} label={t.inventory.notesLabel} />
              </div>

              {/* 金融/投资提示 */}
              {(tab === "finance" || tab === "investment") && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50/60 border border-amber-200/50 text-[11px] text-amber-800/80 leading-relaxed">
                  <span className="text-amber-500 shrink-0 mt-0.5">💡</span>
                  <span>{tab === "finance" ? t.inventory.financeChannelNote : t.inventory.investmentChannelNote}</span>
                </div>
              )}

              {/* ──── 按钮组 ──── */}
              <div className="flex flex-col gap-2 pt-1">
                {/* 加入列表 */}
                <button
                  type="button"
                  onClick={handleAddToList}
                  disabled={!platform.trim()}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 text-amber-700 text-sm font-medium hover:bg-amber-100 hover:border-amber-400 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ListPlus className="w-4 h-4" />
                  {lang === "en" ? "Add to list" : "加入列表"}
                </button>

                {/* 单条保存 */}
                {lastSaved ? (
                  <div className="flex items-center justify-center gap-2 py-2 text-sm text-emerald-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" />{t.inventory.savedHint}
                  </div>
                ) : (
                  <SaveToVault
                    vaultType="asset_inventory"
                    aliasName={buildAlias()}
                    memoryHint={account.trim() || extra1.trim() || undefined}
                    categoryTag={getCategoryTag()}
                    content={buildContent()}
                    triggerLabel={t.inventory.saveTriggerLabel}
                    onSaved={handleDirectSaved}
                  />
                )}
              </div>

              {/* 全部保存按钮 */}
              {pendingEntries.length > 0 && (
                <div className="pt-2 border-t border-border/30">
                  <SaveToVault
                    vaultType="asset_inventory"
                    aliasName={`${t.inventory.title} · ${t.inventory.categories[tab]} × ${pendingEntries.length}`}
                    memoryHint={pendingEntries.map((e) => getPendingLabel(e)).join(" / ")}
                    categoryTag={getCategoryTag()}
                    content={{ entries: pendingEntries.map((e) => {
                      const finalAction = e.action === "custom" ? e.customAction : e.action;
                      const base = { platform: e.platform, action: finalAction, notes: e.notes, category: e.category };
                      switch (e.category) {
                        case "finance": return { ...base, accountName: e.accountDesc };
                        case "investment": return { ...base, invType: e.extra1, scale: e.extra2 };
                        case "creator": return { ...base, audience: e.extra1, income: e.extra2, business: e.extra3, assets: e.accountDesc };
                        case "gaming": return { ...base, value: e.extra1, bind: e.extra2 };
                      }
                    }) }}
                    triggerLabel={lang === "en" ? `Save All (${pendingEntries.length})` : `全部保存 (${pendingEntries.length}条)`}
                    onSaved={() => {
                      setPendingEntries([]);
                      handleDirectSaved();
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ==================== AI 辅助模式 ==================== */}
      {mode === "ai" && (
        <div className="space-y-6">
          <AIGreeting message={t.inventory.aiGreeting} />
          <Card className="border-border/60 overflow-hidden">
            <div className="h-[450px] overflow-y-auto p-4 sm:p-6 space-y-4">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md" : "bg-muted/60 rounded-2xl rounded-bl-md"} px-4 py-3`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      {msg.assets && msg.assets.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.assets.map((asset, j) => (
                            <div key={j} className="flex items-center gap-2 bg-background/60 rounded-lg px-3 py-2 text-xs">
                              <Badge variant="outline" className="text-[11px] shrink-0">{categoryLabels[asset.category] || asset.category}</Badge>
                              <span className="font-medium">{asset.platform}</span>
                              <span className="text-muted-foreground ml-auto text-[11px]">{actionLabels[asset.action] || asset.action}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.summary && (
                        <div className="mt-3 bg-warm-50 text-warm-800 rounded-xl p-3 text-sm">
                          <CheckCircle2 className="w-4 h-4 inline mr-1" />{msg.summary}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && <div className="flex justify-start"><div className="bg-muted/60 rounded-2xl rounded-bl-md px-4 py-3"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div></div>}
              <div ref={messagesEndRef} />
            </div>
            {!done && (
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={t.inventory.aiChatPlaceholder} disabled={loading} className="flex-1" />
                  <Button size="icon" onClick={sendMessage} disabled={loading || !input.trim()}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">{t.inventory.aiChatHint}</p>
              </div>
            )}
          </Card>

          {aiEntries.length > 0 && (
            <div className="flex justify-center">
              <SaveToVault vaultType="asset_inventory" aliasName={`${t.inventory.title} · ${new Date().toLocaleDateString(locale)}`} memoryHint={t.inventory.savedCountHint.replace("{n}", String(aiEntries.length))} categoryTag="social" content={{ assets: aiEntries.map(e => ({ platform: e.platform, accountName: e.accountDesc, category: e.category, action: e.action, notes: e.notes })) }} triggerLabel={t.inventory.saveAllLabel} />
            </div>
          )}

          {done && (
            <div className="flex gap-3 justify-center">
              <Link href="/letters" className="inline-flex items-center justify-center rounded-lg border border-border bg-background hover:bg-muted h-9 gap-1.5 px-3 text-sm font-medium transition-all">
                <Sparkles className="w-4 h-4 mr-2" />{t.inventory.nextStepLetters}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 已保存的历史 */}
      <div className="mt-8">
        <VaultList vaultType="asset_inventory" emptyMessage={t.inventory.noAssets} />
      </div>
    </div>
  );
}
