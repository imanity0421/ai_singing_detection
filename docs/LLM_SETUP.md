# GPT-4o / 大模型接入说明

本文档说明「AI声乐助手」中 GPT-4o 的配置分布与推荐用法，便于维护和排查。

---

## 一、配置分布一览

| 配置项 | 所在文件 | 说明 |
|--------|----------|------|
| **OPENAI_API_BASE** | `.env.local` | 兼容 OpenAI 的 API 根地址（如官方 `https://api.openai.com/v1` 或代理 `https://4zapi.com/v1`） |
| **OPENAI_API_KEY** | `.env.local` | API 密钥，绝不提交到 Git |
| **OPENAI_API_KEY** | `.env.local` | API 密钥，绝不提交到 Git |
| **默认 baseURL / 模型 ID / System Prompt** | `lib/chat-config.ts` | 未配置时的回退值、可选 `OPENAI_CHAT_MODEL`、声乐老师人设单处维护 |
| **聊天 API 入口** | `app/api/chat/route.ts` | 读取 `lib/chat-config`，调用 GPT-4o 并流式返回 |
| **前端聊天 API 路径** | `components/vocal-coach/chat-screen.tsx` | `useChat` 的 `api: "/api/chat"` |
| **错误提示文案** | `chat-screen.tsx`（MOCK_ERROR_MESSAGE） | API 失败时展示的“请配置 .env.local”等提示 |

---

## 二、环境变量

- **本地开发**：复制 `.env.example` 为 `.env.local`，填入真实 `OPENAI_API_BASE` 与 `OPENAI_API_KEY`。
- **生产/部署**：在 Vercel / 自有服务器环境变量中配置同名变量，不要使用 `.env.local` 提交密钥。
- `.env.local` 已被 `.gitignore` 忽略，仅本地生效。

---

## 三、可选优化

- **切换模型**：在 `lib/chat-config.ts` 中修改 `OPENAI_CHAT_MODEL`，或在 `.env.local` 中增加 `OPENAI_CHAT_MODEL=gpt-4o-mini` 等，由 route 读取（当前实现见 `lib/chat-config.ts`）。
- **多环境**：不同环境使用不同 `.env.*` 或平台环境变量，代码只读 `process.env.OPENAI_*`，无需改逻辑。

---

## 四、关于根目录的 `get_prompt_gpt_api.py`

该脚本为早期用 Python（aisuite）调用 GPT-4o 的测试代码，业务为「新闻推荐」，与当前 Next 应用无关。  
**仅对本项目有用的信息**：`OPENAI_API_BASE` 与 `OPENAI_API_KEY` 的取值，已迁移到 `.env.local`。  
若不再需要该脚本，可安全删除；保留仅作历史参考。
