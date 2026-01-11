import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Doğrulama kodu bulunamadı' },
        { status: 400 }
      )
    }

    const result = await query(
      `SELECT id, email, name, email_verified, verification_token_expires 
       FROM users 
       WHERE verification_token = $1`,
      [token]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Geçersiz doğrulama kodu' },
        { status: 400 }
      )
    }

    const user = result.rows[0]

    if (user.email_verified) {
      return NextResponse.json(
        { message: 'E-posta adresi zaten doğrulanmış' },
        { status: 200 }
      )
    }

    if (new Date(user.verification_token_expires) < new Date()) {
      return NextResponse.json(
        { error: 'Doğrulama kodunun süresi dolmuş. Lütfen yeni bir kod isteyin.' },
        { status: 400 }
      )
    }

    await query(
      `UPDATE users 
       SET email_verified = true, 
           verification_token = NULL, 
           verification_token_expires = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [user.id]
    )

    return NextResponse.json({
      success: true,
      message: 'E-posta adresiniz başarıyla doğrulandı. Artık giriş yapabilirsiniz.',
      email: user.email
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Doğrulama işlemi başarısız' },
      { status: 500 }
    )
  }
}
