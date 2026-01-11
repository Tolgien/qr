import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const venueResult = await query(
      'SELECT id FROM venues WHERE slug = $1',
      [params.slug]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const venueId = venueResult.rows[0].id

    const slidersResult = await query(
      `SELECT id, image, title, description, display_order as "displayOrder"
       FROM sliders 
       WHERE venue_id = $1 AND is_active = true
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
