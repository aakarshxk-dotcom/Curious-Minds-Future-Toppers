import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

function setCacheHeaders(headers: Headers, maxAge: number, swr: number) {
  headers.set('Cache-Control', `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`)
}

// GET /api/classes - Get all active class categories ordered by order field
export async function GET() {
  try {
    const categories = await db.classCategory.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { courses: true, liveSessions: true } },
      },
      orderBy: { order: 'asc' },
    })

    const headers = new Headers()
    setCacheHeaders(headers, 30, 60)
    headers.set('X-Content-Type-Options', 'nosniff')

    return NextResponse.json({ success: true, data: categories }, { headers })
  } catch (error) {
    console.error('GET /api/classes error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
