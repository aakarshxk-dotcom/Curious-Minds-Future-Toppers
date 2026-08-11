import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// POST /api/admin/enrollments — Admin manually enrolls a student in a course
export async function POST(request: NextRequest) {
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { userId, courseId } = body

  if (!userId || !courseId) {
    return NextResponse.json(
      { success: false, error: 'userId and courseId are required' },
      { status: 400 }
    )
  }

  const course = await db.course.findUnique({ where: { id: courseId } })
  if (!course) {
    return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
  }

  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
  }

  const existing = await db.enrollment.findFirst({
    where: { userId, courseId },
  })
  if (existing) {
    return NextResponse.json(
      { success: false, error: 'Already enrolled in this course' },
      { status: 409 }
    )
  }

  const enrollment = await db.enrollment.create({
    data: { userId, courseId },
  })

  // Create progress records
  const videos = await db.video.findMany({ where: { courseId }, select: { id: true } })
  if (videos.length > 0) {
    await db.courseProgress.createMany({
      data: videos.map((v) => ({
        userId,
        courseId,
        videoId: v.id,
        completed: false,
        watchTime: 0,
      })),
    })
  }

  // Notify student
  await db.notification.create({
    data: {
      userId,
      title: 'Enrollment Granted',
      message: `An admin has enrolled you in "${course.title}". Start learning now!`,
      type: 'course',
    },
  })

  return NextResponse.json({ success: true, data: enrollment }, { status: 201 })
}

// DELETE /api/admin/enrollments — Admin unenrolls a student from a course
export async function DELETE(request: NextRequest) {
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const courseId = searchParams.get('courseId')

  if (!userId || !courseId) {
    return NextResponse.json(
      { success: false, error: 'userId and courseId query params are required' },
      { status: 400 }
    )
  }

  const enrollment = await db.enrollment.findFirst({
    where: { userId, courseId },
  })
  if (!enrollment) {
    return NextResponse.json({ success: false, error: 'Enrollment not found' }, { status: 404 })
  }

  // Clean up progress records
  await db.courseProgress.deleteMany({ where: { userId, courseId } })

  // Delete enrollment
  await db.enrollment.delete({ where: { id: enrollment.id } })

  const course = await db.course.findUnique({ where: { id: courseId } })
  await db.notification.create({
    data: {
      userId,
      title: 'Enrollment Removed',
      message: `Your enrollment in "${course?.title || 'a course'}" has been removed by an admin.`,
      type: 'warning',
    },
  })

  return NextResponse.json({ success: true, data: { message: 'Enrollment removed' } })
}