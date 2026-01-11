
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

    const result = await query(`
      SELECT * FROM membership_plans 
      ORDER BY display_order ASC
    `)

    const plans = result.rows.map(plan => {
      let features = []
      
      if (Array.isArray(plan.features)) {
        features = plan.features
      } else if (typeof plan.features === 'object' && plan.features !== null) {
        features = Object.entries(plan.features).map(([key, value]) => {
          if (typeof value === 'boolean') return value ? key : `No ${key}`
          return `${key}: ${value}`
        })
      } else if (typeof plan.features === 'string') {
        try {
          const parsed = JSON.parse(plan.features)
          if (Array.isArray(parsed)) {
            features = parsed
          } else {
            features = Object.entries(parsed).map(([key, value]) => {
              if (typeof value === 'boolean') return value ? key : `No ${key}`
              return `${key}: ${value}`
            })
          }
        } catch {
          features = []
        }
      }
      
      return {
        ...plan,
        features
      }
    })

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Error fetching membership plans:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { planType, monthlyPrice, yearlyPrice, features, displayOrder } = await request.json()

    const result = await query(`
      INSERT INTO membership_plans (plan_type, monthly_price, yearly_price, features, display_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [planType, monthlyPrice, yearlyPrice, JSON.stringify(features), displayOrder || 0])

    return NextResponse.json({ success: true, plan: result.rows[0] })
  } catch (error) {
    console.error('Error creating membership plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
