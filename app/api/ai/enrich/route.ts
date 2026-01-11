import { NextResponse } from 'next/server'
import { generateItemDetails, searchImage } from '@/lib/anthropic'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'


export async function POST(request: Request) {
  try {
    // Get token from cookie instead of header
    const cookieHeader = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...v] = c.split('=')
        return [key, v.join('=')]
      })
    )
    const token = cookies.authToken

    if (!token) {
      console.log('❌ No auth token in cookie')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload?.userId) {
      console.log('❌ Invalid token payload')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    console.log('✅ Token verified for user:', payload.userId)

    // Check user's membership tier
    const userResult = await query(
      'SELECT membership_tier FROM users WHERE id = $1',
      [payload.userId]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const membershipTier = userResult.rows[0].membership_tier
    if (membershipTier === 'free') {
      return NextResponse.json(
        { error: 'AI zenginleştirme özelliği Premium veya Basic üyelere özeldir' },
        { status: 403 }
      )
    }

    const { productName, language } = await request.json()

    if (!productName) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      )
    }

    let details, imageUrl
    try {
      [details, imageUrl] = await Promise.all([
        generateItemDetails(productName, language || 'tr'),
        searchImage(productName)
      ])
      console.log('🤖 AI Generated Details:', details)
    } catch (error: any) {
      const isOverloaded = error?.status === 529 || error?.error?.error?.type === 'overloaded_error'
      const isRateLimited = error?.status === 429
      
      if (isOverloaded) {
        return NextResponse.json(
          { 
            error: 'AI servisi şu anda yoğun. Lütfen birkaç saniye sonra tekrar deneyin.',
            errorCode: 'AI_OVERLOADED'
          },
          { status: 503 }
        )
      }
      
      if (isRateLimited) {
        return NextResponse.json(
          { 
            error: 'Çok fazla istek gönderildi. Lütfen 30 saniye bekleyip tekrar deneyin.',
            errorCode: 'RATE_LIMITED'
          },
          { status: 429 }
        )
      }
      
      throw error
    }

    // Helper function to safely parse numbers
    const parseNum = (val: any) => {
      if (val === null || val === undefined || val === '') return null
      const num = parseFloat(val)
      return isNaN(num) ? null : num
    }

    const sanitizedResponse = {
      description: details.description || '',
      calories: parseNum(details.calories),
      protein: parseNum(details.protein),
      carbs: parseNum(details.carbs),
      fat: parseNum(details.fat),
      fiber: parseNum(details.fiber),
      sugar: parseNum(details.sugar),
      sodium: parseNum(details.sodium),
      preparation_time: parseNum(details.preparation_time),
      serving_size: details.serving_size || '',
      ingredients: details.ingredients || '',
      allergens: Array.isArray(details.allergens) ? details.allergens : [],
      tags: Array.isArray(details.tags) ? details.tags : [],
      dietary_info: Array.isArray(details.dietary_info) ? details.dietary_info : (Array.isArray(details.tags) ? details.tags : []),
      origin: details.origin || '',
      storage_instructions: details.storage_instructions || '',
      image: imageUrl || ''
    }

    console.log('✅ Sanitized Response:', sanitizedResponse)

    return NextResponse.json(sanitizedResponse)
  } catch (error) {
    console.error('Error enriching item:', error)
    return NextResponse.json(
      { error: 'Failed to generate item details' },
      { status: 500 }
    )
  }
}