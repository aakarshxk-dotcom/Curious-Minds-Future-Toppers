import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// POST /api/feedback - Submit session feedback (auth required)
export async function POST(request: NextRequest) {
  const payload = getUserFromRequest(request)
  if (!payload) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { sessionId, rating, comment } = body

  if (!sessionId || !rating) {
    return NextResponse.json(
      { success: false, error: 'sessionId and rating are required' },
      { status: 400 }
    )
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json(
      { success: false, error: 'Rating must be between 1 and 5' },
      { status: 400 }
    )
  }

  const session = await db.liveSession.findUnique({ where: { id: sessionId } })
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Session not found' },
      { status: 404 }
    )
  }

  const existingFeedback = await db.sessionFeedback.findFirst({
    where: { sessionId, userId: payload.userId },
  })
  if (existingFeedback) {
    return NextResponse.json(
      { success: false, error: 'You have already submitted feedback for this session' },
      { status: 409 }
    )
  }

  const feedback = await db.sessionFeedback.create({
    data: {
      sessionId,
      userId: payload.userId,
      rating,
      comment: comment || null,
    },
    include: {
      user: {
        select: { id: true, name: true, avatar: true },
      },
    },
  })

  return NextResponse.json({ success: true, data: feedback }, { status: 201 })
}
