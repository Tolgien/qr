
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'


export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get all users with their venue counts
    const result = await query(`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.membership_tier,
        u.membership_expires_at,
        u.created_at,
        COUNT(DISTINCT v.id) as venue_count
      FROM users u
      LEFT JOIN venues v ON v.owner_id = u.id
      GROUP BY u.id, u.email, u.name, u.membership_tier, u.membership_expires_at, u.created_at
      ORDER BY u.created_at DESC
    `)

    const users = result.rows.map(row => ({
      id: row.id,
      email: row.email,
      name: row.name,
      membershipTier: row.membership_tier,
      membershipExpiresAt: row.membership_expires_at,
      createdAt: row.created_at,
      venueCount: parseInt(row.venue_count) || 0,
    }))

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
