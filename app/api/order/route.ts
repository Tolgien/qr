import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { venueSlug, tableNumber, items, notes, total, tableToken } = body

    if (!venueSlug || !tableNumber || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // QR kod zorunluluğu - tableToken olmadan sipariş verilemez
    if (!tableToken) {
      return NextResponse.json(
        { error: 'Sipariş vermek için masanızdaki QR kodu okutmanız gerekiyor.' },
        { status: 403 }
      )
    }

    // Get venue ID from slug
    const venueResult = await query(
      'SELECT id FROM venues WHERE slug = $1',
      [venueSlug]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const venueId = venueResult.rows[0].id

    // Validate table token - artık zorunlu
    const tokenResult = await query(
      `SELECT id FROM table_tokens 
       WHERE venue_id = $1 AND table_number = $2 AND token = $3 AND is_active = TRUE`,
      [venueId, tableNumber, tableToken]
    )

    if (tokenResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Geçersiz masa QR kodu. Lütfen masanızdaki QR kodu okutun.' },
        { status: 401 }
      )
    }

    // Update last used
    await query(
      'UPDATE table_tokens SET last_used = CURRENT_TIMESTAMP WHERE id = $1',
      [tokenResult.rows[0].id]
    )

    // Müşteri session ID'si al veya oluştur
    const cookieStore = cookies()
    let sessionId = cookieStore.get('customer_session')?.value

    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }


    // Create order
    const orderResult = await query(
      `INSERT INTO orders (venue_id, table_number, total, status, created_at, updated_at, customer_session)
       VALUES ($1, $2, $3, $4, NOW(), NOW(), $5)
       RETURNING id`,
      [venueId, tableNumber, total, 'placed', sessionId]
    )

    const orderId = orderResult.rows[0].id

    // Insert order items
    for (const item of items) {
      const orderItemResult = await query(
        `INSERT INTO order_items (order_id, item_id, variant_id, quantity, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING id`,
        [orderId, item.itemId, item.variantId || null, item.quantity, item.notes || notes || null]
      )

      const orderItemId = orderItemResult.rows[0].id

      // Insert addons if any
      if (item.addonIds && item.addonIds.length > 0) {
        for (const addonId of item.addonIds) {
          await query(
            `INSERT INTO order_addons (order_item_id, addon_id, created_at)
             VALUES ($1, $2, NOW())`,
            [orderItemId, addonId]
          )
        }
      }
    }

    const response = NextResponse.json({
      success: true,
      orderId,
      message: 'Siparişiniz alındı',
      eta: '15-20 dk', // Tahmini hazırlık süresi
    })

    // Session cookie'yi set et
    response.cookies.set('customer_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 gün
    })

    return response
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}