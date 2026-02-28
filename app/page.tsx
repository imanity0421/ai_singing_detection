import dynamic from "next/dynamic"

const VocalCoachApp = dynamic(
  () => import("@/components/vocal-coach/vocal-coach-app").then((mod) => mod.VocalCoachApp),
  { ssr: false }
)

export default function Page() {
  return (
    <main className="min-h-dvh bg-background">
      <VocalCoachApp />
    </main>
  )
}
