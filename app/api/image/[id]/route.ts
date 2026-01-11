import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const imageId = parseInt(params.id)
    
    if (isNaN(imageId)) {
      return NextResponse.json({ error: 'Invalid image ID' }, { status: 400 })
    }

    const result = await pool.query(
      'SELECT data, mime_type, filename FROM uploaded_images WHERE id = $1',
      [imageId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    const { data, mime_type } = result.rows[0]

    const buffer = Buffer.from(data, 'base64')

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mime_type,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error: any) {
    console.error('Error serving image:', error)
    return NextResponse.json({ error: 'Failed to load image' }, { status: 500 })
  }
}
