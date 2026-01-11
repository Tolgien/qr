import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'
import { autoUpdateOrderStatus } from '@/lib/auto-update-orders'

export const dynamic = 'force-dynamic'
export const revalidate = 0 // Disable caching completely

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Step 1: Get venue ID first (before session check)
    let venueResult
    try {
      venueResult = await query(
        'SELECT id FROM venues WHERE slug = $1',
        [params.slug]
      )
    } catch (dbError) {
      console.error('Database error fetching venue:', dbError)
      return NextResponse.json(
        { orders: [] },
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        }
      )
    }

    if (!venueResult || venueResult.rows.length === 0) {
      return NextResponse.json(
        { orders: [] },
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        }
      )
    }

    const venueId = venueResult.rows[0].id

    // Step 2: Auto-update ALL venue orders BEFORE checking customer session
    // This ensures orders progress even if customer has no session cookie
    await autoUpdateOrderStatus(venueId)

    // Step 3: NOW check customer session
    let customerSession: string | undefined
    try {
      const cookieStore = await cookies()
      customerSession = cookieStore.get('customer_session')?.value
    } catch (cookieError) {
      console.error('Cookie error:', cookieError)
      customerSession = undefined
    }

    if (!customerSession) {
      return NextResponse.json(
        { orders: [] },
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        }
      )
    }

    // Safely get customer orders
    let ordersResult
    try {
      ordersResult = await query(
        `SELECT
          o.id,
          o.status,
          o.total,
          o.created_at,
          COALESCE(
            (
              SELECT AVG(i.preparation_time)
              FROM order_items oi
              JOIN items i ON oi.item_id = i.id
              WHERE oi.order_id = o.id AND i.preparation_time IS NOT NULL
            ), 15
          ) as estimated_time
        FROM orders o
        WHERE o.venue_id = $1
          AND o.customer_session = $2
          AND o.created_at > NOW() - INTERVAL '24 hours'
          AND o.status != 'delivered'
        ORDER BY o.created_at DESC`,
        [venueId, customerSession]
      )
    } catch (dbError) {
      console.error('Database error fetching orders:', dbError)
      return NextResponse.json(
        { orders: [] },
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        }
      )
    }

    // Convert total to number
    const orders = ordersResult.rows.map(order => ({
      ...order,
      total: parseFloat(order.total),
      estimated_time: parseFloat(order.estimated_time)
    }))

    return NextResponse.json(
      { orders: orders },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      }
    )
  } catch (error) {
    console.error('Critical error in customer-orders route:', error)
    // ALWAYS return 200 with empty orders, never 500/502
    return NextResponse.json(
      { orders: [] },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    )
  }
}