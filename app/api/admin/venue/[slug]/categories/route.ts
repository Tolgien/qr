
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

    // Get venue ID first
    const venueResult = await query(
      'SELECT id FROM venues WHERE slug = $1',
      [params.slug]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const venueId = venueResult.rows[0].id

    // Get categories with item count
    const result = await query(`
      SELECT 
        c.id,
        c.venue_id,
        c.name,
        c.display_order,
        c.image,
        c.created_at,
        c.updated_at,
        COALESCE(COUNT(i.id), 0)::integer as item_count
      FROM categories c
      LEFT JOIN items i ON i.category_id = c.id
      WHERE c.venue_id = $1
      GROUP BY c.id, c.venue_id, c.name, c.display_order, c.image, c.created_at, c.updated_at
      ORDER BY c.display_order, c.name
    `, [venueId])

    return NextResponse.json({ categories: result.rows })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
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

    // Get venue ID
    const venueResult = await query(
      'SELECT id FROM venues WHERE slug = $1',
      [params.slug]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const venueId = venueResult.rows[0].id
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const result = await query(
      'INSERT INTO categories (venue_id, name) VALUES ($1, $2) RETURNING *',
      [venueId, name]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
