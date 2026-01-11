import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function GET(
  request: Request,
  { params }: { params: { slug: string; id: string } }
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

    // Verify venue ownership and get item
    const result = await query(
      `SELECT i.* FROM items i
       JOIN categories c ON c.id = i.category_id
       JOIN venues v ON v.id = c.venue_id
       WHERE i.id = $1 AND v.slug = $2 AND v.owner_id = $3`,
      [params.id, params.slug, payload.userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const item = {
      ...result.rows[0],
      price: parseFloat(result.rows[0].price)
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string; id: string } }
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

    const { 
      name, description, price, categoryId, image, tags, allergens, isAvailable,
      calories, protein, carbs, fat, fiber, sugar, sodium,
      preparation_time, serving_size, ingredients, origin, storage_instructions, dietary_info, isFeatured
    } = await request.json()

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await query(
      `UPDATE items 
       SET category_id = $1, name = $2, description = $3, price = $4, image = $5, is_available = $6,
           calories = $7, protein = $8, carbs = $9, fat = $10, fiber = $11, sugar = $12, sodium = $13,
           preparation_time = $14, serving_size = $15, ingredients = $16, origin = $17,
           storage_instructions = $18, allergens = $19, dietary_info = $20, tags = $21, is_featured = $22,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $23
       RETURNING *`,
      [
        categoryId, name, description, price, image, isAvailable !== false,
        calories, protein, carbs, fat, fiber, sugar, sodium,
        preparation_time, serving_size, ingredients, origin,
        storage_instructions, allergens || [], dietary_info || [], tags || [], isFeatured || false,
        params.id
      ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, item: result.rows[0] })
  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string; id: string } }
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

    await query('DELETE FROM items WHERE id = $1', [params.id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}