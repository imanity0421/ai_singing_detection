"use client"

import { useState, useEffect, useRef } from "react"
import { RotateCcw, Save, Sparkles, MessageCircle, Upload } from "lucide-react"

interface ResultScreenProps {
  duration: number
  active: boolean
  onRetry: () => void
  onSave: (evaluation: EvaluationResult) => void
  onOpenChat: () => void
}

export interface EvaluationResult {
  score: number
  label: string
  breathStability: number
  toneBrightness: number
  comment: string
}

// Simulated AI evaluation
function generateEvaluation(duration: number): EvaluationResult {
  const baseScore = Math.min(60 + Math.floor(duration / 3), 98)
  const score = Math.min(baseScore + Math.floor(Math.random() * 8), 99)
  const breathStability = Math.min(50 + Math.floor(Math.random() * 45), 95)
  const toneBrightness = Math.min(55 + Math.floor(Math.random() * 40), 95)
  const label = score >= 90 ? "卓越" : score >= 80 ? "优秀" : score >= 70 ? "良好" : "继续加油"

  const comments = [
    "您的声音很有厚度，听起来精气神十足！",
    "气息运用得很稳健，高音部分表现出色！",
    "音色饱满明亮，情感表达很到位！",
    "嗓音状态非常好，节奏感掌握得很棒！",
    "声音柔和圆润，细节处理很有韵味！",
  ]

  return {
    score,
    label,
    breathStability,
    toneBrightness,
    comment: comments[Math.floor(Math.random() * comments.length)],
  }
}

export function ResultScreen({ duration, active, onRetry, onSave, onOpenChat }: ResultScreenProps) {
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
  const [animatedScore, setAnimatedScore] = useState(0)
  const [animatedBreath, setAnimatedBreath] = useState(0)
  const [animatedTone, setAnimatedTone] = useState(0)
  const [showResult, setShowResult] = useState(false)

  // Only run effects when screen becomes active, reset on new entry
  const prevActiveRef = useRef(false)
  useEffect(() => {
    if (active && !prevActiveRef.current) {
      // Freshly navigated here: generate new evaluation & reset animations
      setShowResult(false)
      setAnimatedScore(0)
      setAnimatedBreath(0)
      setAnimatedTone(0)

      const result = generateEvaluation(duration)
      setEvaluation(result)
      const timer = setTimeout(() => setShowResult(true), 200)
      prevActiveRef.current = true
      return () => clearTimeout(timer)
    }
    if (!active) {
      prevActiveRef.current = false
    }
  }, [active, duration])

  // Animate score counting up
  useEffect(() => {
    if (!evaluation || !showResult) return
    const target = evaluation.score
    let current = 0
    const increment = Math.ceil(target / 30)
    const interval = setInterval(() => {
      current = Math.min(current + increment, target)
      setAnimatedScore(current)
      if (current >= target) clearInterval(interval)
    }, 40)
    return () => clearInterval(interval)
  }, [evaluation, showResult])

  // Animate progress bars
  useEffect(() => {
    if (!evaluation || !showResult) return
    const timer = setTimeout(() => {
      setAnimatedBreath(evaluation.breathStability)
      setAnimatedTone(evaluation.toneBrightness)
    }, 400)
    return () => clearTimeout(timer)
  }, [evaluation, showResult])

  const handleSave = () => {
    if (evaluation) {
      onSave(evaluation)
    }
  }

  return (
    <div className={`flex min-h-dvh flex-col bg-background px-6 py-8 transition-opacity duration-500 ${showResult ? "opacity-100" : "opacity-0"}`}>
      {!showResult ? null : evaluation ? (
        <>
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-black text-foreground">{"\u58F0\u4E50\u62A5\u544A"}</h1>
            <p className="mt-1 text-base text-muted-foreground">{"\u672C\u6B21\u7EC3\u6B4C\u8BC4\u4F30\u7ED3\u679C"}</p>
          </div>

          {/* Score Card */}
          <div className="mb-5 rounded-3xl bg-card p-8 shadow-sm">
            <div className="flex flex-col items-center gap-2">
              <p className="text-lg font-medium text-muted-foreground">{"\u4ECA\u65E5\u8868\u73B0"}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-7xl font-black text-primary">
                  {animatedScore}
                </span>
                <span className="text-2xl font-bold text-primary/60">分</span>
              </div>
              <div className="mt-1 rounded-2xl bg-primary/10 px-5 py-1.5">
                <span className="text-xl font-bold text-primary">
                  {evaluation.label}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="mb-5 space-y-5 rounded-3xl bg-card p-6 shadow-sm">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-lg font-bold text-foreground">{"\u6C14\u606F\u7A33\u5B9A\u6027"}</span>
                <span className="text-lg font-bold text-primary">{animatedBreath}%</span>
              </div>
              <div className="h-3.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                  style={{ width: `${animatedBreath}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-lg font-bold text-foreground">{"\u97F3\u8272\u660E\u4EAE\u5EA6"}</span>
                <span className="text-lg font-bold text-primary">{animatedTone}%</span>
              </div>
              <div className="h-3.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                  style={{ width: `${animatedTone}%` }}
                />
              </div>
            </div>
          </div>

          {/* Comment */}
          <div className="mb-5 rounded-3xl bg-accent p-6">
            <p className="text-center text-xl leading-relaxed font-medium text-accent-foreground">
              {evaluation.comment}
            </p>
          </div>

          {/* Ask AI Teacher Button */}
          <button
            onClick={onOpenChat}
            className="mb-6 flex w-full items-center justify-center gap-3 rounded-3xl bg-primary py-5 shadow-lg transition-all active:scale-[0.98]"
          >
            <MessageCircle className="h-6 w-6 text-primary-foreground" />
            <span className="text-xl font-bold text-primary-foreground">
              {"\u5BF9\u70B9\u8BC4\u6709\u7591\u95EE\uFF1F\u548CAI\u8001\u5E08\u804A\u804A"}
            </span>
          </button>

          {/* Actions */}
          <div className="mt-auto flex gap-3 pb-6">
            <button
              onClick={onRetry}
              className="flex flex-1 items-center justify-center gap-2 rounded-3xl bg-card py-5 text-xl font-bold text-foreground shadow-sm transition-all active:scale-[0.98]"
            >
              <RotateCcw className="h-5 w-5" />
              <span>{"\u91CD\u65B0\u5F55"}</span>
            </button>
            <button
              onClick={handleSave}
              className="flex flex-[1.5] items-center justify-center gap-2 rounded-3xl bg-primary py-5 text-xl font-bold text-primary-foreground shadow-lg transition-all active:scale-[0.98]"
            >
              <Save className="h-5 w-5" />
              <span>{"\u4FDD\u5B58\u5230\u4F5C\u54C1\u5899"}</span>
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}

/* Loading overlay component - used by parent, supports 2-stage loading */
export function LoadingOverlay({ visible, stage = "uploading" }: { visible: boolean; stage?: "uploading" | "analyzing" }) {
  const isUploading = stage === "uploading"

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-500 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="flex flex-col items-center gap-6 rounded-3xl bg-card p-10 shadow-lg">
        <div className="relative">
          <div className="h-20 w-20 animate-spin rounded-full border-4 border-secondary border-t-primary" style={{ animationDuration: isUploading ? "1.6s" : "1.2s" }} />
          {isUploading ? (
            <Upload className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-primary" />
          ) : (
            <Sparkles className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-primary" />
          )}
        </div>
        <div className="text-center transition-opacity duration-300">
          <p className="text-2xl font-bold text-foreground">
            {isUploading ? "作品上传中..." : "老师正在点评..."}
          </p>
          <p className="mt-2 text-lg text-muted-foreground">
            {isUploading ? "正在上传您的演唱" : "请稍候片刻"}
          </p>
        </div>
      </div>
    </div>
  )
}
