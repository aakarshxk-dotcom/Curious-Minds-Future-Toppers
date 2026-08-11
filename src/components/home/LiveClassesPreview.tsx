"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, CalendarClock, Radio, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface LiveSession {
  id: string
  title: string
  batchName: string | null
  subject: string | null
  status: string
  startTime: string | null
  viewerCount?: number
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

export function LiveClassesPreview() {
  const [sessions, setSessions] = React.useState<LiveSession[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch("/api/live")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data
        setSessions(Array.isArray(list) ? list.slice(0, 3) : [])
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="bg-muted/30 py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Live Now &amp; Upcoming
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Live Classes
            </h2>
          </div>
          <Link
            href="/live"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            See full schedule <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-3">
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
        ) : sessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card p-12 text-center">
            <Radio className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-muted-foreground">
              Live schedule is being finalised.{" "}
              <Link href="/contact" className="font-semibold text-emerald-600 hover:underline">
                Contact us
              </Link>{" "}
              for the next batch.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {sessions.map((session) => (
              <Link key={session.id} href={`/live/${session.id}`}>
                <Card className="premium-feature-card h-full">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <Badge
                        className={`border ${statusStyles[session.status] ?? statusStyles.scheduled}`}
                      >
                        {session.status === "live" && (
                          <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-rose-600" />
                        )}
                        {session.status.toUpperCase()}
                      </Badge>
                      {session.status === "live" && (
                        <span className="flex items-center gap-1 text-xs text-rose-600">
                          <Users className="h-3.5 w-3.5" />
                          {session.viewerCount ?? 0}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-4 line-clamp-2 text-lg font-bold">{session.title}</h3>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {formatStart(session.startTime)}
                    </p>
                    {(session.batchName || session.subject) && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {session.batchName}
                        {session.batchName && session.subject ? " • " : ""}
                        {session.subject}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
