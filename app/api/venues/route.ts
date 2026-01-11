import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const result = await query('SELECT * FROM venues ORDER BY created_at DESC')

    // Get statistics for each venue
    const venuesWithStats = await Promise.all(
      result.rows.map(async (venue) => {
        // Get total items count (items -> categories -> venues)
        const itemsResult = await query(
          `SELECT COUNT(*) as count 
           FROM items i 
           JOIN categories c ON i.category_id = c.id 
           WHERE c.venue_id = $1`,
          [venue.id]
        )

        // Get total categories count
        const categoriesResult = await query(
          'SELECT COUNT(*) as count FROM categories WHERE venue_id = $1',
          [venue.id]
        )

        // Get total orders count
        const ordersResult = await query(
          'SELECT COUNT(*) as count FROM orders WHERE venue_id = $1',
          [venue.id]
        )

        // Get average rating from reviews (reviews -> items -> categories -> venues)
        const reviewsResult = await query(
          `SELECT AVG(r.rating) as avg_rating, COUNT(*) as review_count 
           FROM reviews r
           JOIN items i ON r.item_id = i.id
           JOIN categories c ON i.category_id = c.id
           WHERE c.venue_id = $1 AND r.is_approved = true`,
          [venue.id]
        )

        const avgRating = reviewsResult.rows[0]?.avg_rating
          ? parseFloat(reviewsResult.rows[0].avg_rating)
          : 5.0

        const reviewCount = parseInt(reviewsResult.rows[0]?.review_count || '0')

        return {
          id: venue.id.toString(),
          slug: venue.slug,
          name: venue.name,
          description: venue.description,
          logo: venue.logo,
          coverImage: venue.cover_image,
          website: venue.website,
          wifiPassword: venue.wifi_password,
          status: venue.status,
          languages: venue.languages || ['tr'],
          totalItems: parseInt(itemsResult.rows[0]?.count || '0'),
          totalCategories: parseInt(categoriesResult.rows[0]?.count || '0'),
          totalOrders: parseInt(ordersResult.rows[0]?.count || '0'),
          averageRating: Math.round(avgRating * 10) / 10,
          reviewCount: reviewCount
        }
      })
    )

    return NextResponse.json({
      venues: venuesWithStats
    })
  } catch (error) {
    console.error('Error fetching venues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch venues' },
      { status: 500 }
    )
  }
}