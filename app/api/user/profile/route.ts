
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function GET(request: Request) {
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
    if (!payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user with membership details
    const userResult = await query(`
      SELECT 
        u.id, u.email, u.name, u.membership_tier, u.membership_expires_at,
        mp.max_categories, mp.max_items, mp.features
      FROM users u
      LEFT JOIN membership_plans mp ON mp.tier = u.membership_tier
      WHERE u.id = $1
    `, [payload.userId])

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = userResult.rows[0]

    // Get user's venues count
    const venuesResult = await query(
      'SELECT COUNT(*) as total FROM venues WHERE owner_id = $1',
      [user.id]
    )

    // Get total categories count across all user's venues
    const categoriesResult = await query(
      `SELECT COUNT(*) as total 
       FROM categories c
       INNER JOIN venues v ON c.venue_id = v.id
       WHERE v.owner_id = $1`,
      [user.id]
    )

    // Get total items count across all user's venues
    const itemsResult = await query(
      `SELECT COUNT(*) as total 
       FROM items i
       INNER JOIN categories c ON i.category_id = c.id
       INNER JOIN venues v ON c.venue_id = v.id
       WHERE v.owner_id = $1`,
      [user.id]
    )

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      membershipTier: user.membership_tier,
      membershipExpiresAt: user.membership_expires_at,
      limits: {
        maxCategories: user.max_categories,
        maxItems: user.max_items
      },
      currentUsage: {
        categories: parseInt(categoriesResult.rows[0].total),
        items: parseInt(itemsResult.rows[0].total)
      },
      features: user.features,
      venuesCount: parseInt(venuesResult.rows[0].total)
    })
  } catch (error) {
    console.error('Profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
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
    if (!payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { name, email, password } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'İsim ve email gerekli' }, { status: 400 })
    }

    // Check if email is already used by another user
    const emailCheck = await query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, payload.userId]
    )

    if (emailCheck.rows.length > 0) {
      return NextResponse.json({ error: 'Bu email adresi zaten kullanılıyor' }, { status: 400 })
    }

    // Update user
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      await query(
        'UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4',
        [name, email, hashedPassword, payload.userId]
      )
    } else {
      await query(
        'UPDATE users SET name = $1, email = $2 WHERE id = $3',
        [name, email, payload.userId]
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
