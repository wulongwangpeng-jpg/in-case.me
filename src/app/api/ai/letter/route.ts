import { NextRequest, NextResponse } from "next/server";
import { chatMultiTurn } from "@/lib/ai-client";
import { getOrCreateUser } from "@/lib/auth";
import {
  getLetterSystemPrompt,
  getLetterStep1Prompt,
  getLetterDraftPrompt,
} from "@/lib/prompts";
import { demoLetterChat } from "@/lib/demo-ai";
import { getLangFromRequest } from "@/i18n/server";

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
      const result = await demoLetterChat(action, userMessages, lang);
      return NextResponse.json(result);
    }

    // ==================== 真实 AI 模式 ====================
    if (action === "start") {
      const content = await chatMultiTurn({
        systemPrompt: getLetterSystemPrompt(lang),
        messages: [{ role: "user", content: getLetterStep1Prompt(lang) }],
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

      const userMsgCount = conversationMessages.filter(
        (m: { role: string }) => m.role === "user"
      ).length;

      const isReadyForDraft =
        userMsgCount >= 3 &&
        (conversationMessages.length >= 6 ||
          conversationMessages.some(
            (m: { content: string }) =>
              m.content.includes("写出来") ||
              m.content.includes("帮我写") ||
              m.content.includes("生成") ||
              m.content.includes("可以了") ||
              m.content.includes("draft") ||
              m.content.includes("write it") ||
              m.content.includes("ready")
          ));

      if (isReadyForDraft) {
        const draftContent = await chatMultiTurn({
          systemPrompt: getLetterSystemPrompt(lang),
          messages: [
            ...conversationMessages,
            { role: "user", content: getLetterDraftPrompt(lang) },
          ],
          jsonMode: true,
        });

        try {
          const parsed = JSON.parse(draftContent);
          const defaultMsg = lang === "en"
            ? "Here's a draft for you 💌"
            : "我帮你写了一封初稿，看看怎么样？💌";
          return NextResponse.json({
            message: parsed.message || defaultMsg,
            draft: parsed.draft,
            tone: parsed.tone,
            suggestions: parsed.suggestions || [],
          });
        } catch {
          const defaultMsg = lang === "en"
            ? "Here's a draft:"
            : "我帮你写了一封初稿：";
          return NextResponse.json({
            message: defaultMsg,
            draft: draftContent,
            suggestions: [],
          });
        }
      }

      const content = await chatMultiTurn({
        systemPrompt: getLetterSystemPrompt(lang),
        messages: conversationMessages,
      });
      return NextResponse.json({ message: content });
    }

    if (action === "regenerate") {
      const conversationMessages = messages.map(
        (m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })
      );

      const extraPrompt = lang === "en"
        ? "\n\nWrite from a different angle and tone. Don't make it like the last version."
        : "\n\n请用不同的角度和语气重新写。不要跟上次一样。";

      const draftContent = await chatMultiTurn({
        systemPrompt: getLetterSystemPrompt(lang),
        messages: [
          ...conversationMessages,
          {
            role: "user" as const,
            content: getLetterDraftPrompt(lang) + extraPrompt,
          },
        ],
        jsonMode: true,
        temperature: 1.0,
      });

      try {
        const parsed = JSON.parse(draftContent);
        return NextResponse.json({
          draft: parsed.draft,
          tone: parsed.tone,
          suggestions: parsed.suggestions || [],
        });
      } catch {
        return NextResponse.json({
          draft: draftContent,
          suggestions: [],
        });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Letter API error:", error);
    return NextResponse.json(
      { error: "AI service unavailable" },
      { status: 500 }
    );
  }
}
