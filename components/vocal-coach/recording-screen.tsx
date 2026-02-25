"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Upload, Mic, Pause, Square, Music2, Trophy } from "lucide-react"

interface RecordingScreenProps {
  onComplete: (duration: number) => void
  onUpload: () => void
  onOpenHistory: () => void
  historyCount: number
}

export function RecordingScreen({ onComplete, onUpload, onOpenHistory, historyCount }: RecordingScreenProps) {
  const [seconds, setSeconds] = useState(0)
  const [phase, setPhase] = useState<"idle" | "recording" | "paused">("idle")
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startRecording = useCallback(() => {
    setPhase("recording")
    setSeconds(0)
  }, [])

  const pauseRecording = useCallback(() => {
    setPhase("paused")
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  const resumeRecording = useCallback(() => {
    setPhase("recording")
  }, [])

  const finishRecording = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setPhase("idle")
    onComplete(seconds)
  }, [onComplete, seconds])

  useEffect(() => {
    if (phase === "recording") {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1)
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [phase])

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60).toString().padStart(2, "0")
    const secs = (s % 60).toString().padStart(2, "0")
    return `${mins}:${secs}`
  }

  const isActive = phase === "recording" || phase === "paused"

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

      {/* Tips Card */}
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

      {/* Center Visualization */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          {/* Ripple animations when recording */}
          {phase === "recording" && (
            <>
              <div className="absolute h-72 w-72 animate-ping rounded-full bg-primary/5" style={{ animationDuration: "3s" }} />
              <div className="absolute h-60 w-60 animate-ping rounded-full bg-primary/8" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }} />
              <div className="absolute h-52 w-52 animate-pulse rounded-full bg-primary/10" style={{ animationDuration: "2s" }} />
            </>
          )}

          {/* Paused gentle pulse */}
          {phase === "paused" && (
            <div className="absolute h-52 w-52 animate-pulse rounded-full bg-muted/60" style={{ animationDuration: "3s" }} />
          )}

          {/* Main visualization circle - display only, no click interaction */}
          <div
            className={`relative z-10 flex h-44 w-44 flex-col items-center justify-center rounded-full transition-all duration-700 ${
              phase === "recording"
                ? "bg-primary/15 shadow-[0_0_80px_rgba(247,128,0,0.25)]"
                : phase === "paused"
                  ? "bg-muted shadow-lg"
                  : "bg-secondary shadow-sm"
            }`}
          >
            {isActive ? (
              <>
                <span className="text-4xl font-black tracking-wider text-foreground">
                  {formatTime(seconds)}
                </span>
                <span className="mt-1 text-sm font-medium text-muted-foreground">
                  {phase === "recording" ? "录音中" : "已暂停"}
                </span>
              </>
            ) : (
              <>
                <Mic className="h-10 w-10 text-muted-foreground/60" />
                <span className="mt-2 text-base font-medium text-muted-foreground">
                  准备就绪
                </span>
              </>
            )}
          </div>
        </div>

        {/* Status text */}
        <p className="mt-8 text-center text-lg font-medium text-muted-foreground transition-all duration-500">
          {phase === "recording"
            ? "老师正在听，请尽情歌唱..."
            : phase === "paused"
              ? "已暂停录音，可继续或结束"
              : "点击下方按钮开始练歌"}
        </p>
      </div>

      {/* Bottom Controls */}
      <div className="space-y-4 pb-2">
        {phase === "idle" ? (
          /* Idle: Two buttons - Record + Upload */
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
          /* Recording/Paused: Control row */
          <div className="flex items-center gap-3">
            {/* Pause / Resume */}
            <button
              onClick={phase === "recording" ? pauseRecording : resumeRecording}
              className="flex flex-1 items-center justify-center gap-2 rounded-3xl bg-card py-5 text-xl font-bold text-foreground shadow-sm transition-all active:scale-[0.98]"
            >
              {phase === "recording" ? (
                <>
                  <Pause className="h-5 w-5" />
                  <span>暂停</span>
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 text-primary" />
                  <span>继续</span>
                </>
              )}
            </button>

            {/* Finish */}
            <button
              onClick={finishRecording}
              disabled={seconds < 3}
              className="flex flex-[1.5] items-center justify-center gap-2 rounded-3xl bg-primary py-5 text-xl font-bold text-primary-foreground shadow-lg transition-all active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
            >
              <Square className="h-5 w-5" />
              <span>完成录歌</span>
            </button>
          </div>
        )}

        {isActive && seconds < 3 && (
          <p className="text-center text-base text-muted-foreground">
            至少录制3秒哦
          </p>
        )}
      </div>
    </div>
  )
}
