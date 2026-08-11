import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/leaderboard?courseId=xxx - Get leaderboard for a course
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json({ success: false, error: 'courseId is required' }, { status: 400 })
    }

    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          include: { videos: true },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
    }

    const allVideoIds = course.chapters.flatMap((ch) => ch.videos.map((v) => v.id))

    const enrollments = await db.enrollment.findMany({
      where: { courseId, status: { in: ['active', 'completed'] } },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })

    const leaderboard: {
      userId: string
      userName: string | null
      userAvatar: string | null
      completedLessons: number
      totalLessons: number
      progressPercent: number
      quizScore: number
    }[] = []

    for (const enrollment of enrollments) {
      const completedCount = allVideoIds.length > 0
        ? await db.courseProgress.count({
            where: {
              userId: enrollment.user.id,
              courseId,
              videoId: { in: allVideoIds },
              completed: true,
            },
          })
        : 0

      const bestAttempt = await db.quizAttempt.findFirst({
        where: {
          userId: enrollment.user.id,
          quiz: { courseId },
        },
        orderBy: { score: 'desc' },
      })

      const progressPercent = allVideoIds.length > 0
        ? Math.round((completedCount / allVideoIds.length) * 100)
        : 0

      leaderboard.push({
        userId: enrollment.user.id,
        userName: enrollment.user.name,
        userAvatar: enrollment.user.avatar,
        completedLessons: completedCount,
        totalLessons: allVideoIds.length,
        progressPercent,
        quizScore: bestAttempt ? (bestAttempt.totalPoints > 0 ? Math.round((bestAttempt.score / bestAttempt.totalPoints) * 100) : 0) : 0,
      })
    }

    leaderboard.sort((a, b) => {
      if (b.progressPercent !== a.progressPercent) return b.progressPercent - a.progressPercent
      return b.quizScore - a.quizScore
    })

    const headers = new Headers()
    headers.set('X-Content-Type-Options', 'nosniff')

    return NextResponse.json({ success: true, data: leaderboard }, { headers })
  } catch (error) {
    console.error('GET /api/leaderboard error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
