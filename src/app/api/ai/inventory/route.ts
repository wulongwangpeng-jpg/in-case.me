import { NextRequest, NextResponse } from "next/server";
import { chatMultiTurn } from "@/lib/ai-client";
import { getOrCreateUser } from "@/lib/auth";
import {
  getInventorySystemPrompt,
  getInventoryStep1Prompt,
  getInventorySummaryPrompt,
} from "@/lib/prompts";
import { demoInventoryChat } from "@/lib/demo-ai";
import { getLangFromRequest } from "@/i18n/server";

// 无 API Key 时自动使用 Demo 模式
const USE_DEMO = !process.env.AI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    await getOrCreateUser(); // 认证
    const body = await req.json();
    const { action, messages } = body;
    const lang = getLangFromRequest(req);

    // ==================== Demo 模式 ====================
    if (USE_DEMO) {
      const userMessages =
        messages?.map((m: { content: string }) => m.content) || [];
      const result = await demoInventoryChat(action, userMessages, lang);
      return NextResponse.json(result);
    }

    // ==================== 真实 AI 模式 ====================
    if (action === "start") {
      const content = await chatMultiTurn({
        systemPrompt: getInventorySystemPrompt(lang),
        messages: [{ role: "user", content: getInventoryStep1Prompt(lang) }],
      });

      return NextResponse.json({ message: content });
    }

    if (action === "chat") {
      const conversationMessages = messages.map(
        (m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })
      );

      const lastFewMessages = conversationMessages.slice(-4);
      const userMsgCount = conversationMessages.filter(
        (m: { role: string }) => m.role === "user"
      ).length;

      const isWrappingUp =
        userMsgCount >= 5 &&
        (lastFewMessages.some(
          (m: { content: string }) =>
            m.content.includes("差不多了") ||
            m.content.includes("没有了") ||
            m.content.includes("就这些") ||
            m.content.includes("可以了") ||
            m.content.includes("done") ||
            m.content.includes("that's it") ||
            m.content.includes("finished")
        ) ||
          conversationMessages.length >= 12);

      if (isWrappingUp) {
        const summaryContent = await chatMultiTurn({
          systemPrompt: getInventorySystemPrompt(lang),
          messages: [
            ...conversationMessages,
            { role: "user", content: getInventorySummaryPrompt(lang) },
          ],
          jsonMode: true,
        });

        try {
          const parsed = JSON.parse(summaryContent);
          const defaultMsg = lang === "en"
            ? "Amazing work! You've done something genuinely important ✨"
            : "太棒了！你完成了一件很重要的事 ✨";
          return NextResponse.json({
            message: parsed.summary || defaultMsg,
            assets: parsed.assets || [],
            summary: parsed.summary,
            suggestions: parsed.suggestions,
            done: true,
          });
        } catch {
          return NextResponse.json({
            message: summaryContent,
            done: true,
          });
        }
      }

      const content = await chatMultiTurn({
        systemPrompt: getInventorySystemPrompt(lang),
        messages: conversationMessages,
      });

      return NextResponse.json({ message: content });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Inventory API error:", error);
    return NextResponse.json(
      { error: "AI service unavailable" },
      { status: 500 }
    );
  }
}
