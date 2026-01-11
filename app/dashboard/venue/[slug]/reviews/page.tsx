'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Star, Check, X, Trash2 } from 'lucide-react'

interface Review {
  id: number
  customer_name: string
  rating: number
  comment: string
  is_approved: boolean
  created_at: string
  item_name: string
  item_id: number
}

export default function UserVenueReviews() {
  const params = useParams()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    loadReviews()
  }, [params.slug])

  const loadReviews = async () => {
    try {
      const res = await fetch(`/api/user/venue/${params.slug}/reviews`, {
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
        setIsAuthenticated(true)
      } else if (res.status === 401 || res.status === 403) {
        setIsAuthenticated(false)
      } else {
        console.error('Failed to load reviews:', await res.text())
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (reviewId: number, isApproved: boolean) => {
    try {
      const res = await fetch(`/api/user/venue/${params.slug}/reviews`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ reviewId, is_approved: isApproved })
      })

      if (res.ok) {
        loadReviews()
      } else {
        console.error('Failed to update review:', await res.text())
      }
    } catch (error) {
      console.error('Error updating review:', error)
    }
  }

  const handleDelete = async (reviewId: number) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return

    try {
      const res = await fetch(`/api/user/venue/${params.slug}/reviews?id=${reviewId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        loadReviews()
      } else {
        console.error('Failed to delete review:', await res.text())
      }
    } catch (error) {
      console.error('Error deleting review:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#34C8B6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push(`/dashboard/venue/${params.slug}`)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Geri</span>
                </button>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Yorumlar</h1>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl p-8 sm:p-16 text-center shadow-lg">
            <div className="text-4xl sm:text-6xl mb-4">🔒</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Giriş Gerekli</h3>
            <p className="text-gray-600 text-sm sm:text-base mb-6">Yorumları görebilmek için lütfen giriş yapın.</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-[#34C8B6] hover:bg-[#2ab5a3] text-white rounded-xl font-semibold transition-colors"
            >
              Giriş Yap
            </button>
          </div>
        </div>
      </div>
    )
  }

  const pendingReviews = reviews.filter(r => !r.is_approved)
  const approvedReviews = reviews.filter(r => r.is_approved)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/dashboard/venue/${params.slug}`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Geri</span>
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Yorumlar</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Pending Reviews */}
        {pendingReviews.length > 0 && (
          <div className="mb-8">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4 rounded-lg">
              <h2 className="text-base sm:text-lg font-semibold text-amber-900">
                Onay Bekleyen Yorumlar ({pendingReviews.length})
              </h2>
            </div>
            <div className="space-y-4">
              {pendingReviews.map(review => (
                <div key={review.id} className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{review.customer_name}</h3>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              size={16}
                              fill={star <= review.rating ? '#F59E0B' : 'none'}
                              className={star <= review.rating ? 'text-amber-500' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">
                        Ürün: {review.item_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleString('tr-TR')}
                      </p>
                      {review.comment && (
                        <p className="mt-3 text-gray-700 text-sm sm:text-base">{review.comment}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleApprove(review.id, true)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm sm:text-base"
                    >
                      <Check size={18} />
                      Onayla
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm sm:text-base"
                    >
                      <Trash2 size={18} />
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved Reviews */}
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            Onaylanmış Yorumlar ({approvedReviews.length})
          </h2>
          {approvedReviews.length === 0 && pendingReviews.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 sm:p-16 text-center shadow-lg">
              <div className="text-4xl sm:text-6xl mb-4">⭐</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Henüz Yorum Yok</h3>
              <p className="text-gray-600 text-sm sm:text-base">Müşterilerinizden gelen yorumlar burada görünecek.</p>
            </div>
          ) : approvedReviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center text-gray-500">
              Henüz onaylanmış yorum yok
            </div>
          ) : (
            <div className="space-y-4">
              {approvedReviews.map(review => (
                <div key={review.id} className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{review.customer_name}</h3>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              size={16}
                              fill={star <= review.rating ? '#F59E0B' : 'none'}
                              className={star <= review.rating ? 'text-amber-500' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                          Onaylandı
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">
                        Ürün: {review.item_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleString('tr-TR')}
                      </p>
                      {review.comment && (
                        <p className="mt-3 text-gray-700 text-sm sm:text-base">{review.comment}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleApprove(review.id, false)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm sm:text-base"
                    >
                      <X size={18} />
                      Onayı Kaldır
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm sm:text-base"
                    >
                      <Trash2 size={18} />
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}