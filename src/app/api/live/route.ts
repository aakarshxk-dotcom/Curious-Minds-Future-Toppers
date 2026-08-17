import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

function setCacheHeaders(headers: Headers, maxAge: number, swr: number) {
  headers.set('Cache-Control', `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`)
}

// GET /api/live - List live sessions. Supports ?status= (scheduled|live|ended) and ?batchType=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const batchType = searchParams.get('batchType')
    const upcoming = searchParams.get('upcoming') === 'true'

    const now = new Date()
    const sessions = await db.liveSession.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(batchType ? { batchType } : {}),
        ...(upcoming ? { status: { in: ['scheduled', 'live'] }, startTime: { gt: now } } : {}),
      },
      include: {
        course: {
          select: { id: true, title: true, thumbnail: true },
        },
        classCategory: {
          select: { id: true, name: true, displayName: true },
        },
        _count: {
          select: { attendance: true, chatMessages: true },
        },
      },
      orderBy: [{ startTime: 'desc' }],
    })

    const headers = new Headers()
    setCacheHeaders(headers, 15, 60)
    headers.set('X-Content-Type-Options', 'nosniff')

    return NextResponse.json({ success: true, data: sessions }, { headers })
  } catch (error) {
    console.error('GET /api/live error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/live - Admin only. Create a live session
export async function POST(request: NextRequest) {
  const payload = getUserFromRequest(request)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const {
    title,
    description,
    courseId,
    batchName,
    batchType,
    subject,
    startTime,
    duration,
    channelId,
    thumbnail,
    enableChat,
    enableDoubts,
    recordSession,
    maxViewers,
  } = body

  if (!title) {
    return NextResponse.json(
      { success: false, error: 'Title is required' },
      { status: 400 }
    )
  }

  const session = await db.liveSession.create({
    data: {
      title,
      description: description || null,
      courseId: courseId || null,
      teacherId: payload.userId,
      channelId: channelId || `ft-${Date.now().toString(36)}`,
      batchName: batchName || null,
      batchType: batchType || null,
      subject: subject || null,
      startTime: startTime ? new Date(startTime) : null,
      duration: duration ?? 0,
      thumbnail: thumbnail || null,
      enableChat: enableChat ?? true,
      enableDoubts: enableDoubts ?? true,
      recordSession: recordSession ?? false,
      maxViewers: maxViewers ?? 0,
      status: 'scheduled',
    },
  })

  return NextResponse.json({ success: true, data: session }, { status: 201 })
}
