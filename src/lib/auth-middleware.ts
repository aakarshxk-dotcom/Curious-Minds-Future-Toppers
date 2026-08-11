import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'future-toppers-secret-key-2024'

interface AuthenticatedUser {
  id: string
  email: string
  name: string | null
  role: string
  phone: string | null
}

/**
 * Authenticate a request by verifying the JWT Bearer token.
 * Returns the user object on success, or a 401 Response on failure.
 * Used by all payment/enrollment API routes.
 */
export async function authenticateRequest(
  request: Request
): Promise<{ user: AuthenticatedUser; token: string } | NextResponse> {
  const authHeader = request.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Missing or invalid Authorization header' },
      { status: 401 }
    )
  }

  const token = authHeader.slice(7)

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Empty token' },
      { status: 401 }
    )
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      email: string
      role: string
    }

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      )
    }

    return { user, token }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid or expired token' },
      { status: 401 }
    )
  }
}

export type { AuthenticatedUser }