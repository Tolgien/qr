
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { autoUpdateOrderStatus } from '@/lib/auto-update-orders'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Try to get token from Authorization header first, then from cookie
    let token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      const cookies = request.headers.get('cookie')
      const adminTokenMatch = cookies?.match(/adminToken=([^;]+)/)
      const userTokenMatch = cookies?.match(/userToken=([^;]+)/)
      const authTokenMatch = cookies?.match(/authToken=([^;]+)/)
      token = adminTokenMatch?.[1] || userTokenMatch?.[1] || authTokenMatch?.[1] || undefined
    }
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get venue
    const venueResult = await query(
      'SELECT id, owner_id FROM venues WHERE slug = $1',
      [params.slug]
    )
    
    if (!venueResult || venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const venue = venueResult.rows[0]

    // Admin can access all venues, regular users only their own
    const isAdmin = payload.username === 'admin'
    if (!isAdmin && Number(venue.owner_id) !== Number(payload.userId)) {
      console.log('Orders access denied: userId', payload.userId, 'trying to access venue owned by', venue.owner_id)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const venueId = venue.id

    // Auto-update order status using shared helper
    await autoUpdateOrderStatus(venueId)

    // Get orders with items
    const ordersResult = await query(`
      SELECT 
        o.id,
        o.table_number,
        o.total,
        o.status,
        o.created_at,
        json_agg(
          json_build_object(
            'id', oi.id,
            'item_name', i.name,
            'variant_name', v.name,
            'quantity', oi.quantity,
            'notes', oi.notes,
            'addons', (
              SELECT json_agg(a.name)
              FROM order_addons oa
              JOIN addons a ON a.id = oa.addon_id
              WHERE oa.order_item_id = oi.id
            )
          )
        ) as items
      FROM orders o
      JOIN venues ve ON ve.id = o.venue_id
      JOIN order_items oi ON oi.order_id = o.id
      JOIN items i ON i.id = oi.item_id
      LEFT JOIN variants v ON v.id = oi.variant_id
      WHERE ve.slug = $1 AND ve.owner_id = $2
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [params.slug, payload.userId])

    return NextResponse.json({ orders: ordersResult.rows })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
