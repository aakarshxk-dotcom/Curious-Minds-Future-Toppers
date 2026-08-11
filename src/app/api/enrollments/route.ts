import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware'

// GET /api/enrollments — Get user's enrollments with course details & progress
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth instanceof NextResponse) return auth

  const { user } = auth

  try {
    const enrollments = await db.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            category: true,
            level: true,
            duration: true,
            videos: {
              select: { id: true },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    })

    const enriched = await Promise.all(
      enrollments.map(async (enrollment) => {
        const courseId = enrollment.courseId
        const progressRecords = await db.courseProgress.findMany({
          where: { userId: user.id, courseId },
        })

        const totalVideos = enrollment.course.videos.length
        const completedVideos = progressRecords.filter((p) => p.completed).length
        const progressPercent =
          totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0

        const lastAccessedVideo =
          progressRecords.length > 0
            ? progressRecords.sort(
                (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
              )[0]
            : null

        let lastAccessedVideoDetails: {
          id: string
          title: string
          chapterTitle: string | null
        } | null = null

        if (lastAccessedVideo) {
          const video = await db.video.findUnique({
            where: { id: lastAccessedVideo.videoId },
            select: {
              id: true,
              title: true,
              chapter: {
                select: { title: true },
              },
            },
          })
          if (video) {
            lastAccessedVideoDetails = {
              id: video.id,
              title: video.title,
              chapterTitle: video.chapter?.title ?? null,
            }
          }
        }

        return {
          id: enrollment.id,
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt,
          completedAt: enrollment.completedAt,
          courseId: enrollment.courseId,
          course: {
            id: enrollment.course.id,
            title: enrollment.course.title,
            thumbnail: enrollment.course.thumbnail,
            category: enrollment.course.category,
            level: enrollment.course.level,
            duration: enrollment.course.duration,
          },
          progress: {
            totalVideos,
            completedVideos,
            percentage: progressPercent,
          },
          lastAccessedVideo: lastAccessedVideoDetails,
        }
      })
    )

    return NextResponse.json({ success: true, data: enriched })
  } catch (error) {
    console.error('[GET /api/enrollments]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/enrollments — Manual enrollment (admin or free course auto-enroll)
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth instanceof NextResponse) return auth

  const { user } = auth

  try {
    const body = await request.json()
    const { courseId, userId: targetUserId } = body as {
      courseId?: string
      userId?: string
    }

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'courseId is required' },
        { status: 400 }
      )
    }

    const enrollUserId = user.role === 'admin' && targetUserId ? targetUserId : user.id

    const course = await db.course.findUnique({ where: { id: courseId } })
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    const existingEnrollment = await db.enrollment.findFirst({
      where: { userId: enrollUserId, courseId },
    })
    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, error: 'Already enrolled in this course' },
        { status: 409 }
      )
    }

    if (course.price > 0 && user.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'This is a paid course. Please complete payment to enroll.',
        },
        { status: 403 }
      )
    }

    const enrollment = await db.enrollment.create({
      data: {
        userId: enrollUserId,
        courseId,
      },
    })

    const videos = await db.video.findMany({
      where: { courseId },
      select: { id: true },
    })

    if (videos.length > 0) {
      await db.courseProgress.createMany({
        data: videos.map((v) => ({
          userId: enrollUserId,
          courseId,
          videoId: v.id,
          completed: false,
          watchTime: 0,
        })),
      })
    }

    await db.notification.create({
      data: {
        userId: enrollUserId,
        title: 'Enrollment Confirmed',
        message: `You have been successfully enrolled in "${course.title}".`,
        type: 'success',
      },
    })

    return NextResponse.json(
      { success: true, data: enrollment },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/enrollments]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
