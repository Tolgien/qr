
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
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

    if (!payload || !payload.userId) {
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

    // Check user's membership limits
    const userResult = await query(
      `SELECT u.membership_tier,
       (SELECT COUNT(*) FROM venues WHERE owner_id = $1) as current_venues
       FROM users u
       WHERE u.id = $1`,
      [userId]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { membership_tier, current_venues } = userResult.rows[0]
    
    // Set venue limits based on membership tier
    let max_venues = null
    if (membership_tier === 'free') {
      max_venues = 1
    } else if (membership_tier === 'basic') {
      max_venues = 3
    }
    // premium has unlimited venues (max_venues = null)
    
    if (max_venues !== null && parseInt(current_venues) >= max_venues) {
      return NextResponse.json({ 
        error: `Üyelik planınız maksimum ${max_venues} kafe oluşturmanıza izin veriyor. Daha fazla kafe eklemek için planınızı yükseltin.` 
      }, { status: 403 })
    }

    // Insert new venue with owner
    const result = await query(
      `INSERT INTO venues (owner_id, slug, name, logo, cover_image, status, languages)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, slug, name, logo || null, cover_image || null, status || 'open', languages || ['tr', 'en']]
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
