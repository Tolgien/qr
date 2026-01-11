
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

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

    // Verify venue ownership
    const venueResult = await query(
      'SELECT id FROM venues WHERE slug = $1 AND owner_id = $2',
      [params.slug, payload.userId]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const venueId = venueResult.rows[0].id
    const { items } = await request.json()

    // Update display_order for each item
    for (const item of items) {
      await query(
        `UPDATE items 
         SET display_order = $1 
         WHERE id = $2 
         AND category_id IN (SELECT id FROM categories WHERE venue_id = $3)`,
        [item.display_order, item.id, venueId]
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering items:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
