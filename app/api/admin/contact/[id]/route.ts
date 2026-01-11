
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyAdminToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'


export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isValid = await verifyAdminToken(token)
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { isRead } = body

    await query(
      'UPDATE contact_messages SET is_read = $1 WHERE id = $2',
      [isRead, params.id]
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating message:', error)
    return NextResponse.json(
      { error: 'Mesaj güncellenemedi' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isValid = await verifyAdminToken(token)
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await query('DELETE FROM contact_messages WHERE id = $1', [params.id])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting message:', error)
    return NextResponse.json(
      { error: 'Mesaj silinemedi' },
      { status: 500 }
    )
  }
}
