"use client"

import { ArrowLeft, Play, Pause, Music, Trophy } from "lucide-react"
import { useState } from "react"

export interface HistoryRecord {
  id: string
  date: string
  score: number
  label: string
  comment: string
}

interface HistoryScreenProps {
  records: HistoryRecord[]
  onBack: () => void
}

export function HistoryScreen({ records, onBack }: HistoryScreenProps) {
  const [playingId, setPlayingId] = useState<string | null>(null)

  const togglePlay = (id: string) => {
    setPlayingId(playingId === id ? null : id)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-primary"
    if (score >= 80) return "text-primary/80"
    return "text-muted-foreground"
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background px-6 py-8">
      {/* Header */}
      <div className="mb-2 flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card text-foreground shadow-sm transition-all active:scale-95"
          aria-label="返回"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-foreground">{"\u4F5C\u54C1\u5899"}</h1>
          <p className="text-sm text-muted-foreground">{"\u5171 "}{records.length}{" \u6761\u8BB0\u5F55"}</p>
        </div>
      </div>

      {/* Summary bar */}
      {records.length > 0 && (
        <div className="mb-6 mt-4 flex items-center gap-3 rounded-3xl bg-card p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">
              {"\u6700\u9AD8\u5206 "}{Math.max(...records.map((r) => r.score))}{" \u5206"}
            </p>
            <p className="text-sm text-muted-foreground">
              {"\u5E73\u5747\u5206 "}{Math.round(records.reduce((sum, r) => sum + r.score, 0) / records.length)}{" \u5206"}
            </p>
          </div>
        </div>
      )}

      {/* Records List */}
      {records.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
            <Music className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="text-xl font-medium text-muted-foreground">{"\u4F5C\u54C1\u5899\u8FD8\u662F\u7A7A\u7684"}</p>
          <p className="text-lg text-muted-foreground">{"\u5B8C\u6210\u4E00\u6B21\u7EC3\u6B4C\u540E\uFF0C\u4F5C\u54C1\u4F1A\u51FA\u73B0\u5728\u8FD9\u91CC"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record, index) => (
            <div
              key={record.id}
              className="flex items-center gap-4 rounded-3xl bg-card p-5 shadow-sm transition-all"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {/* Score Circle */}
              <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-2xl bg-primary/10">
                <span className={`text-2xl font-black ${getScoreColor(record.score)}`}>
                  {record.score}
                </span>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-lg font-bold text-foreground">{record.label}</span>
                <span className="text-sm text-muted-foreground">{record.date}</span>
                <span className="mt-0.5 line-clamp-1 text-sm text-muted-foreground/80">{record.comment}</span>
              </div>

              {/* Play Button */}
              <button
                onClick={() => togglePlay(record.id)}
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-all active:scale-95"
                aria-label={playingId === record.id ? "暂停" : "播放"}
              >
                {playingId === record.id ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="ml-0.5 h-5 w-5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
