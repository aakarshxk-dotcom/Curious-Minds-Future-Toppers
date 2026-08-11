import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'

// POST /api/auth/register
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, phone } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashPassword(password),
        phone: phone || null,
        role: 'student',
      },
    })

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { success: true, data: { token, user: userWithoutPassword } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
