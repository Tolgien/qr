
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const cookies = request.headers.get('cookie')
    const adminTokenMatch = cookies?.match(/adminToken=([^;]+)/)
    const userTokenMatch = cookies?.match(/userToken=([^;]+)/)
    const authTokenMatch = cookies?.match(/authToken=([^;]+)/)
    const cookieToken = adminTokenMatch?.[1] || userTokenMatch?.[1] || authTokenMatch?.[1]
    
    let token = cookieToken
    let tokenSource = 'cookie'
    
    if (!token) {
      token = request.headers.get('Authorization')?.replace('Bearer ', '')
      tokenSource = 'header'
    } else {
      const authHeader = request.headers.get('Authorization')
      if (authHeader) {
        console.warn('Ignoring Authorization header - cookie-based auth takes precedence')
      }
    }
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get venue
    const venueResult = await query(
      'SELECT id, owner_id FROM venues WHERE slug = $1',
      [params.slug]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const venue = venueResult.rows[0]

    // Admin can access all venues, regular users only their own
    const isAdmin = payload.username === 'admin'
    if (!isAdmin && Number(venue.owner_id) !== Number(payload.userId)) {
      console.log('Waiter calls access denied: userId', payload.userId, '(type:', typeof payload.userId, ') trying to access venue owned by', venue.owner_id, '(type:', typeof venue.owner_id, ')')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get waiter calls
    const callsResult = await query(
      `SELECT id, table_number, message, status, created_at
       FROM waiter_calls
       WHERE venue_id = $1 AND status = 'pending'
       ORDER BY created_at DESC`,
      [venue.id]
    )

    return NextResponse.json({ calls: callsResult.rows })
  } catch (error) {
    console.error('Error fetching waiter calls:', error)
    return NextResponse.json(
      { error: 'Failed to fetch waiter calls' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const cookies = request.headers.get('cookie')
    const adminTokenMatch = cookies?.match(/adminToken=([^;]+)/)
    const userTokenMatch = cookies?.match(/userToken=([^;]+)/)
    const authTokenMatch = cookies?.match(/authToken=([^;]+)/)
    const cookieToken = adminTokenMatch?.[1] || userTokenMatch?.[1] || authTokenMatch?.[1]
    
    let token = cookieToken
    
    if (!token) {
      token = request.headers.get('Authorization')?.replace('Bearer ', '')
    } else {
      const authHeader = request.headers.get('Authorization')
      if (authHeader) {
        console.warn('Ignoring Authorization header - cookie-based auth takes precedence')
      }
    }
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get venue to verify ownership
    const venueResult = await query(
      'SELECT id, owner_id FROM venues WHERE slug = $1',
      [params.slug]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const venue = venueResult.rows[0]

    // Admin can update all waiter calls, regular users only their venue's calls
    const isAdmin = payload.username === 'admin'
    if (!isAdmin && Number(venue.owner_id) !== Number(payload.userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { callId, status } = await request.json()

    // Update waiter call status
    await query(
      'UPDATE waiter_calls SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, callId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating waiter call:', error)
    return NextResponse.json(
      { error: 'Failed to update waiter call' },
      { status: 500 }
    )
  }
}
