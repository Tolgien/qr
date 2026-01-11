
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'


export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const venueResult = await query(`
      SELECT 
        v.*,
        COUNT(DISTINCT i.id) as total_items,
        COUNT(DISTINCT c.id) as total_categories,
        0 as total_orders
      FROM venues v
      LEFT JOIN categories c ON c.venue_id = v.id
      LEFT JOIN items i ON i.category_id = c.id
      WHERE v.slug = $1
      GROUP BY v.id
    `, [params.slug])

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const row = venueResult.rows[0]
    return NextResponse.json({
      id: row.id,
      slug: row.slug,
      name: row.name,
      logo: row.logo,
      coverImage: row.cover_image,
      website: row.website,
      wifiPassword: row.wifi_password,
      address: row.address,
      phone: row.phone,
      totalItems: parseInt(row.total_items) || 0,
      totalCategories: parseInt(row.total_categories) || 0,
      totalOrders: parseInt(row.total_orders) || 0,
      status: row.status
    })
  } catch (error) {
    console.error('Error fetching venue:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    console.log('Auth header:', authHeader)
    
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      console.log('No token provided')
      return NextResponse.json({ error: 'Token bulunamadı. Lütfen tekrar giriş yapın.' }, { status: 401 })
    }

    console.log('Verifying token...')
    const payload = await verifyToken(token)
    console.log('Token payload:', payload)
    
    if (!payload) {
      console.log('Token verification failed')
      return NextResponse.json({ error: 'Token geçersiz. Lütfen tekrar giriş yapın.' }, { status: 401 })
    }

    // Verify venue exists and user has access
    const venueCheck = await query('SELECT id FROM venues WHERE slug = $1', [params.slug])
    if (venueCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const body = await request.json()
    const { 
      name, logo, cover_image, coverImage, website, wifi_password, wifiPassword, 
      address, phone, status
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Support both cover_image and coverImage field names
    const coverImageValue = cover_image || coverImage
    const wifiPasswordValue = wifi_password || wifiPassword

    const result = await query(`
      UPDATE venues 
      SET name = $1, logo = $2, cover_image = $3, website = $4, wifi_password = $5, 
          address = $6, phone = $7, status = $8, updated_at = NOW()
      WHERE slug = $9
      RETURNING *
    `, [
      name, 
      logo || null, 
      coverImageValue || null, 
      website || null, 
      wifiPasswordValue || null, 
      address || null, 
      phone || null, 
      status || 'open',
      params.slug
    ])

    const row = result.rows[0]
    return NextResponse.json({
      id: row.id,
      slug: row.slug,
      name: row.name,
      logo: row.logo,
      coverImage: row.cover_image,
      website: row.website,
      wifiPassword: row.wifi_password,
      address: row.address,
      phone: row.phone,
      status: row.status
    })
  } catch (error) {
    console.error('Error updating venue:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
