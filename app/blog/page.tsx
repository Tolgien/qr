
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, ArrowRight, Search, Tag, TrendingUp, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

interface BlogPost {
  id: number
  slug: string
  title: string
  excerpt: string
  image: string
  published_at: string
  keywords?: string[]
}

const POSTS_PER_PAGE = 5

export default function BlogPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetch('/api/blog')
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts || [])
        setFilteredPosts(data.posts || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error:', err)
        setLoading(false)
      })
  }, [])

  // Extract all unique categories from keywords
  const allCategories = Array.from(
    new Set(
      posts.flatMap(post => post.keywords || [])
    )
  ).slice(0, 8) // Show top 8 categories

  // Filter posts based on search and category
  useEffect(() => {
    let filtered = posts

    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(post =>
        post.keywords?.includes(selectedCategory)
      )
    }

    setFilteredPosts(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchQuery, selectedCategory, posts])

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE
  const endIndex = startIndex + POSTS_PER_PAGE
  const currentPosts = filteredPosts.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3EB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#34C8B6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#1A1A1A] font-medium">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  const latestPosts = posts.slice(0, 5)

  return (
    <div className="min-h-screen bg-[#F7F3EB]">
      {/* Hero Section with Background Image */}
      <div className="relative h-[400px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop)',
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/70 via-[#1A1A1A]/60 to-[#1A1A1A]/90"></div>
        </div>

        {/* Home Button */}
        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/90 hover:bg-white backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all text-[#1A1A1A] font-medium"
          >
            <ArrowRight size={20} className="rotate-180" />
            Anasayfa
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white drop-shadow-lg">Blog</h1>
              <p className="text-base md:text-lg lg:text-xl text-white/95 max-w-2xl mx-auto drop-shadow-md px-4">
                QRim.net dünyasından haberler, ipuçları ve trendler
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentPosts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                <p className="text-[#1A1A1A]/60 text-lg">
                  {searchQuery || selectedCategory
                    ? 'Arama kriterlerine uygun blog yazısı bulunamadı'
                    : 'Henüz blog yazısı yok'}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-8">
                  {currentPosts.map((post, index) => (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => router.push(`/blog/${post.slug}`)}
                      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
                    >
                      <div className="grid md:grid-cols-5 gap-0">
                        {post.image && (
                          <div className="md:col-span-2 h-64 md:h-auto bg-gradient-to-br from-[#34C8B6]/10 to-[#D7A449]/10 overflow-hidden">
                            <img 
                              src={post.image} 
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="md:col-span-3 p-8">
                          <div className="flex items-center gap-2 text-sm text-[#1A1A1A]/60 mb-3">
                            <Calendar size={16} />
                            <time>
                              {new Date(post.published_at).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </time>
                          </div>
                          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#1A1A1A] mb-4 group-hover:text-[#34C8B6] transition-colors leading-tight">
                            {post.title}
                          </h2>
                          <p className="text-[#1A1A1A]/70 mb-6 line-clamp-3 leading-relaxed">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-2 text-[#34C8B6] font-medium">
                            Devamını Oku
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={20} className="text-[#1A1A1A]" />
                    </button>

                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-[#34C8B6] to-[#2AA897] text-white shadow-lg'
                              : 'bg-white text-[#1A1A1A] hover:bg-[#34C8B6]/10 shadow-md'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={20} className="text-[#1A1A1A]" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Search Box */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
                  <Search size={20} className="text-[#34C8B6]" />
                  Arama
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Blog yazılarında ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F7F3EB] rounded-xl border-2 border-transparent focus:border-[#34C8B6] focus:outline-none transition-colors"
                  />
                  <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40" />
                </div>
              </motion.div>

              {/* Categories */}
              {allCategories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
                    <Tag size={20} className="text-[#34C8B6]" />
                    Kategoriler
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl transition-all ${
                        selectedCategory === null
                          ? 'bg-gradient-to-r from-[#34C8B6] to-[#2AA897] text-white shadow-md'
                          : 'bg-[#F7F3EB] text-[#1A1A1A] hover:bg-[#34C8B6]/10'
                      }`}
                    >
                      Tümü
                    </button>
                    {allCategories.map((category, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl transition-all ${
                          selectedCategory === category
                            ? 'bg-gradient-to-r from-[#34C8B6] to-[#2AA897] text-white shadow-md'
                            : 'bg-[#F7F3EB] text-[#1A1A1A] hover:bg-[#34C8B6]/10'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Latest Posts */}
              {latestPosts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-[#34C8B6]" />
                    Son Yazılar
                  </h3>
                  <div className="space-y-4">
                    {latestPosts.map((post, index) => (
                      <div
                        key={post.id}
                        onClick={() => router.push(`/blog/${post.slug}`)}
                        className="group cursor-pointer"
                      >
                        <div className="flex gap-3">
                          {post.image && (
                            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#34C8B6]/10 to-[#D7A449]/10">
                              <img
                                src={post.image}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-[#1A1A1A] group-hover:text-[#34C8B6] transition-colors line-clamp-2 mb-1">
                              {post.title}
                            </h4>
                            <div className="flex items-center gap-1.5 text-xs text-[#1A1A1A]/60">
                              <Clock size={12} />
                              <time>
                                {new Date(post.published_at).toLocaleDateString('tr-TR', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </time>
                            </div>
                          </div>
                        </div>
                        {index < latestPosts.length - 1 && (
                          <div className="border-b border-[#1A1A1A]/5 mt-4"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
