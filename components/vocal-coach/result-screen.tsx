"use client"

import { useState, useEffect } from "react"
import { RotateCcw, Save, Sparkles, X } from "lucide-react"

interface ResultScreenProps {
  duration: number
  onRetry: () => void
  onSave: () => void
}

// Simulated AI evaluation
function generateEvaluation(duration: number) {
  const baseScore = Math.min(60 + Math.floor(duration / 3), 98)
  const score = baseScore + Math.floor(Math.random() * 8)
  const breathStability = Math.min(50 + Math.floor(Math.random() * 45), 95)
  const toneBrightness = Math.min(55 + Math.floor(Math.random() * 40), 95)

  const labels = score >= 90 ? "卓越" : score >= 80 ? "优秀" : score >= 70 ? "良好" : "继续加油"

  const comments = [
    "您的声音很有厚度，听起来精气神十足！",
    "气息运用得很稳健，高音部分表现出色！",
    "音色饱满明亮，情感表达很到位！",
    "嗓音状态非常好，节奏感掌握得很棒！",
    "声音柔和圆润，细节处理很有韵味！",
  ]

  return {
    score: Math.min(score, 99),
    label: labels,
    breathStability,
    toneBrightness,
    comment: comments[Math.floor(Math.random() * comments.length)],
  }
}

export function ResultScreen({ duration, onRetry, onSave }: ResultScreenProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [evaluation, setEvaluation] = useState<ReturnType<typeof generateEvaluation> | null>(null)
  const [saved, setSaved] = useState(false)
  const [animatedScore, setAnimatedScore] = useState(0)
  const [animatedBreath, setAnimatedBreath] = useState(0)
  const [animatedTone, setAnimatedTone] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      const result = generateEvaluation(duration)
      setEvaluation(result)
      setIsLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [duration])

  // Animate score counting up
  useEffect(() => {
    if (!evaluation) return
    const target = evaluation.score
    let current = 0
    const increment = Math.ceil(target / 30)
    const interval = setInterval(() => {
      current = Math.min(current + increment, target)
      setAnimatedScore(current)
      if (current >= target) clearInterval(interval)
    }, 40)
    return () => clearInterval(interval)
  }, [evaluation])

  // Animate progress bars
  useEffect(() => {
    if (!evaluation) return
    const timer = setTimeout(() => {
      setAnimatedBreath(evaluation.breathStability)
      setAnimatedTone(evaluation.toneBrightness)
    }, 300)
    return () => clearTimeout(timer)
  }, [evaluation])

  const handleSave = () => {
    setSaved(true)
    setTimeout(onSave, 1200)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6">
        <div className="relative">
          <div className="h-20 w-20 animate-spin rounded-full border-4 border-secondary border-t-primary" />
          <Sparkles className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-primary" />
        </div>
        <p className="text-2xl font-bold text-foreground">
          老师正在为您批改...
        </p>
        <p className="text-lg text-muted-foreground">请稍候片刻</p>
      </div>
    )
  }

  if (!evaluation) return null

  // Saved success toast
  if (saved) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/15">
          <Save className="h-12 w-12 text-primary" />
        </div>
        <p className="text-2xl font-bold text-foreground">已存入练歌记录</p>
        <p className="text-lg text-muted-foreground">继续保持，每天进步一点点！</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background px-6 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">声乐报告</h1>
        <button
          onClick={onRetry}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-muted-foreground transition-all active:scale-95"
          aria-label="关闭"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Score Card */}
      <div className="mb-6 rounded-3xl bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-medium text-muted-foreground">今日表现</p>
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
      <div className="mb-6 space-y-5 rounded-3xl bg-card p-6 shadow-sm">
        {/* Breath Stability */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">
              气息稳定性
            </span>
            <span className="text-lg font-bold text-primary">
              {animatedBreath}%
            </span>
          </div>
          <div className="h-3.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
              style={{ width: `${animatedBreath}%` }}
            />
          </div>
        </div>

        {/* Tone Brightness */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">
              音色明亮度
            </span>
            <span className="text-lg font-bold text-primary">
              {animatedTone}%
            </span>
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
      <div className="mb-8 rounded-3xl bg-accent p-6">
        <p className="text-center text-xl leading-relaxed font-medium text-accent-foreground">
          {evaluation.comment}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-auto flex gap-4 pb-6">
        <button
          onClick={onRetry}
          className="flex flex-1 items-center justify-center gap-2 rounded-3xl bg-secondary py-5 text-xl font-bold text-secondary-foreground transition-all active:scale-[0.98]"
        >
          <RotateCcw className="h-5 w-5" />
          <span>重新录</span>
        </button>
        <button
          onClick={handleSave}
          className="flex flex-[1.5] items-center justify-center gap-2 rounded-3xl bg-primary py-5 text-xl font-bold text-primary-foreground shadow-lg transition-all active:scale-[0.98]"
        >
          <Save className="h-5 w-5" />
          <span>保存到作品墙</span>
        </button>
      </div>
    </div>
  )
}
