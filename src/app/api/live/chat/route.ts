import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// DELETE /api/gallery/[id] — Admin only
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  try {
    await db.galleryItem.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Gallery item deleted' })
  } catch {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }
}
