
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import bcrypt from 'bcrypt'

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

    const result = await query(
      'SELECT id, username FROM admin_users WHERE id = $1',
      [payload.userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching admin profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { username, password } = await request.json()

    if (!username || !username.trim()) {
      return NextResponse.json({ error: 'Kullanıcı adı gerekli' }, { status: 400 })
    }

    // Check if username is already taken by another admin
    const existingUser = await query(
      'SELECT id FROM admin_users WHERE username = $1 AND id != $2',
      [username, payload.userId]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: 'Bu kullanıcı adı zaten kullanımda' }, { status: 400 })
    }

    // Update username and optionally password
    if (password && password.trim()) {
      const passwordHash = await bcrypt.hash(password, 10)
      await query(
        'UPDATE admin_users SET username = $1, password_hash = $2 WHERE id = $3',
        [username, passwordHash, payload.userId]
      )
    } else {
      await query(
        'UPDATE admin_users SET username = $1 WHERE id = $2',
        [username, payload.userId]
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating admin profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
