import Link from "next/link"
import { notFound } from "next/navigation"
import { BookOpen, Clock, GraduationCap, PlayCircle, Star, Users } from "@/components/ui/lucide-icons"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { EnrollButton } from "./EnrollButton"
import { db } from "@/lib/db"

async function getCourse(id: string) {
  try {
    const course = await db.course.findUnique({
      where: { id },
      include: {
        chapters: {
          orderBy: { order: 'asc' },
          include: {
            videos: {
              orderBy: { order: 'asc' },
            },
          },
        },
        _count: { select: { enrollments: true, reviews: true, quizzes: true } },
        quizzes: {
          where: { status: 'published' },
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { questions: true, attempts: true } },
          },
        },
        announcements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        resources: {
          where: { type: 'PDF' },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })
    return course ?? null
  } catch {
    return null
  }
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const course = await getCourse(id)
  if (!course) notFound()

  const totalVideos = course.chapters?.reduce(
    (sum: number, ch: { videos?: unknown[] }) => sum + (ch.videos?.length ?? 0),
    0
  ) ?? 0

  const whatYouLearn = course.whatYouLearn ? JSON.parse(course.whatYouLearn) : []
  const requirements = course.requirements ? JSON.parse(course.requirements) : []

  return (
    <div>
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 py-12 text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {course.category && <Badge className="border-white/30 bg-white/10 text-white">{course.category}</Badge>}
            {course.level && <Badge className="border-white/30 bg-white/10 text-white">{course.level}</Badge>}
          </div>
          <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl">{course.title}</h1>
          <p className="mt-3 max-w-2xl text-emerald-50/90">{course.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-emerald-50">
            <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {course.chapters?.length ?? 0} chapters</span>
            <span className="flex items-center gap-1.5"><PlayCircle className="h-4 w-4" /> {totalVideos} lessons</span>
            {course.duration && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {course.duration}</span>}
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {course._count?.enrollments ?? 0} enrolled</span>
            {course._count?.reviews ? (
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {course._count.reviews} reviews</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="container mx-auto grid gap-8 px-4 py-12 lg:grid-cols-[1fr_340px] lg:px-8">
        <div className="space-y-8">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {Array.isArray(whatYouLearn) && whatYouLearn.length > 0 && (
                <div className="rounded-2xl border bg-card p-6">
                  <h3 className="text-lg font-bold">What you&apos;ll learn</h3>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {whatYouLearn.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(requirements) && requirements.length > 0 && (
                <div className="rounded-2xl border bg-card p-6">
                  <h3 className="text-lg font-bold">Requirements</h3>
                  <ul className="mt-4 space-y-2">
                    {requirements.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {course.instructorName && (
                <div className="flex items-center gap-4 rounded-2xl border bg-card p-6">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xl font-bold text-white">
                    {course.instructorName.charAt(0)}
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">Course Instructor</p>
                    <p className="font-bold">{course.instructorName}</p>
                    {course.instructorTitle && (
                      <p className="text-sm text-muted-foreground">{course.instructorTitle}</p>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="curriculum">
              <Card>
                <CardContent className="p-6">
                  {course.chapters?.length ? (
                    <Accordion type="multiple" className="w-full">
                      {course.chapters.map((chapter: any, i: number) => (
                        <AccordionItem key={chapter.id} value={chapter.id}>
                          <AccordionTrigger>
                            <span className="flex items-center gap-3 text-left">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600/10 text-xs font-bold text-emerald-600">
                                {i + 1}
                              </span>
                              {chapter.title}
                              <span className="text-xs text-muted-foreground">
                                {chapter.videos?.length ?? 0} lessons
                              </span>
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2 pt-2">
                              {chapter.videos?.map((video: any) => (
                                <li key={video.id} className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                                  <PlayCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                                  <span className="flex-1">{video.title}</span>
                                  {video.freePreview && (
                                    <Badge className="border-emerald-600/25 bg-emerald-600/10 text-emerald-600">Free</Badge>
                                  )}
                                  {video.duration ? (
                                    <span className="text-xs text-muted-foreground">
                                      {Math.floor(video.duration / 60)} min
                                    </span>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Curriculum is being prepared.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources">
              <Card>
                <CardContent className="p-6">
                  {course.resources?.length ? (
                    <ul className="space-y-2">
                      {course.resources.map((r: any) => (
                        <li key={r.id} className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm">
                          <span className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-emerald-600" />
                            {r.title}
                          </span>
                          {r.fileName && <span className="text-xs text-muted-foreground">{r.fileName}</span>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No PDF resources yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="announcements">
              <Card>
                <CardContent className="p-6">
                  {course.announcements?.length ? (
                    <ul className="space-y-3">
                      {course.announcements.map((a: any) => (
                        <li key={a.id} className="rounded-lg border p-4">
                          <p className="text-sm font-semibold">{a.title}</p>
                          {a.message && <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>}
                          <p className="mt-2 text-xs text-muted-foreground">
                            {new Date(a.createdAt).toLocaleDateString("en-IN")}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="py-8 text-center text-sm text-muted-foreground">No announcements yet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold">
                  {course.discountPrice != null && course.discountPrice < course.price
                    ? `₹${course.discountPrice}`
                    : `₹${course.price}`}
                </span>
                {course.discountPrice != null && course.discountPrice < course.price && (
                  <>
                    <span className="text-muted-foreground line-through">₹{course.price}</span>
                    <Badge className="border-emerald-600/25 bg-emerald-600/10 text-emerald-600">
                      {Math.round((1 - course.discountPrice / course.price) * 100)}% off
                    </Badge>
                  </>
                )}
              </div>
              <EnrollButton course={course} />
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>• Lifetime access to recorded lectures</li>
                <li>• PDF notes & practice material</li>
                <li>• Certificate on completion</li>
                <li>• Doubt support included</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
