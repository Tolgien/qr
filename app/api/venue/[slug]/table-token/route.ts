
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const tableNumber = searchParams.get('table')

    if (!token || !tableNumber) {
      return NextResponse.json(
        { error: 'Token ve masa numarası gerekli' },
        { status: 400 }
      )
    }

    // Get venue
    const venueResult = await query(
      'SELECT id FROM venues WHERE slug = $1',
      [params.slug]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Mekan bulunamadı' },
        { status: 404 }
      )
    }

    const venueId = venueResult.rows[0].id

    // Validate token
    const tokenResult = await query(
      `SELECT id, table_number, is_active 
       FROM table_tokens 
       WHERE venue_id = $1 AND token = $2 AND table_number = $3`,
      [venueId, token, tableNumber]
    )

    if (tokenResult.rows.length === 0 || !tokenResult.rows[0].is_active) {
      return NextResponse.json(
        { valid: false, error: 'Geçersiz masa QR kodu' },
        { status: 401 }
      )
    }

    // Update last used
    await query(
      'UPDATE table_tokens SET last_used = CURRENT_TIMESTAMP WHERE id = $1',
      [tokenResult.rows[0].id]
    )

    return NextResponse.json({
      valid: true,
      tableNumber: tokenResult.rows[0].table_number
    })
  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { error: 'Doğrulama hatası' },
      { status: 500 }
    )
  }
}
