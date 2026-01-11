import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Cookie'den veya Authorization header'dan token al
    const { cookies } = await import('next/headers')
    const cookieStore = cookies()
    const tokenFromCookie = cookieStore.get('authToken')?.value
    const authHeader = request.headers.get('Authorization')
    
    const token = tokenFromCookie || authHeader?.replace('Bearer ', '')
    
    console.log('Token source:', tokenFromCookie ? 'cookie' : 'header')

    if (!token) {
      console.log('No token found')
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    console.log('Token payload:', payload)

    if (!payload || !payload.userId) {
      console.log('Invalid token payload')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = payload.userId as number
    const { slug } = params

    console.log('Looking for venue:', { slug, userId })

    const result = await query(
      'SELECT id, slug, name, logo FROM venues WHERE slug = $1 AND owner_id = $2',
      [slug, userId]
    )

    console.log('Venue query result:', result.rows.length)

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const venueId = result.rows[0].id;

    // Get stats
    const statsResult = await query(`
      SELECT 
        (SELECT COUNT(*) FROM items i 
         INNER JOIN categories c ON i.category_id = c.id 
         WHERE c.venue_id = $1) as item_count,
        (SELECT COUNT(*) FROM categories WHERE venue_id = $1) as category_count,
        (SELECT COUNT(*) FROM orders WHERE venue_id = $1) as order_count
    `, [venueId])

    const venue = {
      ...result.rows[0],
      item_count: parseInt(statsResult.rows[0].item_count),
      category_count: parseInt(statsResult.rows[0].category_count),
      order_count: parseInt(statsResult.rows[0].order_count)
    }

    return NextResponse.json({
      id: venue.id,
      slug: venue.slug,
      name: venue.name,
      logo: venue.logo,
      item_count: venue.item_count,
      category_count: venue.category_count,
      order_count: venue.order_count
    })
  } catch (error) {
    console.error('Error fetching venue:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}