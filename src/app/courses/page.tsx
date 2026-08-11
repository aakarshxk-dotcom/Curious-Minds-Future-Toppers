"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { BookOpen, Clock, Search, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

interface Course {
  id: string
  title: string
  description: string | null
  thumbnail: string | null
  price: number
  discountPrice: number | null
  category: string | null
  level: string | null
  duration: string | null
  instructorName: string | null
  _count?: { enrollments?: number; chapters?: number; reviews?: number }
}

const levelColors: Record<string, string> = {
  beginner: "bg-emerald-600/10 text-emerald-600 border-emerald-600/20",
  intermediate: "bg-amber-600/10 text-amber-600 border-amber-600/20",
  advanced: "bg-rose-600/10 text-rose-600 border-rose-600/20",
}

const categories = ["All", "CBSE", "ICSE", "Bihar Board", "JEE", "NEET", "Coding"]

export default function CoursesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [courses, setCourses] = React.useState<Course[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState(searchParams.get("search") || "")
  const [category, setCategory] = React.useState(
    (searchParams.get("board") || searchParams.get("category") || "All") as string
  )

  const loadCourses = React.useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (category !== "All") params.set("category", category)
    try {
      const res = await fetch(`/api/courses?${params.toString()}`)
      const data = await res.json()
      setCourses(Array.isArray(data.data) ? data.data : [])
    } catch {
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [search, category])

  React.useEffect(() => {
    loadCourses()
  }, [loadCourses])

  React.useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (category !== "All") params.set("category", category)
    router.replace(`/courses${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false })
  }, [search, category, router])

  return (
    <div className="container mx-auto px-4 py-12 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Courses</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Find Your Perfect Course
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Live classes, recorded lectures and PDF notes — pick a batch and start learning today.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Button
              key={c}
              variant={category === c ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(c)}
              className={category === c ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 rounded-none" />
              <CardContent className="space-y-3 p-5">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-9 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/30 p-14 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">
            No courses found. Try a different search or{" "}
            <Link href="/contact" className="font-semibold text-emerald-600 hover:underline">
              contact us
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <Card className="premium-feature-card h-full overflow-hidden">
                <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-emerald-600/15 via-teal-600/10 to-slate-100">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                  ) : (
                    <BookOpen className="h-12 w-12 text-emerald-600/50" />
                  )}
                  {course.level && (
                    <Badge className={`absolute left-3 top-3 border ${levelColors[course.level] ?? levelColors.beginner}`}>
                      {course.level}
                    </Badge>
                  )}
                  {course.category && (
                    <Badge className="absolute right-3 top-3 border bg-background/80 text-foreground">
                      {course.category}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-5">
                  <h2 className="line-clamp-1 text-lg font-bold">{course.title}</h2>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    {course.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {course.duration}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {course._count?.enrollments ?? 0} enrolled
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-extrabold">₹{course.discountPrice ?? course.price}</span>
                      {course.discountPrice != null && course.discountPrice < course.price && (
                        <span className="text-sm text-muted-foreground line-through">₹{course.price}</span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">View Details →</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
