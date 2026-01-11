import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Try to get token from Authorization header first, then from cookie
    let token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      const cookies = request.headers.get('cookie')
      const adminTokenMatch = cookies?.match(/adminToken=([^;]+)/)
      const userTokenMatch = cookies?.match(/userToken=([^;]+)/)
      const authTokenMatch = cookies?.match(/authToken=([^;]+)/)
      token = adminTokenMatch?.[1] || userTokenMatch?.[1] || authTokenMatch?.[1] || undefined
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get venue ID and verify ownership
    const venueResult = await query(
      'SELECT id, owner_id FROM venues WHERE slug = $1',
      [params.slug]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const venue = venueResult.rows[0]

    // Admin can access all venues, regular users only their own
    const isAdmin = payload.username === 'admin'
    if (!isAdmin && Number(venue.owner_id) !== Number(payload.userId)) {
      console.log('Reviews access denied: userId', payload.userId, '(type:', typeof payload.userId, ') trying to access venue owned by', venue.owner_id, '(type:', typeof venue.owner_id, ')')
      return NextResponse.json({ error: 'Unauthorized - not venue owner' }, { status: 403 })
    }

    const venueId = venue.id

    // Get all reviews for this venue
    const result = await query(
      `SELECT 
        r.id,
        r.customer_name,
        r.rating,
        r.comment,
        r.is_approved,
        r.created_at,
        i.name as item_name,
        i.id as item_id
      FROM reviews r
      JOIN items i ON r.item_id = i.id
      JOIN categories c ON i.category_id = c.id
      WHERE c.venue_id = $1
      ORDER BY r.is_approved ASC, r.created_at DESC`,
      [venueId]
    )

    return NextResponse.json({ reviews: result.rows })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Try to get token from Authorization header first, then from cookie
    let token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      const cookies = request.headers.get('cookie')
      const adminTokenMatch = cookies?.match(/adminToken=([^;]+)/)
      const userTokenMatch = cookies?.match(/userToken=([^;]+)/)
      const authTokenMatch = cookies?.match(/authToken=([^;]+)/)
      token = adminTokenMatch?.[1] || userTokenMatch?.[1] || authTokenMatch?.[1] || undefined
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Verify venue ownership
    const venueResult = await query(
      'SELECT id, owner_id FROM venues WHERE slug = $1',
      [params.slug]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const venue = venueResult.rows[0]

    // Admin can access all venues, regular users only their own
    const isAdmin = payload.username === 'admin'
    if (!isAdmin && Number(venue.owner_id) !== Number(payload.userId)) {
      console.log('Reviews access denied: userId', payload.userId, '(type:', typeof payload.userId, ') trying to access venue owned by', venue.owner_id, '(type:', typeof venue.owner_id, ')')
      return NextResponse.json({ error: 'Unauthorized - not venue owner' }, { status: 403 })
    }

    const { reviewId, is_approved } = await request.json()

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 })
    }

    const result = await query(
      'UPDATE reviews SET is_approved = $1 WHERE id = $2 RETURNING *',
      [is_approved, reviewId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Verify venue ownership
    const venueResult = await query(
      'SELECT id, owner_id FROM venues WHERE slug = $1',
      [params.slug]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    if (Number(venueResult.rows[0].owner_id) !== Number(payload.userId)) {
      return NextResponse.json({ error: 'Unauthorized - not venue owner' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get('id')

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 })
    }

    await query('DELETE FROM reviews WHERE id = $1', [reviewId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}