import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// POST /api/chapters - Admin only. Create chapter for a course.
export async function POST(request: NextRequest) {
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { title, description, order, courseId } = body

  if (!title || !courseId) {
    return NextResponse.json(
      { success: false, error: 'Title and courseId are required' },
      { status: 400 }
    )
  }

  const courseExists = await db.course.findUnique({ where: { id: courseId } })
  if (!courseExists) {
    return NextResponse.json(
      { success: false, error: 'Course not found' },
      { status: 404 }
    )
  }

  const chapter = await db.chapter.create({
    data: {
      title,
      description: description || null,
      order: order ?? 0,
      courseId,
    },
  })

  return NextResponse.json({ success: true, data: chapter }, { status: 201 })
}
