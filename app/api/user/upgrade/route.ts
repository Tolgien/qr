
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'
import { getIyzico, createPaymentRequest } from '@/lib/iyzico'

export const dynamic = 'force-dynamic'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: Request) {
  try {
    // Cookie'den veya Authorization header'dan token al
    const { cookies } = await import('next/headers')
    const cookieStore = cookies()
    const tokenFromCookie = cookieStore.get('authToken')?.value
    const authHeader = request.headers.get('Authorization')
    
    const token = tokenFromCookie || authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = jwt.verify(token, JWT_SECRET) as any
    if (!payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { membershipTier } = await request.json()

    if (!membershipTier || !['basic', 'premium'].includes(membershipTier)) {
      return NextResponse.json({ error: 'Geçersiz üyelik tipi' }, { status: 400 })
    }

    // Get user info
    const userResult = await query(
      'SELECT id, email, name, membership_tier FROM users WHERE id = $1',
      [payload.userId]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    const user = userResult.rows[0]

    // Pricing based on tier
    const prices = {
      basic: { monthly: '299.00', yearly: '2990.00' },
      premium: { monthly: '999.00', yearly: '9990.00' }
    }

    const price = prices[membershipTier as 'basic' | 'premium'].monthly
    const basketId = `upgrade-${user.id}-${Date.now()}`

    // Store pending payment
    await query(
      `INSERT INTO pending_payments (user_id, basket_id, membership_tier, amount, status)
       VALUES ($1, $2, $3, $4, 'pending')`,
      [user.id, basketId, membershipTier, parseFloat(price)]
    )

    // Create iyzico payment
    const iyzico = await getIyzico()
    const nameParts = user.name.split(' ')
    const firstName = nameParts[0] || 'User'
    const lastName = nameParts.slice(1).join(' ') || 'Name'

    const paymentRequest = createPaymentRequest(
      price,
      price,
      basketId,
      {
        id: user.id.toString(),
        name: firstName,
        surname: lastName,
        email: user.email
      },
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/payment/callback`
    )

    const paymentResult = await new Promise((resolve, reject) => {
      iyzico.checkoutFormInitialize.create(paymentRequest, (err: any, result: any) => {
        if (err) {
          console.error('Iyzico error:', err)
          reject(err)
        } else {
          resolve(result)
        }
      })
    }) as any

    if (paymentResult.status === 'success') {
      return NextResponse.json({
        success: true,
        paymentPageUrl: paymentResult.paymentPageUrl,
        token: paymentResult.token
      })
    } else {
      return NextResponse.json(
        { error: 'Ödeme başlatılamadı', details: paymentResult.errorMessage },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Upgrade error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
