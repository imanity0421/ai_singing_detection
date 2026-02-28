"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Upload, Mic, ArrowLeft, Check, Music2, Trophy, MessageCircle } from "lucide-react"

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

      {/* Tips Card - only in idle */}
      {!isRecording && (
        <div className="mt-6 rounded-3xl bg-card p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <Music2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">今日小贴士</p>
              <p className="mt-1 text-base leading-relaxed text-muted-foreground">
                唱歌前先做几次深呼吸，可以帮助放松喉咙，让声音更加饱满圆润。
              </p>
            </div>
          </div>
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
          <div className="flex flex-col items-center gap-5">
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
            <p className="text-center text-xl font-bold text-foreground">准备好了吗？</p>
            <p className="text-center text-base text-muted-foreground">录一首歌，让AI老师为您打分</p>
          </div>
        )}
      </div>

      {/* Bottom Controls - fixed height region so buttons don't shift */}
      <div className="flex flex-col gap-3 pb-2" style={{ minHeight: "112px" }}>
        {/* Hint row: always rendered to preserve height, invisible when not needed */}
        <p
          className={`text-center text-base text-muted-foreground transition-opacity ${
            isRecording && seconds < 3 ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {"\u81F3\u5C11\u5F55\u52363\u79D2\u54E6"}
        </p>

        {phase === "idle" ? (
          <div className="flex items-center gap-3">
            <button
              onClick={startRecording}
              className="flex flex-[2] items-center justify-center gap-3 rounded-3xl bg-primary py-5 text-2xl font-bold text-primary-foreground shadow-lg transition-all active:scale-[0.98]"
            >
              <Mic className="h-6 w-6" />
              <span>开始录歌</span>
            </button>
            <button
              onClick={onUpload}
              className="flex flex-1 flex-col items-center justify-center gap-1 rounded-3xl bg-card py-5 shadow-sm transition-all active:scale-[0.98]"
            >
              <Upload className="h-6 w-6 text-foreground" />
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

      {/* FAB - Ask AI Teacher */}
      <button
        onClick={onOpenChat}
        className="fixed bottom-28 right-5 z-40 flex items-center gap-2 rounded-full bg-primary py-3.5 pl-4 pr-5 shadow-lg transition-all active:scale-95"
        style={{ maxWidth: "calc(100% - 40px)" }}
        aria-label="问老师"
      >
        <MessageCircle className="h-7 w-7 text-primary-foreground" />
        <span className="text-lg font-bold text-primary-foreground">问老师</span>
      </button>

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
