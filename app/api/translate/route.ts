import { NextRequest, NextResponse } from 'next/server'
import translate from 'google-translate-api-x'

export async function POST(req: NextRequest) {
  let originalText = ''
  
  try {
    const { text, target, source } = await req.json()
    originalText = text

    if (!text || !target) {
      return NextResponse.json(
        { error: 'Text and target language are required' },
        { status: 400 }
      )
    }

    if (target === 'tr' || !text.trim()) {
      return NextResponse.json({ translatedText: text })
    }

    const result = await translate(text, {
      from: source || 'tr',
      to: target,
      forceTo: true
    })

    const translatedText = typeof result === 'string' ? result : (Array.isArray(result) ? result[0]?.text : result?.text) || text
    return NextResponse.json({ translatedText })
  } catch (error) {
    console.error('Translation error:', error)
    // Fallback to original text on error
    return NextResponse.json({ translatedText: originalText })
  }
}
