
import { query } from './db'

/**
 * Sipariş tamamlandığında ürünler arası ilişkileri günceller
 */
export async function updateItemAssociations(orderId: number) {
  try {
    // Siparişdeki tüm ürünleri al
    const result = await query(
      `SELECT DISTINCT item_id FROM order_items WHERE order_id = $1`,
      [orderId]
    )

    const itemIds = result.rows.map((row: any) => row.item_id)

    // Her ürün çifti için ilişkiyi artır
    for (let i = 0; i < itemIds.length; i++) {
      for (let j = i + 1; j < itemIds.length; j++) {
        const itemId1 = itemIds[i]
        const itemId2 = itemIds[j]

        // Her iki yönde de ilişkiyi kaydet
        await query(
          `INSERT INTO item_associations (item_id, associated_item_id, frequency, last_updated)
           VALUES ($1, $2, 1, NOW())
           ON CONFLICT (item_id, associated_item_id)
           DO UPDATE SET frequency = item_associations.frequency + 1, last_updated = NOW()`,
          [itemId1, itemId2]
        )

        await query(
          `INSERT INTO item_associations (item_id, associated_item_id, frequency, last_updated)
           VALUES ($1, $2, 1, NOW())
           ON CONFLICT (item_id, associated_item_id)
           DO UPDATE SET frequency = item_associations.frequency + 1, last_updated = NOW()`,
          [itemId2, itemId1]
        )
      }
    }

    console.log(`Updated associations for order ${orderId}`)
  } catch (error) {
    console.error('Error updating item associations:', error)
  }
}

/**
 * Belirli bir ürün için en çok birlikte alınan ürünleri getirir
 */
export async function getFrequentlyBoughtTogether(itemId: number, limit: number = 3) {
  try {
    const result = await query(
      `SELECT 
        i.id,
        i.name,
        i.description,
        i.price,
        i.image,
        i.tags,
        a.frequency,
        c.name as category_name
      FROM item_associations a
      JOIN items i ON a.associated_item_id = i.id
      JOIN categories c ON i.category_id = c.id
      WHERE a.item_id = $1 
        AND i.is_available = true
      ORDER BY a.frequency DESC, a.last_updated DESC
      LIMIT $2`,
      [itemId, limit]
    )

    return result.rows.map((row: any) => ({
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      image: row.image,
      tags: row.tags || [],
      frequency: row.frequency,
      categoryName: row.category_name,
      associationType: 'frequently_bought_together'
    }))
  } catch (error) {
    console.error('Error getting frequently bought together items:', error)
    return []
  }
}
