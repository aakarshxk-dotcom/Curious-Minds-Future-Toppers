import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

function setCacheHeaders(headers: Headers, maxAge: number, swr: number) {
  headers.set('Cache-Control', `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`)
}

// GET /api/gallery - Get all gallery items
export async function GET() {
  try {
    const items = await db.galleryItem.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })

    const headers = new Headers()
    setCacheHeaders(headers, 60, 120)
    headers.set('X-Content-Type-Options', 'nosniff')

    return NextResponse.json({ success: true, data: items }, { headers })
  } catch (error) {
    console.error('GET /api/gallery error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/gallery - Admin only. Add gallery item
export async function POST(request: NextRequest) {
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { title, description, imageUrl, type, order } = body

  if (!title || !imageUrl) {
    return NextResponse.json(
      { success: false, error: 'Title and imageUrl are required' },
      { status: 400 }
    )
  }

  const item = await db.galleryItem.create({
    data: {
      title,
      description: description || null,
      imageUrl,
      type: type || 'photo',
      order: order ?? 0,
    },
  })

  return NextResponse.json({ success: true, data: item }, { status: 201 })
}
