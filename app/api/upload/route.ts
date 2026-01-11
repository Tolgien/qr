
import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = cookies()
    const tokenFromCookie = cookieStore.get('authToken')?.value
    const authHeader = request.headers.get('Authorization')
    
    const token = tokenFromCookie || authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Convert to Base64
    const base64Data = buffer.toString('base64')

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}-${randomString}.${extension}`

    // Save to database
    const result = await pool.query(
      `INSERT INTO uploaded_images (filename, original_name, mime_type, size, data, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [filename, file.name, file.type, file.size, base64Data, payload.userId]
    )

    const imageId = result.rows[0].id

    console.log(`✅ Image uploaded to database: ${filename} (ID: ${imageId})`)

    // Return the full image URL (will be served from database)
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const host = request.headers.get('host') || 'localhost:3000'
    const imageUrl = `${protocol}://${host}/api/image/${imageId}`

    return NextResponse.json({ url: imageUrl, id: imageId })
  } catch (error: any) {
    console.error('❌ Error uploading file:', error)
    return NextResponse.json({ 
      error: error.message || 'Resim yüklenirken bir hata oluştu' 
    }, { status: 500 })
  }
}
