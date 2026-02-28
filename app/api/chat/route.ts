import {
  consumeStream,
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai"

export const maxDuration = 60

/**
 * ====== 模型配置说明 ======
 *
 * 当前默认使用 Vercel AI Gateway（零配置，v0 预览环境可直接运行）。
 *
 * 若要切换到通义千问（DashScope），请：
 * 1. 安装兼容 AI SDK 6 v2 规范的 provider（目前 @ai-sdk/openai 尚不支持自定义 baseURL 的 v2 模式）
 * 2. 或等待官方发布 @ai-sdk/dashscope provider
 * 3. 在 .env.local 中配置 DASHSCOPE_API_KEY=sk-xxxxxxxx
 *
 * 推荐做法：部署后通过 AI Gateway 添加自定义 provider 或使用兼容的模型
 */

// 默认使用 AI Gateway 的模型（v0 环境零配置可用）
const MODEL_ID = process.env.DASHSCOPE_API_KEY
  ? "openai/gpt-4o-mini" // TODO: 当 Dashscope provider 支持 v2 规范后替换为 qwen-plus
  : "openai/gpt-4o-mini"

const SYSTEM_PROMPT = `你是一位资深、耐心、温暖的声乐老师，面对的是中老年声乐爱好者。请用通俗易懂的语言，少用专业术语，多用鼓励的话语来解答他们关于唱歌、气息、发声的疑问。回答时注意：
1. 语气亲切，像和老朋友聊天一样
2. 每次回复尽量控制在100字以内，简洁明了
3. 多给予肯定和鼓励，让学员有信心继续练习
4. 如果涉及练习方法，要描述得具体、容易跟着做`

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: MODEL_ID,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  })
}
