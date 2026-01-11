import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, ArrowLeft } from 'lucide-react'
import BlogPostClient from './BlogPostClient'

interface BlogPost {
  id: number
  slug: string
  title: string
  content: string
  excerpt: string
  image: string
  seo_title: string
  seo_description: string
  keywords: string[]
  published_at: string
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'
    const res = await fetch(`${baseUrl}/api/blog/${slug}`, {
      cache: 'no-store'
    })
    
    if (!res.ok) {
      return null
    }
    
    const data = await res.json()
    return data
  } catch (error) {
    console.error("Error fetching post:", error)
    return null
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)

  if (!post) {
    return {
      title: 'Blog Yazısı Bulunamadı',
    }
  }

  const imageUrl = post.image || 'https://qrim.net/logo-qrim.png'

  return {
    title: `${post.title} | QRim.net Blog`,
    description: post.seo_description || post.excerpt,
    authors: [{ name: 'QRim.net', url: 'https://qrim.net' }],
    publisher: 'QRim.net',
    openGraph: {
      title: post.title,
      description: post.seo_description || post.excerpt,
      type: 'article',
      publishedTime: post.published_at,
      authors: ['QRim.net'],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ],
      siteName: 'QRim.net',
      locale: 'tr_TR',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.seo_description || post.excerpt,
      images: [imageUrl],
      site: '@qrim',
      creator: '@qrim',
    },
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F7F3EB] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4">Blog yazısı bulunamadı</h1>
          <Link
            href="/blog"
            className="text-[#34C8B6] hover:underline"
          >
            Blog sayfasına dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F3EB]">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <BlogPostClient post={post} />
      </article>
    </div>
  )
}
