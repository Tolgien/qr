
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Veritabanından kaydedilmiş pairing önerilerini al
    const pairingsResult = await query(
      `SELECT 
        i.id,
        i.name,
        i.description,
        i.price,
        i.image,
        p.pairing_reason as "pairingReason"
      FROM item_pairings p
      JOIN items i ON p.pairing_item_id = i.id
      WHERE p.item_id = $1
      ORDER BY p.display_order
      LIMIT 3`,
      [params.id]
    )

    const items = pairingsResult.rows

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching pairing items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
