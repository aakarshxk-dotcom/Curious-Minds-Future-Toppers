import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/admin/pdfs?courseId=xxx - Admin only. Get all PDFs with optional course filter
export async function GET(request: NextRequest) {
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const courseId = searchParams.get('courseId')

  const pdfs = await db.pDFDocument.findMany({
    where: courseId ? { courseId } : undefined,
    include: {
      course: {
        select: { id: true, title: true },
      },
    },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json({ success: true, data: pdfs })
}

// POST /api/admin/pdfs - Admin only. Create a new PDF document
export async function POST(request: NextRequest) {
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { title, description, fileUrl, courseId, chapterId, type, order } = body

  if (!title || !fileUrl || !courseId) {
    return NextResponse.json(
      { success: false, error: 'title, fileUrl, and courseId are required' },
      { status: 400 }
    )
  }

  // Verify course exists
  const course = await db.course.findUnique({ where: { id: courseId } })
  if (!course) {
    return NextResponse.json(
      { success: false, error: 'Course not found' },
      { status: 404 }
    )
  }

  // Verify chapter exists if provided
  if (chapterId) {
    const chapter = await db.chapter.findFirst({
      where: { id: chapterId, courseId },
    })
    if (!chapter) {
      return NextResponse.json(
        { success: false, error: 'Chapter not found or does not belong to this course' },
        { status: 404 }
      )
    }
  }

  const pdf = await db.pDFDocument.create({
    data: {
      title,
      description: description || null,
      fileUrl,
      courseId,
      chapterId: chapterId || null,
      type: type || 'note',
      order: order ?? 0,
    },
  })

  return NextResponse.json({ success: true, data: pdf }, { status: 201 })
}
