
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'


export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    console.log('Venues - Auth header:', authHeader ? 'exists' : 'missing')
    
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      console.log('Venues - No token provided')
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    console.log('Venues - Verifying token...')
    const payload = await verifyToken(token)
    console.log('Venues - Token payload:', payload)
    
    if (!payload) {
      console.log('Venues - Token verification failed')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get ALL venues with stats (admin can manage all venues)
    const venuesResult = await query(`
      SELECT 
        v.*,
        COUNT(DISTINCT i.id) as total_items,
        COUNT(DISTINCT c.id) as total_categories,
        COUNT(DISTINCT o.id) as total_orders
      FROM venues v
      LEFT JOIN categories c ON c.venue_id = v.id
      LEFT JOIN items i ON i.category_id = c.id
      LEFT JOIN orders o ON o.venue_id = v.id
      GROUP BY v.id
      ORDER BY v.name
    `)

    const venues = venuesResult.rows.map(row => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      logo: row.logo,
      totalItems: parseInt(row.total_items) || 0,
      totalCategories: parseInt(row.total_categories) || 0,
      totalOrders: parseInt(row.total_orders) || 0,
      status: row.status,
    }))

    return NextResponse.json({ venues })
  } catch (error) {
    console.error('Error fetching venues:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    // Try to get token from Authorization header first, then from cookie
    let token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      const cookies = request.headers.get('cookie')
      const adminTokenMatch = cookies?.match(/adminToken=([^;]+)/)
      token = adminTokenMatch?.[1] || undefined
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get venue ID from request body
    const { venueId } = await request.json()

    if (!venueId) {
      return NextResponse.json({ error: 'Venue ID is required' }, { status: 400 })
    }

    // Check if venue exists
    const venueResult = await query(
      'SELECT id, name FROM venues WHERE id = $1',
      [venueId]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    // Delete venue (cascade will handle related data)
    // Order of deletion to handle foreign key constraints:
    // 1. Reviews
    // 2. Orders
    // 3. Items
    // 4. Categories
    // 5. Waiter calls
    // 6. Table tokens
    // 7. Venue

    await query('DELETE FROM reviews WHERE item_id IN (SELECT i.id FROM items i JOIN categories c ON i.category_id = c.id WHERE c.venue_id = $1)', [venueId])
    await query('DELETE FROM orders WHERE venue_id = $1', [venueId])
    await query('DELETE FROM items WHERE category_id IN (SELECT id FROM categories WHERE venue_id = $1)', [venueId])
    await query('DELETE FROM categories WHERE venue_id = $1', [venueId])
    await query('DELETE FROM waiter_calls WHERE venue_id = $1', [venueId])
    await query('DELETE FROM table_tokens WHERE venue_id = $1', [venueId])
    await query('DELETE FROM venues WHERE id = $1', [venueId])

    return NextResponse.json({ success: true, message: 'Venue deleted successfully' })
  } catch (error) {
    console.error('Error deleting venue:', error)
    return NextResponse.json(
      { error: 'Failed to delete venue' },
      { status: 500 }
    )
  }
}
