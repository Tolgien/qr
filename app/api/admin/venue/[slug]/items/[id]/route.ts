import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'


export async function GET(
  request: Request,
  { params }: { params: { slug: string; id: string } }
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

    const result = await query(
      `SELECT i.* FROM items i
       JOIN categories c ON c.id = i.category_id
       JOIN venues v ON v.id = c.venue_id
       WHERE i.id = $1 AND v.slug = $2`,
      [params.id, params.slug]
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
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { 
      category_id, name, description, price, image, is_available,
      calories, protein, carbs, fat, fiber, sugar, sodium,
      preparation_time, serving_size, ingredients, origin, 
      storage_instructions, allergens, dietary_info, tags
    } = await request.json()

    if (!category_id || !name || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await query(
      `UPDATE items 
       SET category_id = $1, name = $2, description = $3, price = $4, image = $5, is_available = $6,
           calories = $7, protein = $8, carbs = $9, fat = $10, fiber = $11, sugar = $12, sodium = $13,
           preparation_time = $14, serving_size = $15, ingredients = $16, origin = $17,
           storage_instructions = $18, allergens = $19, dietary_info = $20, tags = $21,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $22
       RETURNING *`,
      [
        category_id, name, description, price, image, is_available !== false,
        calories, protein, carbs, fat, fiber, sugar, sodium,
        preparation_time, serving_size, ingredients, origin,
        storage_instructions, allergens || [], dietary_info || [], tags || [],
        params.id
      ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { slug: string; id: string } }
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

    const body = await request.json()

    await query(
      'UPDATE items SET is_available = $1 WHERE id = $2',
      [body.is_available, params.id]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating item availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string; id: string } }
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

    const result = await query(
      'DELETE FROM items WHERE id = $1 RETURNING *',
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}