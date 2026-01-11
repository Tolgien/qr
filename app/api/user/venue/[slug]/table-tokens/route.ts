
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Generate a secure random token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// GET - List all table tokens for a venue
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Cookie'den veya Authorization header'dan token al
    const cookieStore = await cookies()
    const tokenFromCookie = cookieStore.get('authToken')?.value
    const authHeader = request.headers.get('Authorization')
    
    const token = tokenFromCookie || authHeader?.replace('Bearer ', '')
    
    console.log('Token source:', tokenFromCookie ? 'cookie' : authHeader ? 'header' : 'none')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify JWT token
    let userId: number
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any
      userId = payload.userId
      console.log('Token payload:', payload)
    } catch (error) {
      console.error('JWT verification failed:', error)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const venueResult = await query(
      'SELECT id FROM venues WHERE slug = $1 AND owner_id = $2',
      [params.slug, userId]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const venueId = venueResult.rows[0].id

    // Get all table tokens
    const tokensResult = await query(
      `SELECT id, table_number, token, is_active, created_at, last_used
       FROM table_tokens
       WHERE venue_id = $1
       ORDER BY table_number ASC`,
      [venueId]
    )

    return NextResponse.json({ tokens: tokensResult.rows })
  } catch (error) {
    console.error('Error fetching table tokens:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Generate new table token
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Cookie'den veya Authorization header'dan token al
    const cookieStore = await cookies()
    const tokenFromCookie = cookieStore.get('authToken')?.value
    const authHeader = request.headers.get('Authorization')
    
    const token = tokenFromCookie || authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tableNumber } = body

    if (!tableNumber) {
      return NextResponse.json(
        { error: 'Masa numarası gerekli' },
        { status: 400 }
      )
    }

    // Verify JWT token
    let userId: number
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any
      userId = payload.userId
    } catch (error) {
      console.error('JWT verification failed:', error)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const venueResult = await query(
      'SELECT id FROM venues WHERE slug = $1 AND owner_id = $2',
      [params.slug, userId]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const venueId = venueResult.rows[0].id

    // Generate unique token
    const tableToken = generateToken()

    // Insert or update table token
    const result = await query(
      `INSERT INTO table_tokens (venue_id, table_number, token, is_active)
       VALUES ($1, $2, $3, TRUE)
       ON CONFLICT (venue_id, table_number)
       DO UPDATE SET token = $3, is_active = TRUE, created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [venueId, tableNumber, tableToken]
    )

    return NextResponse.json({
      success: true,
      tableToken: result.rows[0]
    })
  } catch (error) {
    console.error('Error generating table token:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Deactivate a table token
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Cookie'den veya Authorization header'dan token al
    const cookieStore = await cookies()
    const tokenFromCookie = cookieStore.get('authToken')?.value
    const authHeader = request.headers.get('Authorization')
    
    const token = tokenFromCookie || authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const tableTokenId = searchParams.get('id')

    if (!tableTokenId) {
      return NextResponse.json(
        { error: 'Token ID gerekli' },
        { status: 400 }
      )
    }

    // Verify JWT token
    let userId: number
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any
      userId = payload.userId
    } catch (error) {
      console.error('JWT verification failed:', error)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const venueResult = await query(
      'SELECT id FROM venues WHERE slug = $1 AND owner_id = $2',
      [params.slug, userId]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const venueId = venueResult.rows[0].id

    // Deactivate token
    await query(
      'UPDATE table_tokens SET is_active = FALSE WHERE id = $1 AND venue_id = $2',
      [tableTokenId, venueId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deactivating table token:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
