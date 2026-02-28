"use client"

import { useState } from "react"
import { ArrowLeft, Mic, Keyboard, Send } from "lucide-react"

interface ChatScreenProps {
  fromResult?: boolean
  onBack: () => void
}

interface ChatMessage {
  id: string
  role: "ai" | "user"
  text: string
}

function getDefaultMessages(): ChatMessage[] {
  return [
    {
      id: "ai-1",
      role: "ai",
      text: "\u60A8\u597D\uFF01\u6211\u662F\u60A8\u7684\u4E13\u5C5EAI\u58F0\u4E50\u5BFC\u5E08\uFF0C\u6709\u4EFB\u4F55\u5173\u4E8E\u5531\u6B4C\u7684\u95EE\u9898\u90FD\u53EF\u4EE5\u95EE\u6211\u54E6\uFF01",
    },
    {
      id: "user-1",
      role: "user",
      text: "\u8001\u5E08\uFF0C\u6211\u5531\u9AD8\u97F3\u7684\u65F6\u5019\u603B\u89C9\u5F97\u55D3\u5B50\u7D27\uFF0C\u600E\u4E48\u529E\uFF1F",
    },
    {
      id: "ai-2",
      role: "ai",
      text: "\u8FD9\u662F\u5F88\u5E38\u89C1\u7684\u95EE\u9898\uFF01\u5EFA\u8BAE\u60A8\u8BD5\u8BD5\u201C\u53F9\u6C14\u5F0F\u201D\u8D77\u97F3\uFF1A\u5148\u6DF1\u5438\u4E00\u53E3\u6C14\uFF0C\u7136\u540E\u50CF\u53F9\u6C14\u4E00\u6837\u81EA\u7136\u5730\u53D1\u51FA\u58F0\u97F3\uFF0C\u8BA9\u5589\u5499\u4FDD\u6301\u653E\u677E\u3002\u6BCF\u5929\u7EC3\u4E605\u5206\u949F\uFF0C\u4F1A\u6709\u660E\u663E\u6539\u5584\u7684\uFF01",
    },
  ]
}

function getResultMessages(): ChatMessage[] {
  return [
    {
      id: "ai-result-1",
      role: "ai",
      text: "\u6211\u521A\u521A\u542C\u4E86\u60A8\u7684\u6F14\u5531\uFF0C\u6C14\u606F\u63A7\u5236\u5F97\u6BD4\u4E0A\u6B21\u597D\uFF01\u4F46\u5728\u9AD8\u97F3\u533A\u7A0D\u5FAE\u6709\u70B9\u7D27\uFF0C\u60A8\u521A\u624D\u89C9\u5F97\u55D3\u5B50\u7D2F\u5417\uFF1F",
    },
    {
      id: "user-result-1",
      role: "user",
      text: "\u662F\u7684\u8001\u5E08\uFF0C\u5531\u5230\u9AD8\u97F3\u90E8\u5206\u786E\u5B9E\u6709\u70B9\u5403\u529B\u3002",
    },
    {
      id: "ai-result-2",
      role: "ai",
      text: "\u6CA1\u5173\u7CFB\uFF0C\u8FD9\u8BF4\u660E\u60A8\u7684\u6C14\u606F\u652F\u6491\u8FD8\u9700\u8981\u52A0\u5F3A\u4E00\u70B9\u3002\u6211\u5EFA\u8BAE\u60A8\u6BCF\u5929\u7528\u201C\u5636\u201D\u7684\u53D1\u97F3\u505A\u547C\u6C14\u7EC3\u4E60\uFF0C\u6162\u6162\u628A\u6C14\u606F\u62C9\u957F\u523015\u79D2\u4EE5\u4E0A\uFF0C\u575A\u6301\u4E00\u5468\u5C31\u80FD\u611F\u89C9\u5230\u53D8\u5316\uFF01",
    },
  ]
}

export function ChatScreen({ fromResult = false, onBack }: ChatScreenProps) {
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice")
  const [textValue, setTextValue] = useState("")
  const [isHolding, setIsHolding] = useState(false)

  const messages = fromResult ? getResultMessages() : getDefaultMessages()

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Top Navigation Bar */}
      <header className="flex flex-shrink-0 items-center gap-3 border-b border-border bg-card px-4 pb-4 pt-12">
        <button
          onClick={onBack}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-secondary text-foreground transition-all active:scale-95"
          aria-label={"\u8FD4\u56DE"}
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex flex-1 flex-col">
          <h1 className="text-2xl font-black text-foreground">
            {"AI\u58F0\u4E50\u5BFC\u5E08"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {"\u6709\u95EE\u9898\u968F\u65F6\u95EE\uFF0C\u6211\u6765\u5E2E\u60A8\u89E3\u7B54"}
          </p>
        </div>
        {/* AI Avatar indicator */}
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
          <span className="text-lg font-black text-primary">AI</span>
        </div>
      </header>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="flex flex-col gap-5">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
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
              aria-label={"\u5207\u6362\u5230\u6587\u5B57\u8F93\u5165"}
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
                  ? "scale-[0.97] bg-primary/80 text-primary-foreground shadow-lg"
                  : "bg-primary text-primary-foreground shadow-md"
              }`}
            >
              <Mic className={`h-7 w-7 ${isHolding ? "animate-pulse" : ""}`} />
              <span>{isHolding ? "\u677E\u5F00\u53D1\u9001" : "\u6309\u4F4F\u8BF4\u8BDD"}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {/* Switch to voice input */}
            <button
              onClick={() => setInputMode("voice")}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-secondary text-foreground transition-all active:scale-95"
              aria-label={"\u5207\u6362\u5230\u8BED\u97F3\u8F93\u5165"}
            >
              <Mic className="h-6 w-6" />
            </button>
            {/* Text input field */}
            <div className="flex flex-1 items-center gap-2 rounded-2xl bg-background px-4 py-3 ring-1 ring-border">
              <input
                type="text"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder={"\u8F93\u5165\u60A8\u7684\u95EE\u9898..."}
                className="flex-1 bg-transparent text-lg text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                disabled={!textValue.trim()}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all active:scale-95 disabled:opacity-40"
                aria-label={"\u53D1\u9001"}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* Chat bubble with AI avatar for AI messages */
function ChatBubble({ message }: { message: ChatMessage }) {
  const isAi = message.role === "ai"
  return (
    <div className={`flex gap-3 ${isAi ? "justify-start" : "justify-end"}`}>
      {/* AI Avatar */}
      {isAi && (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 mt-6">
          <span className="text-sm font-black text-primary">AI</span>
        </div>
      )}
      <div className={`flex max-w-[78%] flex-col gap-1 ${isAi ? "" : "items-end"}`}>
        {isAi && (
          <span className="px-1 text-sm font-bold text-muted-foreground">
            {"AI\u5BFC\u5E08"}
          </span>
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
