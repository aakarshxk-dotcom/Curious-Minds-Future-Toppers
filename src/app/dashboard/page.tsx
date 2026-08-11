"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Award, BookOpen, Loader2, PlayCircle, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

interface Enrollment {
  id: string
  status: string
  courseId: string
  course: {
    id: string
    title: string
    thumbnail: string | null
    category: string | null
    level: string | null
    duration: string | null
  }
  progress: {
    totalVideos: number
    completedVideos: number
    percentage: number
  }
  lastAccessedVideo: { id: string; title: string; chapterTitle: string | null } | null
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = React.useState<{ name: string | null; email: string; role: string } | null>(null)
  const [enrollments, setEnrollments] = React.useState<Enrollment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [authError, setAuthError] = React.useState(false)

  React.useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      setAuthError(true)
      setLoading(false)
      return
    }
    Promise.all([
      fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then(async (res) => {
          if (!res.ok) return null
          const data = await res.json()
          return data.user ?? null
        })
        .catch(() => null),
      fetch("/api/enrollments", { headers: { Authorization: `Bearer ${token}` } })
        .then(async (res) => (res.ok ? (await res.json()).data : []))
        .catch(() => []),
    ])
      .then(([userData, enr]) => {
        if (!userData) {
          setAuthError(true)
          return
        }
        setUser(userData)
        setEnrollments(Array.isArray(enr) ? enr : [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-12 lg:px-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 p-5">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="container mx-auto px-4 py-24 text-center lg:px-8">
        <h1 className="text-2xl font-bold">Please login to view your dashboard</h1>
        <Link href="/auth/login">
          <Button className="mt-6 bg-emerald-600 hover:bg-emerald-700">Go to Login</Button>
        </Link>
      </div>
    )
  }

  const avgProgress =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress.percentage, 0) / enrollments.length)
      : 0
  const completed = enrollments.filter((e) => e.progress.percentage === 100).length

  return (
    <div className="container mx-auto px-4 py-12 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Dashboard</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Welcome back, {user?.name || "Student"} 👋
          </h1>
        </div>
        <Link href="/courses">
          <Button className="bg-emerald-600 hover:bg-emerald-700">Browse Courses</Button>
        </Link>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-extrabold">{enrollments.length}</p>
              <p className="text-sm text-muted-foreground">Courses Enrolled</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-600/10 text-amber-600">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-extrabold">{avgProgress}%</p>
              <p className="text-sm text-muted-foreground">Average Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/10 text-violet-600">
              <Award className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-extrabold">{completed}</p>
              <p className="text-sm text-muted-foreground">Courses Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold">My Courses</h2>
        {enrollments.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed bg-muted/30 p-14 text-center">
            <p className="text-muted-foreground">
              You haven&apos;t enrolled in any courses yet.
            </p>
            <Link href="/courses">
              <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700">Explore Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.id} className="premium-feature-card overflow-hidden">
                <div className="flex h-32 items-center justify-center bg-gradient-to-br from-emerald-600/15 via-teal-600/10 to-slate-100">
                  {enrollment.course.thumbnail ? (
                    <img src={enrollment.course.thumbnail} alt={enrollment.course.title} className="h-full w-full object-cover" />
                  ) : (
                    <BookOpen className="h-10 w-10 text-emerald-600/50" />
                  )}
                </div>
                <CardContent className="p-5">
                  <h3 className="line-clamp-1 font-bold">{enrollment.course.title}</h3>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {enrollment.progress.completedVideos}/{enrollment.progress.totalVideos} lessons
                    </span>
                    <span className="font-semibold text-emerald-600">{enrollment.progress.percentage}%</span>
                  </div>
                  <Progress value={enrollment.progress.percentage} className="mt-2" />
                  {enrollment.lastAccessedVideo && enrollment.progress.percentage < 100 ? (
                    <p className="mt-3 line-clamp-1 text-xs text-muted-foreground">
                      Last: {enrollment.lastAccessedVideo.title}
                    </p>
                  ) : null}
                  <Link href={`/courses/${enrollment.courseId}`} className="mt-4 block">
                    <Button variant="outline" className="w-full">
                      <PlayCircle className="mr-2 h-4 w-4" />
                      {enrollment.progress.percentage === 100 ? "Review Course" : "Continue Learning"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
