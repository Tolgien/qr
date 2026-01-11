import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = cookies()
    const tokenFromCookie = cookieStore.get('authToken')?.value
    const authHeader = request.headers.get('Authorization')

    const token = tokenFromCookie || authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Check if venue belongs to user
    const venueCheck = await query(
      'SELECT id FROM venues WHERE id = $1 AND owner_id = $2',
      [params.id, decoded.userId]
    )

    if (venueCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Venue not found or unauthorized' },
        { status: 404 }
      )
    }

    console.log('Starting deletion process for venue:', params.id)

    // Delete related data first (due to foreign key constraints)
    try {
      // Get all items for this venue first
      const itemsResult = await query(
        'SELECT i.id FROM items i INNER JOIN categories c ON i.category_id = c.id WHERE c.venue_id = $1',
        [params.id]
      )
      const itemIds = itemsResult.rows.map(row => row.id)

      if (itemIds.length > 0) {
        // Delete reviews for items
        console.log('Deleting reviews...')
        await query('DELETE FROM reviews WHERE item_id = ANY($1)', [itemIds])

        // Delete order addons
        console.log('Deleting order addons...')
        await query('DELETE FROM order_addons WHERE order_item_id IN (SELECT id FROM order_items WHERE item_id = ANY($1))', [itemIds])

        // Delete addons
        console.log('Deleting addons...')
        await query('DELETE FROM addons WHERE item_id = ANY($1)', [itemIds])

        // Delete variants
        console.log('Deleting variants...')
        await query('DELETE FROM variants WHERE item_id = ANY($1)', [itemIds])

        // Delete item pairings
        console.log('Deleting item pairings...')
        await query('DELETE FROM item_pairings WHERE item_id = ANY($1) OR pairing_item_id = ANY($1)', [itemIds])

        // Delete item associations
        console.log('Deleting item associations...')
        await query('DELETE FROM item_associations WHERE item_id = ANY($1) OR associated_item_id = ANY($1)', [itemIds])
      }

      // Delete order items
      console.log('Deleting order items...')
      await query('DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE venue_id = $1)', [params.id])

      // Delete orders
      console.log('Deleting orders...')
      await query('DELETE FROM orders WHERE venue_id = $1', [params.id])

      // Delete items
      console.log('Deleting items...')
      await query('DELETE FROM items WHERE category_id IN (SELECT id FROM categories WHERE venue_id = $1)', [params.id])

      // Delete categories
      console.log('Deleting categories...')
      await query('DELETE FROM categories WHERE venue_id = $1', [params.id])

      // Finally delete the venue
      console.log('Deleting venue...')
      await query('DELETE FROM venues WHERE id = $1', [params.id])

      console.log('Venue deleted successfully')
      return NextResponse.json({ message: 'Venue deleted successfully' })
    } catch (deleteError: any) {
      console.error('Delete operation error:', deleteError.message)
      console.error('Error details:', deleteError)
      return NextResponse.json(
        { error: `Delete failed: ${deleteError.message}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error deleting venue:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = cookies()
    const tokenFromCookie = cookieStore.get('authToken')?.value
    const authHeader = request.headers.get('Authorization')

    const token = tokenFromCookie || authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production') as any

    const venue = await query('SELECT * FROM venues WHERE id = $1 AND owner_id = $2', [params.id, decoded.userId])

    if (venue.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json(venue.rows[0])
  } catch (error: any) {
    console.error('Error fetching venue:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = cookies()
    const tokenFromCookie = cookieStore.get('authToken')?.value
    const authHeader = request.headers.get('Authorization')

    const token = tokenFromCookie || authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production') as any

    const { name, address, city, state, zip_code, phone_number, description, image_url } = await request.json()

    // Check if venue belongs to user
    const venueCheck = await query(
      'SELECT id FROM venues WHERE id = $1 AND owner_id = $2',
      [params.id, decoded.userId]
    )

    if (venueCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Venue not found or unauthorized' },
        { status: 404 }
      )
    }

    const updatedVenue = await query(
      'UPDATE venues SET name = $1, address = $2, city = $3, state = $4, zip_code = $5, phone_number = $6, description = $7, image_url = $8 WHERE id = $9 RETURNING *',
      [name, address, city, state, zip_code, phone_number, description, image_url, params.id]
    )

    return NextResponse.json(updatedVenue.rows[0])
  } catch (error: any) {
    console.error('Error updating venue:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}