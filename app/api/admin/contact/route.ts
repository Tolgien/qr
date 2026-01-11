
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyAdminToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'


export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isValid = await verifyAdminToken(token)
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await query(
      `SELECT * FROM contact_messages ORDER BY created_at DESC`
    )

    return NextResponse.json({ messages: result.rows })
  } catch (error: any) {
    console.error('Error fetching contact messages:', error)
    return NextResponse.json(
      { error: 'Mesajlar yüklenemedi' },
      { status: 500 }
    )
  }
}
