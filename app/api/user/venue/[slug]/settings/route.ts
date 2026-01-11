import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Cookie'den veya Authorization header'dan token al
    const { cookies } = await import('next/headers')
    const cookieStore = cookies()
    const tokenFromCookie = cookieStore.get('authToken')?.value
    const authHeader = request.headers.get('Authorization')

    const token = tokenFromCookie || authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = jwt.verify(token, JWT_SECRET) as any

    const result = await query(
      'SELECT name, slug, logo, cover_image, description, theme, status, online_ordering_enabled, address, phone, website, wifi_password, languages FROM venues WHERE slug = $1 AND owner_id = $2',
      [params.slug, payload.userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    return NextResponse.json({
      name: result.rows[0].name,
      slug: result.rows[0].slug,
      logo: result.rows[0].logo,
      coverImage: result.rows[0].cover_image,
      description: result.rows[0].description,
      theme: result.rows[0].theme || 'modern',
      status: result.rows[0].status,
      onlineOrderingEnabled: result.rows[0].online_ordering_enabled || false,
      address: result.rows[0].address,
      phone: result.rows[0].phone,
      website: result.rows[0].website,
      wifiPassword: result.rows[0].wifi_password,
      languages: result.rows[0].languages || ['tr', 'en']
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Cookie'den veya Authorization header'dan token al
    const { cookies } = await import('next/headers')
    const cookieStore = cookies()
    const tokenFromCookie = cookieStore.get('authToken')?.value
    const authHeader = request.headers.get('Authorization')

    const token = tokenFromCookie || authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = jwt.verify(token, JWT_SECRET) as any
    const { name, description, status, logo, coverImage, theme, onlineOrderingEnabled, address, phone, website, wifiPassword, languages } = await request.json()

    // Check user's membership tier to validate online ordering permission
    const userResult = await query(
      'SELECT membership_tier FROM users WHERE id = $1',
      [payload.userId]
    )

    let allowOnlineOrdering = onlineOrderingEnabled
    if (userResult.rows.length > 0) {
      const membershipTier = userResult.rows[0].membership_tier
      // Only premium users can enable online ordering
      if (membershipTier !== 'premium' && onlineOrderingEnabled) {
        allowOnlineOrdering = false
      }
    }

    const validLanguages = ['tr', 'en', 'de', 'ar']
    const filteredLanguages = (languages || ['tr', 'en']).filter((lang: string) => validLanguages.includes(lang))
    const finalLanguages = filteredLanguages.length > 0 ? filteredLanguages : ['tr', 'en']

    await query(
      'UPDATE venues SET name = $1, description = $2, status = $3, logo = $4, cover_image = $5, theme = $6, online_ordering_enabled = $7, address = $8, phone = $9, website = $10, wifi_password = $11, languages = $12, updated_at = CURRENT_TIMESTAMP WHERE slug = $13 AND owner_id = $14',
      [name, description, status, logo, coverImage, theme || 'modern', allowOnlineOrdering, address, phone, website, wifiPassword, finalLanguages, params.slug, payload.userId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}