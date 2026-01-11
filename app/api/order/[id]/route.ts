import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { updateItemAssociations } from '@/lib/collaborative-filtering'

export const dynamic = 'force-dynamic'


export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()

    const result = await query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Sipariş tamamlandığında ürün ilişkilerini güncelle
    if (status === 'completed' || status === 'delivered') {
      await updateItemAssociations(parseInt(params.id))
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}