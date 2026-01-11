
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

    const result = await query(`
      SELECT 
        o.id,
        o.table_number,
        o.total,
        o.status,
        o.created_at,
        COUNT(oi.id) as item_count
      FROM orders o
      JOIN venues v ON v.id = o.venue_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE v.slug = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [params.slug])

    return NextResponse.json({ orders: result.rows })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
