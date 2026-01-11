
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

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
      'SELECT * FROM blog_posts ORDER BY created_at DESC'
    )

    return NextResponse.json({ posts: result.rows })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { 
      slug, 
      title, 
      content, 
      excerpt, 
      image, 
      seo_title, 
      seo_description, 
      keywords,
      is_published 
    } = await request.json()

    if (!slug || !title || !content) {
      return NextResponse.json({ error: 'Slug, title ve content gereklidir' }, { status: 400 })
    }

    // Check if slug already exists
    const existingPost = await query(
      'SELECT id FROM blog_posts WHERE slug = $1',
      [slug]
    )

    if (existingPost.rows.length > 0) {
      return NextResponse.json({ error: 'Bu slug zaten kullanımda' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO blog_posts (
        slug, title, content, excerpt, image, 
        seo_title, seo_description, keywords, 
        is_published, published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        slug,
        title,
        content,
        excerpt || null,
        image || null,
        seo_title || title,
        seo_description || excerpt,
        keywords || [],
        is_published || false,
        is_published ? new Date() : null
      ]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
