'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Store, 
  Package, 
  LayoutGrid, 
  ShoppingCart, 
  Star, 
  Users, 
  TrendingUp, 
  Activity,
  Coffee,
  LogOut,
  Plus,
  ArrowRight,
  MessageSquare,
  Clock,
  Mail,
  FileText,
  User,
  X,
  Lock
} from 'lucide-react'
import Link from 'next/link'

interface VenueStats {
  id: number
  slug: string
  name: string
  logo?: string
  totalItems: number
  totalCategories: number
  totalOrders: number
  status: string
}

interface Review {
  id: number
  customerName: string
  rating: number
  comment: string
  isApproved: boolean
  createdAt: string
  itemName: string
  venueName: string
  venueSlug: string
}

interface GlobalStats {
  totalVenues: number
  totalItems: number
  totalCategories: number
  totalOrders: number
  totalReviews: number
  totalAdmins: number
  recentOrders: number
  recentReviews: number
  pendingReviews: number
  topVenues: { name: string; slug: string; itemCount: number }[]
  allReviews: Review[]
  pendingReviewsList: Review[]
  dailyOrdersTrend?: { date: string; revenue: number; orderCount: number }[]
  topVenuesByRevenue?: { venueName: string; venueSlug: string; totalRevenue: number }[]
  popularItems?: { itemName: string; venueName: string; venueSlug: string; orderCount: number }[]
  membershipDistribution?: { tier: string; userCount: number }[]
  venueRatings?: { venueName: string; venueSlug: string; avgRating: number; reviewCount: number }[]
}

interface AdminProfile {
  id: number
  username: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [venues, setVenues] = useState<VenueStats[]>([])
  const [stats, setStats] = useState<GlobalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [profileForm, setProfileForm] = useState({ username: '', newPassword: '', confirmPassword: '' })
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [deleteVenueId, setDeleteVenueId] = useState<number | null>(null)
  const [deleteVenueName, setDeleteVenueName] = useState<string>('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }

    // Fetch venues, stats and profile
    Promise.all([
      fetch(`/api/admin/venues?t=${Date.now()}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
      }),
      fetch(`/api/admin/stats?t=${Date.now()}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
      }),
      fetch(`/api/admin/profile`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
      })
    ])
      .then(async ([venuesRes, statsRes, profileRes]) => {
        if (venuesRes.status === 401 || statsRes.status === 401 || profileRes.status === 401) {
          localStorage.removeItem('adminToken')
          router.push('/admin/login')
          return [null, null, null]
        }
        const venuesData = await venuesRes.json()
        const statsData = await statsRes.json()
        const profileData = await profileRes.json()
        return [venuesData, statsData, profileData]
      })
      .then(([venuesData, statsData, profileData]) => {
        if (venuesData) setVenues(venuesData.venues || [])
        if (statsData) setStats(statsData)
        if (profileData) {
          setProfile(profileData)
          setProfileForm({ username: profileData.username, newPassword: '', confirmPassword: '' })
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching data:', err)
        setLoading(false)
      })
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }

  const handleDeleteVenue = async () => {
    if (!deleteVenueId) return

    setDeleting(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/venues', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ venueId: deleteVenueId })
      })

      if (response.ok) {
        // Remove from state
        setVenues(venues.filter(v => v.id !== deleteVenueId))
        setDeleteVenueId(null)
        setDeleteVenueName('')
        // Refresh stats
        window.location.reload()
      } else {
        const error = await response.json()
        alert(error.error || 'Kafe silinemedi')
      }
    } catch (err) {
      console.error(err)
      alert('Bir hata oluştu')
    } finally {
      setDeleting(false)
    }
  }

  const handleProfileUpdate = async () => {
    setProfileError('')
    setProfileSuccess('')

    if (!profileForm.username.trim()) {
      setProfileError('Kullanıcı adı gerekli')
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
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: profileForm.username,
          password: profileForm.newPassword || undefined
        })
      })

      if (response.ok) {
        setProfileSuccess('Profil başarıyla güncellendi')
        setProfileForm({ ...profileForm, newPassword: '', confirmPassword: '' })
        setTimeout(() => {
          setShowProfileModal(false)
          setProfileSuccess('')
        }, 2000)
      } else {
        const data = await response.json()
        setProfileError(data.error || 'Güncelleme başarısız')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      setProfileError('Bir hata oluştu')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Dashboard yükleniyor...</p>
        </motion.div>
      </div>
    )
  }

  const statCards = [
    { icon: Store, label: 'Toplam Kafe', value: stats?.totalVenues || 0, color: 'from-emerald-500 to-teal-500', bgColor: 'from-emerald-50 to-teal-50' },
    { icon: Package, label: 'Toplam Ürün', value: stats?.totalItems || 0, color: 'from-blue-500 to-cyan-500', bgColor: 'from-blue-50 to-cyan-50' },
    { icon: LayoutGrid, label: 'Kategoriler', value: stats?.totalCategories || 0, color: 'from-purple-500 to-pink-500', bgColor: 'from-purple-50 to-pink-50' },
    { icon: ShoppingCart, label: 'Siparişler', value: stats?.totalOrders || 0, color: 'from-orange-500 to-red-500', bgColor: 'from-orange-50 to-red-50' },
    { icon: Star, label: 'Değerlendirmeler', value: stats?.totalReviews || 0, color: 'from-yellow-500 to-amber-500', bgColor: 'from-yellow-50 to-amber-50' },
    { icon: Users, label: 'Yöneticiler', value: stats?.totalAdmins || 0, color: 'from-indigo-500 to-violet-500', bgColor: 'from-indigo-50 to-violet-50' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Modern Header */}
      <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Coffee className="text-white" size={28} />
              </div>
              <div className="hidden md:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500">QRim.net Yönetim Paneli</p>
              </div>
            </motion.div>
            <div className="flex items-center gap-3">
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProfileModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-100 to-teal-100 hover:from-emerald-200 hover:to-teal-200 rounded-xl text-emerald-700 font-medium transition-all flex items-center gap-2 shadow-md"
              >
                <Users size={20} />
                Profil
              </motion.button>
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl text-gray-700 font-medium transition-all flex items-center gap-2 shadow-md"
              >
                <LogOut size={20} />
                Çıkış Yap
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`relative overflow-hidden bg-gradient-to-br ${stat.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-white/50`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                  <p className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="text-white" size={28} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <TrendingUp size={16} className="text-emerald-600" />
                <span className="text-gray-600 font-medium">Aktif</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Activity Stats */}
        {stats && (stats.recentOrders > 0 || stats.recentReviews > 0 || (stats.pendingReviews ?? 0) > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12 bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-emerald-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <Activity className="text-emerald-600" size={24} />
              <h3 className="text-xl font-bold text-gray-900">Son 7 Gün Aktivite</h3>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm text-gray-600 mb-1">Yeni Siparişler</p>
                <p className="text-3xl font-bold text-blue-600">{stats.recentOrders}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <p className="text-sm text-gray-600 mb-1">Yeni Değerlendirmeler</p>
                <p className="text-3xl font-bold text-purple-600">{stats.recentReviews}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                <p className="text-sm text-gray-600 mb-1">Onay Bekleyen</p>
                <p className="text-3xl font-bold text-amber-600">{stats.pendingReviews ?? 0}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Analytics Charts */}
        {stats && (
          <>
            {/* Revenue Trend */}
            {stats.dailyOrdersTrend && stats.dailyOrdersTrend.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="mb-8 bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-emerald-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="text-green-600" size={24} />
                  <h3 className="text-xl font-bold text-gray-900">Son 30 Gün Gelir Trendi</h3>
                </div>
                <div className="overflow-x-auto">
                  <div className="flex items-end justify-between gap-1 h-72 min-w-max px-2">
                    {stats.dailyOrdersTrend.map((day: any, idx: number) => {
                      const maxRevenue = Math.max(...(stats.dailyOrdersTrend || []).map((d: any) => Number(d.revenue) || 0), 1)
                      const dayRevenue = Number(day.revenue) || 0
                      const heightPercent = maxRevenue > 0 ? (dayRevenue / maxRevenue) * 100 : 0
                      const minHeight = dayRevenue > 0 ? 8 : 0
                      const finalHeight = Math.max(heightPercent, minHeight)
                      
                      return (
                        <div key={idx} className="flex flex-col items-center gap-2 flex-1 min-w-[32px]">
                          <div className="relative w-full" style={{ height: '240px' }}>
                            <div 
                              className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-300 group ${
                                dayRevenue > 0
                                  ? 'bg-gradient-to-t from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 shadow-md'
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
              </motion.div>
            )}

            {/* Top Performers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Top Venues by Revenue */}
              {stats.topVenuesByRevenue && stats.topVenuesByRevenue.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-emerald-100"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Store className="text-emerald-600" size={24} />
                    <h3 className="text-xl font-bold text-gray-900">En Çok Gelir Getiren Kafeler</h3>
                  </div>
                  <div className="space-y-3">
                    {stats.topVenuesByRevenue.slice(0, 5).map((venue: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                          <div>
                            <p className="font-semibold text-gray-900">{venue.name}</p>
                            <p className="text-sm text-gray-500">{venue.orderCount} sipariş</p>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-green-600">₺{venue.totalRevenue.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Popular Items */}
              {stats.popularItems && stats.popularItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-emerald-100"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Package className="text-blue-600" size={24} />
                    <h3 className="text-xl font-bold text-gray-900">En Popüler Ürünler</h3>
                  </div>
                  <div className="space-y-3">
                    {stats.popularItems.slice(0, 5).map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                          <div>
                            <p className="font-semibold text-gray-900">{item.itemName}</p>
                            <p className="text-sm text-gray-500">{item.venueName}</p>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-blue-600">{item.totalQuantity} adet</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Membership & Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Membership Distribution */}
              {stats.membershipDistribution && stats.membershipDistribution.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-emerald-100"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Users className="text-purple-600" size={24} />
                    <h3 className="text-xl font-bold text-gray-900">Üyelik Dağılımı</h3>
                  </div>
                  <div className="space-y-4">
                    {stats.membershipDistribution.map((tier: any, idx: number) => {
                      const total = (stats.membershipDistribution || []).reduce((sum: number, t: any) => sum + t.userCount, 0)
                      const percentage = (tier.userCount / total) * 100
                      return (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900 capitalize">{tier.tier}</span>
                            <span className="text-sm text-gray-600">{tier.userCount} kullanıcı</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full ${
                                tier.tier === 'premium' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                tier.tier === 'basic' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                                'bg-gradient-to-r from-gray-400 to-gray-600'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Top Rated Venues */}
              {stats.venueRatings && stats.venueRatings.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85 }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-emerald-100"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Star className="text-yellow-600" size={24} />
                    <h3 className="text-xl font-bold text-gray-900">En Yüksek Puanlı Kafeler</h3>
                  </div>
                  <div className="space-y-3">
                    {stats.venueRatings.slice(0, 5).map((venue: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                          <div>
                            <p className="font-semibold text-gray-900">{venue.venueName}</p>
                            <p className="text-sm text-gray-500">{venue.reviewCount} değerlendirme</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star fill="#F59E0B" className="text-yellow-500 w-5 h-5" />
                          <p className="text-lg font-bold text-yellow-600">{venue.avgRating}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </>
        )}

        {/* Pending Reviews Section */}
        {stats && stats.pendingReviewsList && stats.pendingReviewsList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-12 bg-gradient-to-br from-amber-50 to-orange-50 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-amber-200"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Clock className="text-amber-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Onay Bekleyen Değerlendirmeler</h3>
              </div>
              <span className="px-3 py-1.5 bg-amber-500 text-white rounded-full text-sm font-semibold">{stats.pendingReviewsList.length} bekliyor</span>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {stats.pendingReviewsList.map((review) => (
                <div key={review.id} className="bg-white rounded-xl p-4 border-2 border-amber-300 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{review.customerName}</h4>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              size={14}
                              fill={star <= review.rating ? '#F59E0B' : 'none'}
                              className={star <= review.rating ? 'text-amber-500' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                          Bekliyor
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Store size={12} />
                        <span className="font-medium">{review.venueName}</span>
                        <span>•</span>
                        <span>{review.itemName}</span>
                        <span>•</span>
                        <Clock size={12} />
                        <span>{new Date(review.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* All Approved Reviews Section */}
        {stats && stats.allReviews && stats.allReviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-12 bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-emerald-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="text-emerald-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Onaylanmış Değerlendirmeler</h3>
              </div>
              <span className="text-sm text-gray-500">{stats.allReviews.length} değerlendirme</span>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {stats.allReviews.map((review) => (
                <div key={review.id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{review.customerName}</h4>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              size={14}
                              fill={star <= review.rating ? '#F59E0B' : 'none'}
                              className={star <= review.rating ? 'text-amber-500' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Store size={12} />
                        <span className="font-medium">{review.venueName}</span>
                        <span>•</span>
                        <span>{review.itemName}</span>
                        <span>•</span>
                        <Clock size={12} />
                        <span>{new Date(review.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={() => router.push('/admin/users')}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200 cursor-pointer shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="text-white" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Kullanıcı Yönetimi</h3>
                <p className="text-gray-600 text-sm">Kullanıcıları görüntüle ve düzenle</p>
              </div>
            </div>
          </motion.div>

          <Link 
            href="/admin/contact" 
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-100"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📧</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">İletişim</h2>
            </div>
            <p className="text-gray-600">Mesajları görüntüle</p>
          </Link>

          <Link 
            href="/admin/settings" 
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-100"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⚙️</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Sistem Ayarları</h2>
            </div>
            <p className="text-gray-600">API ve ödeme ayarları</p>
          </Link>

          <Link 
            href="/admin/membership-plans" 
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-100"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💎</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Üyelik Planları</h2>
            </div>
            <p className="text-gray-600">Fiyat ve özellikleri düzenle</p>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            onClick={() => router.push('/admin/venue/new')}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200 cursor-pointer shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Plus className="text-white" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Yeni Kafe Ekle</h3>
                <p className="text-gray-600 text-sm">Sisteme yeni kafe ekle</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            onClick={() => router.push('/admin/blog')}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 cursor-pointer shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="text-white" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Blog Yönetimi</h3>
                <p className="text-gray-600 text-sm">Blog yazılarını yönet</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Venues Section */}
        <div className="mb-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-between items-center mb-6"
          >
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                Tüm Kafeler
              </h2>
              <p className="text-gray-600">Sistemdeki tüm kafeleri yönetin</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/admin/venue/new')}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg"
            >
              <Plus size={20} />
              Yeni Kafe Ekle
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue, index) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group border border-emerald-100 relative"
              >
                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteVenueId(venue.id)
                    setDeleteVenueName(venue.name)
                  }}
                  className="absolute top-4 right-4 z-20 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Kafeyi Sil"
                >
                  <X size={18} />
                </button>

                <div 
                  onClick={() => router.push(`/admin/venue/${venue.slug}`)}
                  className="cursor-pointer"
                >
                  {venue.logo ? (
                    <div className="h-40 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all"></div>
                      <img 
                        src={venue.logo} 
                        alt={venue.name}
                        className="w-24 h-24 object-cover rounded-2xl border-4 border-white shadow-xl relative z-10 group-hover:scale-110 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center">
                      <Store className="text-white/40" size={64} />
                    </div>
                  )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {venue.name}
                    </h3>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                      venue.status === 'open' 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' 
                        : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700'
                    }`}>
                      {venue.status === 'open' ? '● Açık' : '● Kapalı'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 text-center border border-emerald-100">
                      <p className="text-2xl font-bold text-emerald-600">{venue.totalItems}</p>
                      <p className="text-xs text-gray-600 font-medium">Ürün</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 text-center border border-blue-100">
                      <p className="text-2xl font-bold text-blue-600">{venue.totalCategories}</p>
                      <p className="text-xs text-gray-600 font-medium">Kategori</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 text-center border border-purple-100">
                      <p className="text-2xl font-bold text-purple-600">{venue.totalOrders}</p>
                      <p className="text-xs text-gray-600 font-medium">Sipariş</p>
                    </div>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    Yönet
                    <ArrowRight size={18} />
                  </motion.button>
                </div>
                </div>
              </motion.div>
            ))}
          </div>

          {venues.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white/50 rounded-2xl border-2 border-dashed border-gray-300"
            >
              <Store className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Henüz kafe eklenmemiş</p>
              <p className="text-gray-400 text-sm mt-2">İlk kafeyi eklemek için yukarıdaki butona tıklayın</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && profile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <User className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Profil Ayarları</h3>
              </div>
              <button
                onClick={() => {
                  setShowProfileModal(false)
                  setProfileError('')
                  setProfileSuccess('')
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="admin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Şifre (Opsiyonel)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={profileForm.newPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    placeholder="Yeni şifre"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre Tekrar (Opsiyonel)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={profileForm.confirmPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    placeholder="Şifre tekrar"
                  />
                </div>
              </div>

              {profileError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {profileError}
                </div>
              )}

              {profileSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {profileSuccess}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowProfileModal(false)
                    setProfileError('')
                    setProfileSuccess('')
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleProfileUpdate}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg font-medium transition-all shadow-md"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteVenueId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <X className="text-red-600" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Kafeyi Sil</h3>
            </div>

            <p className="text-gray-600 mb-6">
              <span className="font-bold text-red-600">{deleteVenueName}</span> isimli kafeyi silmek istediğinizden emin misiniz? 
              Bu işlem <strong>geri alınamaz</strong> ve tüm kategoriler, ürünler, siparişler ve yorumlar silinecektir.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 font-medium">⚠️ Uyarı: Bu işlem şunları silecektir:</p>
              <ul className="text-sm text-red-700 mt-2 ml-4 list-disc">
                <li>Tüm kategoriler</li>
                <li>Tüm ürünler</li>
                <li>Tüm siparişler</li>
                <li>Tüm yorumlar</li>
                <li>Tüm garson çağrıları</li>
                <li>Tüm masa token'ları</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteVenueId(null)
                  setDeleteVenueName('')
                }}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteVenue}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}