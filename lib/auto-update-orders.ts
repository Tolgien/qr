import { query } from '@/lib/db'

export async function autoUpdateOrderStatus(venueId: number): Promise<void> {
  try {
    await query(
      `UPDATE orders 
      SET status = 'preparing', updated_at = NOW()
      WHERE venue_id = $1
        AND status = 'placed'
        AND created_at <= NOW() - INTERVAL '30 seconds'
        AND created_at > NOW() - INTERVAL '24 hours'`,
      [venueId]
    )
  } catch (error) {
    console.error('Error auto-updating order status:', error)
  }
}
