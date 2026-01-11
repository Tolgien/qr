
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcrypt'
import { SignJWT } from 'jose'
import { createPaymentRequest } from '@/lib/iyzico'
import { sendVerificationEmail } from '@/lib/resend'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function POST(request: Request) {
  try {
    const { email, password, name, membershipTier = 'free' } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Tüm alanlar gerekli' },
        { status: 400 }
      )
    }

    // Validate membership tier
    const validTiers = ['free', 'basic', 'premium']
    if (!validTiers.includes(membershipTier)) {
      return NextResponse.json(
        { error: 'Geçersiz üyelik tipi' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kayıtlı' },
        { status: 400 }
      )
    }

    // Check if email verification is required (from system settings)
    const settingsResult = await query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'require_email_verification'`
    )
    const requireEmailVerification = settingsResult.rows.length > 0 
      ? (settingsResult.rows[0].setting_value === 'true' || settingsResult.rows[0].setting_value === true)
      : false

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Generate email verification token only if required
    const verificationToken = requireEmailVerification ? crypto.randomBytes(32).toString('hex') : null
    const tokenExpiry = requireEmailVerification ? new Date() : null
    if (tokenExpiry) {
      tokenExpiry.setHours(tokenExpiry.getHours() + 24) // Token valid for 24 hours
    }

    // Set trial expiry for paid plans (14 days from now)
    let membershipExpiresAt = null
    if (membershipTier === 'basic' || membershipTier === 'premium') {
      const trialExpiry = new Date()
      trialExpiry.setDate(trialExpiry.getDate() + 14) // 14 days trial
      membershipExpiresAt = trialExpiry.toISOString()
    }

    // Insert new user with selected tier and trial period
    // If email verification is not required, set email_verified to true
    const result = await query(
      `INSERT INTO users (email, password_hash, name, membership_tier, membership_expires_at, email_verified, verification_token, verification_token_expires)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, name, membership_tier, membership_expires_at`,
      [email, passwordHash, name, membershipTier, membershipExpiresAt, !requireEmailVerification, verificationToken, tokenExpiry ? tokenExpiry.toISOString() : null]
    )

    const user = result.rows[0]

    // Send verification email only if required
    if (requireEmailVerification) {
      try {
        await sendVerificationEmail(user.email, verificationToken!, user.name)
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError)
        // Continue registration even if email fails
      }

      return NextResponse.json({
        requiresPayment: false,
        requiresVerification: true,
        message: 'Kayıt başarılı! E-posta adresinize gönderilen doğrulama linkine tıklayarak hesabınızı aktifleştirebilirsiniz.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          membershipTier: user.membership_tier
        }
      })
    } else {
      // Email verification not required, create JWT token and auto-login
      const token = await new SignJWT({
        userId: user.id,
        email: user.email,
        membershipTier: user.membership_tier
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('30d')
        .sign(JWT_SECRET)

      return NextResponse.json({
        requiresPayment: false,
        requiresVerification: false,
        message: 'Kayıt başarılı! Giriş yapılıyor...',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          membershipTier: user.membership_tier
        }
      })
    }
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Kayıt işlemi başarısız' },
      { status: 500 }
    )
  }
}
