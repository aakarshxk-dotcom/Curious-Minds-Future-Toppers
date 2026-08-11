"use client"

import * as React from "react"
import { Crown, Medal, Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Course {
  id: string
  title: string
}

interface Entry {
  userId: string
  userName: string | null
  userAvatar: string | null
  completedLessons: number
  totalLessons: number
  progressPercent: number
  quizScore: number
}

const medals = [<Crown key="c" className="h-5 w-5 text-amber-400" />, <Medal key="m1" className="h-5 w-5 text-slate-400" />, <Medal key="m2" className="h-5 w-5 text-amber-700" />]

export default function LeaderboardPage() {
  const [courses, setCourses] = React.useState<Course[]>([])
  const [courseId, setCourseId] = React.useState<string>("")
  const [entries, setEntries] = React.useState<Entry[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch("/api/courses")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list = Array.isArray(data?.data) ? data.data : []
        setCourses(list)
        if (list.length > 0) setCourseId(list[0].id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => {
    if (!courseId) return
    setLoading(true)
    fetch(`/api/leaderboard?courseId=${courseId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setEntries(Array.isArray(data?.data) ? data.data : []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [courseId])

  return (
    <div className="container mx-auto px-4 py-12 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Competition</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Leaderboard</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          See who&apos;s topping the charts — complete lessons and quizzes to climb the ranks!
        </p>
      </div>

      <div className="mb-8 max-w-sm">
        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Card>
          <CardContent className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="p-14 text-center">
            <Trophy className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">
              No rankings yet — enroll in this course and start learning!
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-2 sm:p-4">
            {entries.map((entry, index) => (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 rounded-xl px-4 py-3 ${
                  index === 0 ? "bg-amber-500/10" : index % 2 === 0 ? "" : "bg-muted/40"
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center">
                  {index < 3 ? medals[index] : <span className="text-sm font-bold text-muted-foreground">{index + 1}</span>}
                </span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">
                  {(entry.userName || "Student").charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{entry.userName || "Student"}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.completedLessons}/{entry.totalLessons} lessons
                  </p>
                </div>
                <div className="hidden w-40 sm:block">
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                      style={{ width: `${entry.progressPercent}%` }}
                    />
                  </div>
                </div>
                <div className="w-24 text-right">
                  <p className="text-sm font-bold text-emerald-600">{entry.progressPercent}%</p>
                  <p className="text-xs text-muted-foreground">Quiz {entry.quizScore}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
