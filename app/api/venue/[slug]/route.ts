import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = (searchParams.get('lang') || 'tr') as 'en' | 'tr'

    // Get venue
    const venueResult = await query(
      'SELECT id, name, slug, logo, cover_image, description, theme, status, online_ordering_enabled, website, wifi_password, address, phone, languages FROM venues WHERE slug = $1',
      [params.slug]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const venueRow = venueResult.rows[0]

    // Get categories
    const categoriesResult = await query(
      'SELECT * FROM categories WHERE venue_id = $1 ORDER BY display_order',
      [venueRow.id]
    )

    // Get items with variants and addons
    const itemsResult = await query(`
      SELECT
        i.id,
        i.category_id,
        i.name,
        i.description,
        i.price,
        i.image,
        i.tags,
        i.allergens,
        i.calories,
        i.protein,
        i.carbs,
        i.fat,
        i.fiber,
        i.sugar,
        i.sodium,
        i.preparation_time,
        i.serving_size,
        i.ingredients,
        i.origin,
        i.storage_instructions,
        i.dietary_info,
        i.is_available,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', v.id, 'name', v.name, 'delta', v.price_delta))
          FILTER (WHERE v.id IS NOT NULL),
          '[]'
        ) as variants,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', a.id, 'name', a.name, 'price', a.price))
          FILTER (WHERE a.id IS NOT NULL),
          '[]'
        ) as addons
      FROM items i
      LEFT JOIN variants v ON v.item_id = i.id
      LEFT JOIN addons a ON a.item_id = i.id
      WHERE i.category_id = ANY(
        SELECT id FROM categories WHERE venue_id = $1
      )
      GROUP BY i.id
      ORDER BY i.created_at DESC
    `, [venueRow.id])

    const venue = {
      id: venueRow.id.toString(),
      slug: venueRow.slug,
      name: venueRow.name,
      logo: venueRow.logo,
      coverImage: venueRow.cover_image,
      website: venueRow.website,
      wifiPassword: venueRow.wifi_password,
      address: venueRow.address,
      phone: venueRow.phone,
      theme: venueRow.theme || 'modern',
      status: venueRow.status,
      languages: venueRow.languages || ['tr'],
      onlineOrderingEnabled: venueRow.online_ordering_enabled || false,
    }

    const categories = categoriesResult.rows.map((cat) => ({
      id: cat.id.toString(),
      venueId: cat.venue_id.toString(),
      name: cat.name,
      order: cat.display_order,
      image: cat.image,
    }))

    const items = itemsResult.rows.map((item) => ({
      id: item.id.toString(),
      categoryId: item.category_id.toString(),
      name: item.name,
      description: item.description,
      price: parseFloat(item.price),
      image: item.image,
      tags: item.tags || [],
      allergens: item.allergens || [],
      calories: item.calories,
      protein: item.protein ? parseFloat(item.protein) : undefined,
      carbs: item.carbs ? parseFloat(item.carbs) : undefined,
      fat: item.fat ? parseFloat(item.fat) : undefined,
      fiber: item.fiber,
      sugar: item.sugar,
      sodium: item.sodium,
      preparationTime: item.preparation_time,
      servingSize: item.serving_size,
      ingredients: item.ingredients,
      origin: item.origin,
      storageInstructions: item.storage_instructions,
      dietaryInfo: item.dietary_info || [],
      variants: item.variants || [],
      addons: item.addons || [],
      isAvailable: item.is_available,
    }))

    return NextResponse.json({
      venue,
      categories,
      items,
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}