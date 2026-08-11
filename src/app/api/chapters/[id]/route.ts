import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// PUT /api/chapters/[id] - Admin only. Update chapter
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.chapter.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json(
      { success: false, error: 'Chapter not found' },
      { status: 404 }
    )
  }

  const body = await request.json()
  const chapter = await db.chapter.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.order !== undefined && { order: body.order }),
    },
  })

  return NextResponse.json({ success: true, data: chapter })
}

// DELETE /api/chapters/[id] - Admin only. Delete chapter
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.chapter.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json(
      { success: false, error: 'Chapter not found' },
      { status: 404 }
    )
  }

  await db.chapter.delete({ where: { id } })

  return NextResponse.json({ success: true, data: { message: 'Chapter deleted' } })
}
