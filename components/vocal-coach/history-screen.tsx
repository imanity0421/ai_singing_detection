"use client"

import { ArrowLeft, Play, Pause, Music } from "lucide-react"
import { useState } from "react"

export interface HistoryRecord {
  id: string
  date: string
  score: number
  label: string
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

  return (
    <div className="flex min-h-dvh flex-col bg-background px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-foreground transition-all active:scale-95"
          aria-label="返回"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">练歌记录</h1>
      </div>

      {/* Records List */}
      {records.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
            <Music className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="text-xl font-medium text-muted-foreground">
            还没有练歌记录
          </p>
          <p className="text-lg text-muted-foreground">
            完成一次练歌后，记录会出现在这里
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div
              key={record.id}
              className="flex items-center gap-4 rounded-3xl bg-card p-5 shadow-sm transition-all"
            >
              {/* Score Circle */}
              <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-2xl bg-primary/10">
                <span className="text-2xl font-black text-primary">
                  {record.score}
                </span>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-lg font-bold text-foreground">
                  {record.label}
                </span>
                <span className="text-base text-muted-foreground">
                  {record.date}
                </span>
              </div>

              {/* Play Button */}
              <button
                onClick={() => togglePlay(record.id)}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-all active:scale-95"
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
