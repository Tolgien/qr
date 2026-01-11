import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'


export async function POST(request: Request) {
  try {
    // Try to get token from Authorization header first, then from cookie
    let token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      const cookies = request.headers.get('cookie')
      const adminTokenMatch = cookies?.match(/adminToken=([^;]+)/)
      token = adminTokenMatch?.[1] || undefined
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = payload.userId as number

    const { name, slug, logo, cover_image, status, languages } = await request.json()

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    // Check if slug already exists
    const existingVenue = await query(
      'SELECT id FROM venues WHERE slug = $1',
      [slug]
    )

    if (existingVenue.rows.length > 0) {
      return NextResponse.json({ error: 'Bu slug zaten kullanımda' }, { status: 400 })
    }

    // Insert new venue with owner and admin_user_id
    const result = await query(
      `INSERT INTO venues (owner_id, slug, name, logo, cover_image, status, languages, admin_user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, slug, name, logo || null, cover_image || null, status || 'open', languages || ['tr', 'en'], payload.userId]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error creating venue:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}