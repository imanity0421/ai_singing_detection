"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ArrowLeft, Mic, Keyboard, Send, Loader2 } from "lucide-react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import type { UIMessage } from "ai"
import { toast } from "sonner"

interface ChatScreenProps {
  fromResult?: boolean
  onBack: () => void
}

// ---------- Helper: extract text from UIMessage parts ----------
function getMessageText(message: UIMessage): string {
  if (!message.parts || !Array.isArray(message.parts)) return ""
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

// ---------- Initial greeting based on context ----------
const INITIAL_MESSAGES_DEFAULT: UIMessage[] = [
  {
    id: "ai-welcome",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "您好！我是您的专属AI声乐导师，有任何关于唱歌的问题都可以问我哦！",
      },
    ],
  },
]

const INITIAL_MESSAGES_FROM_RESULT: UIMessage[] = [
  {
    id: "ai-result-welcome",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "我刚才听了您的演唱，整体表现很棒！如果您对点评有任何疑问，随时问我，我来帮您详细解答。",
      },
    ],
  },
]

// ---------- Mock fallback message for when API fails ----------
const MOCK_ERROR_MESSAGE: UIMessage = {
  id: "ai-mock-error",
  role: "assistant",
  parts: [
    {
      type: "text",
      text: "系统提示：这是预览环境，完整对话需要在本地配置 DASHSCOPE_API_KEY 后体验哦~ 不过您可以先看看界面效果！",
    },
  ],
}

// Stable transport instance — avoids re-creating on every render
const chatTransport = new DefaultChatTransport({ api: "/api/chat" })

export function ChatScreen({ fromResult = false, onBack }: ChatScreenProps) {
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice")
  const [textValue, setTextValue] = useState("")
  const [isHolding, setIsHolding] = useState(false)
  const [errorMessages, setErrorMessages] = useState<UIMessage[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const initialMessages = fromResult
    ? INITIAL_MESSAGES_FROM_RESULT
    : INITIAL_MESSAGES_DEFAULT

  const { messages, sendMessage, status, error } = useChat({
    transport: chatTransport,
    initialMessages,
  })

  const isLoading = status === "streaming" || status === "submitted"

  // ---------- Auto-scroll to latest message ----------
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, errorMessages, scrollToBottom])

  // ---------- Error handling: render mock AI response ----------
  useEffect(() => {
    if (error) {
      setErrorMessages((prev) => {
        // Only add one error message per error
        const lastErr = prev[prev.length - 1]
        if (lastErr && lastErr.id === MOCK_ERROR_MESSAGE.id) return prev
        return [...prev, { ...MOCK_ERROR_MESSAGE, id: `ai-error-${Date.now()}` }]
      })
    }
  }, [error])

  // ---------- Submit handler ----------
  const handleSend = useCallback(() => {
    const text = textValue.trim()
    if (!text || isLoading) return
    sendMessage({ text })
    setTextValue(text === textValue.trim() ? "" : textValue)
    setTextValue("")
  }, [textValue, isLoading, sendMessage])

  // ---------- Voice button handler (placeholder) ----------
  const handleVoicePress = useCallback(() => {
    toast("语音功能开发中", {
      description: "目前请使用文字输入，语音识别功能即将上线！",
    })
  }, [])

  // Combine real messages + error fallback messages for display
  const allMessages = [...messages, ...errorMessages]

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Top Navigation Bar */}
      <header className="flex flex-shrink-0 items-center gap-3 border-b border-border bg-card px-4 pb-4 pt-12">
        <button
          onClick={onBack}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-secondary text-foreground transition-all active:scale-95"
          aria-label="返回"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex flex-1 flex-col">
          <h1 className="text-2xl font-black text-foreground">
            AI声乐导师
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "正在思考中..." : "有问题随时问，我来帮您解答"}
          </p>
        </div>
        {/* AI Avatar indicator with streaming pulse */}
        <div
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 ${
            isLoading ? "animate-pulse" : ""
          }`}
        >
          <span className="text-lg font-black text-primary">AI</span>
        </div>
      </header>

      {/* Chat Messages Area */}
      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto px-5 py-5"
      >
        <div className="flex flex-col gap-5">
          {allMessages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          {/* Streaming indicator when AI is responding */}
          {isLoading &&
            allMessages.length > 0 &&
            allMessages[allMessages.length - 1].role === "user" && (
              <div className="flex gap-3 justify-start">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 mt-6">
                  <span className="text-sm font-black text-primary">AI</span>
                </div>
                <div className="flex max-w-[78%] flex-col gap-1">
                  <span className="px-1 text-sm font-bold text-muted-foreground">
                    AI导师
                  </span>
                  <div className="rounded-2xl rounded-tl-md bg-accent px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-lg text-muted-foreground">
                        正在思考...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Bottom Input Area -- voice-first, senior-friendly */}
      <div className="flex-shrink-0 border-t border-border bg-card px-5 pb-8 pt-4">
        {inputMode === "voice" ? (
          <div className="flex items-center gap-3">
            {/* Switch to text input */}
            <button
              onClick={() => setInputMode("text")}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-secondary text-foreground transition-all active:scale-95"
              aria-label="切换到文字输入"
            >
              <Keyboard className="h-6 w-6" />
            </button>
            {/* Giant hold-to-talk button (placeholder -- triggers toast) */}
            <button
              onPointerDown={() => {
                setIsHolding(true)
                handleVoicePress()
              }}
              onPointerUp={() => setIsHolding(false)}
              onPointerLeave={() => setIsHolding(false)}
              className={`flex flex-1 items-center justify-center gap-3 rounded-2xl py-5 text-xl font-bold transition-all active:scale-[0.98] ${
                isHolding
                  ? "scale-[0.97] bg-primary/80 text-primary-foreground shadow-lg"
                  : "bg-primary text-primary-foreground shadow-md"
              }`}
            >
              <Mic
                className={`h-7 w-7 ${isHolding ? "animate-pulse" : ""}`}
              />
              <span>{isHolding ? "松开发送" : "按住说话"}</span>
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-3"
          >
            {/* Switch to voice input */}
            <button
              type="button"
              onClick={() => setInputMode("voice")}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-secondary text-foreground transition-all active:scale-95"
              aria-label="切换到语音输入"
            >
              <Mic className="h-6 w-6" />
            </button>
            {/* Text input field */}
            <div className="flex flex-1 items-center gap-2 rounded-2xl bg-background px-4 py-3 ring-1 ring-border">
              <input
                type="text"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="输入您的问题..."
                className="flex-1 bg-transparent text-lg text-foreground outline-none placeholder:text-muted-foreground"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!textValue.trim() || isLoading}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all active:scale-95 disabled:opacity-40"
                aria-label="发送"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

/* Chat bubble with AI avatar for AI messages */
function ChatBubble({ message }: { message: UIMessage }) {
  const isAi = message.role === "assistant"
  const text = getMessageText(message)

  if (!text) return null

  return (
    <div className={`flex gap-3 ${isAi ? "justify-start" : "justify-end"}`}>
      {/* AI Avatar */}
      {isAi && (
        <div className="mt-6 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
          <span className="text-sm font-black text-primary">AI</span>
        </div>
      )}
      <div
        className={`flex max-w-[78%] flex-col gap-1 ${isAi ? "" : "items-end"}`}
      >
        {isAi && (
          <span className="px-1 text-sm font-bold text-muted-foreground">
            AI导师
          </span>
        )}
        <div
          className={`rounded-2xl px-5 py-4 ${
            isAi
              ? "rounded-tl-md bg-accent text-accent-foreground"
              : "rounded-tr-md bg-primary/15 text-foreground"
          }`}
        >
          <p className="whitespace-pre-wrap text-lg leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  )
}
