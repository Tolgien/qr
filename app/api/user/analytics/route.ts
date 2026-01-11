import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
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

    // Daily orders trend for user's venues (last 30 days)
    const dailyOrdersTrend = await query(`
      SELECT 
        DATE(o.created_at) as date,
        COUNT(o.id) as count,
        COALESCE(SUM(o.total), 0)::numeric::float8 as revenue
      FROM orders o
      JOIN venues v ON v.id = o.venue_id
      WHERE v.owner_id = $1 AND o.created_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE(o.created_at)
      ORDER BY date ASC
    `, [payload.userId])

    // Weekly comparison
    const weeklyStats = await query(`
      SELECT 
        DATE_TRUNC('week', o.created_at) as week,
        COUNT(o.id) as order_count,
        SUM(o.total) as revenue
      FROM orders o
      JOIN venues v ON v.id = o.venue_id
      WHERE v.owner_id = $1 AND o.created_at > NOW() - INTERVAL '8 weeks'
      GROUP BY week
      ORDER BY week ASC
    `, [payload.userId])

    // Total revenue and orders
    const totalStats = await query(`
      SELECT 
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.total), 0) as total_revenue,
        COALESCE(AVG(o.total), 0) as avg_order_value
      FROM orders o
      JOIN venues v ON v.id = o.venue_id
      WHERE v.owner_id = $1
    `, [payload.userId])

    // Today's stats
    const todayStats = await query(`
      SELECT 
        COUNT(o.id) as today_orders,
        COALESCE(SUM(o.total), 0) as today_revenue
      FROM orders o
      JOIN venues v ON v.id = o.venue_id
      WHERE v.owner_id = $1 AND DATE(o.created_at) = CURRENT_DATE
    `, [payload.userId])

    // Top selling items
    const topItems = await query(`
      SELECT 
        i.name as item_name,
        v.name as venue_name,
        COUNT(oi.id) as order_count,
        SUM(oi.quantity) as total_quantity
      FROM items i
      JOIN categories c ON i.category_id = c.id
      JOIN venues v ON c.venue_id = v.id
      LEFT JOIN order_items oi ON oi.item_id = i.id
      WHERE v.owner_id = $1
      GROUP BY i.id, i.name, v.name
      ORDER BY order_count DESC
      LIMIT 10
    `, [payload.userId])

    // Venue performance
    const venuePerformance = await query(`
      SELECT 
        v.name,
        v.slug,
        COUNT(DISTINCT o.id) as order_count,
        COALESCE(SUM(o.total), 0) as revenue,
        COUNT(DISTINCT c.id) as category_count,
        COUNT(DISTINCT i.id) as item_count
      FROM venues v
      LEFT JOIN orders o ON o.venue_id = v.id
      LEFT JOIN categories c ON c.venue_id = v.id
      LEFT JOIN items i ON i.category_id = c.id
      WHERE v.owner_id = $1
      GROUP BY v.id, v.name, v.slug
      ORDER BY revenue DESC
    `, [payload.userId])

    // Peak hours
    const peakHours = await query(`
      SELECT 
        EXTRACT(HOUR FROM o.created_at) as hour,
        COUNT(o.id) as order_count
      FROM orders o
      JOIN venues v ON v.id = o.venue_id
      WHERE v.owner_id = $1
      GROUP BY hour
      ORDER BY hour ASC
    `, [payload.userId])

    // Recent reviews for user's items
    const recentReviews = await query(`
      SELECT 
        r.id,
        r.customer_name,
        r.rating,
        r.comment,
        r.created_at,
        i.name as item_name,
        v.name as venue_name
      FROM reviews r
      JOIN items i ON r.item_id = i.id
      JOIN categories c ON i.category_id = c.id
      JOIN venues v ON c.venue_id = v.id
      WHERE v.owner_id = $1 AND r.is_approved = true
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [payload.userId])

    // Average ratings
    const averageRatings = await query(`
      SELECT 
        v.name as venue_name,
        AVG(r.rating) as avg_rating,
        COUNT(r.id) as review_count
      FROM venues v
      LEFT JOIN categories c ON c.venue_id = v.id
      LEFT JOIN items i ON i.category_id = c.id
      LEFT JOIN reviews r ON r.item_id = i.id AND r.is_approved = true
      WHERE v.owner_id = $1
      GROUP BY v.id, v.name
    `, [payload.userId])

    return NextResponse.json({
      userId: payload.userId,
      dailyOrdersTrend: dailyOrdersTrend.rows.map(d => ({
        date: d.date,
        count: parseInt(d.count || 0),
        revenue: parseFloat(d.revenue || 0),
      })),
      weeklyStats: weeklyStats.rows.map(w => ({
        week: w.week,
        orderCount: parseInt(w.order_count || 0),
        revenue: parseFloat(w.revenue || 0),
      })),
      totalStats: {
        totalOrders: parseInt(totalStats.rows[0]?.total_orders || 0),
        totalRevenue: parseFloat(totalStats.rows[0]?.total_revenue || 0),
        avgOrderValue: parseFloat(totalStats.rows[0]?.avg_order_value || 0),
      },
      todayStats: {
        todayOrders: parseInt(todayStats.rows[0]?.today_orders || 0),
        todayRevenue: parseFloat(todayStats.rows[0]?.today_revenue || 0),
      },
      topItems: topItems.rows.map(i => ({
        itemName: i.item_name,
        venueName: i.venue_name,
        orderCount: parseInt(i.order_count || 0),
        totalQuantity: parseInt(i.total_quantity || 0),
      })),
      venuePerformance: venuePerformance.rows.map(v => ({
        name: v.name,
        slug: v.slug,
        orderCount: parseInt(v.order_count || 0),
        revenue: parseFloat(v.revenue || 0),
        categoryCount: parseInt(v.category_count || 0),
        itemCount: parseInt(v.item_count || 0),
      })),
      peakHours: peakHours.rows.map(h => ({
        hour: parseInt(h.hour),
        orderCount: parseInt(h.order_count || 0),
      })),
      recentReviews: recentReviews.rows.map(r => ({
        id: r.id,
        customerName: r.customer_name,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at,
        itemName: r.item_name,
        venueName: r.venue_name,
      })),
      averageRatings: averageRatings.rows.map(r => ({
        venueName: r.venue_name,
        avgRating: parseFloat(r.avg_rating || 0).toFixed(1),
        reviewCount: parseInt(r.review_count || 0),
      })),
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}