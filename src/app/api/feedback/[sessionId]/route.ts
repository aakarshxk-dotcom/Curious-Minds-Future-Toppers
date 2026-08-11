import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/feedback/[sessionId] - Get all feedback for a session (public)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params

  const session = await db.liveSession.findUnique({ where: { id: sessionId } })
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Session not found' },
      { status: 404 }
    )
  }

  const feedback = await db.sessionFeedback.findMany({
    where: { sessionId },
    include: {
      user: {
        select: { id: true, name: true, avatar: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const totalFeedback = feedback.length
  const avgRating = totalFeedback > 0
    ? Number((feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback).toFixed(1))
    : 0

  const ratingDistribution = [1, 2, 3, 4, 5].map((star) => ({
    rating: star,
    count: feedback.filter((f) => f.rating === star).length,
  }))

  return NextResponse.json({
    success: true,
    data: {
      feedback,
      summary: {
        totalFeedback,
        avgRating,
        ratingDistribution,
      },
    },
  })
}
