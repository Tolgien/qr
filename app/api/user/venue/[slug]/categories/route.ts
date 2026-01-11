import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

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

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = jwt.verify(token, JWT_SECRET) as any

    const venueResult = await query(
      'SELECT id, owner_id FROM venues WHERE slug = $1',
      [params.slug]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    if (Number(venueResult.rows[0].owner_id) !== Number(payload.userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const venueId = venueResult.rows[0].id

    const categoriesResult = await query(
      `SELECT c.id, c.name, c.display_order, COUNT(i.id) as item_count
       FROM categories c
       LEFT JOIN items i ON i.category_id = c.id
       WHERE c.venue_id = $1
       GROUP BY c.id
       ORDER BY c.display_order`,
      [venueId]
    )

    const categories = categoriesResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      display_order: row.display_order,
      itemCount: parseInt(row.item_count)
    }))

    return NextResponse.json({ categories })
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
    // Cookie'den veya Authorization header'dan token al
    const { cookies } = await import('next/headers')
    const cookieStore = cookies()
    const tokenFromCookie = cookieStore.get('authToken')?.value
    const authHeader = request.headers.get('Authorization')

    const token = tokenFromCookie || authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = jwt.verify(token, JWT_SECRET) as any
    const { name } = await request.json()

    const venueResult = await query(
      'SELECT id, owner_id FROM venues WHERE slug = $1',
      [params.slug]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    if (Number(venueResult.rows[0].owner_id) !== Number(payload.userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const venueId = venueResult.rows[0].id

    const maxOrderResult = await query(
      'SELECT COALESCE(MAX(display_order), 0) as max_order FROM categories WHERE venue_id = $1',
      [venueId]
    )

    const newOrder = maxOrderResult.rows[0].max_order + 1

    const result = await query(
      'INSERT INTO categories (venue_id, name, display_order) VALUES ($1, $2, $3) RETURNING id',
      [venueId, name, newOrder]
    )

    return NextResponse.json({ success: true, id: result.rows[0].id })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}