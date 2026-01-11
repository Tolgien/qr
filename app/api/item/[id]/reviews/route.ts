import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id

    // Get only approved reviews for the item
    const reviewsResult = await query(
      `SELECT 
        r.id,
        r.customer_name,
        r.rating,
        r.comment,
        r.created_at
      FROM reviews r
      WHERE r.item_id = $1 AND r.is_approved = true
      ORDER BY r.created_at DESC`,
      [itemId]
    )

    // Calculate average rating from approved reviews only
    const avgResult = await query(
      `SELECT 
        COALESCE(AVG(rating), 0) as avg_rating,
        COUNT(*) as total_reviews
      FROM reviews
      WHERE item_id = $1 AND is_approved = true`,
      [itemId]
    )

    return NextResponse.json({
      reviews: reviewsResult.rows,
      averageRating: avgResult.rows[0]?.avg_rating || 0,
      totalReviews: avgResult.rows[0]?.total_reviews || 0
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { customer_name, rating, comment } = await request.json()

    if (!customer_name || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Geçersiz değerlendirme verisi' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO reviews (item_id, customer_name, rating, comment) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [params.id, customer_name, rating, comment || null]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}