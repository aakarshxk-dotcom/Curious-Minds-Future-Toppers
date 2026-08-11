import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/admin/classes - Admin only. List all class categories (including inactive)
export async function GET(request: NextRequest) {
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const categories = await db.classCategory.findMany({
    include: {
      _count: { select: { courses: true, liveSessions: true } },
    },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json({ success: true, data: categories })
}

// POST /api/admin/classes - Admin only. Create a new class category
export async function POST(request: NextRequest) {
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { name, displayName, description, thumbnail, order, isActive } = body

  if (!name || !displayName) {
    return NextResponse.json(
      { success: false, error: 'name and displayName are required' },
      { status: 400 }
    )
  }

  // Check for duplicate name
  const existing = await db.classCategory.findUnique({ where: { name } })
  if (existing) {
    return NextResponse.json(
      { success: false, error: 'A class category with this name already exists' },
      { status: 409 }
    )
  }

  const category = await db.classCategory.create({
    data: {
      name,
      displayName,
      description: description || null,
      thumbnail: thumbnail || null,
      order: order ?? 0,
      isActive: isActive ?? true,
    },
  })

  return NextResponse.json({ success: true, data: category }, { status: 201 })
}
