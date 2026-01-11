import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { sendVerificationEmail } from '@/lib/resend'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'E-posta adresi gerekli' },
        { status: 400 }
      )
    }

    const result = await query(
      'SELECT id, email, name, email_verified FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    const user = result.rows[0]

    if (user.email_verified) {
      return NextResponse.json(
        { error: 'E-posta adresi zaten doğrulanmış' },
        { status: 400 }
      )
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 24)

    await query(
      `UPDATE users 
       SET verification_token = $1, 
           verification_token_expires = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [verificationToken, tokenExpiry.toISOString(), user.id]
    )

    await sendVerificationEmail(user.email, verificationToken, user.name)

    return NextResponse.json({
      success: true,
      message: 'Doğrulama e-postası tekrar gönderildi'
    })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'E-posta gönderilemedi' },
      { status: 500 }
    )
  }
}
