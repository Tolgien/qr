
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSimilarItems } from '@/lib/anthropic'

export const dynamic = 'force-dynamic'


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const language = (searchParams.get('lang') || 'tr') as 'tr' | 'en'

    // Önce veritabanından ürünü al
    const itemResult = await query(
      'SELECT * FROM items WHERE id = $1',
      [params.id]
    )

    if (itemResult.rows.length === 0) {
      return NextResponse.json({ items: [] })
    }

    const currentItem = itemResult.rows[0]

    // Önce veritabanından benzer ürünleri getir
    const dbResult = await query(
      `SELECT i.* 
       FROM items i
       WHERE i.category_id = (SELECT category_id FROM items WHERE id = $1)
       AND i.id != $1
       AND i.is_available = true
       AND i.price BETWEEN 
         (SELECT price * 0.7 FROM items WHERE id = $1) AND 
         (SELECT price * 1.3 FROM items WHERE id = $1)
       ORDER BY RANDOM()
       LIMIT 4`,
      [params.id]
    )

    let items = dbResult.rows.map(item => ({
      id: item.id.toString(),
      categoryId: item.category_id.toString(),
      name: item.name,
      description: item.description,
      price: parseFloat(item.price),
      image: item.image,
      tags: item.tags || [],
    }))

    // Eğer veritabanında yeterli ürün yoksa, AI ile öner
    if (items.length < 3 && process.env.ANTHROPIC_API_KEY) {
      try {
        const aiSuggestions = await getSimilarItems(
          currentItem.name,
          currentItem.description || '',
          language
        )

        const aiItems = aiSuggestions.map((suggestion: any, index: number) => ({
          id: `ai-${index}`,
          categoryId: currentItem.category_id.toString(),
          name: suggestion.name,
          description: suggestion.description,
          price: suggestion.estimatedPrice || currentItem.price,
          image: currentItem.image, // Placeholder image
          tags: [],
          isAISuggestion: true
        }))

        items = [...items, ...aiItems].slice(0, 4)
      } catch (aiError) {
        console.error('AI suggestions failed, using DB results only:', aiError)
      }
    }

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching similar items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
