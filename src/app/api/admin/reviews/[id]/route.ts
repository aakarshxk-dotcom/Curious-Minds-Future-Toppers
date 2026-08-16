import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

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