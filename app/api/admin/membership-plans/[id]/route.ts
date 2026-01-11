
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { monthlyPrice, yearlyPrice, features, isActive, displayOrder } = await request.json()

    const result = await query(`
      UPDATE membership_plans 
      SET monthly_price = $1, yearly_price = $2, features = $3, is_active = $4, display_order = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [monthlyPrice, yearlyPrice, JSON.stringify(features), isActive, displayOrder, params.id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, plan: result.rows[0] })
  } catch (error) {
    console.error('Error updating membership plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    await query('DELETE FROM membership_plans WHERE id = $1', [params.id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting membership plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
