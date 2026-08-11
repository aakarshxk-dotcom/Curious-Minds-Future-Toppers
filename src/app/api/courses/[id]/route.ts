import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/courses/[id] - Get single course with chapters and videos
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

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

  if (!course) {
    return NextResponse.json(
      { success: false, error: 'Course not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true, data: course })
}

// PUT /api/courses/[id] - Admin only. Update course
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.course.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json(
      { success: false, error: 'Course not found' },
      { status: 404 }
    )
  }

  const body = await request.json()
  const course = await db.course.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.thumbnail !== undefined && { thumbnail: body.thumbnail }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.level !== undefined && { level: body.level }),
      ...(body.duration !== undefined && { duration: body.duration }),
      ...(body.featured !== undefined && { featured: body.featured }),
      ...(body.banner !== undefined && { banner: body.banner }),
      ...(body.instructorName !== undefined && { instructorName: body.instructorName }),
      ...(body.instructorBio !== undefined && { instructorBio: body.instructorBio }),
      ...(body.instructorAvatar !== undefined && { instructorAvatar: body.instructorAvatar }),
      ...(body.instructorTitle !== undefined && { instructorTitle: body.instructorTitle }),
      ...(body.requirements !== undefined && { requirements: body.requirements }),
      ...(body.whatYouLearn !== undefined && { whatYouLearn: body.whatYouLearn }),
    },
  })

  return NextResponse.json({ success: true, data: course })
}

// DELETE /api/courses/[id] - Admin only. Delete course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.course.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json(
      { success: false, error: 'Course not found' },
      { status: 404 }
    )
  }

  await db.course.delete({ where: { id } })

  return NextResponse.json({ success: true, data: { message: 'Course deleted' } })
}
