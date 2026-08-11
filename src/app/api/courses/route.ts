import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

function setCacheHeaders(headers: Headers, maxAge: number, swr: number) {
  headers.set('Cache-Control', `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`)
}

// GET /api/courses - List all published courses. Support ?search=, ?category=, ?featured=
// If ?admin=true, list ALL courses (including drafts) — admin only.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category')
    const featured = searchParams.get('featured') === 'true'
    const isAdmin = searchParams.get('admin') === 'true'

    const payload = isAdmin ? getUserFromRequest(request) : null
    if (isAdmin && (!payload || payload.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const courses = await db.course.findMany({
      where: {
        ...(isAdmin ? {} : { status: 'published' }),
        ...(featured ? { featured: true } : {}),
        ...(category ? { category } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search } },
                { description: { contains: search } },
                { category: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        _count: { select: { chapters: true, enrollments: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const headers = new Headers()
    if (!isAdmin) {
      setCacheHeaders(headers, 30, 60)
    }
    headers.set('X-Content-Type-Options', 'nosniff')

    return NextResponse.json({ success: true, data: courses }, { headers })
  } catch (error) {
    console.error('GET /api/courses error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/courses - Admin only. Create new course.
export async function POST(request: NextRequest) {
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { title, description, thumbnail, price, category, status, level, duration, featured } = body

  if (!title) {
    return NextResponse.json(
      { success: false, error: 'Title is required' },
      { status: 400 }
    )
  }

  const course = await db.course.create({
    data: {
      title,
      description: description || null,
      thumbnail: thumbnail || null,
      price: price ?? 0,
      category: category || null,
      status: status || 'draft',
      level: level || 'beginner',
      duration: duration || null,
      featured: featured ?? false,
    },
  })

  return NextResponse.json({ success: true, data: course }, { status: 201 })
}
