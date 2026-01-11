'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, ArrowLeft } from 'lucide-react'

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

export default function BlogPostClient({ post }: { post: BlogPost }) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        onClick={() => router.push('/blog')}
        className="flex items-center gap-2 text-[#1A1A1A]/70 hover:text-[#1A1A1A] mb-8 transition-colors"
      >
        <ArrowLeft size={20} />
        Blog'a Dön
      </button>

      {post.image && (
        <div className="w-full h-96 rounded-2xl overflow-hidden mb-8 shadow-xl">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex items-center gap-2 text-[#1A1A1A]/60 mb-4">
        <Calendar size={16} />
        <time>
          {new Date(post.published_at).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </time>
      </div>

      <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#1A1A1A] mb-6 leading-tight">
        {post.title}
      </h1>

      {post.excerpt && (
        <p className="text-base md:text-lg lg:text-xl text-[#1A1A1A]/70 mb-8 leading-relaxed">
          {post.excerpt}
        </p>
      )}

      <div
        className="prose prose-lg max-w-none prose-headings:text-[#1A1A1A] prose-p:text-[#1A1A1A]/80 prose-a:text-[#34C8B6] prose-strong:text-[#1A1A1A] prose-code:text-[#D7A449]"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.keywords && post.keywords.length > 0 && (
        <div className="mt-12 pt-8 border-t border-[#1A1A1A]/10">
          <h3 className="text-sm font-semibold text-[#1A1A1A]/60 mb-3">Etiketler</h3>
          <div className="flex flex-wrap gap-2">
            {post.keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-[#34C8B6]/10 text-[#34C8B6] rounded-lg text-sm font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
