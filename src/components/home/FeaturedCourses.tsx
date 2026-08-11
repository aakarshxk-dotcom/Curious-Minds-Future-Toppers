"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, BookOpen, Clock, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  _count?: { enrollments?: number; videos?: number }
}

const levelColors: Record<string, string> = {
  beginner: "bg-emerald-600/10 text-emerald-600 border-emerald-600/20",
  intermediate: "bg-amber-600/10 text-amber-600 border-amber-600/20",
  advanced: "bg-rose-600/10 text-rose-600 border-rose-600/20",
}

export function FeaturedCourses() {
  const [courses, setCourses] = React.useState<Course[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch("/api/courses?status=published&featured=true")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data
        setCourses(Array.isArray(list) ? list.slice(0, 6) : [])
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="container mx-auto px-4 py-16 lg:px-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
            Featured Courses
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Popular Courses &amp; Batches
          </h2>
        </div>
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          View all courses <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
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
        <div className="rounded-2xl border border-dashed bg-muted/30 p-12 text-center">
          <p className="text-muted-foreground">
            Courses are being added. Check back soon or{" "}
            <Link href="/contact" className="font-semibold text-emerald-600 hover:underline">
              contact us
            </Link>{" "}
            to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <Card className="premium-feature-card h-full overflow-hidden">
                <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-emerald-600/15 via-teal-600/10 to-slate-100">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <BookOpen className="h-12 w-12 text-emerald-600/50" />
                  )}
                  {course.level && (
                    <Badge
                      className={`absolute left-3 top-3 border ${levelColors[course.level] ?? levelColors.beginner}`}
                    >
                      {course.level}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-5">
                  <h3 className="line-clamp-1 text-lg font-bold">{course.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                    {course.description}
                  </p>
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
                      <span className="text-lg font-extrabold">
                        ₹{course.discountPrice ?? course.price}
                      </span>
                      {course.discountPrice != null && course.discountPrice < course.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{course.price}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">
                      Enroll Now →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
