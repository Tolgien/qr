
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://qrim.net/sitemap.xml
`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
