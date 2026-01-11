
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getFrequentlyBoughtTogether } from '@/lib/collaborative-filtering'

export const dynamic = 'force-dynamic'


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('lang') || 'en'

    // 1. Kullanıcı davranışına dayalı öneriler (Birlikte sık alınanlar)
    const frequentlyBought = await getFrequentlyBoughtTogether(parseInt(params.id), 3)

    // 2. AI pairing önerileri (veritabanında kayıtlı)
    const pairingsResult = await query(
      `SELECT 
        i.id,
        i.name,
        i.description,
        i.price,
        i.image,
        i.tags,
        p.pairing_reason as "pairingReason",
        c.name as category_name
      FROM item_pairings p
      JOIN items i ON p.pairing_item_id = i.id
      JOIN categories c ON i.category_id = c.id
      WHERE p.item_id = $1
      ORDER BY p.display_order
      LIMIT 3`,
      [params.id]
    )

    const aiPairings = pairingsResult.rows.map((row: any) => ({
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      image: row.image,
      tags: row.tags || [],
      pairingReason: row.pairingReason,
      categoryName: row.category_name,
      associationType: 'ai_pairing'
    }))

    // 3. Benzer ürünler (aynı kategoriden)
    const currentItem = await query('SELECT * FROM items WHERE id = $1', [params.id])
    
    let similarItems: Array<{
      id: string
      name: string
      description: string
      price: number
      image: string
      tags: string[]
      categoryName: string
      associationType: string
    }> = []
    if (currentItem.rows.length > 0) {
      const similarResult = await query(
        `SELECT i.id, i.name, i.description, i.price, i.image, i.tags, c.name as category_name
         FROM items i
         JOIN categories c ON i.category_id = c.id
         WHERE i.category_id = (SELECT category_id FROM items WHERE id = $1)
         AND i.id != $1
         AND i.is_available = true
         ORDER BY RANDOM()
         LIMIT 2`,
        [params.id]
      )

      similarItems = similarResult.rows.map((row: any) => ({
        id: row.id.toString(),
        name: row.name,
        description: row.description,
        price: parseFloat(row.price),
        image: row.image,
        tags: row.tags || [],
        categoryName: row.category_name,
        associationType: 'similar'
      }))
    }

    return NextResponse.json({
      frequentlyBoughtTogether: frequentlyBought,
      aiPairings: aiPairings,
      similarItems: similarItems
    })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
