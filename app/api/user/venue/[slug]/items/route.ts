
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Cookie'den veya Authorization header'dan token al
    const { cookies } = await import('next/headers')
    const cookieStore = cookies()
    const tokenFromCookie = cookieStore.get('authToken')?.value
    const authHeader = request.headers.get('Authorization')
    
    const token = tokenFromCookie || authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = jwt.verify(token, JWT_SECRET) as any

    // Verify venue ownership
    const venueResult = await query(
      'SELECT id FROM venues WHERE slug = $1 AND owner_id = $2',
      [params.slug, payload.userId]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const venueId = venueResult.rows[0].id

    // Get items
    const itemsResult = await query(
      `SELECT i.id, i.name, i.description, i.price, i.image, i.is_available, i.display_order, c.name as category_name
       FROM items i
       INNER JOIN categories c ON i.category_id = c.id
       WHERE c.venue_id = $1
       ORDER BY i.display_order, i.name`,
      [venueId]
    )

    // Convert price to number
    const items = itemsResult.rows.map(item => ({
      ...item,
      price: parseFloat(item.price)
    }))

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Cookie'den veya Authorization header'dan token al
    const { cookies } = await import('next/headers')
    const cookieStore = cookies()
    const tokenFromCookie = cookieStore.get('authToken')?.value
    const authHeader = request.headers.get('Authorization')
    
    const token = tokenFromCookie || authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = jwt.verify(token, JWT_SECRET) as any

    // Verify venue ownership
    const venueResult = await query(
      'SELECT id FROM venues WHERE slug = $1 AND owner_id = $2',
      [params.slug, payload.userId]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const { 
      name, description, price, categoryId, image, tags, allergens, isAvailable, isFeatured,
      calories, protein, carbs, fat, fiber, sugar, sodium,
      preparation_time, serving_size, ingredients, origin, storage_instructions, dietary_info
    } = await request.json()

    // Safely handle null/undefined values
    const safeValue = (val: any, defaultVal: any = null) => {
      if (val === undefined || val === null || val === '') return defaultVal
      return val
    }

    const safeArray = (val: any) => {
      if (!val || !Array.isArray(val)) return []
      return val
    }

    const safeNumber = (val: any) => {
      if (val === undefined || val === null || val === '') return null
      const num = parseFloat(val)
      return isNaN(num) ? null : num
    }

    const safeInt = (val: any) => {
      if (val === undefined || val === null || val === '') return null
      const num = parseInt(val)
      return isNaN(num) ? null : num
    }

    const processedData = {
      categoryId: safeInt(categoryId),
      name: safeValue(name),
      description: safeValue(description),
      price: safeNumber(price),
      image: safeValue(image),
      tags: safeArray(tags),
      allergens: safeArray(allergens),
      isAvailable: safeValue(isAvailable, true),
      isFeatured: safeValue(isFeatured, false),
      calories: safeNumber(calories),
      protein: safeNumber(protein),
      carbs: safeNumber(carbs),
      fat: safeNumber(fat),
      fiber: safeNumber(fiber),
      sugar: safeNumber(sugar),
      sodium: safeInt(sodium),
      preparation_time: safeInt(preparation_time),
      serving_size: safeValue(serving_size),
      ingredients: safeValue(ingredients),
      origin: safeValue(origin),
      storage_instructions: safeValue(storage_instructions),
      dietary_info: safeArray(dietary_info)
    }

    console.log('📥 Processed data:', processedData)

    const result = await query(
      `INSERT INTO items (
        category_id, name, description, price, image, tags, allergens, is_available, is_featured,
        calories, protein, carbs, fat, fiber, sugar, sodium,
        preparation_time, serving_size, ingredients, origin, storage_instructions, dietary_info
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) 
       RETURNING id`,
      [
        processedData.categoryId,
        processedData.name,
        processedData.description,
        processedData.price,
        processedData.image,
        processedData.tags,
        processedData.allergens,
        processedData.isAvailable,
        processedData.isFeatured,
        processedData.calories,
        processedData.protein,
        processedData.carbs,
        processedData.fat,
        processedData.fiber,
        processedData.sugar,
        processedData.sodium,
        processedData.preparation_time,
        processedData.serving_size,
        processedData.ingredients,
        processedData.origin,
        processedData.storage_instructions,
        processedData.dietary_info
      ]
    )

    if (!result || !result.rows || result.rows.length === 0 || !result.rows[0]) {
      console.error('❌ Insert failed - no result returned')
      return NextResponse.json({ error: 'Ürün eklenemedi - veritabanı hatası' }, { status: 500 })
    }

    const itemId = result.rows[0].id

    if (!itemId) {
      console.error('❌ Insert failed - no ID returned')
      return NextResponse.json({ error: 'Ürün eklenemedi - ID alınamadı' }, { status: 500 })
    }

    console.log('✅ Item created with ID:', itemId)

    return NextResponse.json({ success: true, id: itemId })
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
