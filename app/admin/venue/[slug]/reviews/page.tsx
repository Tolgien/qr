
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Star, Check, X, Trash2 } from 'lucide-react'

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

export default function ReviewsPage() {
  const params = useParams()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }

    try {
      const res = await fetch(`/api/admin/venue/${params.slug}/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews)
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to load reviews:', error)
      setLoading(false)
    }
  }

  const handleApprove = async (reviewId: number, approve: boolean) => {
    const token = localStorage.getItem('adminToken')

    try {
      const res = await fetch(`/api/admin/venue/${params.slug}/reviews`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reviewId, is_approved: approve })
      })

      if (res.ok) {
        loadReviews()
      }
    } catch (error) {
      console.error('Failed to update review:', error)
    }
  }

  const handleDelete = async (reviewId: number) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return

    const token = localStorage.getItem('adminToken')

    try {
      const res = await fetch(`/api/admin/venue/${params.slug}/reviews?id=${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        loadReviews()
      }
    } catch (error) {
      console.error('Failed to delete review:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const pendingReviews = reviews.filter(r => !r.is_approved)
  const approvedReviews = reviews.filter(r => r.is_approved)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/admin/venue/${params.slug}`)}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Geri
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Yorumlar</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pending Reviews */}
        {pendingReviews.length > 0 && (
          <div className="mb-8">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
              <h2 className="text-lg font-semibold text-amber-900">
                Onay Bekleyen Yorumlar ({pendingReviews.length})
              </h2>
            </div>
            <div className="space-y-4">
              {pendingReviews.map(review => (
                <div key={review.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
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
                        <p className="mt-3 text-gray-700">{review.comment}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(review.id, true)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    >
                      <Check size={18} />
                      Onayla
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Onaylanmış Yorumlar ({approvedReviews.length})
          </h2>
          {approvedReviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Henüz onaylanmış yorum yok
            </div>
          ) : (
            <div className="space-y-4">
              {approvedReviews.map(review => (
                <div key={review.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
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
                        <span className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
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
                        <p className="mt-3 text-gray-700">{review.comment}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(review.id, false)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      <X size={18} />
                      Onayı Kaldır
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
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
