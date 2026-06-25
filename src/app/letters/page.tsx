"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Loader2, Mail, Heart, Bot, Pencil, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useI18n } from "@/i18n";
import { SaveToVault } from "@/components/vault/SaveToVault";
import { VaultList } from "@/components/vault/VaultList";
import { AIGreeting } from "@/components/vault/AIGreeting";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function LettersPage() {
  const { t, lang } = useI18n();
  const [mode, setMode] = useState<"direct" | "ai">("direct");

  // ──── 直接书写状态 ────
  const [recipient, setRecipient] = useState("");
  const [letterBody, setLetterBody] = useState("");
  const [lastSaved, setLastSaved] = useState(false);

  function handleDirectSaved() {
    setRecipient("");
    setLetterBody("");
    setLastSaved(true);
    setTimeout(() => setLastSaved(false), 3000);
  }

  // ──── AI 聊天状态 ────
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (mode === "ai" && messages.length === 0) {
      startConversation();
    }
  }, [mode]);

  async function startConversation() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      const data = await res.json();
      setMessages([{ role: "assistant", content: data.message }]);
    } catch {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          messages: [...messages, { role: "user", content: userMessage }],
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      if (data.draft) setDraft(data.draft);
    } catch {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && mode === "ai") {
      e.preventDefault();
      sendMessage();
    }
  }

  const locale = lang === "en" ? "en-US" : "zh-CN";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg h-7 gap-1 px-2.5 text-[0.8rem] hover:bg-muted hover:text-foreground transition-all mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> {t.common.back}
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <Mail className="w-7 h-7 text-rose-500" />
          {t.letters.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t.letters.desc}
        </p>
      </div>

      {/* 页面引导 */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 text-sm text-rose-800 leading-relaxed">
        <strong>{t.letters.valueTipTitle}:</strong> {t.letters.valueTipBody}
      </div>

      {/* 模式切换 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode("direct")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
            mode === "direct"
              ? "bg-rose-50 border border-rose-200 text-rose-800"
              : "bg-muted/60 border border-border/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Pencil className="w-4 h-4 inline mr-1.5" />
          {t.letters.directMode}
        </button>
        <button
          onClick={() => setMode("ai")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
            mode === "ai"
              ? "bg-rose-50 border border-rose-200 text-rose-800"
              : "bg-muted/60 border border-border/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bot className="w-4 h-4 inline mr-1.5" />
          {t.letters.aiMode}
        </button>
      </div>

      {/* ==================== 直接书写模式 ==================== */}
      {mode === "direct" && (
        <div className="space-y-6">
          <Card className="border-rose-200 bg-rose-50/50">
            <CardContent className="p-4 sm:p-5 space-y-4">
              {/* 收信人 */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  {t.letters.recipientLabel}
                </label>
                <Input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder={t.letters.recipientPlaceholder}
                />
              </div>

              {/* 正文 */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  {t.letters.bodyLabel}
                </label>
                <textarea
                  value={letterBody}
                  onChange={(e) => setLetterBody(e.target.value)}
                  rows={8}
                  className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm resize-none outline-none transition-colors placeholder:text-muted-foreground/50 focus-visible:border-rose-300 focus-visible:ring-2 focus-visible:ring-rose-50"
                  placeholder={t.letters.bodyPlaceholder}
                />
              </div>

              {/* 保存 */}
              {lastSaved ? (
                <div className="flex items-center justify-center gap-2 py-2 text-sm text-emerald-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  {t.letters.savedHint}
                </div>
              ) : (
                <div className="flex justify-center">
                  <SaveToVault
                    vaultType="farewell_letter"
                    aliasName={`${t.letters.recipientLabel} ${recipient.trim() || t.letters.importantPerson} · ${new Date().toLocaleDateString(locale)}`}
                    categoryTag="letter"
                    content={{
                      recipient: recipient.trim(),
                      body: letterBody.trim(),
                    }}
                    triggerLabel={t.letters.saveTriggerLabel}
                    onSaved={handleDirectSaved}
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
          <AIGreeting message={t.letters.aiGreeting} />
          <Card className="border-border/60 overflow-hidden">
            <div className="h-[450px] overflow-y-auto p-4 sm:p-6 space-y-4">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
                          : "bg-muted/60 rounded-2xl rounded-bl-md"
                      } px-4 py-3`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted/60 rounded-2xl rounded-bl-md px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.letters.aiChatPlaceholder}
                  disabled={loading}
                  className="flex-1"
                />
                <Button size="icon" onClick={sendMessage} disabled={loading || !input.trim()}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </Card>

          {/* AI 生成的草稿 */}
          {draft && (
            <Card className="border-rose-200 bg-rose-50/50">
              <CardContent className="p-4 sm:p-5">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  {t.letters.aiDraftLabel}
                </h3>
                <div className="whitespace-pre-wrap text-sm leading-relaxed bg-white rounded-lg p-4 mb-3">
                  {draft}
                </div>
                <div className="flex justify-center">
                  <SaveToVault
                    vaultType="farewell_letter"
                    aliasName={`${t.letters.title} · ${new Date().toLocaleDateString(locale)}`}
                    categoryTag="letter"
                    content={{ body: draft }}
                    triggerLabel={t.letters.saveTriggerLabel}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 已保存的历史 */}
      <div className="mt-8">
        <VaultList
          vaultType="farewell_letter"
          emptyMessage={t.letters.noLetters}
        />
      </div>
    </div>
  );
}
