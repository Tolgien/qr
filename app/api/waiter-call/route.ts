
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const callId = searchParams.get('callId')

    if (!callId) {
      return NextResponse.json(
        { error: 'Call ID is required' },
        { status: 400 }
      )
    }

    // Get waiter call status
    const result = await query(
      'SELECT id, status, updated_at FROM waiter_calls WHERE id = $1',
      [callId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Call not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ call: result.rows[0] })
  } catch (error) {
    console.error('Error fetching waiter call status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch call status' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { venueSlug, tableNumber, tableToken, message } = await request.json()

    if (!venueSlug || !tableNumber) {
      return NextResponse.json(
        { error: 'Venue slug and table number are required' },
        { status: 400 }
      )
    }

    // Get venue ID
    const venueResult = await query(
      'SELECT id FROM venues WHERE slug = $1',
      [venueSlug]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      )
    }

    const venueId = venueResult.rows[0].id

    // Validate table token if provided (QR code validation)
    if (tableToken) {
      const tokenResult = await query(
        `SELECT id, table_number, is_active 
         FROM table_tokens 
         WHERE venue_id = $1 AND token = $2 AND table_number = $3`,
        [venueId, tableToken, tableNumber]
      )

      if (tokenResult.rows.length === 0 || !tokenResult.rows[0].is_active) {
        return NextResponse.json(
          { error: 'Invalid table QR code' },
          { status: 401 }
        )
      }

      // Update last used
      await query(
        'UPDATE table_tokens SET last_used = CURRENT_TIMESTAMP WHERE id = $1',
        [tokenResult.rows[0].id]
      )
    }

    // Insert waiter call notification
    const callResult = await query(
      `INSERT INTO waiter_calls (venue_id, table_number, message, status, created_at)
       VALUES ($1, $2, $3, 'pending', NOW())
       RETURNING id`,
      [venueId, tableNumber, message || 'Garson çağrıldı']
    )

    const callId = callResult.rows[0].id

    return NextResponse.json({ success: true, callId })
  } catch (error) {
    console.error('Error creating waiter call:', error)
    return NextResponse.json(
      { error: 'Failed to call waiter' },
      { status: 500 }
    )
  }
}
