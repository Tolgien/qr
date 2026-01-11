
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'


export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const result = await query(
      'SELECT * FROM blog_posts WHERE slug = $1 AND is_published = true',
      [params.slug]
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
