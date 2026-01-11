
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: Request,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('authToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const venueResult = await query(
      'SELECT id, owner_id FROM venues WHERE slug = $1',
      [params.slug]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const venue = venueResult.rows[0]

    if (venue.owner_id !== payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const sliderCheck = await query(
      'SELECT id FROM sliders WHERE id = $1 AND venue_id = $2',
      [params.id, venue.id]
    )

    if (sliderCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Slider not found' }, { status: 404 })
    }

    const body = await request.json()
    const { image, title, description, isActive } = body

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      )
    }

    const result = await query(
      `UPDATE sliders 
       SET image = $1, title = $2, description = $3, is_active = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING id, image, title, description, display_order as "displayOrder", is_active as "isActive", 
                 created_at as "createdAt", updated_at as "updatedAt"`,
      [image, title || null, description || null, isActive !== undefined ? isActive : true, params.id]
    )

    return NextResponse.json({ slider: result.rows[0] })
  } catch (error) {
    console.error('Error updating slider:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('authToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const venueResult = await query(
      'SELECT id, owner_id FROM venues WHERE slug = $1',
      [params.slug]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const venue = venueResult.rows[0]

    if (venue.owner_id !== payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const sliderCheck = await query(
      'SELECT id FROM sliders WHERE id = $1 AND venue_id = $2',
      [params.id, venue.id]
    )

    if (sliderCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Slider not found' }, { status: 404 })
    }

    await query('DELETE FROM sliders WHERE id = $1', [params.id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting slider:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
