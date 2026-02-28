"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Upload, Mic, ArrowLeft, Check, Music2, Trophy, ChevronRight } from "lucide-react"

const TIPS = [
  "\u5531\u6B4C\u524D\u505A\u51E0\u6B21\u6DF1\u547C\u5438\uFF0C\u58F0\u97F3\u66F4\u52A0\u9971\u6EE1",
  "\u7528\u8179\u90E8\u53D1\u529B\uFF0C\u5589\u5499\u4F1A\u66F4\u8F7B\u677E",
  "\u5531\u9AD8\u97F3\u65F6\u60F3\u8C61\u58F0\u97F3\u5F80\u524D\u9001\uFF0C\u522B\u5F80\u4E0A\u62BD",
  "\u6BCF\u5929\u7EC3\u4E60\u54FC\u9E23\uFF0C\u80FD\u6709\u6548\u6253\u5F00\u5171\u9E23",
  "\u5531\u6B4C\u65F6\u4FDD\u6301\u5FAE\u7B11\uFF0C\u97F3\u8272\u4F1A\u66F4\u660E\u4EAE",
  "\u591A\u559D\u6E29\u6C34\uFF0C\u5C11\u559D\u51B0\u6C34\uFF0C\u4FDD\u62A4\u597D\u55D3\u5B50",
  "\u5531\u6162\u6B4C\u65F6\u6CE8\u610F\u6C14\u606F\u7684\u8FDE\u8D2F\u6027",
]

interface RecordingScreenProps {
  onComplete: (duration: number) => void
  onUpload: () => void
  onOpenHistory: () => void
  historyCount: number
  onOpenChat: () => void
}

export function RecordingScreen({ onComplete, onUpload, onOpenHistory, historyCount, onOpenChat }: RecordingScreenProps) {
  const [seconds, setSeconds] = useState(0)
  const [phase, setPhase] = useState<"idle" | "recording">("idle")
  const [showConfirm, setShowConfirm] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * TIPS.length))
  const [tipFade, setTipFade] = useState(true)

  // Rotate tips every 5 seconds with fade
  useEffect(() => {
    if (phase !== "idle") return
    const timer = setInterval(() => {
      setTipFade(false)
      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % TIPS.length)
        setTipFade(true)
      }, 400)
    }, 5000)
    return () => clearInterval(timer)
  }, [phase])

  const startRecording = useCallback(() => {
    setPhase("recording")
    setSeconds(0)
  }, [])

  const goBack = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setPhase("idle")
    setSeconds(0)
  }, [])

  const requestFinish = useCallback(() => {
    setShowConfirm(true)
  }, [])

  const confirmFinish = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setShowConfirm(false)
    setPhase("idle")
    onComplete(seconds)
  }, [onComplete, seconds])

  const cancelFinish = useCallback(() => {
    setShowConfirm(false)
  }, [])

  useEffect(() => {
    if (phase === "recording" && !showConfirm) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1)
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [phase, showConfirm])

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60).toString().padStart(2, "0")
    const secs = (s % 60).toString().padStart(2, "0")
    return `${mins}:${secs}`
  }

  const isRecording = phase === "recording"
  const waveformBars = 28

  return (
    <div className="flex min-h-dvh flex-col bg-background px-6 pb-8 pt-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground">
            声乐AI助教
          </h1>
          <p className="mt-1 text-base text-muted-foreground">每天一首歌，越唱越快乐</p>
        </div>
        <button
          onClick={onOpenHistory}
          className="relative flex items-center gap-2 rounded-2xl bg-card px-4 py-3 text-lg font-bold text-foreground shadow-sm transition-all active:scale-95"
        >
          <Trophy className="h-5 w-5 text-primary" />
          <span>作品墙</span>
          {historyCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {historyCount > 99 ? "99+" : historyCount}
            </span>
          )}
        </button>
      </div>

      {/* Ask AI Teacher Card - only in idle */}
      {!isRecording && (
        <div className="mt-6">
          <button
            onClick={onOpenChat}
            className="flex w-full items-center gap-4 rounded-3xl border-l-4 border-primary bg-card p-5 shadow-sm transition-all active:scale-[0.98]"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary shadow-md">
              <span className="text-base font-black text-primary-foreground">AI</span>
            </div>
            <div className="flex flex-1 flex-col items-start">
              <p className="text-lg font-bold text-foreground">{"\u6709\u5531\u6B4C\u7684\u7591\u95EE\uFF1F"}</p>
              <p className="text-sm text-muted-foreground">{"\u968F\u65F6\u548CAI\u58F0\u4E50\u5BFC\u5E08\u804A\u804A"}</p>
            </div>
            <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Center Visualization */}
      <div className="flex flex-1 flex-col items-center justify-center">
        {isRecording ? (
          /* --- Recording State --- */
          <div className="flex w-full flex-col items-center gap-8">
            {/* Timer */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-6xl font-black tracking-wider text-foreground tabular-nums">
                {formatTime(seconds)}
              </span>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                </span>
                <span className="text-base font-medium text-primary">
                  {showConfirm ? "已暂停" : "录音中"}
                </span>
              </div>
            </div>

            {/* Waveform Card */}
            <div className="flex h-36 w-full items-center justify-center gap-[3px] rounded-3xl bg-card p-6 shadow-sm">
              {Array.from({ length: waveformBars }).map((_, i) => (
                <WaveBar key={i} index={i} isActive={phase === "recording" && !showConfirm} />
              ))}
            </div>

            <p className="text-center text-lg font-medium text-muted-foreground">
              {showConfirm ? "录音已暂停" : "正在聆听，请尽情歌唱..."}
            </p>
          </div>
        ) : (
          /* --- Idle State: Disc-style visual --- */
          <div className="flex flex-col items-center gap-4">
            {/* Ambient glow behind disc */}
            <div className="relative flex h-56 w-56 items-center justify-center">
              <div className="absolute -inset-4 rounded-full bg-primary/6 blur-2xl" />
              {/* Vinyl disc visual */}
              <div className="relative flex h-56 w-56 items-center justify-center">
                {/* Outer disc - looks like a vinyl record */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-secondary via-border to-secondary shadow-lg" />
                {/* Track grooves - subtle rings */}
                <div className="absolute inset-3 rounded-full border border-muted-foreground/10" />
                <div className="absolute inset-6 rounded-full border border-muted-foreground/8" />
                <div className="absolute inset-10 rounded-full border border-muted-foreground/6" />
                <div className="absolute inset-14 rounded-full border border-muted-foreground/5" />
                {/* Center label */}
                <div className="relative z-10 flex h-24 w-24 flex-col items-center justify-center rounded-full bg-primary shadow-md">
                  <Mic className="h-9 w-9 text-primary-foreground" />
                </div>
                {/* Spinning note decorations */}
                <NoteOrbit />
              </div>
            </div>

            {/* Text area below disc */}
            <div className="flex flex-col items-center gap-2 pt-2">
              <p className="text-center text-2xl font-black text-foreground">{"\u51C6\u5907\u597D\u4E86\u5417\uFF1F"}</p>
              <div className="flex items-center gap-2">
                <span className="h-px w-8 bg-primary/30" />
                <Music2 className="h-4 w-4 text-primary/50" />
                <span className="h-px w-8 bg-primary/30" />
              </div>
              <p
                className={`max-w-[260px] text-center text-base leading-relaxed text-muted-foreground transition-opacity duration-400 ${tipFade ? "opacity-100" : "opacity-0"}`}
                suppressHydrationWarning
              >
                {TIPS[tipIndex]}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls - fixed height region so buttons don't shift */}
      <div className="flex flex-col gap-3 pb-2" style={{ minHeight: "112px" }}>
        {/* Hint row: always rendered to preserve height, invisible when not needed */}
        <p
          suppressHydrationWarning
          className={`text-center text-base text-muted-foreground transition-opacity ${
            isRecording && seconds < 3 ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {"至少录制3秒哦"}
        </p>

        {phase === "idle" ? (
          <div className="flex items-center gap-3">
            <button
              onClick={startRecording}
              className="flex flex-[2] items-center justify-center gap-3 rounded-3xl bg-primary py-5 text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
            >
              <Mic className="h-6 w-6" />
              <span>开始录歌</span>
            </button>
            <button
              onClick={onUpload}
              className="flex flex-1 flex-col items-center justify-center gap-1.5 rounded-3xl bg-card py-5 shadow-sm ring-1 ring-border/60 transition-all active:scale-[0.98]"
            >
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-bold text-foreground">上传音频</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="flex flex-1 flex-col items-center justify-center gap-1 rounded-3xl bg-card py-5 shadow-sm transition-all active:scale-[0.98]"
            >
              <ArrowLeft className="h-6 w-6 text-foreground" />
              <span className="text-sm font-bold text-foreground">返回</span>
            </button>
            <button
              onClick={requestFinish}
              disabled={seconds < 3}
              className="flex flex-[2] items-center justify-center gap-3 rounded-3xl bg-primary py-5 text-2xl font-bold text-primary-foreground shadow-lg transition-all active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
            >
              <Check className="h-6 w-6" />
              <span>完成录歌</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirm Dialog Overlay */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm">
          <div className="mx-4 mb-8 w-full max-w-md animate-in slide-in-from-bottom-4 duration-300 rounded-3xl bg-card p-6 shadow-xl">
            <p className="text-center text-2xl font-bold text-foreground">确认提交作品？</p>
            <p className="mt-2 text-center text-base text-muted-foreground">
              {'本次录制 '}
              <span className="font-bold text-foreground">{formatTime(seconds)}</span>
              {'，提交后AI老师将为您评分'}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={cancelFinish}
                className="flex flex-1 items-center justify-center rounded-2xl bg-secondary py-4 text-lg font-bold text-foreground transition-all active:scale-[0.98]"
              >
                继续录制
              </button>
              <button
                onClick={confirmFinish}
                className="flex flex-1 items-center justify-center rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-lg transition-all active:scale-[0.98]"
              >
                确认提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* Spinning music notes around the disc */
function NoteOrbit() {
  return (
    <div className="absolute inset-0 animate-[spin_12s_linear_infinite]">
      <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1 text-2xl text-primary/60">
        <Music2 className="h-5 w-5" />
      </span>
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 text-2xl text-primary/40">
        <Music2 className="h-4 w-4" />
      </span>
      <span className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 text-2xl text-primary/50">
        <Music2 className="h-4 w-4" />
      </span>
    </div>
  )
}

/* Animated waveform bar */
function WaveBar({ index, isActive }: { index: number; isActive: boolean }) {
  const [height, setHeight] = useState(20)

  useEffect(() => {
    if (!isActive) {
      setHeight(12)
      return
    }
    const interval = setInterval(() => {
      const base = 16
      const wave = Math.sin(Date.now() / 300 + index * 0.6) * 20
      const random = Math.random() * 24
      setHeight(Math.max(8, base + wave + random))
    }, 120 + index * 8)
    return () => clearInterval(interval)
  }, [index, isActive])

  return (
    <div
      className="w-1.5 rounded-full bg-primary/70 transition-all duration-150"
      style={{ height: `${height}px` }}
    />
  )
}
