import {
  consumeStream,
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import {
  getOpenAIChatConfig,
  isOpenAIConfigured,
  OPENAI_CHAT_SYSTEM_PROMPT,
} from "@/lib/chat-config"

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messages: UIMessage[] = body?.messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "请求体需包含 messages 数组" },
        { status: 400 }
      )
    }

    const { baseURL, apiKey, model } = getOpenAIChatConfig()
    if (!apiKey) {
      return Response.json(
        {
          error: "AI 服务未配置",
          detail: "OPENAI_API_KEY 未配置",
          hint: "请在 .env.local 中设置 OPENAI_API_KEY，并重启开发服务器。参见 .env.example 与 docs/LLM_SETUP.md。",
        },
        { status: 500 }
      )
    }

    const openai = createOpenAI({ baseURL, apiKey })
    const result = streamText({
      model: openai(model),
      system: OPENAI_CHAT_SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      abortSignal: req.signal,
    })

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      consumeSseStream: consumeStream,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const cause = err instanceof Error && err.cause ? String(err.cause) : ""
    console.error("[api/chat]", message, cause || "")
    return Response.json(
      {
        error: "AI 服务请求失败",
        detail: message,
        hint: !isOpenAIConfigured()
          ? "请检查 .env.local 中 OPENAI_API_BASE 与 OPENAI_API_KEY，并重启开发服务器。"
          : "若使用代理，请确认 baseURL、API Key 及网络可访问。参见 docs/LLM_SETUP.md。",
      },
      { status: 500 }
    )
  }
}
