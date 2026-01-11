
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyAdminToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await verifyAdminToken(token)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const result = await query(
      `SELECT id, email, name, membership_tier, membership_expires_at, created_at 
       FROM users WHERE id = $1`,
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: result.rows[0] })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await verifyAdminToken(token)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, membership_tier, membership_expires_at } = body

    // Convert empty string to null for timestamp field
    const expiresAt = membership_expires_at && membership_expires_at.trim() !== '' 
      ? membership_expires_at 
      : null

    await query(
      `UPDATE users 
       SET name = $1, email = $2, membership_tier = $3, membership_expires_at = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [name, email, membership_tier, expiresAt, params.id]
    )

    return NextResponse.json({ success: true, message: 'User updated successfully' })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ 
      error: 'Failed to update user', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await verifyAdminToken(token)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get user's venues first to delete related data
    const venuesResult = await query(
      'SELECT id FROM venues WHERE owner_id = $1',
      [params.id]
    )

    // Delete related data for each venue in a transaction-like manner
    for (const venue of venuesResult.rows) {
      const venueId = venue.id

      // Delete order addons for this venue's orders
      await query(`
        DELETE FROM order_addons 
        WHERE order_item_id IN (
          SELECT oi.id FROM order_items oi
          JOIN orders o ON o.id = oi.order_id
          JOIN venues v ON v.id = o.venue_id
          WHERE v.id = $1
        )
      `, [venueId])

      // Delete order items for this venue's orders
      await query(`
        DELETE FROM order_items 
        WHERE order_id IN (
          SELECT o.id FROM orders o
          WHERE o.venue_id = $1
        )
      `, [venueId])

      // Delete orders
      await query('DELETE FROM orders WHERE venue_id = $1', [venueId])

      // Delete reviews for this venue's items
      await query(`
        DELETE FROM reviews 
        WHERE item_id IN (
          SELECT i.id FROM items i
          JOIN categories c ON c.id = i.category_id
          WHERE c.venue_id = $1
        )
      `, [venueId])

      // Delete item associations
      await query(`
        DELETE FROM item_associations 
        WHERE item_id IN (
          SELECT i.id FROM items i
          JOIN categories c ON c.id = i.category_id
          WHERE c.venue_id = $1
        )
      `, [venueId])

      // Delete item pairings
      await query(`
        DELETE FROM item_pairings 
        WHERE item_id IN (
          SELECT i.id FROM items i
          JOIN categories c ON c.id = i.category_id
          WHERE c.venue_id = $1
        )
      `, [venueId])

      // Delete addons for items in this venue
      await query(`
        DELETE FROM addons 
        WHERE item_id IN (
          SELECT i.id FROM items i
          JOIN categories c ON c.id = i.category_id
          WHERE c.venue_id = $1
        )
      `, [venueId])

      // Delete variants for items in this venue
      await query(`
        DELETE FROM variants 
        WHERE item_id IN (
          SELECT i.id FROM items i
          JOIN categories c ON c.id = i.category_id
          WHERE c.venue_id = $1
        )
      `, [venueId])

      // Delete items
      await query(`
        DELETE FROM items 
        WHERE category_id IN (
          SELECT id FROM categories WHERE venue_id = $1
        )
      `, [venueId])

      // Delete categories
      await query('DELETE FROM categories WHERE venue_id = $1', [venueId])

      // Delete the venue itself
      await query('DELETE FROM venues WHERE id = $1', [venueId])
    }

    // Finally, delete the user
    await query('DELETE FROM users WHERE id = $1', [params.id])

    return NextResponse.json({ success: true, message: 'User and all related data deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ 
      error: 'Failed to delete user', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
