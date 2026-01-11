
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'


export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'İsim, email ve mesaj alanları gereklidir' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO contact_messages (name, email, phone, subject, message) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`,
      [name, email, phone || null, subject || null, message]
    )

    return NextResponse.json({
      success: true,
      messageId: result.rows[0].id
    })
  } catch (error: any) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Mesaj gönderilemedi. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
}
