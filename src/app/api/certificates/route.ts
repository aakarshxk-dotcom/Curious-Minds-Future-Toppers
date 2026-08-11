import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/certificates - List all certificates for the user, or check a single one with ?courseId=
export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request)
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (courseId) {
      const certificate = await db.certificate.findUnique({
        where: {
          userId_courseId: { userId: payload.userId, courseId },
        },
      })

      const headers = new Headers()
      headers.set('X-Content-Type-Options', 'nosniff')

      return NextResponse.json({ success: true, data: certificate }, { headers })
    }

    const certificates = await db.certificate.findMany({
      where: { userId: payload.userId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { issuedAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: certificates })
  } catch (error) {
    console.error('GET /api/certificates error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/certificates - Generate certificate for user
export async function POST(request: NextRequest) {
  const payload = getUserFromRequest(request)
  if (!payload) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { courseId } = body

  if (!courseId) {
    return NextResponse.json({ success: false, error: 'courseId is required' }, { status: 400 })
  }

  // Check if already exists
  const existing = await db.certificate.findUnique({
    where: {
      userId_courseId: { userId: payload.userId, courseId },
    },
  })

  if (existing) {
    return NextResponse.json({ success: true, data: existing })
  }

  // Check enrollment exists
  const enrollment = await db.enrollment.findFirst({
    where: { userId: payload.userId, courseId, status: { in: ['active', 'completed'] } },
  })

  if (!enrollment) {
    return NextResponse.json({ success: false, error: 'Not enrolled in this course' }, { status: 400 })
  }

  // Check if all videos completed
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
  const completedProgress = await db.courseProgress.count({
    where: {
      userId: payload.userId,
      courseId,
      videoId: { in: allVideoIds },
      completed: true,
    },
  })

  if (allVideoIds.length > 0 && completedProgress < allVideoIds.length) {
    return NextResponse.json({
      success: false,
      error: `Complete all lessons to earn certificate (${completedProgress}/${allVideoIds.length} completed)`,
    }, { status: 400 })
  }

  // Generate certificate number
  const certNo = `FT-${courseId.slice(0, 6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`

  const certificate = await db.certificate.create({
    data: {
      userId: payload.userId,
      courseId,
      certificateNo: certNo,
    },
  })

  // Mark enrollment as completed
  await db.enrollment.updateMany({
    where: { userId: payload.userId, courseId },
    data: { status: 'completed', completedAt: new Date() },
  })

  return NextResponse.json({ success: true, data: certificate }, { status: 201 })
}
