import {
  consumeStream,
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai"
import { createOpenAI } from "@ai-sdk/openai"

export const maxDuration = 60

/**
 * 通义千问（DashScope）兼容 OpenAI 协议的配置
 * baseURL: 通义千问 OpenAI 兼容模式接口
 * apiKey:  从环境变量 DASHSCOPE_API_KEY 读取
 *
 * 本地开发时请在 .env.local 中配置：
 *   DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxx
 */
const qwen = createOpenAI({
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  apiKey: process.env.DASHSCOPE_API_KEY ?? "sk-placeholder",
  compatibility: "compatible",
})

const SYSTEM_PROMPT = `你是一位资深、耐心、温暖的声乐老师，面对的是中老年声乐爱好者。请用通俗易懂的语言，少用专业术语，多用鼓励的话语来解答他们关于唱歌、气息、发声的疑问。回答时注意：
1. 语气亲切，像和老朋友聊天一样
2. 每次回复尽量控制在100字以内，简洁明了
3. 多给予肯定和鼓励，让学员有信心继续练习
4. 如果涉及练习方法，要描述得具体、容易跟着做`

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: qwen("qwen-plus"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  })
}
