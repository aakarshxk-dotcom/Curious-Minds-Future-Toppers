"use client"

import * as React from "react"
import { notFound, useParams } from "next/navigation"
import { CalendarClock, MonitorPlay, Radio, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface Session {
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
  enableChat?: boolean
  enableDoubts?: boolean
  course?: { id: string; title: string } | null
  recordings?: { id: string; title: string; videoUrl: string | null }[]
}

function formatStart(value: string | null) {
  if (!value) return "Schedule announced soon"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Schedule announced soon"
  return date.toLocaleString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export default function LiveSessionPage() {
  const params = useParams<{ id: string }>()
  const [session, setSession] = React.useState<Session | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [notFoundState, setNotFoundState] = React.useState(false)

  React.useEffect(() => {
    fetch(`/api/live/${params.id}`)
      .then(async (res) => {
        if (res.status === 404) {
          setNotFoundState(true)
          return null
        }
        if (!res.ok) return null
        const data = await res.json()
        return data.data ?? null
      })
      .then(setSession)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [params.id])

  const handleJoin = () => {
    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("Please login to join the class")
      return
    }
    toast.info("Live streaming is being set up — recording will be available soon.")
  }

  if (notFoundState) notFound()

  if (loading || !session) {
    return (
      <div className="container mx-auto px-4 py-12 lg:px-8">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-4 h-64 w-full" />
      </div>
    )
  }

  const isLive = session.status === "live"

  return (
    <div className="container mx-auto px-4 py-12 lg:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <Badge className={`border ${isLive ? "border-rose-600/25 bg-rose-600/10 text-rose-600" : "border-emerald-600/25 bg-emerald-600/10 text-emerald-600"}`}>
          {isLive && <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-rose-600" />}
          {session.status.toUpperCase()}
        </Badge>
        {session.batchName && <Badge variant="outline">{session.batchName}</Badge>}
        {session.subject && <Badge variant="outline">{session.subject}</Badge>}
      </div>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{session.title}</h1>
      {session.description && (
        <p className="mt-3 max-w-2xl text-muted-foreground">{session.description}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarClock className="h-4 w-4" /> {formatStart(session.startTime)}
        </span>
        {isLive && (
          <span className="flex items-center gap-1.5 text-rose-600">
            <Users className="h-4 w-4" />
            {session.viewerCount ?? 0} watching
          </span>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardContent className="flex aspect-video items-center justify-center bg-muted/40 p-10">
            {isLive ? (
              <div className="text-center">
                <Radio className="mx-auto h-14 w-14 animate-pulse text-rose-600" />
                <p className="mt-4 font-semibold">Class is LIVE</p>
                <Button onClick={handleJoin} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                  Join Live Class
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <MonitorPlay className="mx-auto h-14 w-14 text-muted-foreground/40" />
                <p className="mt-4 font-semibold text-muted-foreground">
                  {session.status === "ended" ? "Session ended" : "Class not started yet"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {session.course && (
            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Course
                </p>
                <p className="mt-2 font-semibold">{session.course.title}</p>
              </CardContent>
            </Card>
          )}

          {session.recordings && session.recordings.length > 0 && (
            <Card>
              <CardContent className="space-y-2 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recordings
                </p>
                {session.recordings.map((rec) => (
                  <p key={rec.id} className="text-sm font-medium">
                    {rec.title}
                  </p>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Features
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• {session.enableChat !== false ? "Live chat" : "Chat disabled"}</li>
                <li>• {session.enableDoubts !== false ? "Doubt solving in class" : "Doubts disabled"}</li>
                <li>• {session.maxViewers ? `Max ${session.maxViewers} viewers` : "Unlimited viewers"}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
