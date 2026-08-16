import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/live/[id]/chat - Get chat messages for a session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const messages = await db.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ success: true, data: messages })
  } catch (error) {
    console.error('GET /api/live/[id]/chat error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/live/[id]/chat - Send a chat message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = getUserFromRequest(request)
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const { id: sessionId } = await params
    const body = await request.json()
    const { message, userName } = body

    if (!message) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 })
    }

    const msg = await db.chatMessage.create({
      data: {
        sessionId,
        userId: payload.userId,
        userName: userName || null,
        message,
      },
    })

    return NextResponse.json({ success: true, data: msg }, { status: 201 })
  } catch (error) {
    console.error('POST /api/live/[id]/chat error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}