"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { RotateCcw, Share2, Home, MessageCircle, Sparkles, Upload } from "lucide-react"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"

interface ResultScreenProps {
  duration: number
  active: boolean
  onRetry: () => void
  onSave: (evaluation: EvaluationResult) => void
  onOpenChat: () => void
  onGoHome?: () => void
}

export interface EvaluationResult {
  score: number
  label: string
  breathStability: number
  toneBrightness: number
  comment: string
}

/* ---------- Grade palette: A / S / SS / SSS ---------- */
const GRADE_CONFIG: Record<
  string,
  {
    from: string
    to: string
    glow: string
    subtitle: string
    cheer: string
  }
> = {
  SSS: {
    from: "#C04000",
    to: "#E87430",
    glow: "rgba(192,64,0,0.32)",
    subtitle: "超凡表现",
    cheer: "惊艳全场！您就是天生的歌唱家！",
  },
  SS: {
    from: "#D06800",
    to: "#F09838",
    glow: "rgba(208,104,0,0.24)",
    subtitle: "卓越演唱",
    cheer: "太棒了，您的声音充满故事感！",
  },
  S: {
    from: "#DA8A18",
    to: "#F0B850",
    glow: "rgba(218,138,24,0.20)",
    subtitle: "精彩绝伦",
    cheer: "非常出色，继续保持这份热情！",
  },
  A: {
    from: "#D8A030",
    to: "#F0CC60",
    glow: "rgba(216,160,48,0.16)",
    subtitle: "出色发挥",
    cheer: "表现得真好，越唱越有味道！",
  },
}

// Score floor = 80, guaranteeing every user at least S
function generateEvaluation(duration: number): EvaluationResult {
  const rawBase = Math.min(68 + Math.floor(duration / 3), 98)
  const raw = Math.min(rawBase + Math.floor(Math.random() * 8), 99)
  const score = Math.max(raw, 80)
  const breathStability = Math.min(60 + Math.floor(Math.random() * 35), 95)
  const toneBrightness = Math.min(60 + Math.floor(Math.random() * 35), 95)
  const label = score >= 93 ? "SSS" : score >= 87 ? "SS" : score >= 80 ? "S" : "A"

  const comments = [
    "您的声音很有厚度，听起来精气神十足！",
    "气息运用得很稳健，高音部分表现出色！",
    "音色饱满明亮，情感表达很到位！",
    "嗓音状态非常好，节奏感掌握得很棒！",
    "声音柔和圆润，细节处理很有韵味！",
  ]

  return {
    score,
    label,
    breathStability,
    toneBrightness,
    comment: comments[Math.floor(Math.random() * comments.length)],
  }
}

/* ---------- Semi-ring progress (used for breath / diction cards) ---------- */
function SemiRingProgress({
  value,
  label,
  levelText,
  color = "var(--primary)",
  size = 120,
}: {
  value: number
  label: string
  levelText: string
  color?: string
  size?: number
}) {
  const [animated, setAnimated] = useState(0)
  const r = (size - 14) / 2
  const circumference = Math.PI * r // half circle

  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimated(value))
    return () => cancelAnimationFrame(raf)
  }, [value])

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size / 2 + 14} viewBox={`0 0 ${size} ${size / 2 + 14}`}>
        {/* Track */}
        <path
          d={`M 7 ${size / 2 + 7} A ${r} ${r} 0 0 1 ${size - 7} ${size / 2 + 7}`}
          fill="none"
          stroke="var(--secondary)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Value */}
        <path
          d={`M 7 ${size / 2 + 7} A ${r} ${r} 0 0 1 ${size - 7} ${size / 2 + 7}`}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - animated / 100)}
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
        {/* Center text */}
        <text
          x={size / 2}
          y={size / 2 - 2}
          textAnchor="middle"
          className="text-2xl font-black"
          fill="var(--foreground)"
        >
          {Math.round(animated)}%
        </text>
      </svg>
      <span className="text-base font-bold text-foreground">{label}</span>
      <span
        className="rounded-lg px-3 py-0.5 text-sm font-bold"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`, color }}
      >
        {levelText}
      </span>
    </div>
  )
}

/* ---------- Timbre radar data ---------- */
const timbreData = [
  { trait: "磁性", value: 80 },
  { trait: "浑厚", value: 90 },
  { trait: "温暖", value: 75 },
  { trait: "甜美", value: 30 },
]

const timbreTags = [
  { name: "磁性", pct: 80, bg: "#F78000" },
  { name: "浑厚", pct: 90, bg: "#D96B00" },
  { name: "温暖", pct: 75, bg: "#E8A040" },
  { name: "甜美", pct: 30, bg: "#C4A882" },
]



export function ResultScreen({
  duration,
  active,
  onRetry,
  onSave,
  onOpenChat,
  onGoHome,
}: ResultScreenProps) {
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
  const [animatedScore, setAnimatedScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Generate evaluation when screen becomes active
  useEffect(() => {
    if (!active) {
      setShowResult(false)
      setAnimatedScore(0)
      return
    }
    const result = generateEvaluation(duration)
    setEvaluation(result)
    const timer = setTimeout(() => setShowResult(true), 200)
    return () => clearTimeout(timer)
  }, [active, duration])

  // Animate score counting up
  useEffect(() => {
    if (!evaluation || !showResult) return
    const target = evaluation.score
    let current = 0
    const increment = Math.ceil(target / 40)
    const interval = setInterval(() => {
      current = Math.min(current + increment, target)
      setAnimatedScore(current)
      if (current >= target) clearInterval(interval)
    }, 35)
    return () => clearInterval(interval)
  }, [evaluation, showResult])

  // Scroll to top when activated
  useEffect(() => {
    if (active && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0 })
    }
  }, [active])

  const handleSave = useCallback(() => {
    if (evaluation) onSave(evaluation)
  }, [evaluation, onSave])

  const handleShare = useCallback(() => {
    if (evaluation) onSave(evaluation)
  }, [evaluation, onSave])

  const scoreLabel = evaluation?.label ?? "S"
  const grade = GRADE_CONFIG[scoreLabel] ?? GRADE_CONFIG.S

  return (
    <div
      ref={scrollRef}
      className={`flex min-h-dvh flex-col overflow-y-auto bg-background pb-32 transition-opacity duration-500 ${showResult ? "opacity-100" : "opacity-0"}`}
    >
      {!showResult || !evaluation ? null : (
        <>
          {/* ==================== PART 1: Emotion & Core Conclusion ==================== */}

          {/* ---- Score Hero: typography-driven, no rings ---- */}
          <div
            className="relative flex flex-col items-center px-6 pt-12 pb-5"
            style={{
              background: `radial-gradient(ellipse 70% 50% at 50% 18%, ${grade.glow} 0%, transparent 100%)`,
            }}
          >
            {/* Large gradient grade letter */}
            <div className="relative">
              {/* Glow behind text */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${grade.glow} 0%, transparent 65%)`,
                  filter: "blur(20px)",
                }}
              />
              <span
                className="relative block font-black leading-none"
                style={{
                  fontSize: scoreLabel.length >= 3 ? 72 : scoreLabel.length === 2 ? 84 : 96,
                  letterSpacing: scoreLabel.length >= 2 ? "0.06em" : "0.02em",
                  background: `linear-gradient(160deg, ${grade.from}, ${grade.to})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: `drop-shadow(0 4px 16px ${grade.glow})`,
                }}
              >
                {scoreLabel}
              </span>
            </div>

            {/* Subtitle pill */}
            <span
              className="mt-3 rounded-full px-5 py-1 text-sm font-bold tracking-widest"
              style={{
                backgroundColor: `color-mix(in srgb, ${grade.from} 10%, transparent)`,
                color: grade.from,
              }}
            >
              {grade.subtitle}
            </span>

            {/* Thin decorative divider */}
            <div
              className="mt-5 mb-4 h-px w-16 rounded-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${grade.from}40, transparent)`,
              }}
            />

            {/* Numeric score */}
            <div className="flex items-baseline gap-1">
              <span className="text-7xl font-black leading-none text-foreground">{animatedScore}</span>
              <span className="text-xl font-bold text-muted-foreground">{"分"}</span>
            </div>

            {/* Cheer */}
            <p className="mt-3 max-w-[260px] text-center text-base leading-relaxed text-muted-foreground text-balance">
              {grade.cheer}
            </p>
          </div>

          {/* AI Teacher Bubble Card */}
          <div className="mx-5 mt-6 rounded-3xl bg-card p-5 shadow-sm">
            {/* Teacher avatar row */}
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                <span className="text-sm font-black text-primary-foreground">{"AI"}</span>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{"AI声乐导师"}</p>
                <p className="text-sm text-muted-foreground">{"综合点评"}</p>
              </div>
            </div>
            {/* Bubble */}
            <div className="rounded-2xl rounded-tl-md bg-accent px-5 py-4">
              <p className="text-lg leading-relaxed text-accent-foreground">
                {"我非常喜欢您刚才的演唱！您的中低音区有一种岁月沉淀的浑厚感，听起来非常温暖。不过我注意到，在长音收尾的时候，气息稍微有一点点不够用，就像风筝线稍微松了一下。下次我们在长音前，试试把肚子再稍微撑住一点点，效果一定会更惊艳！"}
              </p>
            </div>
          </div>

          {/* Chat Entry Button — subtle warm border + icon accent */}
          <div className="mx-5 mt-4">
            <button
              onClick={onOpenChat}
              className="group relative flex w-full items-center gap-3.5 overflow-hidden rounded-2xl px-5 py-4 transition-all active:scale-[0.98]"
              style={{
                backgroundColor: "#FEF5EB",
                border: "1.5px solid color-mix(in srgb, var(--primary) 18%, transparent)",
              }}
            >
              {/* Icon circle */}
              <span
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                style={{
                  background: "linear-gradient(135deg, var(--primary), #E8A040)",
                  boxShadow: "0 2px 8px rgba(247,128,0,0.18)",
                }}
              >
                <MessageCircle className="h-5 w-5 text-primary-foreground" />
              </span>
              {/* Text */}
              <span className="text-lg font-bold text-foreground">
                {"对点评有疑问？"}
                <span className="text-primary">{"和AI老师聊聊"}</span>
              </span>
              {/* Arrow */}
              <svg
                className="ml-auto h-5 w-5 flex-shrink-0 text-primary/50 transition-transform group-active:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* ==================== PART 2: Professional Vocal Health Cards ==================== */}

          <div className="mx-5 mt-8 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-black text-foreground">{"声乐体检报告"}</h2>
            </div>
            <p className="mt-1 text-base text-muted-foreground">{"多维度AI分析，了解您的声音特质"}</p>
          </div>

          {/* Card 1: Breath & Health */}
          <div className="mx-5 mb-4 rounded-3xl bg-card p-6 shadow-sm">
            <h3 className="mb-1 text-xl font-bold text-foreground">{"气息与发声健康"}</h3>
            <p className="mb-5 text-sm text-muted-foreground">{"Breath & Health"}</p>

            <div className="flex items-center justify-around">
              <SemiRingProgress
                value={85}
                label={"气息支撑度"}
                levelText={"优秀"}
                color="var(--primary)"
              />
              <SemiRingProgress
                value={78}
                label={"声带放松度"}
                levelText={"良好"}
                color="#E8A040"
              />
            </div>

            <div className="mt-5 rounded-2xl bg-accent/60 px-4 py-3">
              <p className="text-base leading-relaxed text-accent-foreground">
                {"发声习惯很健康，没有明显漏气现象。"}
              </p>
            </div>
          </div>

          {/* Card 2: Timbre Analysis */}
          <div className="mx-5 mb-4 rounded-3xl bg-card p-6 shadow-sm">
            <h3 className="mb-1 text-xl font-bold text-foreground">{"音色特质鉴定"}</h3>
            <p className="mb-4 text-sm text-muted-foreground">{"Timbre Analysis"}</p>

            {/* Radar chart */}
            <div className="mx-auto mb-4" style={{ height: 200, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={timbreData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis
                    dataKey="trait"
                    tick={{ fill: "var(--foreground)", fontSize: 14, fontWeight: 700 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />
                  <Radar
                    name="音色"
                    dataKey="value"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Tag Cloud */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {timbreTags.map((tag) => (
                <span
                  key={tag.name}
                  className="rounded-xl px-4 py-1.5 text-base font-bold text-primary-foreground"
                  style={{
                    backgroundColor: tag.bg,
                    opacity: 0.4 + (tag.pct / 100) * 0.6,
                  }}
                >
                  {tag.name} {tag.pct}%
                </span>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-accent/60 px-4 py-3">
              <p className="text-base leading-relaxed text-accent-foreground">
                {"您的专属音色偏向"}
                <span className="font-bold text-primary">{"【温暖浑厚】"}</span>
                {"，非常适合演唱抒情经典老歌。"}
              </p>
            </div>
          </div>

          {/* Card 3: Diction Clarity */}
          <div className="mx-5 mb-8 rounded-3xl bg-card p-6 shadow-sm">
            <h3 className="mb-1 text-xl font-bold text-foreground">{"咬字与吐音"}</h3>
            <p className="mb-5 text-sm text-muted-foreground">{"Diction Clarity"}</p>

            <div className="flex justify-center">
              <SemiRingProgress
                value={95}
                label={"吐字清晰度"}
                levelText={"卓越"}
                color="#D96B00"
                size={140}
              />
            </div>

            <div className="mt-5 rounded-2xl bg-accent/60 px-4 py-3">
              <p className="text-base leading-relaxed text-accent-foreground">
                {"字正腔圆，咬字归韵非常到位，这在朗诵和民歌中是非常棒的优势！"}
              </p>
            </div>
          </div>
        </>
      )}

      {/* ==================== STICKY BOTTOM BAR ==================== */}
      {showResult && evaluation && active && (
        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t border-border bg-card/95 px-5 pb-8 pt-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={onRetry}
              className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl bg-secondary py-3.5 transition-all active:scale-[0.98]"
            >
              <RotateCcw className="h-5 w-5 text-foreground" />
              <span className="text-sm font-bold text-foreground">{"再唱一次"}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl bg-secondary py-3.5 transition-all active:scale-[0.98]"
            >
              <Share2 className="h-5 w-5 text-foreground" />
              <span className="text-sm font-bold text-foreground">{"分享报告"}</span>
            </button>
            <button
              onClick={onGoHome ?? onRetry}
              className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl bg-secondary py-3.5 transition-all active:scale-[0.98]"
            >
              <Home className="h-5 w-5 text-foreground" />
              <span className="text-sm font-bold text-foreground">{"返回主页"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* Loading overlay component - used by parent, supports 2-stage loading */
export function LoadingOverlay({ visible, stage = "uploading" }: { visible: boolean; stage?: "uploading" | "analyzing" }) {
  const isUploading = stage === "uploading"

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-500 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="flex flex-col items-center gap-6 rounded-3xl bg-card p-10 shadow-lg">
        <div className="relative">
          <div className="h-20 w-20 animate-spin rounded-full border-4 border-secondary border-t-primary" style={{ animationDuration: isUploading ? "1.6s" : "1.2s" }} />
          {isUploading ? (
            <Upload className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-primary" />
          ) : (
            <Sparkles className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-primary" />
          )}
        </div>
        <div className="text-center transition-opacity duration-300">
          <p className="text-2xl font-bold text-foreground">
            {isUploading ? "作品上传中..." : "老师正在点评..."}
          </p>
          <p className="mt-2 text-lg text-muted-foreground">
            {isUploading ? "正在上传您的演唱" : "请稍候片刻"}
          </p>
        </div>
      </div>
    </div>
  )
}
