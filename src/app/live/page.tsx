"use client"

import * as React from "react"
import Link from "next/link"
import { CalendarClock, Radio, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface LiveSession {
  id: string
  title: string
  description: string | null
  status: string
  startTime: string | null
  subject: string | null
  batchName: string | null
  batchType: string | null
  viewerCount?: number
  maxViewers?: number
  course?: { id: string; title: string } | null
}

const statusStyles: Record<string, string> = {
  live: "bg-rose-600/10 text-rose-600 border-rose-600/25",
  scheduled: "bg-emerald-600/10 text-emerald-600 border-emerald-600/25",
  ended: "bg-slate-500/10 text-slate-500 border-slate-500/25",
}

function formatStart(value: string | null) {
  if (!value) return "Schedule announced soon"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Schedule announced soon"
  return date.toLocaleString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export default function LivePage() {
  const [sessions, setSessions] = React.useState<LiveSession[]>([])
  const [loading, setLoading] = React.useState(true)
  const [tab, setTab] = React.useState<"live" | "scheduled" | "ended" | "all">("all")

  React.useEffect(() => {
    fetch("/api/live")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setSessions(Array.isArray(data?.data) ? data.data : [])
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = tab === "all" ? sessions : sessions.filter((s) => s.status === tab)
  const liveCount = sessions.filter((s) => s.status === "live").length
  const upcomingCount = sessions.filter((s) => s.status === "scheduled").length

  const tabs: { key: typeof tab; label: string }[] = [
    { key: "all", label: "All Classes" },
    { key: "live", label: `Live Now (${liveCount})` },
    { key: "scheduled", label: `Upcoming (${upcomingCount})` },
    { key: "ended", label: "Recorded / Ended" },
  ]

  return (
    <div className="container mx-auto px-4 py-12 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Live Learning</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Live Classes</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Join interactive sessions with expert teachers — ask doubts in real time and stay on track.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Button
            key={t.key}
            variant={tab === t.key ? "default" : "outline"}
            size="sm"
            onClick={() => setTab(t.key)}
            className={tab === t.key ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 p-5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/30 p-14 text-center">
          <Radio className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">
            No classes in this category right now. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((session) => (
            <Link key={session.id} href={`/live/${session.id}`}>
              <Card className="premium-feature-card h-full">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <Badge className={`border ${statusStyles[session.status] ?? statusStyles.scheduled}`}>
                      {session.status === "live" && (
                        <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-rose-600" />
                      )}
                      {session.status.toUpperCase()}
                    </Badge>
                    {session.status === "live" && (
                      <span className="flex items-center gap-1 text-xs text-rose-600">
                        <Users className="h-3.5 w-3.5" />
                        {session.viewerCount ?? 0}
                        {session.maxViewers ? ` / ${session.maxViewers}` : ""}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-4 line-clamp-2 text-lg font-bold">{session.title}</h2>
                  {session.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{session.description}</p>
                  )}
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {formatStart(session.startTime)}
                  </p>
                  {(session.batchName || session.subject) && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[session.batchName, session.batchType, session.subject]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
