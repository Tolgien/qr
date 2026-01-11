
import { NextResponse } from 'next/server'
import { generateItemDetails } from '@/lib/anthropic'

export const dynamic = 'force-dynamic'


export async function POST(request: Request) {
  try {
    const { itemName, language } = await request.json()

    if (!itemName) {
      return NextResponse.json(
        { error: 'Item name is required' },
        { status: 400 }
      )
    }

    const details = await generateItemDetails(itemName, language || 'tr')

    return NextResponse.json(details)
  } catch (error) {
    console.error('Error enriching item:', error)
    return NextResponse.json(
      { error: 'Failed to generate item details' },
      { status: 500 }
    )
  }
}
