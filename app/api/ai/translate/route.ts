
import { NextResponse } from 'next/server'
import { translateText } from '@/lib/anthropic'

export const dynamic = 'force-dynamic'


export async function POST(request: Request) {
  try {
    const { text, fromLang, toLang } = await request.json()

    if (!text || !fromLang || !toLang) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const translated = await translateText(text, fromLang, toLang)

    return NextResponse.json({ translatedText: translated })
  } catch (error) {
    console.error('Error translating text:', error)
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
}
