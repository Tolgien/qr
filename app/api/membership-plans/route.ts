
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const result = await query(`
      SELECT * FROM membership_plans 
      WHERE is_active = true
      ORDER BY display_order ASC
    `)

    const plans = result.rows.map(plan => {
      let features = []
      
      if (Array.isArray(plan.features)) {
        features = plan.features.filter((f: any) => typeof f === 'string' && !f.startsWith('name:') && !f.startsWith('support:'))
      } else if (typeof plan.features === 'object' && plan.features !== null) {
        features = Object.entries(plan.features)
          .filter(([key]) => key !== 'name' && key !== 'support')
          .map(([key, value]) => {
            if (typeof value === 'boolean') return value ? key : null
            return `${key}: ${value}`
          })
          .filter((f: any) => f !== null)
      } else if (typeof plan.features === 'string') {
        try {
          const parsed = JSON.parse(plan.features)
          if (Array.isArray(parsed)) {
            features = parsed.filter((f: any) => typeof f === 'string' && !f.startsWith('name:') && !f.startsWith('support:'))
          } else {
            features = Object.entries(parsed)
              .filter(([key]) => key !== 'name' && key !== 'support')
              .map(([key, value]) => {
                if (typeof value === 'boolean') return value ? key : null
                return `${key}: ${value}`
              })
              .filter((f: any) => f !== null)
          }
        } catch {
          features = []
        }
      }
      
      return {
        id: plan.id,
        planType: plan.plan_type || 'free',
        monthlyPrice: parseFloat(plan.monthly_price) || 0,
        yearlyPrice: parseFloat(plan.yearly_price) || 0,
        features,
        displayOrder: plan.display_order
      }
    })

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Error fetching membership plans:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
