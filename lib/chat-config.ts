/**
 * AI 聊天（GPT-4o）集中配置
 * - 环境变量：OPENAI_API_BASE / OPENAI_API_KEY / OPENAI_CHAT_MODEL（可选）
 * - 单处维护 model、默认 baseURL、System Prompt，便于切换模型与提示词
 */

const DEFAULT_BASE_URL = "https://api.openai.com/v1"
const DEFAULT_MODEL = "gpt-4o"

export const OPENAI_CHAT_SYSTEM_PROMPT = `你是一位资深、耐心、温暖的声乐老师，面对的是中老年声乐爱好者。请用通俗易懂的语言，少用专业术语，多用鼓励的话语来解答他们关于唱歌、气息、发声的疑问。回答时注意：
1. 语气亲切，像和老朋友聊天一样
2. 每次回复尽量控制在100字以内，简洁明了
3. 多给予肯定和鼓励，让学员有信心继续练习
4. 如果涉及练习方法，要描述得具体、容易跟着做`

export function getOpenAIChatConfig() {
  const baseURL = process.env.OPENAI_API_BASE || DEFAULT_BASE_URL
  const apiKey = process.env.OPENAI_API_KEY || ""
  const model = process.env.OPENAI_CHAT_MODEL || DEFAULT_MODEL
  return { baseURL, apiKey, model }
}

export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim())
}
