
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getIyzico } from '@/lib/iyzico'
import { SignJWT } from 'jose'

export const dynamic = 'force-dynamic'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const token = formData.get('token') as string

    if (!token) {
      return NextResponse.json(
        { error: 'Token bulunamadı' },
        { status: 400 }
      )
    }

    // Verify payment with iyzico
    const iyzico = await getIyzico()
    const paymentResult = await new Promise((resolve, reject) => {
      iyzico.checkoutForm.retrieve({ token }, (err: any, result: any) => {
        if (err) reject(err)
        else resolve(result)
      })
    }) as any

    if (paymentResult.status !== 'success' || paymentResult.paymentStatus !== 'SUCCESS') {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/register?payment=failed`
      )
    }

    const basketId = paymentResult.basketId

    // Get pending payment
    const pendingPayment = await query(
      'SELECT user_id, membership_tier FROM pending_payments WHERE basket_id = $1',
      [basketId]
    )

    if (pendingPayment.rows.length === 0) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/register?payment=notfound`
      )
    }

    const { user_id, membership_tier } = pendingPayment.rows[0]

    // Set membership expiration (30 days from now)
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 30)

    // Update user membership
    await query(
      `UPDATE users 
       SET membership_tier = $1, membership_expires_at = $2
       WHERE id = $3`,
      [membership_tier, expiryDate.toISOString(), user_id]
    )

    // Update payment status
    await query(
      `UPDATE pending_payments 
       SET status = 'completed', completed_at = NOW()
       WHERE basket_id = $1`,
      [basketId]
    )

    // Get user info
    const userResult = await query(
      'SELECT id, email, name, membership_tier FROM users WHERE id = $1',
      [user_id]
    )

    const user = userResult.rows[0]

    // Create JWT token for auto-login
    const jwtToken = await new SignJWT({ 
      userId: user.id, 
      email: user.email,
      membershipTier: user.membership_tier 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    // Redirect to success page with token
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/payment-success?token=${jwtToken}`
    )
  } catch (error) {
    console.error('Payment callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/register?payment=error`
    )
  }
}
