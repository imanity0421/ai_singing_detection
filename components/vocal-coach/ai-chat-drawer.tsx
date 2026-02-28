"use client"

import { useState } from "react"
import { Mic, Keyboard, X } from "lucide-react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer"

interface AiChatDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** If true, show a contextual opening message from the AI teacher about the result */
  fromResult?: boolean
}

interface ChatMessage {
  id: string
  role: "ai" | "user"
  text: string
}

const defaultMessages: ChatMessage[] = [
  {
    id: "ai-1",
    role: "ai",
    text: "您好！我是您的专属AI声乐导师，有任何关于唱歌的问题都可以问我哦！",
  },
  {
    id: "user-1",
    role: "user",
    text: "老师，我唱高音的时候总觉得嗓子紧，怎么办？",
  },
  {
    id: "ai-2",
    role: "ai",
    text: "这是很常见的问题！建议您试试"叹气式"起音：先深吸一口气，然后像叹气一样自然地发出声音，让喉咙保持放松。每天练习5分钟，会有明显改善的！",
  },
]

const resultMessages: ChatMessage[] = [
  {
    id: "ai-result-1",
    role: "ai",
    text: "我刚刚听了您的演唱，气息控制得比上次好！但在高音区稍微有点紧，您刚才觉得嗓子累吗？",
  },
  {
    id: "user-result-1",
    role: "user",
    text: "是的老师，唱到高音部分确实有点吃力。",
  },
  {
    id: "ai-result-2",
    role: "ai",
    text: "没关系，这说明您的气息支撑还需要加强一点。我建议您每天用"嘶"的发音做呼气练习，慢慢把气息拉长到15秒以上，坚持一周就能感觉到变化！",
  },
]

export function AiChatDrawer({ open, onOpenChange, fromResult = false }: AiChatDrawerProps) {
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice")
  const [textValue, setTextValue] = useState("")
  const [isHolding, setIsHolding] = useState(false)

  const messages = fromResult ? resultMessages : defaultMessages

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-md rounded-t-3xl border-t-0 bg-background">
        <div className="flex h-[78dvh] flex-col">
          {/* Header */}
          <DrawerHeader className="relative flex-shrink-0 border-b border-border px-6 pb-4 pt-2">
            <DrawerTitle className="text-center text-2xl font-black text-foreground">
              您的专属AI声乐导师
            </DrawerTitle>
            <p className="text-center text-base text-muted-foreground">
              有问题随时问，我来帮您解答
            </p>
            <DrawerClose asChild>
              <button
                className="absolute right-4 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-all active:scale-95"
                aria-label="关闭"
              >
                <X className="h-5 w-5" />
              </button>
            </DrawerClose>
          </DrawerHeader>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
            </div>
          </div>

          {/* Bottom Input Area */}
          <div className="flex-shrink-0 border-t border-border bg-card px-5 pb-8 pt-4">
            {inputMode === "voice" ? (
              <div className="flex items-center gap-3">
                {/* Switch to text */}
                <button
                  onClick={() => setInputMode("text")}
                  className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-secondary text-foreground transition-all active:scale-95"
                  aria-label="切换到文字输入"
                >
                  <Keyboard className="h-6 w-6" />
                </button>
                {/* Giant hold-to-talk button */}
                <button
                  onPointerDown={() => setIsHolding(true)}
                  onPointerUp={() => setIsHolding(false)}
                  onPointerLeave={() => setIsHolding(false)}
                  className={`flex flex-1 items-center justify-center gap-3 rounded-2xl py-5 text-xl font-bold transition-all active:scale-[0.98] ${
                    isHolding
                      ? "bg-primary/80 text-primary-foreground shadow-lg scale-[0.97]"
                      : "bg-primary text-primary-foreground shadow-md"
                  }`}
                >
                  <Mic className={`h-7 w-7 ${isHolding ? "animate-pulse" : ""}`} />
                  <span>{isHolding ? "松开发送" : "按住说话"}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* Switch to voice */}
                <button
                  onClick={() => setInputMode("voice")}
                  className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-secondary text-foreground transition-all active:scale-95"
                  aria-label="切换到语音输入"
                >
                  <Mic className="h-6 w-6" />
                </button>
                {/* Text input */}
                <div className="flex flex-1 items-center gap-2 rounded-2xl bg-background px-4 py-3 ring-1 ring-border">
                  <input
                    type="text"
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    placeholder="输入您的问题..."
                    className="flex-1 bg-transparent text-lg text-foreground outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    disabled={!textValue.trim()}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all active:scale-95 disabled:opacity-40"
                    aria-label="发送"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isAi = message.role === "ai"
  return (
    <div className={`flex ${isAi ? "justify-start" : "justify-end"}`}>
      <div className="flex max-w-[85%] flex-col gap-1">
        {isAi && (
          <span className="px-1 text-sm font-bold text-muted-foreground">AI导师</span>
        )}
        <div
          className={`rounded-2xl px-5 py-4 ${
            isAi
              ? "rounded-tl-md bg-accent text-accent-foreground"
              : "rounded-tr-md bg-primary/15 text-foreground"
          }`}
        >
          <p className="text-lg leading-relaxed">{message.text}</p>
        </div>
      </div>
    </div>
  )
}
