import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function PUT(
  request: Request,
  { params }: { params: { slug: string; id: string } }
) {
  try {
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

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Kategori adı gerekli' }, { status: 400 })
    }

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

    const result = await query(
      'UPDATE categories SET name = $1 WHERE id = $2 AND venue_id = $3 RETURNING *',
      [name, params.id, venueId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Kategori bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string; id: string } }
) {
  try {
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

    await query(
      'DELETE FROM categories WHERE id = $1 AND venue_id = $2',
      [params.id, venueId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}