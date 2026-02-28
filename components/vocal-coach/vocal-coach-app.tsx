"use client"

import { useState, useCallback, useRef } from "react"
import { RecordingScreen } from "./recording-screen"
import { ResultScreen, LoadingOverlay, type EvaluationResult } from "./result-screen"
import { HistoryScreen, type HistoryRecord } from "./history-screen"
import { UploadDialog } from "./upload-dialog"
import { ChatScreen } from "./chat-screen"

type Screen = "recording" | "result" | "history" | "chat"

// Pre-populated demo records
const initialRecords: HistoryRecord[] = [
  { id: "demo-1", date: "2026年2月24日 14:30", score: 91, label: "卓越", comment: "气息运用得很稳健，高音部分表现出色！" },
  { id: "demo-2", date: "2026年2月23日 10:15", score: 85, label: "优秀", comment: "音色饱满明亮，情感表达很到位！" },
  { id: "demo-3", date: "2026年2月22日 16:00", score: 78, label: "良好", comment: "嗓音状态非常好，节奏感掌握得很棒！" },
]

export function VocalCoachApp() {
  const [screen, setScreen] = useState<Screen>("recording")
  const [lastDuration, setLastDuration] = useState(0)
  const [records, setRecords] = useState<HistoryRecord[]>(initialRecords)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState<"uploading" | "analyzing">("uploading")
  const [showUpload, setShowUpload] = useState(false)
  const [chatFromResult, setChatFromResult] = useState(false)
  const [prevScreen, setPrevScreen] = useState<Screen>("recording")

  // Track which screens have been visited so we can lazy-mount them
  const visitedRef = useRef<Set<Screen>>(new Set(["recording"]))

  const navigateTo = useCallback((target: Screen) => {
    visitedRef.current.add(target)
    setScreen(target)
  }, [])

  const handleOpenChat = useCallback((fromResult = false) => {
    setChatFromResult(fromResult)
    setPrevScreen(fromResult ? "result" : "recording")
    navigateTo("chat")
  }, [navigateTo])

  const handleBackFromChat = useCallback(() => {
    setScreen(prevScreen)
  }, [prevScreen])

  const handleRecordingComplete = useCallback((duration: number) => {
    setLastDuration(duration)
    // Stage 1: uploading
    setLoadingStage("uploading")
    setIsLoading(true)
    // Stage 2: analyzing (after upload finishes)
    setTimeout(() => {
      setLoadingStage("analyzing")
    }, 1800)
    // Done: transition to result
    setTimeout(() => {
      navigateTo("result")
      setIsLoading(false)
    }, 4200)
  }, [navigateTo])

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
    setLastDuration(duration)
    setLoadingStage("uploading")
    setIsLoading(true)
    setTimeout(() => {
      setLoadingStage("analyzing")
    }, 1800)
    setTimeout(() => {
      navigateTo("result")
      setIsLoading(false)
    }, 4200)
  }, [navigateTo])

  // Helper: whether a screen should be mounted (once visited, stays mounted)
  const shouldMount = (s: Screen) => visitedRef.current.has(s) || screen === s

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
            onRetry={handleRetry}
            onSave={handleSave}
            onOpenChat={() => handleOpenChat(true)}
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
