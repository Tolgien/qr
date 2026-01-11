
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'


export async function GET() {
  try {
    const result = await query(
      `SELECT id, slug, title, excerpt, image, published_at, created_at 
       FROM blog_posts 
       WHERE is_published = true 
       ORDER BY published_at DESC`
    )

    return NextResponse.json({ posts: result.rows })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
