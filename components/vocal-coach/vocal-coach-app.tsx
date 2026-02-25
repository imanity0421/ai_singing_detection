"use client"

import { useState, useCallback } from "react"
import { RecordingScreen } from "./recording-screen"
import { ResultScreen } from "./result-screen"
import { HistoryScreen, type HistoryRecord } from "./history-screen"

type Screen = "recording" | "result" | "history"

// Pre-populated demo records
const initialRecords: HistoryRecord[] = [
  { id: "demo-1", date: "2026年2月24日 14:30", score: 91, label: "卓越" },
  { id: "demo-2", date: "2026年2月23日 10:15", score: 85, label: "优秀" },
  { id: "demo-3", date: "2026年2月22日 16:00", score: 78, label: "良好" },
]

export function VocalCoachApp() {
  const [screen, setScreen] = useState<Screen>("recording")
  const [lastDuration, setLastDuration] = useState(0)
  const [records, setRecords] = useState<HistoryRecord[]>(initialRecords)

  const handleRecordingComplete = useCallback((duration: number) => {
    setLastDuration(duration)
    setScreen("result")
  }, [])

  const handleRetry = useCallback(() => {
    setScreen("recording")
  }, [])

  const handleSave = useCallback(() => {
    const now = new Date()
    const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    const score = Math.min(60 + Math.floor(lastDuration / 3) + Math.floor(Math.random() * 8), 99)
    const label = score >= 90 ? "卓越" : score >= 80 ? "优秀" : score >= 70 ? "良好" : "继续加油"

    const newRecord: HistoryRecord = {
      id: `record-${Date.now()}`,
      date: dateStr,
      score,
      label,
    }
    setRecords((prev) => [newRecord, ...prev])
    // Slight delay before going back to recording
    setTimeout(() => setScreen("recording"), 100)
  }, [lastDuration])

  const handleOpenHistory = useCallback(() => {
    setScreen("history")
  }, [])

  const handleBackFromHistory = useCallback(() => {
    setScreen("recording")
  }, [])

  return (
    <div className="relative mx-auto min-h-dvh max-w-md overflow-hidden bg-background">
      <div
        className={`transition-all duration-500 ease-in-out ${
          screen === "recording" ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 absolute inset-0"
        }`}
      >
        {screen === "recording" && (
          <RecordingScreen
            onComplete={handleRecordingComplete}
            onOpenHistory={handleOpenHistory}
          />
        )}
      </div>

      <div
        className={`transition-all duration-500 ease-in-out ${
          screen === "result" ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 absolute inset-0"
        }`}
      >
        {screen === "result" && (
          <ResultScreen
            duration={lastDuration}
            onRetry={handleRetry}
            onSave={handleSave}
          />
        )}
      </div>

      <div
        className={`transition-all duration-500 ease-in-out ${
          screen === "history" ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 absolute inset-0"
        }`}
      >
        {screen === "history" && (
          <HistoryScreen records={records} onBack={handleBackFromHistory} />
        )}
      </div>
    </div>
  )
}
