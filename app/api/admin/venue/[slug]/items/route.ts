import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'


export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
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

    // Get venue ID first
    const venueResult = await query(
      'SELECT id FROM venues WHERE slug = $1',
      [params.slug]
    )

    if (venueResult.rows.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const venueId = venueResult.rows[0].id

    // Get items with category info, including all fields
    const result = await query(`
      SELECT 
        i.*,
        c.name as category_name
      FROM items i
      JOIN categories c ON c.id = i.category_id
      WHERE c.venue_id = $1
      ORDER BY c.display_order, i.name
    `, [venueId])

    return NextResponse.json({ items: result.rows })
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
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { 
      category_id, name, description, price, image, is_available,
      calories, protein, carbs, fat, fiber, sugar, sodium,
      preparation_time, serving_size, ingredients, origin, 
      storage_instructions, allergens, dietary_info, tags
    } = await request.json()

    if (!category_id || !name || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('Inserting item with ingredients:', ingredients)
    const result = await query(
      `INSERT INTO items (
        category_id, name, description, price, image, tags, 
        calories, protein, carbs, fat, fiber, sugar, sodium,
        preparation_time, serving_size, ingredients, allergens, 
        origin, storage_instructions, dietary_info, is_available
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *`,
      [
        category_id,
        name,
        description || null,
        price,
        image || null,
        tags,
        calories || null,
        protein || null,
        carbs || null,
        fat || null,
        fiber || null,
        sugar || null,
        sodium || null,
        preparation_time || null,
        serving_size || null,
        ingredients || null,
        allergens,
        origin || null,
        storage_instructions || null,
        dietary_info,
        is_available
      ]
    )

    const newItem = result.rows[0]

    // Generate and save AI pairing suggestions
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        // Get all items from the same venue first
        const venueItemsResult = await query(
          `SELECT i.* FROM items i
           JOIN categories c ON i.category_id = c.id
           WHERE c.venue_id = (SELECT venue_id FROM categories WHERE id = $1)
           AND i.id != $2`,
          [category_id, newItem.id]
        )
        
        const { getPairingItems } = await import('@/lib/anthropic')
        const availableItemNames = venueItemsResult.rows.map((item: any) => item.name)
        const pairingSuggestions = await getPairingItems(
          name, 
          description || '', 
          'tr',
          availableItemNames
        )
        
        // Match AI suggestions with existing items and save pairings
        console.log('AI Pairing Suggestions:', pairingSuggestions)
        console.log('Available venue items:', venueItemsResult.rows.map((i: any) => i.name))
        
        for (let i = 0; i < pairingSuggestions.length; i++) {
          const suggestion = pairingSuggestions[i]
          
          // Gelişmiş eşleştirme algoritması - kelimeleri normalize et
          const normalizeText = (text: string) => 
            text.toLowerCase()
              .replace(/ı/g, 'i')
              .replace(/ğ/g, 'g')
              .replace(/ü/g, 'u')
              .replace(/ş/g, 's')
              .replace(/ö/g, 'o')
              .replace(/ç/g, 'c')
          
          const suggestionWords = normalizeText(suggestion.name).split(' ')
          
          // Find best matching item by name similarity (more flexible)
          const matchingItem = venueItemsResult.rows.find((item: any) => {
            const itemWords = normalizeText(item.name).split(' ')
            // Herhangi bir kelime eşleşirse kabul et
            return suggestionWords.some(sw => 
              itemWords.some(iw => iw.includes(sw) || sw.includes(iw))
            )
          })
          
          if (matchingItem) {
            console.log(`✓ Matched "${suggestion.name}" → "${matchingItem.name}"`)
            await query(
              `INSERT INTO item_pairings (item_id, pairing_item_id, pairing_reason, display_order)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (item_id, pairing_item_id) DO NOTHING`,
              [newItem.id, matchingItem.id, suggestion.pairingReason || suggestion.description, i]
            )
          } else {
            console.log(`✗ No match found for "${suggestion.name}"`)
          }
        }
      } catch (error) {
        console.error('Failed to generate pairing suggestions:', error)
      }
    }

    return NextResponse.json(newItem)
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}