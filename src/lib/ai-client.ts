import OpenAI from "openai";

/**
 * AI 客户端 — 支持 DeepSeek 和 OpenAI 兼容 API
 * 通过环境变量配置:
 *   AI_API_KEY      — API密钥
 *   AI_BASE_URL     — API地址（默认 DeepSeek）
 *   AI_MODEL        — 模型名称（默认 deepseek-chat）
 */

const apiKey = process.env.AI_API_KEY || "";
const baseURL = process.env.AI_BASE_URL || "https://api.deepseek.com/v1";
const model = process.env.AI_MODEL || "deepseek-chat";

// 只在服务端创建
let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey,
      baseURL,
    });
  }
  return client;
}

export interface ChatOptions {
  systemPrompt: string;
  userMessage: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export async function chat({
  systemPrompt,
  userMessage,
  temperature = 0.8,
  maxTokens = 2000,
  jsonMode = false,
}: ChatOptions): Promise<string> {
  const c = getClient();

  const response = await c.chat.completions.create({
    model,
    temperature,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    ...(jsonMode && { response_format: { type: "json_object" } }),
  });

  return response.choices[0]?.message?.content || "";
}

export async function chatMultiTurn({
  systemPrompt,
  messages,
  temperature = 0.8,
  maxTokens = 2000,
  jsonMode = false,
}: {
  systemPrompt: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}): Promise<string> {
  const c = getClient();

  const response = await c.chat.completions.create({
    model,
    temperature,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ],
    ...(jsonMode && { response_format: { type: "json_object" } }),
  });

  return response.choices[0]?.message?.content || "";
}
