import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/contact - Submit contact form
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, email, phone, subject, message } = body

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { success: false, error: 'Name, email, subject, and message are required' },
      { status: 400 }
    )
  }

  const contactMessage = await db.contactMessage.create({
    data: {
      name,
      email,
      phone: phone || null,
      subject,
      message,
    },
  })

  return NextResponse.json({ success: true, data: contactMessage }, { status: 201 })
}
