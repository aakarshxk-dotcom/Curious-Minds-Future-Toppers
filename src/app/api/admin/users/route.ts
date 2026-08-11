import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/admin/users - Admin only. List all users
export async function GET(request: NextRequest) {
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      avatar: true,
      isVerified: true,
      createdAt: true,
      _count: {
        select: { enrollments: true, reviews: true, payments: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ success: true, data: users })
}
