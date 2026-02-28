"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Upload, Mic, ArrowLeft, Check, Music2, Trophy, ChevronRight, Play, Pause, RotateCcw, Sparkles } from "lucide-react"

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
  const [phase, setPhase] = useState<"idle" | "recording" | "preview">("idle")
  const [showConfirm, setShowConfirm] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [tipIndex, setTipIndex] = useState(0)
  const [tipFade, setTipFade] = useState(true)
  const [hasMounted, setHasMounted] = useState(false)

  // Avoid hydration mismatch: randomize tip index only after mount
  useEffect(() => {
    setTipIndex(Math.floor(Math.random() * TIPS.length))
    setHasMounted(true)
  }, [])

  // Preview (试听) state
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackProgress, setPlaybackProgress] = useState(0)
  const [recordedDuration, setRecordedDuration] = useState(0)
  const playbackRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Rotate tips every 5 seconds with fade
  useEffect(() => {
    if (phase !== "idle") return
    let fadeTimeout: ReturnType<typeof setTimeout> | null = null
    const timer = setInterval(() => {
      setTipFade(false)
      fadeTimeout = setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % TIPS.length)
        setTipFade(true)
      }, 400)
    }, 5000)
    return () => {
      clearInterval(timer)
      if (fadeTimeout) clearTimeout(fadeTimeout)
    }
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
    // Enter preview phase instead of directly completing
    setRecordedDuration(seconds)
    setPhase("preview")
    setPlaybackProgress(0)
    setIsPlaying(false)
  }, [seconds])

  const cancelFinish = useCallback(() => {
    setShowConfirm(false)
  }, [])

  // Preview: submit to AI analysis
  const handleSubmitFromPreview = useCallback(() => {
    if (playbackRef.current) clearInterval(playbackRef.current)
    setPhase("idle")
    setSeconds(0)
    onComplete(recordedDuration)
  }, [onComplete, recordedDuration])

  // Preview: re-record
  const handleReRecordFromPreview = useCallback(() => {
    if (playbackRef.current) clearInterval(playbackRef.current)
    setPhase("idle")
    setSeconds(0)
    setPlaybackProgress(0)
    setIsPlaying(false)
  }, [])

  // Preview: toggle playback
  const togglePlayback = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  // Simulate playback progress
  useEffect(() => {
    if (phase !== "preview") return
    if (isPlaying) {
      playbackRef.current = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 100
          }
          return prev + (100 / (recordedDuration || 1)) * 0.1
        })
      }, 100)
    } else {
      if (playbackRef.current) clearInterval(playbackRef.current)
    }
    return () => {
      if (playbackRef.current) clearInterval(playbackRef.current)
    }
  }, [isPlaying, phase, recordedDuration])

  // Reset playback when replaying
  const handleReplay = useCallback(() => {
    setPlaybackProgress(0)
    setIsPlaying(true)
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
  const isPreview = phase === "preview"
  const waveformBars = 28

  return (
    <div className="flex min-h-dvh flex-col bg-background px-6 pb-8 pt-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground">
            {"\u58F0\u4E50AI\u52A9\u6559"}
          </h1>
          <p className="mt-1 text-base text-muted-foreground">{"\u6BCF\u5929\u4E00\u9996\u6B4C\uFF0C\u8D8A\u5531\u8D8A\u5FEB\u4E50"}</p>
        </div>
        <button
          onClick={onOpenHistory}
          className="relative flex items-center gap-2 rounded-2xl bg-card px-4 py-3 text-lg font-bold text-foreground shadow-sm transition-all active:scale-95"
        >
          <Trophy className="h-5 w-5 text-primary" />
          <span>{"\u4F5C\u54C1\u5899"}</span>
          {historyCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {historyCount > 99 ? "99+" : historyCount}
            </span>
          )}
        </button>
      </div>

      {/* Ask AI Teacher Card - only in idle */}
      {!isRecording && !isPreview && (
        <div className="mt-6">
          <button
            onClick={onOpenChat}
            className="flex w-full items-center gap-4 rounded-3xl p-5 shadow-sm transition-all active:scale-[0.98]"
            style={{ backgroundColor: "#FEF5EB" }}
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary">
              <span className="text-sm font-black text-primary-foreground">AI</span>
            </div>
            <div className="flex flex-1 flex-col items-start">
              <p className="text-lg font-bold text-foreground">{"\u6709\u5531\u6B4C\u7684\u7591\u95EE\uFF1F"}</p>
              <p className="text-sm text-muted-foreground">{"\u968F\u65F6\u548CAI\u58F0\u4E50\u5BFC\u5E08\u804A\u804A"}</p>
            </div>
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: "#FDDBB5" }}
            >
              <ChevronRight className="h-4 w-4 text-primary" />
            </div>
          </button>
        </div>
      )}

      {/* Center Visualization */}
      <div className="flex flex-1 flex-col items-center justify-center">
        {isRecording ? (
          /* --- Recording State --- */
          <div className="flex w-full flex-col items-center gap-6">
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

            {/* Enhanced bottom status text */}
            {showConfirm ? (
              <p className="text-center text-lg font-medium text-muted-foreground">
                {"录音已暂停"}
              </p>
            ) : (
              <div className="flex items-center justify-center gap-3 rounded-2xl px-5 py-2.5" style={{ backgroundColor: "rgba(247, 128, 0, 0.08)" }}>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" style={{ animationDuration: "1.5s" }} />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                </span>
                <RecordingStatusText />
              </div>
            )}
          </div>
        ) : isPreview ? (
          /* --- Preview / 试听 State --- */
          <div className="flex w-full flex-col items-center gap-6">
            {/* Header text */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-center text-2xl font-black text-foreground">
                {"唱得不错，来听听回放吧"}
              </p>
              <p className="text-center text-base text-muted-foreground">
                {"录制时长 "}
                <span className="font-bold text-foreground">{formatTime(recordedDuration)}</span>
              </p>
            </div>

            {/* Playback Card - centered disc design */}
            <div className="w-full rounded-3xl bg-card px-6 py-8 shadow-sm">
              {/* Central play button with circular progress */}
              <div className="flex flex-col items-center">
                <div className="relative flex h-40 w-40 items-center justify-center">
                  {/* Circular progress ring */}
                  <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="72" fill="none" stroke="currentColor" strokeWidth="5" className="text-secondary" />
                    <circle
                      cx="80" cy="80" r="72" fill="none" stroke="currentColor" strokeWidth="5"
                      className="text-primary transition-all duration-150 ease-linear"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 72}`}
                      strokeDashoffset={`${2 * Math.PI * 72 * (1 - Math.min(playbackProgress, 100) / 100)}`}
                    />
                  </svg>
                  {/* Play / Pause button */}
                  <button
                    onClick={playbackProgress >= 100 ? handleReplay : togglePlayback}
                    className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/25 transition-all active:scale-95"
                    aria-label={isPlaying ? "暂停" : "播放"}
                  >
                    {isPlaying ? (
                      <Pause className="h-9 w-9 text-primary-foreground" />
                    ) : (
                      <Play className="ml-1 h-9 w-9 text-primary-foreground" />
                    )}
                  </button>
                </div>

                {/* Current time */}
                <p className="mt-3 text-lg font-bold text-foreground tabular-nums">
                  {formatTime(Math.floor((playbackProgress / 100) * recordedDuration))}
                  <span className="font-normal text-muted-foreground">{" / "}{formatTime(recordedDuration)}</span>
                </p>

                {/* Replay from start */}
                <button
                  onClick={handleReplay}
                  className="mt-4 flex items-center gap-1.5 rounded-xl px-4 py-2 text-base font-medium text-muted-foreground transition-all active:scale-95"
                  style={{ backgroundColor: "rgba(0,0,0,0.04)" }}
                  aria-label="从头播放"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>{"从头播放"}</span>
                </button>
              </div>
            </div>

            {/* Encouraging note */}
            <p className="text-center text-base leading-relaxed text-muted-foreground">
              {"不满意可以重录，没有次数限制"}
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
          className={`text-center text-base text-muted-foreground transition-opacity ${
            isRecording && !isPreview && seconds < 3 ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {"\u81F3\u5C11\u5F55\u52363\u79D2\u54E6"}
        </p>

        {phase === "idle" ? (
          <div className="flex items-center gap-3">
            <button
              onClick={startRecording}
              className="flex flex-[2] items-center justify-center gap-3 rounded-3xl bg-primary py-5 text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
            >
              <Mic className="h-6 w-6" />
              <span>{"\u5F00\u59CB\u5F55\u6B4C"}</span>
            </button>
            <button
              onClick={onUpload}
              className="flex flex-1 flex-col items-center justify-center gap-1.5 rounded-3xl bg-card py-5 transition-all active:scale-[0.98]"
            >
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-bold text-foreground">{"\u4E0A\u4F20\u97F3\u9891"}</span>
            </button>
          </div>
        ) : phase === "recording" ? (
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="flex flex-1 flex-col items-center justify-center gap-1 rounded-3xl bg-card py-5 shadow-sm transition-all active:scale-[0.98]"
            >
              <ArrowLeft className="h-6 w-6 text-foreground" />
              <span className="text-sm font-bold text-foreground">{"\u8FD4\u56DE"}</span>
            </button>
            <button
              onClick={requestFinish}
              disabled={seconds < 3}
              className="flex flex-[2] items-center justify-center gap-3 rounded-3xl bg-primary py-5 text-2xl font-bold text-primary-foreground shadow-lg transition-all active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
            >
              <Check className="h-6 w-6" />
              <span>{"\u5B8C\u6210\u5F55\u6B4C"}</span>
            </button>
          </div>
        ) : (
          /* Preview phase bottom controls */
          <div className="flex items-center gap-3">
            <button
              onClick={handleReRecordFromPreview}
              className="flex flex-1 flex-col items-center justify-center gap-1 rounded-3xl bg-card py-5 shadow-sm transition-all active:scale-[0.98]"
            >
              <Mic className="h-6 w-6 text-foreground" />
              <span className="text-sm font-bold text-foreground">{"\u91CD\u65B0\u5F55"}</span>
            </button>
            <button
              onClick={handleSubmitFromPreview}
              className="flex flex-[2] items-center justify-center gap-3 rounded-3xl bg-primary py-5 text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
            >
              <Sparkles className="h-6 w-6" />
              <span>{"\u63D0\u4EA4\u70B9\u8BC4"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirm Dialog Overlay */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm">
          <div className="mx-4 mb-8 w-full max-w-md animate-in slide-in-from-bottom-4 duration-300 rounded-3xl bg-card p-6 shadow-xl">
            <p className="text-center text-2xl font-bold text-foreground">{"\u7ED3\u675F\u8FD9\u6B21\u5F55\u97F3\u5417\uFF1F"}</p>
            <p className="mt-2 text-center text-base text-muted-foreground">
              {'已录制 '}
              <span className="font-bold text-foreground">{formatTime(seconds)}</span>
              {'，结束后可以先试听一下'}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={cancelFinish}
                className="flex flex-1 items-center justify-center rounded-2xl bg-secondary py-4 text-lg font-bold text-foreground transition-all active:scale-[0.98]"
              >
                {"\u7EE7\u7EED\u5F55\u5236"}
              </button>
              <button
                onClick={confirmFinish}
                className="flex flex-1 items-center justify-center rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-lg transition-all active:scale-[0.98]"
              >
                {"\u7ED3\u675F\u5F55\u97F3"}
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

/* Enhanced recording status text with animated dots (no layout shift) */
function RecordingStatusText() {
  const [dotCount, setDotCount] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className="text-lg font-bold text-primary">
      {"正在收音中，请放心演唱"}
      <span className="inline-block w-[1.5em] text-left">
        {".".repeat(dotCount)}
      </span>
    </span>
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
