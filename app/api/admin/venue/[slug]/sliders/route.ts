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

    const venueResult = await query(
      'SELECT id FROM venues WHERE slug = $1',
      [params.slug]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const venueId = venueResult.rows[0].id

    const slidersResult = await query(
      `SELECT id, image, title, description, display_order as "displayOrder", is_active as "isActive", 
       created_at as "createdAt", updated_at as "updatedAt"
       FROM sliders 
       WHERE venue_id = $1 
       ORDER BY display_order ASC, created_at ASC`,
      [venueId]
    )

    return NextResponse.json({ sliders: slidersResult.rows })
  } catch (error) {
    console.error('Error fetching sliders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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

    const venueResult = await query(
      'SELECT id FROM venues WHERE slug = $1',
      [params.slug]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const venueId = venueResult.rows[0].id

    // Check if venue already has 3 sliders
    const countResult = await query(
      'SELECT COUNT(*) as count FROM sliders WHERE venue_id = $1',
      [venueId]
    )

    if (parseInt(countResult.rows[0].count) >= 3) {
      return NextResponse.json(
        { error: 'Maximum 3 sliders allowed per venue' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { image = '', title = '', description = '', isActive = true } = body

    // Get next display order
    const orderResult = await query(
      'SELECT COALESCE(MAX(display_order), -1) + 1 as next_order FROM sliders WHERE venue_id = $1',
      [venueId]
    )
    const nextOrder = orderResult.rows[0].next_order

    const result = await query(
      `INSERT INTO sliders (venue_id, image, title, description, display_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, image, title, description, display_order as "displayOrder", is_active as "isActive", 
                 created_at as "createdAt", updated_at as "updatedAt"`,
      [venueId, image, title || null, description || null, nextOrder, isActive]
    )

    return NextResponse.json({ slider: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating slider:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
