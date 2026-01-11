
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const baseUrl = 'https://qrim.net'
  
  // Statik sayfalar
  const staticPages = [
    '',
    '/features',
    '/pricing',
    '/blog',
    '/login',
    '/register',
    '/terms',
    '/privacy',
    '/cookies',
    '/kvkk',
  ]

  // Tüm venue'ları ve blog yazılarını çek
  const venuesResult = await query('SELECT slug, updated_at FROM venues')
  const blogsResult = await query('SELECT slug, published_at FROM blog_posts WHERE is_published = true')

  // XML oluştur
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  // Statik sayfaları ekle
  staticPages.forEach(page => {
    xml += '  <url>\n'
    xml += `    <loc>${baseUrl}${page}</loc>\n`
    xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`
    xml += '    <changefreq>weekly</changefreq>\n'
    xml += '    <priority>0.8</priority>\n'
    xml += '  </url>\n'
  })

  // Venue sayfalarını ekle
  venuesResult.rows.forEach((venue: any) => {
    xml += '  <url>\n'
    xml += `    <loc>${baseUrl}/menu/${venue.slug}</loc>\n`
    xml += `    <lastmod>${new Date(venue.updated_at).toISOString().split('T')[0]}</lastmod>\n`
    xml += '    <changefreq>daily</changefreq>\n'
    xml += '    <priority>1.0</priority>\n'
    xml += '  </url>\n'
  })

  // Blog sayfalarını ekle
  blogsResult.rows.forEach((blog: any) => {
    xml += '  <url>\n'
    xml += `    <loc>${baseUrl}/blog/${blog.slug}</loc>\n`
    xml += `    <lastmod>${new Date(blog.published_at).toISOString().split('T')[0]}</lastmod>\n`
    xml += '    <changefreq>monthly</changefreq>\n'
    xml += '    <priority>0.6</priority>\n'
    xml += '  </url>\n'
  })

  xml += '</urlset>'

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
