/**
 * 仅用于本地排查：检查服务端是否读到 OPENAI 环境变量（不暴露具体值）
 * 开发时访问 GET /api/chat/config 即可
 */
import { getOpenAIChatConfig, isOpenAIConfigured } from "@/lib/chat-config"
import { NextResponse } from "next/server"

export async function GET() {
  const { baseURL, apiKey, model } = getOpenAIChatConfig()
  return NextResponse.json({
    configured: isOpenAIConfigured(),
    hasApiKey: apiKey.length > 0,
    hasBaseUrl: baseURL.length > 0,
    model,
    hint: !apiKey
      ? "请在项目根目录 .env.local 中设置 OPENAI_API_KEY，保存后重启开发服务器（重新运行 npm run dev）"
      : undefined,
  })
}
