
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

    const [
      venuesCount, 
      itemsCount, 
      categoriesCount, 
      ordersCount, 
      reviewsCount, 
      adminUsersCount
    ] = await Promise.all([
      query('SELECT COUNT(*) FROM venues'),
      query('SELECT COUNT(*) FROM items'),
      query('SELECT COUNT(*) FROM categories'),
      query('SELECT COUNT(*) FROM orders'),
      query('SELECT COUNT(*) FROM reviews WHERE is_approved = true'),
      query('SELECT COUNT(*) FROM admin_users'),
    ])

    // Get recent activity (last 7 days)
    const recentOrders = await query(`
      SELECT COUNT(*) FROM orders 
      WHERE created_at > NOW() - INTERVAL '7 days'
    `)

    const recentReviews = await query(`
      SELECT COUNT(*) FROM reviews 
      WHERE created_at > NOW() - INTERVAL '7 days'
    `)

    // Daily orders trend (last 30 days)
    const dailyOrdersTrend = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        COALESCE(SUM(total), 0)::numeric::float8 as revenue
      FROM orders
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `)

    // Weekly revenue comparison
    const weeklyRevenue = await query(`
      SELECT 
        DATE_TRUNC('week', created_at) as week,
        SUM(total) as revenue,
        COUNT(*) as order_count
      FROM orders
      WHERE created_at > NOW() - INTERVAL '12 weeks'
      GROUP BY week
      ORDER BY week ASC
    `)

    // Monthly statistics
    const monthlyStats = await query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as total_orders,
        SUM(total) as total_revenue,
        AVG(total) as avg_order_value
      FROM orders
      WHERE created_at > NOW() - INTERVAL '12 months'
      GROUP BY month
      ORDER BY month ASC
    `)

    // Top venues by revenue
    const topVenuesByRevenue = await query(`
      SELECT 
        v.name, 
        v.slug, 
        COUNT(o.id) as order_count,
        COALESCE(SUM(o.total), 0) as total_revenue
      FROM venues v
      LEFT JOIN orders o ON o.venue_id = v.id
      GROUP BY v.id, v.name, v.slug
      ORDER BY total_revenue DESC
      LIMIT 10
    `)

    // Get top venues by items
    const topVenues = await query(`
      SELECT v.name, v.slug, COUNT(i.id) as item_count
      FROM venues v
      LEFT JOIN categories c ON c.venue_id = v.id
      LEFT JOIN items i ON i.category_id = c.id
      GROUP BY v.id, v.name, v.slug
      ORDER BY item_count DESC
      LIMIT 5
    `)

    // Popular items across all venues
    const popularItems = await query(`
      SELECT 
        i.name as item_name,
        v.name as venue_name,
        COUNT(oi.id) as order_count,
        SUM(oi.quantity) as total_quantity
      FROM items i
      JOIN categories c ON i.category_id = c.id
      JOIN venues v ON c.venue_id = v.id
      LEFT JOIN order_items oi ON oi.item_id = i.id
      GROUP BY i.id, i.name, v.name
      ORDER BY order_count DESC
      LIMIT 10
    `)

    // User growth trend
    const userGrowth = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users
      FROM users
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `)

    // Membership distribution
    const membershipDistribution = await query(`
      SELECT 
        membership_tier,
        COUNT(*) as user_count
      FROM users
      GROUP BY membership_tier
      ORDER BY user_count DESC
    `)

    // Average rating per venue
    const venueRatings = await query(`
      SELECT 
        v.name as venue_name,
        v.slug,
        AVG(r.rating) as avg_rating,
        COUNT(r.id) as review_count
      FROM venues v
      LEFT JOIN categories c ON c.venue_id = v.id
      LEFT JOIN items i ON i.category_id = c.id
      LEFT JOIN reviews r ON r.item_id = i.id AND r.is_approved = true
      GROUP BY v.id, v.name, v.slug
      HAVING COUNT(r.id) > 0
      ORDER BY avg_rating DESC
      LIMIT 10
    `)

    // Get all approved reviews from all venues
    const allReviews = await query(`
      SELECT 
        r.id,
        r.customer_name,
        r.rating,
        r.comment,
        r.is_approved,
        r.created_at,
        i.name as item_name,
        v.name as venue_name,
        v.slug as venue_slug
      FROM reviews r
      JOIN items i ON r.item_id = i.id
      JOIN categories c ON i.category_id = c.id
      JOIN venues v ON c.venue_id = v.id
      WHERE r.is_approved = true
      ORDER BY r.created_at DESC
      LIMIT 100
    `)

    // Get pending reviews count
    const pendingReviewsCount = await query(`
      SELECT COUNT(*) FROM reviews WHERE is_approved = false
    `)

    // Get pending reviews list
    const pendingReviewsList = await query(`
      SELECT 
        r.id,
        r.customer_name,
        r.rating,
        r.comment,
        r.is_approved,
        r.created_at,
        i.name as item_name,
        v.name as venue_name,
        v.slug as venue_slug
      FROM reviews r
      JOIN items i ON r.item_id = i.id
      JOIN categories c ON i.category_id = c.id
      JOIN venues v ON c.venue_id = v.id
      WHERE r.is_approved = false
      ORDER BY r.created_at DESC
      LIMIT 100
    `)

    return NextResponse.json({
      totalVenues: parseInt(venuesCount.rows[0].count),
      totalItems: parseInt(itemsCount.rows[0].count),
      totalCategories: parseInt(categoriesCount.rows[0].count),
      totalOrders: parseInt(ordersCount.rows[0].count),
      totalReviews: parseInt(reviewsCount.rows[0].count),
      totalAdmins: parseInt(adminUsersCount.rows[0].count),
      recentOrders: parseInt(recentOrders.rows[0].count),
      recentReviews: parseInt(recentReviews.rows[0].count),
      pendingReviews: parseInt(pendingReviewsCount.rows[0].count),
      topVenues: topVenues.rows.map(v => ({
        name: v.name,
        slug: v.slug,
        itemCount: parseInt(v.item_count),
      })),
      topVenuesByRevenue: topVenuesByRevenue.rows.map(v => ({
        name: v.name,
        slug: v.slug,
        orderCount: parseInt(v.order_count),
        totalRevenue: parseFloat(v.total_revenue || 0),
      })),
      dailyOrdersTrend: dailyOrdersTrend.rows.map(d => ({
        date: d.date,
        count: parseInt(d.count),
        revenue: parseFloat(d.revenue || 0),
      })),
      weeklyRevenue: weeklyRevenue.rows.map(w => ({
        week: w.week,
        revenue: parseFloat(w.revenue || 0),
        orderCount: parseInt(w.order_count),
      })),
      monthlyStats: monthlyStats.rows.map(m => ({
        month: m.month,
        totalOrders: parseInt(m.total_orders),
        totalRevenue: parseFloat(m.total_revenue || 0),
        avgOrderValue: parseFloat(m.avg_order_value || 0),
      })),
      popularItems: popularItems.rows.map(i => ({
        itemName: i.item_name,
        venueName: i.venue_name,
        orderCount: parseInt(i.order_count || 0),
        totalQuantity: parseInt(i.total_quantity || 0),
      })),
      userGrowth: userGrowth.rows.map(u => ({
        date: u.date,
        newUsers: parseInt(u.new_users),
      })),
      membershipDistribution: membershipDistribution.rows.map(m => ({
        tier: m.membership_tier,
        userCount: parseInt(m.user_count),
      })),
      venueRatings: venueRatings.rows.map(v => ({
        venueName: v.venue_name,
        slug: v.slug,
        avgRating: parseFloat(v.avg_rating).toFixed(1),
        reviewCount: parseInt(v.review_count),
      })),
      allReviews: allReviews.rows.map(r => ({
        id: r.id,
        customerName: r.customer_name,
        rating: r.rating,
        comment: r.comment,
        isApproved: r.is_approved,
        createdAt: r.created_at,
        itemName: r.item_name,
        venueName: r.venue_name,
        venueSlug: r.venue_slug,
      })),
      pendingReviewsList: pendingReviewsList.rows.map(r => ({
        id: r.id,
        customerName: r.customer_name,
        rating: r.rating,
        comment: r.comment,
        isApproved: r.is_approved,
        createdAt: r.created_at,
        itemName: r.item_name,
        venueName: r.venue_name,
        venueSlug: r.venue_slug,
      })),
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
