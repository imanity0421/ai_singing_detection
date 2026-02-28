"use client"

import { useState, useRef } from "react"
import { Upload, X, FileAudio, Check } from "lucide-react"

interface UploadDialogProps {
  visible: boolean
  onClose: () => void
  onUploadComplete: (duration: number) => void
}

export function UploadDialog({ visible, onClose, onUploadComplete }: UploadDialogProps) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
    }
  }

  const handleUpload = () => {
    if (!fileName) return
    setUploading(true)
    // Simulate upload + processing
    setTimeout(() => {
      setUploading(false)
      setFileName(null)
      onUploadComplete(Math.floor(Math.random() * 60) + 30)
    }, 1500)
  }

  const handleClose = () => {
    setFileName(null)
    setUploading(false)
    onClose()
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative z-10 mx-4 mb-6 w-full max-w-md rounded-3xl bg-card p-6 shadow-xl sm:mb-0">
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-all active:scale-95"
          aria-label="关闭"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="mb-1 text-2xl font-bold text-foreground">{"\u4E0A\u4F20\u97F3\u9891"}</h2>
        <p className="mb-6 text-base text-muted-foreground">
          {"\u652F\u6301 MP3\u3001WAV\u3001M4A \u683C\u5F0F"}
        </p>

        {/* Upload Area */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {fileName ? (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-muted p-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <FileAudio className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-base font-bold text-foreground">{fileName}</p>
              <p className="text-sm text-muted-foreground">{"\u5DF2\u9009\u62E9"}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-4 w-4 text-primary" />
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mb-6 flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border p-8 transition-all active:scale-[0.99]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-7 w-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{"\u70B9\u51FB\u9009\u62E9\u6587\u4EF6"}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {"\u4ECE\u624B\u673A\u4E2D\u9009\u62E9\u97F3\u9891\u6587\u4EF6"}
              </p>
            </div>
          </button>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 rounded-2xl bg-secondary py-4 text-lg font-bold text-secondary-foreground transition-all active:scale-[0.98]"
          >
            {"\u53D6\u6D88"}
          </button>
          <button
            onClick={handleUpload}
            disabled={!fileName || uploading}
            className="flex-[1.5] rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-md transition-all active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
          >
            {uploading ? "上传中..." : "开始评测"}
          </button>
        </div>
      </div>
    </div>
  )
}
