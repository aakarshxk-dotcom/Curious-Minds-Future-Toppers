import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// PUT /api/admin/classes/[id] - Admin only. Update class category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.classCategory.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json(
      { success: false, error: 'Class category not found' },
      { status: 404 }
    )
  }

  const body = await request.json()

  // Check for duplicate name if name is being changed
  if (body.name && body.name !== existing.name) {
    const duplicate = await db.classCategory.findUnique({ where: { name: body.name } })
    if (duplicate) {
      return NextResponse.json(
        { success: false, error: 'A class category with this name already exists' },
        { status: 409 }
      )
    }
  }

  const category = await db.classCategory.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.displayName !== undefined && { displayName: body.displayName }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.thumbnail !== undefined && { thumbnail: body.thumbnail }),
      ...(body.order !== undefined && { order: body.order }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  })

  return NextResponse.json({ success: true, data: category })
}

// DELETE /api/admin/classes/[id] - Admin only. Delete class category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.classCategory.findUnique({
    where: { id },
    include: {
      _count: { select: { courses: true, liveSessions: true } },
    },
  })

  if (!existing) {
    return NextResponse.json(
      { success: false, error: 'Class category not found' },
      { status: 404 }
    )
  }

  if (existing._count.courses > 0 || existing._count.liveSessions > 0) {
    return NextResponse.json(
      { success: false, error: 'Cannot delete category with associated courses or live sessions. Remove them first.' },
      { status: 400 }
    )
  }

  await db.classCategory.delete({ where: { id } })

  return NextResponse.json({ success: true, data: { message: 'Class category deleted' } })
}