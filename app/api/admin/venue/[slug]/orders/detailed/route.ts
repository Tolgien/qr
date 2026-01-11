
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get all orders with their items
    const ordersResult = await query(`
      SELECT 
        o.id,
        o.table_number,
        o.total,
        o.status,
        o.created_at
      FROM orders o
      JOIN venues v ON v.id = o.venue_id
      WHERE v.slug = $1
      ORDER BY o.created_at DESC
    `, [params.slug])

    const orders = await Promise.all(
      ordersResult.rows.map(async (order) => {
        // Get order items with details
        const itemsResult = await query(`
          SELECT 
            oi.id,
            i.name as item_name,
            v.name as variant_name,
            oi.quantity,
            oi.notes,
            (i.price + COALESCE(v.price_delta, 0)) * oi.quantity as price
          FROM order_items oi
          JOIN items i ON i.id = oi.item_id
          LEFT JOIN variants v ON v.id = oi.variant_id
          WHERE oi.order_id = $1
        `, [order.id])

        // Get addons for each order item
        const items = await Promise.all(
          itemsResult.rows.map(async (item) => {
            const addonsResult = await query(`
              SELECT 
                a.name,
                a.price
              FROM order_addons oa
              JOIN addons a ON a.id = oa.addon_id
              WHERE oa.order_item_id = $1
            `, [item.id])

            return {
              ...item,
              addons: addonsResult.rows
            }
          })
        )

        return {
          ...order,
          items
        }
      })
    )

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching detailed orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
