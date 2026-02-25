"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ArrowLeft, BookOpen } from "lucide-react"

interface RecordingScreenProps {
  onComplete: (duration: number) => void
  onOpenHistory: () => void
}

export function RecordingScreen({ onComplete, onOpenHistory }: RecordingScreenProps) {
  const [seconds, setSeconds] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startRecording = useCallback(() => {
    setIsRecording(true)
    setSeconds(0)
  }, [])

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1)
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRecording])

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
      .toString()
      .padStart(2, "0")
    const secs = (s % 60).toString().padStart(2, "0")
    return `${mins}:${secs}`
  }

  const handleComplete = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setIsRecording(false)
    onComplete(seconds)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-foreground transition-all active:scale-95"
          aria-label="返回"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <button
          onClick={onOpenHistory}
          className="flex items-center gap-2 rounded-2xl bg-secondary px-5 py-3 text-lg font-bold text-foreground transition-all active:scale-95"
        >
          <BookOpen className="h-5 w-5" />
          <span>练歌记录</span>
        </button>
      </div>

      {/* Center Recording Area */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <div className="relative flex items-center justify-center">
          {/* Ripple animations */}
          {isRecording && (
            <>
              <div className="absolute h-64 w-64 animate-ping rounded-full bg-primary/5" style={{ animationDuration: "3s" }} />
              <div className="absolute h-56 w-56 animate-ping rounded-full bg-primary/8" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }} />
              <div className="absolute h-48 w-48 animate-pulse rounded-full bg-primary/10" style={{ animationDuration: "2s" }} />
            </>
          )}

          {/* Main circle */}
          <button
            onClick={!isRecording ? startRecording : undefined}
            className={`relative z-10 flex h-44 w-44 flex-col items-center justify-center rounded-full transition-all duration-500 ${
              isRecording
                ? "bg-primary/15 shadow-[0_0_60px_rgba(247,128,0,0.2)]"
                : "bg-secondary shadow-lg hover:bg-primary/10 active:scale-95 cursor-pointer"
            }`}
            aria-label={isRecording ? "正在录音" : "点击开始录音"}
          >
            <span className="text-4xl font-black tracking-wider text-foreground">
              {formatTime(seconds)}
            </span>
            {!isRecording && (
              <span className="mt-2 text-base font-medium text-muted-foreground">
                点击开始
              </span>
            )}
          </button>
        </div>

        {/* Hint text */}
        <p className="text-center text-xl font-medium text-muted-foreground transition-all duration-500">
          {isRecording
            ? "老师正在听，请尽情歌唱..."
            : "准备好了吗？点击圆圈开始练歌"}
        </p>
      </div>

      {/* Bottom Complete Button */}
      <div className="pb-6">
        <button
          onClick={handleComplete}
          disabled={!isRecording || seconds < 3}
          className="w-full rounded-3xl bg-primary py-5 text-2xl font-bold text-primary-foreground shadow-lg transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
        >
          完成
        </button>
        {isRecording && seconds < 3 && (
          <p className="mt-3 text-center text-base text-muted-foreground">
            至少录制3秒哦
          </p>
        )}
      </div>
    </div>
  )
}
