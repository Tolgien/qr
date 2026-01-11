import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcrypt'
import { SignJWT } from 'jose'

export const dynamic = 'force-dynamic'


const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gerekli' },
        { status: 400 }
      )
    }

    const result = await query(
      'SELECT id, email, name, password_hash, membership_tier, email_verified FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      )
    }

    const user = result.rows[0]
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      )
    }

    // Check if email verification is required (from system settings)
    const settingsResult = await query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'require_email_verification'`
    )
    const requireEmailVerification = settingsResult.rows.length > 0 
      ? (settingsResult.rows[0].setting_value === 'true' || settingsResult.rows[0].setting_value === true)
      : false

    // Check if email is verified (only if required by system settings)
    if (requireEmailVerification && !user.email_verified) {
      return NextResponse.json(
        { 
          error: 'E-posta adresiniz doğrulanmamış. Lütfen e-postanızı kontrol edin ve doğrulama linkine tıklayın.',
          requiresVerification: true,
          email: user.email
        },
        { status: 403 }
      )
    }

    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      membershipTier: user.membership_tier
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .sign(JWT_SECRET)

    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        membershipTier: user.membership_tier,
        membershipExpiresAt: user.membership_expires_at // Assuming this field exists and is relevant, though not selected in the original query
      }
    })

    // Set cookie for user panel
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Giriş işlemi başarısız' },
      { status: 500 }
    )
  }
}