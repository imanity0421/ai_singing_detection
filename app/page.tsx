"use client"

import { useState, useEffect } from "react"
import { VocalCoachApp } from "@/components/vocal-coach/vocal-coach-app"

export default function Page() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <main className="min-h-dvh bg-background" />
    )
  }

  return (
    <main className="min-h-dvh bg-background">
      <VocalCoachApp />
    </main>
  )
}
