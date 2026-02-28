"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import dynamic from "next/dynamic"
import { RecordingScreen } from "./recording-screen"
import { ResultScreen, LoadingOverlay, type EvaluationResult } from "./result-screen"
import { HistoryScreen, type HistoryRecord } from "./history-screen"
import { UploadDialog } from "./upload-dialog"

// Lazy-load ChatScreen so that the AI SDK bundle (~100KB+) is only fetched
// when the user actually navigates to the chat page, keeping initial load fast.
const ChatScreen = dynamic(
  () => import("./chat-screen").then((m) => ({ default: m.ChatScreen })),
  { ssr: false }
)

type Screen = "recording" | "result" | "history" | "chat"
const VALID_SCREENS: Screen[] = ["recording", "result", "history", "chat"]
const SS_KEY = "vc_screen"

// Pre-populated demo records
const initialRecords: HistoryRecord[] = [
  { id: "demo-1", date: "2026年2月24日 14:30", score: 91, label: "卓越", comment: "气息运用得很稳健，高音部分表现出色！" },
  { id: "demo-2", date: "2026年2月23日 10:15", score: 85, label: "优秀", comment: "音色饱满明亮，情感表达很到位！" },
  { id: "demo-3", date: "2026年2月22日 16:00", score: 78, label: "良好", comment: "嗓音状态非常好，节奏感掌握得很棒！" },
]

function readSavedScreen(): Screen {
  try {
    const v = sessionStorage.getItem(SS_KEY)
    if (v && VALID_SCREENS.includes(v as Screen)) return v as Screen
  } catch {}
  return "recording"
}

export function VocalCoachApp() {
  const [screen, setScreen] = useState<Screen>(readSavedScreen)
  const [lastDuration, setLastDuration] = useState(0)
  const [records, setRecords] = useState<HistoryRecord[]>(initialRecords)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState<"uploading" | "analyzing">("uploading")
  const [showUpload, setShowUpload] = useState(false)
  const [chatFromResult, setChatFromResult] = useState(false)
  const [prevScreen, setPrevScreen] = useState<Screen>("recording")

  // Persist screen to sessionStorage so HMR / sandbox reloads restore it
  useEffect(() => {
    try { sessionStorage.setItem(SS_KEY, screen) } catch {}
  }, [screen])

  // Track which screens have been visited so we can lazy-mount them
  // Using state instead of ref so re-mounts (HMR / sandbox) correctly trigger re-render
  const [visited, setVisited] = useState<Set<Screen>>(() => new Set(["recording", readSavedScreen()]))

  // Centralized timer refs - cancelable on unmount or re-trigger
  const loadingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const clearLoadingTimers = useCallback(() => {
    loadingTimersRef.current.forEach(clearTimeout)
    loadingTimersRef.current = []
  }, [])

  // Cleanup all loading timers on unmount
  useEffect(() => clearLoadingTimers, [clearLoadingTimers])

  const navigateTo = useCallback((target: Screen) => {
    setVisited((prev) => {
      if (prev.has(target)) return prev
      const next = new Set(prev)
      next.add(target)
      return next
    })
    setScreen(target)
  }, [])

  // Shared loading sequence: upload -> analyze -> navigate to result
  const startLoadingSequence = useCallback((duration: number) => {
    // Cancel any existing loading timers first
    clearLoadingTimers()
    setLastDuration(duration)
    setLoadingStage("uploading")
    setIsLoading(true)

    const t1 = setTimeout(() => {
      setLoadingStage("analyzing")
    }, 1500)

    const t2 = setTimeout(() => {
      setIsLoading(false)
      navigateTo("result")
    }, 3200)

    loadingTimersRef.current = [t1, t2]
  }, [clearLoadingTimers, navigateTo])

  const handleOpenChat = useCallback((fromResult = false) => {
    setChatFromResult(fromResult)
    setPrevScreen(fromResult ? "result" : "recording")
    navigateTo("chat")
  }, [navigateTo])

  const handleBackFromChat = useCallback(() => {
    setScreen(prevScreen)
  }, [prevScreen])

  const handleRecordingComplete = useCallback((duration: number) => {
    startLoadingSequence(duration)
  }, [startLoadingSequence])

  const handleRetry = useCallback(() => {
    navigateTo("recording")
  }, [navigateTo])

  const handleSave = useCallback((evaluation: EvaluationResult) => {
    const now = new Date()
    const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

    const newRecord: HistoryRecord = {
      id: `record-${Date.now()}`,
      date: dateStr,
      score: evaluation.score,
      label: evaluation.label,
      comment: evaluation.comment,
    }
    setRecords((prev) => [newRecord, ...prev])
    navigateTo("history")
  }, [navigateTo])

  const handleOpenHistory = useCallback(() => {
    navigateTo("history")
  }, [navigateTo])

  const handleBackFromHistory = useCallback(() => {
    navigateTo("recording")
  }, [navigateTo])

  const handleOpenUpload = useCallback(() => {
    setShowUpload(true)
  }, [])

  const handleCloseUpload = useCallback(() => {
    setShowUpload(false)
  }, [])

  const handleUploadComplete = useCallback((duration: number) => {
    setShowUpload(false)
    startLoadingSequence(duration)
  }, [startLoadingSequence])

  // Helper: whether a screen should be mounted (once visited, stays mounted)
  const shouldMount = (s: Screen) => visited.has(s) || screen === s

  return (
    <div className="relative mx-auto min-h-dvh max-w-md overflow-hidden bg-background">
      {/* All screens stay mounted once visited - prevents state loss */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          screen === "recording" ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none absolute inset-0"
        }`}
      >
        {shouldMount("recording") && (
          <RecordingScreen
            onComplete={handleRecordingComplete}
            onUpload={handleOpenUpload}
            onOpenHistory={handleOpenHistory}
            historyCount={records.length}
            onOpenChat={() => handleOpenChat(false)}
          />
        )}
      </div>

      <div
        className={`transition-all duration-500 ease-in-out ${
          screen === "result" ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none absolute inset-0"
        }`}
      >
        {shouldMount("result") && (
          <ResultScreen
            duration={lastDuration}
            active={screen === "result"}
            onRetry={handleRetry}
            onSave={handleSave}
            onOpenChat={() => handleOpenChat(true)}
            onGoHome={handleRetry}
          />
        )}
      </div>

      <div
        className={`transition-all duration-500 ease-in-out ${
          screen === "history" ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none absolute inset-0"
        }`}
      >
        {shouldMount("history") && (
          <HistoryScreen records={records} onBack={handleBackFromHistory} />
        )}
      </div>

      <div
        className={`transition-all duration-500 ease-in-out ${
          screen === "chat" ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none absolute inset-0"
        }`}
      >
        {shouldMount("chat") && (
          <ChatScreen fromResult={chatFromResult} onBack={handleBackFromChat} />
        )}
      </div>

      {/* Loading Overlay - renders on top of everything */}
      <LoadingOverlay visible={isLoading} stage={loadingStage} />

      {/* Upload Dialog */}
      <UploadDialog
        visible={showUpload}
        onClose={handleCloseUpload}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  )
}
