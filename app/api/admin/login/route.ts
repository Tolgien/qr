
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

export const dynamic = 'force-dynamic'


const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    console.log('Login attempt for username:', username)

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gerekli' },
        { status: 400 }
      )
    }

    // Get user from database
    const result = await query(
      'SELECT * FROM admin_users WHERE username = $1',
      [username]
    )

    console.log('Query result:', result.rows.length, 'users found')

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Kullanıcı adı veya şifre hatalı' },
        { status: 401 }
      )
    }

    const user = result.rows[0]

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash)

    console.log('Password valid:', isValid)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Kullanıcı adı veya şifre hatalı' },
        { status: 401 }
      )
    }

    // Create JWT token (30 days)
    const token = await new SignJWT({ userId: user.id, username: user.username })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .sign(JWT_SECRET)

    console.log('Login successful for user:', username)

    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        venueId: user.venue_id,
      },
    })

    // Set cookie for admin panel
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    })

    return response
  } catch (error: any) {
    console.error('Login error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    )
  }
}
