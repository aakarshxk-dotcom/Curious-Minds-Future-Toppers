import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/classes/[id] - Get single class category with its courses
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const category = await db.classCategory.findUnique({
    where: { id },
    include: {
      courses: {
        where: { status: 'published' },
        include: {
          _count: { select: { chapters: true, enrollments: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!category) {
    return NextResponse.json(
      { success: false, error: 'Class category not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true, data: category })
}
