import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/live/[id]/attendance - Get attendance for a session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const attendance = await db.liveAttendance.findMany({
      where: { sessionId },
      orderBy: { joinTime: 'asc' },
    })
    return NextResponse.json({ success: true, data: attendance })
  } catch (error) {
    console.error('GET /api/live/[id]/attendance error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/live/[id]/attendance - Record attendance (join/leave)
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
    const { action, userName } = body // action: 'join' | 'leave'

    if (action === 'join') {
      // Check if already has attendance record
      const existing = await db.liveAttendance.findFirst({
        where: { sessionId, userId: payload.userId },
      })

      if (existing) {
        return NextResponse.json({ success: true, data: existing })
      }

      const record = await db.liveAttendance.create({
        data: {
          sessionId,
          userId: payload.userId,
          userName: userName || payload.name,
        },
      })

      return NextResponse.json({ success: true, data: record }, { status: 201 })
    }

    if (action === 'leave') {
      const record = await db.liveAttendance.findFirst({
        where: { sessionId, userId: payload.userId, leaveTime: null },
      })

      if (record) {
        const duration = Math.floor(
          (Date.now() - new Date(record.joinTime).getTime()) / 1000
        )
        await db.liveAttendance.update({
          where: { id: record.id },
          data: {
            leaveTime: new Date(),
            watchDuration: duration,
          },
        })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('POST /api/live/[id]/attendance error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
