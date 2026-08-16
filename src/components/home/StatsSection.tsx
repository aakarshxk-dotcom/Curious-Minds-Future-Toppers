"use client"

import * as React from "react"
import { GraduationCap, Trophy, Users, Video } from "lucide-react"

const stats = [
  { icon: Users, label: "Active Students", value: 5000, suffix: "+" },
  { icon: Video, label: "Live Classes Conducted", value: 1200, suffix: "+" },
  { icon: GraduationCap, label: "Courses & Batches", value: 40, suffix: "+" },
  { icon: Trophy, label: "Top Ranks Achieved", value: 250, suffix: "+" },
]

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = React.useState(0)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1)
          setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.4 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return { ref, value }
}

function StatItem({
  icon: Icon,
  label,
  value,
  suffix,
}: (typeof stats)[number]) {
  const { ref, value: count } = useCountUp(value)
  return (
    <div
      ref={ref}
      className="stat-glow-green flex flex-col items-center gap-2 rounded-2xl border bg-card p-6 text-center"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-3xl font-extrabold tabular-nums">
        {count.toLocaleString()}
        {suffix}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}

export function StatsSection() {
  return (
    <section className="border-y bg-muted/30">
      <div className="container mx-auto grid grid-cols-2 gap-6 px-4 py-12 lg:grid-cols-4 lg:px-8">
        {stats.map((stat) => (
          <StatItem key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  )
}
