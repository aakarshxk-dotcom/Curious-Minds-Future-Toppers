import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

function setCacheHeaders(headers: Headers, maxAge: number, swr: number) {
  headers.set('Cache-Control', `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`)
}

// GET /api/faculty - Get all faculty members
export async function GET() {
  try {
    const faculty = await db.faculty.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })

    const headers = new Headers()
    setCacheHeaders(headers, 60, 120)
    headers.set('X-Content-Type-Options', 'nosniff')

    return NextResponse.json({ success: true, data: faculty }, { headers })
  } catch (error) {
    console.error('GET /api/faculty error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/faculty - Admin only. Add faculty member
export async function POST(request: NextRequest) {
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { name, title, bio, photo, subjects, experience, order } = body

  if (!name) {
    return NextResponse.json(
      { success: false, error: 'Name is required' },
      { status: 400 }
    )
  }

  const member = await db.faculty.create({
    data: {
      name,
      title: title || null,
      bio: bio || null,
      photo: photo || null,
      subjects: subjects || null,
      experience: experience || null,
      order: order ?? 0,
    },
  })

  return NextResponse.json({ success: true, data: member }, { status: 201 })
}
