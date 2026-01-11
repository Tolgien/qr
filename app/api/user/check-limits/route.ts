
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

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

    const payload = jwt.verify(token, JWT_SECRET) as any
    const { venueId, type } = await request.json() // type: 'category' or 'item'

    // Get user's membership limits
    const userResult = await query(`
      SELECT u.membership_tier, mp.max_categories, mp.max_items
      FROM users u
      LEFT JOIN membership_plans mp ON mp.tier = u.membership_tier
      WHERE u.id = $1
    `, [payload.userId])

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { max_categories, max_items } = userResult.rows[0]

    if (type === 'category') {
      // Check total categories across all user's venues
      const countResult = await query(`
        SELECT COUNT(*) as total 
        FROM categories c
        INNER JOIN venues v ON c.venue_id = v.id
        WHERE v.owner_id = $1
      `, [payload.userId])
      const currentCount = parseInt(countResult.rows[0].total)
      
      if (max_categories !== -1 && currentCount >= max_categories) {
        return NextResponse.json({
          canAdd: false,
          reason: `Ücretsiz plan ile maksimum ${max_categories} kategori ekleyebilirsiniz. Şu anda ${currentCount} kategori kullanıyorsunuz. Daha fazla eklemek için üyeliğinizi yükseltin.`,
          currentCount,
          maxAllowed: max_categories
        })
      }
    } else if (type === 'item') {
      // Check total items across all user's venues
      const countResult = await query(`
        SELECT COUNT(*) as total 
        FROM items i 
        INNER JOIN categories c ON i.category_id = c.id
        INNER JOIN venues v ON c.venue_id = v.id
        WHERE v.owner_id = $1
      `, [payload.userId])
      const currentCount = parseInt(countResult.rows[0].total)
      
      if (max_items !== -1 && currentCount >= max_items) {
        return NextResponse.json({
          canAdd: false,
          reason: `Ücretsiz plan ile maksimum ${max_items} ürün ekleyebilirsiniz. Şu anda ${currentCount} ürün kullanıyorsunuz. Daha fazla eklemek için üyeliğinizi yükseltin.`,
          currentCount,
          maxAllowed: max_items
        })
      }
    }

    return NextResponse.json({ canAdd: true })
  } catch (error) {
    console.error('Check limits error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
