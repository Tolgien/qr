import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PUT(
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
    const body = await request.json()
    const { sliderIds } = body

    if (!Array.isArray(sliderIds)) {
      return NextResponse.json(
        { error: 'sliderIds must be an array' },
        { status: 400 }
      )
    }

    // Update display_order for each slider
    for (let i = 0; i < sliderIds.length; i++) {
      await query(
        'UPDATE sliders SET display_order = $1, updated_at = NOW() WHERE id = $2 AND venue_id = $3',
        [i, sliderIds[i], venueId]
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering sliders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
