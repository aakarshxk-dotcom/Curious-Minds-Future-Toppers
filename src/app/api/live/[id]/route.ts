import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/live/[id] - Get a single live session with course info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await db.liveSession.findUnique({
      where: { id },
      include: {
        course: {
          select: { id: true, title: true, thumbnail: true },
        },
        classCategory: {
          select: { id: true, name: true, displayName: true },
        },
        recordings: {
          where: { status: 'ready' },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { attendance: true, chatMessages: true },
        },
      },
    })

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: session })
  } catch (error) {
    console.error('GET /api/live/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
