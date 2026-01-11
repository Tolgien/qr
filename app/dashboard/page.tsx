'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, Plus, QrCode, LogOut, TrendingUp, BarChart3, Users, ShoppingBag, Clock, AlertCircle, ArrowRight, ArrowLeft, Eye, Trash2, Settings, CheckCircle, X, Layers, Star, Calendar, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface OrderItem {
  id: number
  item_name: string
  variant_name?: string
  quantity: number
  notes?: string
  addons?: string[]
}

interface Order {
  id: number
  table_number: string
  total: number | string
  status: string
  created_at: string
  venue_name?: string
  venue_slug?: string
  items: OrderItem[]
}

interface Analytics {
  totalStats?: {
    totalOrders: number
    totalRevenue: number
    avgOrderValue: number
  }
  todayStats?: {
    todayOrders: number
  }
  dailyOrdersTrend?: { date: string; revenue: number; count: number }[]
  topItems?: { itemName: string; venueName: string; totalQuantity: number }[]
  venuePerformance?: { name: string; revenue: number; orderCount: number; itemCount: number }[]
  peakHours?: { hour: number; orderCount: number }[]
  recentReviews?: { id: number; customerName: string; rating: number; itemName: string; venueName: string; comment?: string }[]
  activeOrders?: Order[]
}

function AnalyticsSection({ userId }: { userId: number }) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [processingOrder, setProcessingOrder] = useState(false)


  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/user/analytics', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setAnalytics(data)
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [userId])

  const updateOrderStatus = async (orderId: number, status: string) => {
    setProcessingOrder(true)
    try {
      await fetch(`/api/order/${orderId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })

      // Reload analytics to update the active orders
      await fetchAnalytics()
      setSelectedOrder(null)
    } catch (error) {
      console.error('Error updating order:', error)
    } finally {
      setProcessingOrder(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'placed': return 'Alındı'
      case 'preparing': return 'Hazırlanıyor'
      case 'ready': return 'Hazır'
      case 'delivered': return 'Teslim Edildi'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ready': return 'bg-green-100 text-green-800 border-green-200'
      case 'delivered': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/user/analytics', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-[#34C8B6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Analytics yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return null
  }

  const hasData = (analytics.totalStats?.totalOrders ?? 0) > 0

  return (
    <div className="mt-8 space-y-6">
      {/* Stats Overview */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="text-[#34C8B6] w-6 h-6" />
          <h2 className="text-xl font-bold text-gray-900">Performans Özeti</h2>
        </div>
        {hasData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <p className="text-sm text-blue-700 mb-1">Toplam Sipariş</p>
              <p className="text-3xl font-bold text-blue-900">{analytics.totalStats?.totalOrders ?? 0}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <p className="text-sm text-green-700 mb-1">Toplam Gelir</p>
              <p className="text-3xl font-bold text-green-900">₺{(analytics.totalStats?.totalRevenue ?? 0).toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <p className="text-sm text-purple-700 mb-1">Bugün</p>
              <p className="text-3xl font-bold text-purple-900">{analytics.todayStats?.todayOrders ?? 0}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <p className="text-sm text-orange-700 mb-1">Ort. Sipariş</p>
              <p className="text-3xl font-bold text-orange-900">₺{(analytics.totalStats?.avgOrderValue ?? 0).toFixed(2)}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Henüz sipariş bulunmuyor</p>
          </div>
        )}
      </div>

      {/* Revenue Trend Chart */}
      {analytics.dailyOrdersTrend && analytics.dailyOrdersTrend.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="text-green-600 w-6 h-6" />
            <h3 className="text-xl font-bold text-gray-900">Son 30 Gün Gelir Trendi</h3>
          </div>
          <div className="overflow-x-auto">
            <div className="flex items-end justify-between gap-1 h-72 min-w-max px-2">
              {analytics.dailyOrdersTrend?.map((day: any, idx: number) => {
                const maxRevenue = Math.max(...(analytics.dailyOrdersTrend?.map((d: any) => Number(d.revenue) || 0) ?? []), 1)
                const dayRevenue = Number(day.revenue) || 0
                const heightPercent = maxRevenue > 0 ? (dayRevenue / maxRevenue) * 100 : 0
                const minHeight = dayRevenue > 0 ? 8 : 0
                const finalHeight = Math.max(heightPercent, minHeight)

                return (
                  <div key={`${day.date}-${idx}`} className="flex flex-col items-center gap-2 flex-1 min-w-[32px]">
                    <div className="relative w-full" style={{ height: '240px' }}>
                      <div
                        className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-300 group ${
                          dayRevenue > 0
                            ? 'bg-gradient-to-t from-[#34C8B6] to-[#2AA897] hover:from-[#2AA897] hover:to-[#34C8B6] shadow-md'
                            : 'bg-gray-200'
                        }`}
                        style={{ height: `${finalHeight}%`, minHeight: dayRevenue > 0 ? '8px' : '2px' }}
                      >
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
                          <div className="font-bold">₺{dayRevenue.toFixed(2)}</div>
                          <div className="text-gray-300">{day.count} sipariş</div>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap transform -rotate-45 origin-top-left mt-2">
                      {new Date(day.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Active Orders Section */}
      {analytics && analytics.activeOrders && analytics.activeOrders.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="text-purple-600 w-6 h-6" />
            <h3 className="text-xl font-bold text-gray-900">Aktif Siparişler</h3>
          </div>
          {analytics.activeOrders.length > 0 ? (
            <div className="grid gap-3">
              {analytics.activeOrders.slice(0, 5).map((order: any) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-[#34C8B6] hover:shadow-lg transition-all cursor-pointer text-left hover:bg-gradient-to-r hover:from-[#34C8B6]/5 hover:to-[#2AA897]/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#34C8B6]/10 to-[#2AA897]/10 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-[#34C8B6]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Masa {order.table_number}</p>
                      <p className="text-xs text-gray-500">{order.venue_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#34C8B6]">₺{parseFloat(order.total).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{order.items.length} ürün</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Henüz aktif sipariş bulunmuyor</p>
            </div>
          )}
        </div>
      )}


      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Items */}
        {analytics.topItems && analytics.topItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Package className="text-blue-600 w-6 h-6" />
              <h3 className="text-xl font-bold text-gray-900">En Çok Satan Ürünler</h3>
            </div>
            <div className="space-y-3">
              {analytics.topItems.slice(0, 5).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-gray-400">#{idx + 1}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{item.itemName}</p>
                      <p className="text-sm text-gray-500">{item.venueName}</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-blue-600">{item.totalQuantity} adet</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Venue Performance */}
        {analytics.venuePerformance && analytics.venuePerformance.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingBag className="text-green-600 w-6 h-6" />
              <h3 className="text-xl font-bold text-gray-900">Kafe Performansı</h3>
            </div>
            <div className="space-y-3">
              {analytics.venuePerformance.map((venue: any, idx: number) => (
                <div key={idx} className="p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900">{venue.name}</p>
                    <p className="text-lg font-bold text-green-600">₺{venue.revenue.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{venue.orderCount} sipariş</span>
                    <span>•</span>
                    <span>{venue.itemCount} ürün</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Peak Hours */}
        {analytics.peakHours && analytics.peakHours.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="text-purple-600 w-6 h-6" />
              <h3 className="text-xl font-bold text-gray-900">Yoğun Saatler</h3>
            </div>
            <div className="h-48 flex items-end justify-between gap-1">
              {analytics.peakHours?.map((hour: any) => {
                const maxCount = Math.max(...(analytics.peakHours?.map((h: any) => h.orderCount) ?? []))
                const height = maxCount > 0 ? (hour.orderCount / maxCount) * 100 : 0
                return (
                  <div key={hour.hour} className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t hover:from-purple-600 hover:to-purple-500 transition-all group relative" style={{ height: `${height}%`, minHeight: '4px' }}>
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {hour.orderCount} sipariş
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{hour.hour}:00</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent Reviews */}
        {analytics.recentReviews && analytics.recentReviews.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Star className="text-yellow-600 w-6 h-6" />
              <h3 className="text-xl font-bold text-gray-900">Son Değerlendirmeler</h3>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {analytics.recentReviews.slice(0, 5).map((review: any) => (
                <div key={review.id} className="p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900">{review.customerName}</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={14}
                          fill={star <= review.rating ? '#F59E0B' : 'none'}
                          className={star <= review.rating ? 'text-yellow-500' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{review.itemName} - {review.venueName}</p>
                  {review.comment && (
                    <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

interface DeleteConfirmation {
  venueId: number
  venueName: string
}

interface Venue {
  id: number
  slug: string
  name: string
  logo?: string
  coverImage?: string
  status: string
}

interface UserProfile {
  id: number
  name: string
  email: string
  membershipTier: string
  limits: {
    maxCategories: number
    maxItems: number
  }
  currentUsage: {
    categories: number
    items: number
  }
  venuesCount: number
  membershipExpiresAt?: string
}

interface Analytics {
  totalStats?: {
    totalOrders: number
    totalRevenue: number
    avgOrderValue: number
  }
  todayStats?: {
    todayOrders: number
  }
  dailyOrdersTrend?: { date: string; revenue: number; count: number }[]
  topItems?: { itemName: string; venueName: string; totalQuantity: number }[]
  venuePerformance?: { name: string; revenue: number; orderCount: number; itemCount: number }[]
  peakHours?: { hour: number; orderCount: number }[]
  recentReviews?: { id: number; customerName: string; rating: number; itemName: string; venueName: string; comment?: string }[]
  activeOrders?: Order[]
}


export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedUpgradeTier, setSelectedUpgradeTier] = useState<'basic' | 'premium'>('premium')
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  const [loadingVenues, setLoadingVenues] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [processingOrder, setProcessingOrder] = useState(false)
  const [qrModal, setQrModal] = useState<{ show: boolean; slug: string; name: string; qrUrl: string } | null>(null)


  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('adminToken')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('adminToken')
    }
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/profile', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else if (res.status === 401) {
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        showToast('Profil bilgileri yüklenirken bir hata oluştu.', 'error');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await fetch('/api/user/venues', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setVenues(data.venues);
        } else if (res.status === 401) {
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Error fetching venues:', error);
        showToast('Kafeler yüklenirken bir hata oluştu.', 'error');
      } finally {
        setLoadingVenues(false);
      }
    };

    if (user) {
      fetchVenues();
    }
  }, [user, router]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.id) return;

      try {
        const res = await fetch(`/api/user/analytics?userId=${user.id}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();

          // Check for new orders and play notification sound
          if (analytics?.activeOrders && data.activeOrders) {
            const oldOrderIds = analytics.activeOrders.map((o: Order) => o.id);
            const newOrderIds = data.activeOrders.map((o: Order) => o.id);
            const hasNewOrder = newOrderIds.some((id: number) => !oldOrderIds.includes(id));

            if (hasNewOrder) {
              // Play notification sound
              const audio = new Audio('/notification.mp3');
              audio.play().catch(err => console.error('Error playing notification:', err));

              // Show toast notification
              showToast('Yeni sipariş geldi!', 'success');
            }
          }

          setAnalytics(data);
        } else if (res.status === 401) {
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        showToast('Analitik verileri yüklenirken bir hata oluştu.', 'error');
      } finally {
        setLoadingAnalytics(false);
      }
    };

    if (user) {
      fetchAnalytics();

      // Poll for new orders every 10 seconds
      const interval = setInterval(fetchAnalytics, 10000);
      return () => clearInterval(interval);
    }
  }, [user, router, analytics?.activeOrders]);


  const loadProfile = async () => {
    // This function might not be needed anymore if fetchUser handles it on mount
    try {
      const res = await fetch('/api/user/profile', {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else if (res.status === 401) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const loadVenues = async () => {
    // This function might not be needed anymore if fetchVenues handles it on mount
    try {
      const res = await fetch('/api/user/venues', {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setVenues(data.venues)
      } else if (res.status === 401) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching venues:', error)
    } finally {
      setLoadingVenues(false)
    }
  }

  const handleDeleteVenue = async () => {
    if (!deleteConfirmation) return

    try {
      const res = await fetch(`/api/user/venues/${deleteConfirmation.venueId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await res.json()

      if (res.ok) {
        setVenues(venues.filter(v => v.id !== deleteConfirmation.venueId))
        showToast('Kafe başarıyla silindi', 'success')
        setDeleteConfirmation(null)
      } else {
        console.error('Delete error:', data)
        showToast(data.error || 'Kafe silinemedi', 'error')
      }
    } catch (error) {
      console.error('Error deleting venue:', error)
      showToast('Bir hata oluştu, lütfen tekrar deneyin', 'error')
    }
  }

  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/user/upgrade', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ membershipTier: selectedUpgradeTier })
      })

      const data = await response.json()

      if (response.ok && data.paymentPageUrl) {
        // Ödeme sayfasına yönlendir
        window.location.href = data.paymentPageUrl
      } else {
        showToast(data.error || 'Ödeme başlatılamadı', 'error')
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      showToast('Bir hata oluştu', 'error')
    }
  }

  const handleProfileUpdate = async () => {
    setProfileError('')
    setProfileSuccess('')

    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setProfileError('İsim ve email gerekli')
      return
    }

    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      setProfileError('Şifreler eşleşmiyor')
      return
    }

    if (profileForm.newPassword && profileForm.newPassword.length < 6) {
      setProfileError('Şifre en az 6 karakter olmalı')
      return
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: profileForm.name,
          email: profileForm.email,
          password: profileForm.newPassword || undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        setProfileSuccess('Profil başarıyla güncellendi')
        setUser(prev => prev ? { ...prev, name: profileForm.name, email: profileForm.email } : null)
        setTimeout(() => {
          setShowProfileModal(false)
          setProfileSuccess('')
          setProfileForm({ ...profileForm, newPassword: '', confirmPassword: '' })
        }, 2000)
      } else {
        setProfileError(data.error || 'Güncelleme başarısız')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setProfileError('Bir hata oluştu')
    }
  }

  const openProfileModal = () => {
    if (user) {
      setProfileForm({
        name: user.name,
        email: user.email,
        newPassword: '',
        confirmPassword: ''
      })
      setProfileError('')
      setProfileSuccess('')
      setShowProfileModal(true)
    }
  }

  const handleLogout = async () => {
    try {
      // Logout endpoint'ini çağır
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // localStorage.removeItem('user') // Token is now cookie-based
      router.push('/login')
    }
  }

  const getMembershipBadge = (tier: string) => {
    const badges = {
      free: { color: 'bg-gray-100 text-gray-800', text: 'Ücretsiz' },
      basic: { color: 'bg-blue-100 text-blue-800', text: 'Basic' },
      premium: { color: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white', text: 'Premium' }
    }
    return badges[tier as keyof typeof badges] || badges.free
  }

  const isTrialPeriodEndingSoon = (expiresAt: string | undefined): boolean => {
    if (!expiresAt) return false;
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffTime = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 14;
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    setProcessingOrder(true)
    try {
      await fetch(`/api/order/${orderId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })

      // Reload analytics to update the active orders
      await fetchAnalytics()
      setSelectedOrder(null)
    } catch (error) {
      console.error('Error updating order:', error)
    } finally {
      setProcessingOrder(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'placed': return 'Alındı'
      case 'preparing': return 'Hazırlanıyor'
      case 'ready': return 'Hazır'
      case 'delivered': return 'Teslim Edildi'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ready': return 'bg-green-100 text-green-800 border-green-200'
      case 'delivered': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const fetchAnalytics = async () => {
    if (!user?.id) return;

    try {
      const res = await fetch(`/api/user/analytics?userId=${user.id}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      } else if (res.status === 401) {
        router.push('/login');
        return;
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showToast('Analitik verileri yüklenirken bir hata oluştu.', 'error');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const generateQrCode = async (venueSlug: string, venueName: string) => {
    try {
      const qrUrl = `${window.location.origin}/menu/${venueSlug}`; // Logo eklendiğinde buraya URL gönderilecek
      setQrModal({ show: true, slug: venueSlug, name: venueName, qrUrl: qrUrl });
    } catch (error) {
      console.error('Error generating QR code:', error);
      showToast('QR kod oluşturulurken bir hata oluştu.', 'error');
    }
  };

  const closeQrModal = () => {
    setQrModal(null);
  };


  if (loading || loadingVenues || loadingAnalytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#34C8B6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  const membershipBadge = user ? getMembershipBadge(user.membershipTier) : { color: '', text: '' }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#34C8B6] to-[#2AA897] rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Menü Yönetimi</h1>
                <p className="text-xs text-gray-500">Kafelerinizi yönetin</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${membershipBadge.color}`}>
                    {membershipBadge.text}
                  </span>
                </div>
              )}
              {user && user.membershipTier !== 'premium' && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D7A449] to-[#34C8B6] hover:shadow-lg text-white rounded-lg font-semibold transition-all"
                  title="Premium'a Geç"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Premium</span>
                </button>
              )}
              <button
                onClick={openProfileModal}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-all"
                title="Profili Düzenle"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Profil</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Membership Info */}
        {user && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#34C8B6] to-[#2AA897] rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Üyelik Bilgileri</h2>
                  <p className="text-sm text-gray-500">Mevcut paket ve limitler</p>
                </div>
              </div>
              {user.membershipTier !== 'premium' && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] text-white rounded-lg font-medium hover:shadow-lg transition-all text-sm flex items-center gap-2"
                >
                  <span>Premium'a Geç</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {user.membershipExpiresAt && (
              <div className={`p-4 rounded-xl border mb-6 ${
                isTrialPeriodEndingSoon(user.membershipExpiresAt)
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                  : user.membershipTier === 'premium'
                    ? 'bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200'
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
              }`}>
                <p className={`text-sm flex items-center gap-2 ${
                  isTrialPeriodEndingSoon(user.membershipExpiresAt)
                    ? 'text-yellow-900'
                    : user.membershipTier === 'premium'
                      ? 'text-violet-900'
                      : 'text-blue-900'
                }`}>
                  <span className="text-xl">
                    {isTrialPeriodEndingSoon(user.membershipExpiresAt) ? '⏳' : user.membershipTier === 'premium' ? '💎' : '📅'}
                  </span>
                  <span>
                    {user.membershipTier === 'free' ? (
                      <>
                        <strong>Deneme Süresi Bitiyor:</strong> Üyeliğinizin sona ermesine {Math.ceil((new Date(user.membershipExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} gün kaldı.
                        Sınırsız kullanıma devam etmek için lütfen <Link href="/pricing" className="font-bold underline">üyeliğinizi yükseltin</Link>.
                      </>
                    ) : user.membershipTier === 'premium' ? (
                      <>
                        <strong>Premium Üyelik:</strong> {new Date(user.membershipExpiresAt) > new Date() ? (
                          <>
                            Üyeliğiniz {new Date(user.membershipExpiresAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })} tarihine kadar aktif.
                            ({Math.ceil((new Date(user.membershipExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} gün kaldı)
                          </>
                        ) : (
                          <>
                            Üyeliğinizin süresi doldu. Lütfen <Link href="/pricing" className="font-bold underline">yenileyin</Link>.
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <strong>Üyelik Bilgisi:</strong> {new Date(user.membershipExpiresAt) > new Date() ? (
                          <>
                            Üyeliğiniz {new Date(user.membershipExpiresAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })} tarihine kadar aktif.
                            ({Math.ceil((new Date(user.membershipExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} gün kaldı)
                          </>
                        ) : (
                          <>
                            Üyeliğinizin süresi doldu. Lütfen <Link href="/pricing" className="font-bold underline">yenileyin</Link>.
                          </>
                        )}
                      </>
                    )}
                  </span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <p className="text-sm font-medium text-blue-900">Kategori Kullanımı</p>
                </div>
                <p className="text-3xl font-bold text-blue-700">
                  {user.currentUsage.categories} / {user.limits.maxCategories === -1 ? '∞' : user.limits.maxCategories}
                </p>
                {user.limits.maxCategories !== -1 && (
                  <div className="mt-2 bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((user.currentUsage.categories / user.limits.maxCategories) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-medium text-green-900">Ürün Kullanımı</p>
                </div>
                <p className="text-3xl font-bold text-green-700">
                  {user.currentUsage.items} / {user.limits.maxItems === -1 ? '∞' : user.limits.maxItems}
                </p>
                {user.limits.maxItems !== -1 && (
                  <div className="mt-2 bg-green-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((user.currentUsage.items / user.limits.maxItems) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  <p className="text-sm font-medium text-purple-900">Aktif Kafeler</p>
                </div>
                <p className="text-3xl font-bold text-purple-700">{user.venuesCount}</p>
              </div>
            </div>

            {user.membershipTier === 'free' && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-900 flex items-center gap-2 mb-3">
                  <span className="text-xl">💡</span>
                  <span>
                    <strong>Pro İpucu:</strong> Ücretsiz planda {user.limits.maxCategories} kategori ve {user.limits.maxItems} ürün hakkınız var. Premium üyelik ile sınırsız kategori ve ürün ekleyebilir, gelişmiş analitik raporlarına erişebilirsiniz!
                  </span>
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] text-white rounded-lg font-semibold hover:shadow-xl transition-all text-sm"
                >
                  <span>Hemen Premium'a Geç</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
            {user.membershipTier === 'basic' && (
              <div className="mt-4 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                <p className="text-sm text-violet-900 flex items-center gap-2 mb-3">
                  <span className="text-xl">✨</span>
                  <span>
                    <strong>Premium'a Geçin:</strong> AI ürün önerileri, akıllı chatbot ve daha fazla premium özellik ile işletmenizi bir üst seviyeye taşıyın!
                  </span>
                </p>
                <button
                  onClick={() => {
                    setSelectedUpgradeTier('premium')
                    setShowUpgradeModal(true)
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D7A449] to-[#34C8B6] text-white rounded-lg font-semibold hover:shadow-xl transition-all text-sm"
                >
                  <span>Premium Özellikleri Keşfet</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
            {user.membershipTier === 'free' && (
              (user.currentUsage.categories >= user.limits.maxCategories || user.currentUsage.items >= user.limits.maxItems) && (
                <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200">
                  <p className="text-sm text-red-900 flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <span>
                      <strong>Limit Doldu:</strong> {user.currentUsage.categories >= user.limits.maxCategories && 'Kategori limitinize ulaştınız. '}{user.currentUsage.items >= user.limits.maxItems && 'Ürün limitinize ulaştınız. '}Daha fazla eklemek için üyeliğinizi yükseltin.
                    </span>
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {/* Venues Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#34C8B6] to-[#2AA897] rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Kafelerim</h2>
                <p className="text-sm text-gray-500">{venues.length} kafe kayıtlı</p>
              </div>
            </div>
            <Link
              href="/dashboard/venue/new"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] hover:from-[#2AA897] hover:to-[#34C8B6] text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>Yeni Kafe</span>
            </Link>
          </div>

          {venues.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-16 text-center border-2 border-dashed border-gray-300">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz kafe eklemediniz</h3>
              <p className="text-gray-600 mb-6">İlk kafenizi ekleyerek dijital menü oluşturmaya başlayın</p>
              <Link
                href="/dashboard/venue/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                İlk Kafenizi Ekleyin
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue) => (
                <div
                  key={venue.id}
                  className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4 mb-6">
                    {venue.logo && (
                      <img src={venue.logo} alt={venue.name} className="w-16 h-16 rounded-xl object-cover shadow-md" />
                    )}
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#34C8B6] transition-colors flex-1">
                      {venue.name}
                    </h3>
                  </div>

                  {/* Rest of the venue card content */}
                  <div className="p-0 pt-5">
                    <p className="text-sm text-gray-500 mb-4 font-mono">/menu/{venue.slug}</p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/venue/${venue.slug}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] text-white rounded-lg font-medium hover:shadow-lg transition-all text-sm"
                      >
                        <Settings className="w-4 h-4" />
                        Yönet
                      </Link>
                      <Link
                        href={`/menu/${venue.slug}`}
                        target="_blank"
                        className="flex items-center justify-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                        title="Menüyü Görüntüle"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirmation({ venueId: venue.id, venueName: venue.name })}
                        className="flex items-center justify-center px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all"
                        title="Kafeyi Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => generateQrCode(venue.slug, venue.name)}
                        className="flex items-center justify-center px-4 py-2.5 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg transition-all"
                        title="QR Kod Oluştur"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analytics Section */}
        {user?.id && <AnalyticsSection userId={user.id} />}

        {/* Quick Tips */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="font-bold text-blue-900 mb-2">QR Menü</h3>
            <p className="text-sm text-blue-700">Müşterileriniz QR kod ile menünüze kolayca erişebilir</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="font-bold text-green-900 mb-2">Özelleştirme</h3>
            <p className="text-sm text-green-700">Logo, kapak görseli ve renkleri özelleştirin</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-bold text-purple-900 mb-2">Analitik</h3>
            <p className="text-sm text-purple-700">Sipariş ve ürün istatistiklerinizi takip edin</p>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-slideIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#34C8B6] to-[#2AA897] rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Premium'a Geçin</h3>
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div
                onClick={() => setSelectedUpgradeTier('basic')}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedUpgradeTier === 'basic'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xl font-bold text-gray-900">Basic Plan</h4>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">299₺</div>
                    <div className="text-sm text-gray-500">/ay</div>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    Sınırsız Kategori & Ürün
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    Gelişmiş İstatistikler
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    AI Desteği
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    Çoklu Dil
                  </li>
                </ul>
              </div>

              <div
                onClick={() => setSelectedUpgradeTier('premium')}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all relative ${
                  selectedUpgradeTier === 'premium'
                    ? 'border-violet-500 bg-gradient-to-br from-violet-50 to-purple-50'
                    : 'border-gray-200 hover:border-violet-300'
                }`}
              >
                <div className="absolute -top-3 right-4">
                  <span className="bg-gradient-to-r from-[#D7A449] to-[#34C8B6] text-white text-xs px-3 py-1 rounded-full font-bold">
                    En Popüler
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xl font-bold text-gray-900">Premium Plan</h4>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-violet-600">999₺</div>
                    <div className="text-sm text-gray-500">/ay</div>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-violet-500" />
                    Basic'teki Her Şey
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-violet-500" />
                    Akıllı Chatbot
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-violet-500" />
                    Gelişmiş AI Özellikleri
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-violet-500" />
                    Premium Tema & Tasarım
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-violet-500" />
                    WhatsApp Entegrasyonu
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-violet-500" />
                    Öncelikli Destek
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>💳 Güvenli Ödeme:</strong> Ödemeniz SSL şifreli altyapı ile korunmaktadır. İstediğiniz zaman iptal edebilirsiniz.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleUpgrade}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] hover:from-[#2AA897] hover:to-[#34C8B6] text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Ödemeye Geç
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideIn">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#34C8B6] to-[#2AA897] rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Profili Düzenle</h3>
              </div>
              <button
                onClick={() => {
                  setShowProfileModal(false)
                  setProfileError('')
                  setProfileSuccess('')
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İsim
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent outline-none"
                  placeholder="Adınız"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent outline-none"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Şifre (Opsiyonel)
                </label>
                <input
                  type="password"
                  value={profileForm.newPassword}
                  onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent outline-none"
                  placeholder="En az 6 karakter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre Tekrar (Opsiyonel)
                </label>
                <input
                  type="password"
                  value={profileForm.confirmPassword}
                  onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent outline-none"
                  placeholder="Şifreyi tekrar girin"
                />
              </div>

              {profileError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{profileError}</p>
                </div>
              )}

              {profileSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">{profileSuccess}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowProfileModal(false)
                    setProfileError('')
                    setProfileSuccess('')
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
                >
                  İptal
                </button>
                <button
                  onClick={handleProfileUpdate}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] hover:from-[#2AA897] hover:to-[#34C8B6] text-white rounded-xl font-medium transition-all shadow-md"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Kafeyi Sil</h3>
            </div>

            <p className="text-gray-700 mb-2">
              <span className="font-semibold">"{deleteConfirmation.venueName}"</span> kafesinizi silmek istediğinizden emin misiniz?
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                ⚠️ <strong>Bu işlem geri alınamaz!</strong> Tüm menü öğeleri, kategoriler ve siparişler kalıcı olarak silinecektir.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteVenue}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl min-w-[320px] animate-slideIn ${
              toast.type === 'success'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
            )}
            <p className="flex-1 font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50 bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Sipariş #{selectedOrder.id}</h2>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedOrder.created_at).toLocaleString('tr-TR')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Masa Numarası</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedOrder.table_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Durum</p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Mekan</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedOrder.venue_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Toplam</p>
                    <p className="text-lg font-semibold text-emerald-600">
                      ₺{parseFloat(selectedOrder.total as any).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Sipariş Detayları</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {item.quantity}x {item.item_name}
                            </p>
                            {item.variant_name && (
                              <p className="text-sm text-gray-600 mt-1">
                                • {item.variant_name}
                              </p>
                            )}
                            {item.addons && item.addons.length > 0 && (
                              <p className="text-sm text-gray-600 mt-1">
                                • {item.addons.join(', ')}
                              </p>
                            )}
                            {item.notes && (
                              <p className="text-sm text-gray-500 italic mt-1">
                                Not: "{item.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {selectedOrder.status === 'placed' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')}
                        disabled={processingOrder}
                        className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingOrder ? 'İşleniyor...' : 'Hazırlanmaya Başla'}
                      </button>
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'ready')}
                        disabled={processingOrder}
                        className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingOrder ? 'İşleniyor...' : 'Hazır Olarak İşaretle'}
                      </button>
                    </>
                  )}
                  {selectedOrder.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'ready')}
                      disabled={processingOrder}
                      className="col-span-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {processingOrder ? 'İşleniyor...' : 'Hazır Olarak İşaretle'}
                    </button>
                  )}
                  {selectedOrder.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                      disabled={processingOrder}
                      className="col-span-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {processingOrder ? 'İşleniyor...' : 'Teslim Edildi Olarak İşaretle'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrModal?.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeQrModal}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
              >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#34C8B6] to-[#2AA897] rounded-xl flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">QR Kod</h3>
                </div>
                <button
                  onClick={closeQrModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="text-center mb-6">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{qrModal.name}</h4>
                <p className="text-xs text-gray-500 mb-4 sm:mb-6 font-mono break-all px-2">{qrModal.qrUrl}</p>

                {/* QR Code Container */}
                <div className="w-full max-w-[280px] sm:max-w-xs aspect-square mx-auto bg-white rounded-xl p-3 sm:p-4 shadow-lg mb-4 relative">
                  {/* QR Code */}
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrModal.qrUrl)}&format=png`} 
                    alt="QR Code" 
                    className="w-full h-full object-contain"
                  />
                  {/* Logo Overlay - Site Logo */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-lg shadow-lg flex items-center justify-center p-1.5">
                      <img 
                        src="/logo-qrim.png" 
                        alt="QRim Logo" 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 px-2">
                  QR kodu okutarak <span className="font-semibold">"{qrModal.name}"</span> menüsüne erişin
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={closeQrModal}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
                >
                  Kapat
                </button>
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(qrModal.qrUrl)}&format=png`}
                  download={`${qrModal.slug}-menu-qr.png`}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] hover:from-[#2AA897] hover:to-[#34C8B6] text-white rounded-xl font-medium transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> İndir
                </a>
              </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}