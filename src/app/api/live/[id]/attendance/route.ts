import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/live/[id]/announcements - Get announcements (chat messages of type announcement)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const announcements = await db.chatMessage.findMany({
      where: {
        sessionId,
        message: { startsWith: '[ANN]' },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json({ success: true, data: announcements })
  } catch (error) {
    console.error('GET /api/live/[id]/announcements error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/live/[id]/announcements - Create an announcement (teacher/admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = getUserFromRequest(request)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { id: sessionId } = await params
    const body = await request.json()
    const { message } = body

    if (!message) {
      return NextResponse.json({ success: false, error: 'Message required' }, { status: 400 })
    }

    // Save as chat message with announcement type
    const chatMsg = await db.chatMessage.create({
      data: {
        sessionId,
        userId: payload.userId,
        userName: 'Teacher',
        message: `[ANN] ${message}`,
      },
    })

    return NextResponse.json({ success: true, data: chatMsg }, { status: 201 })
  } catch (error) {
    console.error('POST /api/live/[id]/announcements error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
