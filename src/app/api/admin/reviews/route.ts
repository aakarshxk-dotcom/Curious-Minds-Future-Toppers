import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/admin/reviews - Admin only. Get all reviews with filtering
export async function GET(request: NextRequest) {
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const reviews = await db.review.findMany({
    where: status ? { status } : undefined,
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      course: {
        select: { id: true, title: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ success: true, data: reviews })
}

// PUT /api/admin/reviews/[id] - Admin only. Approve/reject review
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.review.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json(
      { success: false, error: 'Review not found' },
      { status: 404 }
    )
  }

  const body = await request.json()
  const { status } = body

  if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
    return NextResponse.json(
      { success: false, error: 'Status must be approved, rejected, or pending' },
      { status: 400 }
    )
  }

  const review = await db.review.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json({ success: true, data: review })
}
