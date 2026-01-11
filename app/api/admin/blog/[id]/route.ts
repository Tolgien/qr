
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
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

    const result = await query(
      'SELECT * FROM blog_posts WHERE id = $1',
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Blog yazısı bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
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

    if (!title || !content) {
      return NextResponse.json({ error: 'Title ve content gereklidir' }, { status: 400 })
    }

    // Check if slug is being changed and if new slug exists
    if (slug) {
      const existingPost = await query(
        'SELECT id FROM blog_posts WHERE slug = $1 AND id != $2',
        [slug, params.id]
      )

      if (existingPost.rows.length > 0) {
        return NextResponse.json({ error: 'Bu slug zaten kullanımda' }, { status: 400 })
      }
    }

    const result = await query(
      `UPDATE blog_posts SET
        slug = COALESCE($1, slug),
        title = $2,
        content = $3,
        excerpt = $4,
        image = $5,
        seo_title = $6,
        seo_description = $7,
        keywords = $8,
        is_published = $9,
        published_at = CASE 
          WHEN $9 = true AND published_at IS NULL THEN NOW() 
          WHEN $9 = false THEN NULL
          ELSE published_at 
        END,
        updated_at = NOW()
      WHERE id = $10
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
        params.id
      ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Blog yazısı bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    await query('DELETE FROM blog_posts WHERE id = $1', [params.id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
