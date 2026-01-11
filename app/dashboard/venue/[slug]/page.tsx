'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Settings,
  ShoppingBag,
  Grid,
  Menu,
  MessageSquare,
  Clock,
  CheckCircle,
  Package,
  Bell,
  QrCode, // Import QrCode icon
  BellRing // Import BellRing icon
} from 'lucide-react'
import { notificationSound } from '@/lib/notificationSound'

interface VenueData {
  id: number
  name: string
  slug: string
  logo?: string
  item_count: number
  category_count: number
  order_count: number
}

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
  total: number
  status: string
  created_at: string
  items: OrderItem[]
}

interface WaiterCall {
  id: number
  table_number: string
  message: string
  status: string
  created_at: string
}

export default function UserVenueDashboard() {
  const params = useParams()
  const router = useRouter()
  const [venue, setVenue] = useState<VenueData | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>([])
  const [loading, setLoading] = useState(true)
  const [previousOrderCount, setPreviousOrderCount] = useState(0)
  const [previousWaiterCallsCount, setPreviousWaiterCallsCount] = useState(0)
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0)
  const [waiterCallsCount, setWaiterCallsCount] = useState(0)

  const [audioEnabled, setAudioEnabled] = useState(false)
  const lastOrderIdRef = useRef<number>(0)
  const lastWaiterCallIdRef = useRef<number>(0)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showAudioSetupModal, setShowAudioSetupModal] = useState(false)
  const [audioSetupError, setAudioSetupError] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  // Sayfa yüklendiğinde localStorage'dan consent kontrolü
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasConsent = notificationSound.hasConsent()
      if (hasConsent) {
        // Consent var ama unlock edilmemiş olabilir - tekrar unlock et
        notificationSound.unlock().then(() => {
          setAudioEnabled(true)
          setShowAudioSetupModal(false)
        }).catch(() => {
          // Unlock başarısız - modal göster
          setShowAudioSetupModal(true)
        })
      } else {
        // Consent yok - modal göster
        setShowAudioSetupModal(true)
      }
    }
  }, [])

  // Manuel ses aktifleştirme fonksiyonu (modal butonundan çağrılacak)
  const handleEnableAudio = async () => {
    try {
      setAudioSetupError('')
      await notificationSound.unlock()
      setAudioEnabled(true)
      setShowAudioSetupModal(false)
    } catch (err) {
      console.error('Ses aktifleştirme hatası:', err)
      setAudioSetupError('Tarayıcınız sesi engelliyor. Lütfen tekrar deneyin.')
    }
  }

  const playNotificationSound = async () => {
    try {
      await notificationSound.play()
    } catch (err) {
      // Ses çalma hatası - modal göster
      console.log('⚠️ Ses sistemi aktif değil, modal açılıyor')
      setAudioEnabled(false)
      setShowAudioSetupModal(true)
    }
  }

  useEffect(() => {
    loadVenue()
    loadOrders()
    loadReviews()
    loadWaiterCalls()

    const interval = setInterval(() => {
      loadOrders(true)
      loadReviews()
      loadWaiterCalls(true)
    }, 10000)

    return () => clearInterval(interval)
  }, [params.slug])

  const loadReviews = async () => {
    try {
      const res = await fetch(`/api/user/venue/${params.slug}/reviews`, {
        credentials: 'include'
      })

      if (!res.ok) return

      const data = await res.json()
      const pending = (data.reviews || []).filter((r: any) => !r.is_approved)
      setPendingReviewsCount(pending.length)
    } catch (error) {
      console.error('Error loading reviews:', error)
    }
  }

  const loadWaiterCalls = async (isPolling = false) => {
    try {
      const res = await fetch(`/api/user/venue/${params.slug}/waiter-calls`, {
        credentials: 'include'
      })

      if (!res.ok) {
        console.error('Failed to load waiter calls:', res.status)
        return
      }

      const data = await res.json()
      const calls = data.calls || []
      const currentCallsCount = calls.length
      
      // Yeni garson çağrısı kontrolü - En yeni ID'yi kontrol et
      if (calls.length > 0) {
        const newestCallId = Math.max(...calls.map((c: any) => c.id))
        
        console.log('🔍 Garson Çağrısı Kontrolü:', {
          isPolling,
          lastCallId: lastWaiterCallIdRef.current,
          newestCallId,
          willPlaySound: isPolling && lastWaiterCallIdRef.current > 0 && newestCallId > lastWaiterCallIdRef.current
        })
        
        if (isPolling) {
          // Polling sırasında yeni çağrı kontrolü
          if (lastWaiterCallIdRef.current > 0 && newestCallId > lastWaiterCallIdRef.current) {
            console.log('🔔 YENİ GARSON ÇAĞRISI TESPİT EDİLDİ! Ses çalıyor... (ID:', newestCallId, ')')
            playNotificationSound()
          }
          // SADECE polling sırasında güncelle
          lastWaiterCallIdRef.current = newestCallId
        } else {
          // İlk yüklemede sadece ID'yi set et (ses çalma)
          lastWaiterCallIdRef.current = newestCallId
        }
      }

      setPreviousWaiterCallsCount(currentCallsCount)
      setWaiterCalls(calls)
      setWaiterCallsCount(currentCallsCount)
    } catch (error) {
      console.error('Error loading waiter calls:', error)
    }
  }

  const loadOrders = async (isPolling = false) => {
    try {
      const res = await fetch(`/api/user/venue/${params.slug}/orders`, {
        credentials: 'include'
      })

      if (!res.ok) {
        console.error('Failed to load orders:', res.status)
        return
      }

      const data = await res.json()
      const orders = data.orders || []
      const currentOrderCount = orders.length

      // Yeni sipariş kontrolü - En yeni ID'yi kontrol et
      if (orders.length > 0) {
        const newestOrderId = Math.max(...orders.map((o: any) => o.id))
        
        console.log('🔍 Sipariş Kontrolü:', {
          isPolling,
          lastOrderId: lastOrderIdRef.current,
          newestOrderId,
          willPlaySound: isPolling && lastOrderIdRef.current > 0 && newestOrderId > lastOrderIdRef.current
        })
        
        if (isPolling) {
          // Polling sırasında yeni sipariş kontrolü
          if (lastOrderIdRef.current > 0 && newestOrderId > lastOrderIdRef.current) {
            console.log('🎉 YENİ SİPARİŞ TESPİT EDİLDİ! Ses çalıyor... (Sipariş ID:', newestOrderId, ')')
            playNotificationSound()
          }
          // SADECE polling sırasında güncelle
          lastOrderIdRef.current = newestOrderId
        } else {
          // İlk yüklemede sadece ID'yi set et (ses çalma)
          lastOrderIdRef.current = newestOrderId
        }
      }

      setPreviousOrderCount(currentOrderCount)
      setOrders(orders)
    } catch (error) {
      console.error('Error loading orders:', error)
    }
  }

  const loadVenue = async () => {
    try {
      const res = await fetch(`/api/user/venue/${params.slug}`, {
        credentials: 'include'
      })

      if (res.status === 401) {
        router.push('/login')
        return
      }

      if (!res.ok) {
        throw new Error('Failed to load venue')
      }

      const data = await res.json()
      setVenue(data)
    } catch (error) {
      console.error('Error loading venue:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const quickCompleteOrder = async (orderId: number) => {
    try {
      await fetch(`/api/order/${orderId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'delivered' })
      })
      loadOrders()
    } catch (error) {
      console.error('Error completing order:', error)
    }
  }

  const filteredOrders = dateFilter
    ? orders.filter(order => {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0]
        return orderDate === dateFilter
      })
    : orders

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'placed': return <Clock className="text-yellow-500" size={16} />
      case 'preparing': return <Package className="text-blue-500" size={16} />
      case 'ready': return <CheckCircle className="text-green-500" size={16} />
      default: return <Clock className="text-gray-500" size={16} />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'placed': return 'Yeni'
      case 'preparing': return 'Hazırlanıyor'
      case 'ready': return 'Hazır'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ready': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const pendingOrders = orders.filter(o => o.status !== 'delivered')
  const newOrdersCount = orders.filter(o => o.status === 'placed').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
                Geri
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{venue?.name}</h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Ses durumu göstergesi */}
              <div className="relative group">
                {audioEnabled ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">Ses Aktif</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                    onClick={async () => {
                      try {
                        await notificationSound.unlock()
                        setAudioEnabled(true)
                        console.log('🔊 Bildirim sesleri manuel olarak aktif edildi')
                        playNotificationSound() // Test sesi çal
                      } catch (err) {
                        console.log('❌ Manuel aktifleştirme hatası:', err)
                      }
                    }}
                  >
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">Ses Kapalı (Aktifle)</span>
                  </div>
                )}
                <div className="absolute top-full mt-2 right-0 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {audioEnabled ? 'Yeni siparişlerde ses çalacak' : 'Sesi aktifleştirmek için tıklayın'}
                </div>
              </div>

              <button
                onClick={() => setShowNotificationModal(true)}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Bell className={`w-6 h-6 ${(newOrdersCount > 0 || pendingReviewsCount > 0 || waiterCallsCount > 0) ? 'text-emerald-600 animate-pulse' : 'text-gray-400'}`} />
                {(newOrdersCount > 0 || pendingReviewsCount > 0 || waiterCallsCount > 0) && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {newOrdersCount + pendingReviewsCount + waiterCallsCount}
                  </span>
                )}
              </button>
              <Link
                href={`/dashboard/venue/${params.slug}/settings`}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href={`/dashboard/venue/${params.slug}/items`} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ürünler</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{venue?.item_count || 0}</p>
              </div>
              <ShoppingBag className="w-12 h-12 text-emerald-500" />
            </div>
          </Link>

          <Link href={`/dashboard/venue/${params.slug}/categories`} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Kategoriler</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{venue?.category_count || 0}</p>
              </div>
              <Grid className="w-12 h-12 text-blue-500" />
            </div>
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Sipariş</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{venue?.order_count || 0}</p>
              </div>
              <Menu className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Aktif Siparişler</h2>
            <Link
              href={`/dashboard/venue/${params.slug}/orders`}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Tümünü Gör
            </Link>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aktif sipariş yok</h3>
              <p className="text-gray-600 dark:text-gray-400">Yeni siparişler geldiğinde burada görünecek</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">#{order.id}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Masa: <span className="font-semibold">{order.table_number}</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {new Date(order.created_at).toLocaleString('tr-TR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          ₺{typeof order.total === 'number' ? order.total.toFixed(2) : parseFloat(order.total as any).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="border-t dark:border-gray-700 pt-4 space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-start text-sm">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.quantity}x {item.item_name}
                            </p>
                            {item.variant_name && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">• {item.variant_name}</p>
                            )}
                            {item.addons && item.addons.length > 0 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">• {item.addons.join(', ')}</p>
                            )}
                            {item.notes && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 italic">"{item.notes}"</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Garson Çağrıları Bölümü */}
        {waiterCalls.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bekleyen Garson Çağrıları</h2>
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {waiterCalls.length}
                </span>
              </div>
              <Link
                href={`/dashboard/venue/${params.slug}/waiter-calls`}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Tümünü Gör
              </Link>
            </div>

            <div className="space-y-3">
              {waiterCalls.slice(0, 3).map((call) => (
                <div key={call.id} className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl shadow-lg border-2 border-red-200 dark:border-red-700 overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-red-500 p-3 rounded-full">
                          <BellRing className="w-6 h-6 text-white animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              Masa {call.table_number}
                            </span>
                            <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                              ACIL
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {call.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(call.created_at).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/venue/${params.slug}/waiter-calls`}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                      >
                        Yanıtla
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href={`/dashboard/venue/${params.slug}/items/new`}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow text-center"
          >
            <ShoppingBag className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Yeni Ürün</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Ürün ekle</p>
          </Link>

          <Link
            href={`/dashboard/venue/${params.slug}/categories`}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow text-center"
          >
            <Grid className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Kategoriler</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Düzenle</p>
          </Link>

          <Link
            href={`/dashboard/venue/${params.slug}/orders`}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow text-center"
          >
            <Menu className="w-12 h-12 text-purple-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Siparişler</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Görüntüle</p>
          </Link>

          <Link
            href={`/dashboard/venue/${params.slug}/reviews`}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow text-center relative"
          >
            {pendingReviewsCount > 0 && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {pendingReviewsCount}
              </span>
            )}
            <MessageSquare className="w-12 h-12 text-orange-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Yorumlar</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {pendingReviewsCount > 0 ? `${pendingReviewsCount} onay bekliyor` : 'İncele'}
            </p>
          </Link>
          {/* Added new link for Tables management */}
          <Link
            href={`/dashboard/venue/${params.slug}/tables`}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow text-center"
          >
            <QrCode className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Masa QR Kodları</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Güvenli QR kodları oluştur</p>
          </Link>

          {/* Waiter Calls Link */}
          <Link
            href={`/dashboard/venue/${params.slug}/waiter-calls`}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow text-center relative"
          >
            {waiterCallsCount > 0 && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                {waiterCallsCount}
              </span>
            )}
            <BellRing className="w-12 h-12 text-orange-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Garson Çağrıları</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {waiterCallsCount > 0 ? `${waiterCallsCount} bekleyen çağrı` : 'Bekleyen çağrı yok'}
            </p>
          </Link>

          {/* Yeni eklenecek "Tüm Ürünler" kartı */}
          <Link
            href={`/dashboard/venue/${params.slug}/items`}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tüm Ürünler</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{venue?.item_count || 0}</p>
              </div>
              <ShoppingBag className="w-12 h-12 text-green-500" />
            </div>
          </Link>
        </div>
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bildirimler</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Toplam {(orders?.length || 0) + waiterCallsCount} bildirim
                </p>
              </div>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Date Filter */}
            <div className="p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tarih Filtresi:
                </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                {dateFilter && (
                  <button
                    onClick={() => setDateFilter('')}
                    className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    Temizle
                  </button>
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredOrders.length} sipariş bulundu
                </span>
              </div>
            </div>

            {/* Orders List */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)]">
              {filteredOrders.length === 0 && waiterCallsCount === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {dateFilter ? 'Bu tarihte sipariş veya çağrı yok' : 'Bildirim bulunamadı'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {dateFilter ? 'Farklı bir tarih seçin veya bekleyin' : 'Yeni siparişler veya garson çağrıları geldiğinde burada görünecek'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Display waiter calls */}
                  {waiterCallsCount > 0 && (
                    <div
                      onClick={() => {
                        setShowNotificationModal(false)
                        router.push(`/dashboard/venue/${params.slug}/waiter-calls`)
                      }}
                      className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl p-5 border-2 border-orange-300 dark:border-orange-700 flex items-center justify-between cursor-pointer hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <BellRing className="w-7 h-7 text-orange-600 dark:text-orange-400 animate-pulse" />
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {waiterCallsCount}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-orange-800 dark:text-orange-300 text-lg">Garson Çağrısı!</p>
                          <p className="text-sm text-orange-700 dark:text-orange-400">{waiterCallsCount} masa yardım bekliyor</p>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors shadow-md">
                        Görüntüle →
                      </div>
                    </div>
                  )}

                  {/* Display orders */}
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-3 py-1 rounded-lg">
                              #{order.id}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Masa: <span className="font-semibold">{order.table_number}</span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {new Date(order.created_at).toLocaleString('tr-TR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                              ₺{typeof order.total === 'number' ? order.total.toFixed(2) : parseFloat(order.total as any).toFixed(2)}
                            </p>
                          </div>
                          {order.status !== 'delivered' && (
                            <button
                              onClick={() => quickCompleteOrder(order.id)}
                              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                              title="Tamamlandı olarak işaretle"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="border-t dark:border-gray-700 pt-3 space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-start text-sm">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {item.quantity}x {item.item_name}
                              </p>
                              {item.variant_name && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">• {item.variant_name}</p>
                              )}
                              {item.addons && item.addons.length > 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">• {item.addons.join(', ')}</p>
                              )}
                              {item.notes && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 italic">"{item.notes}"</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SES AKTİFLEŞTİRME MODALI (ZORUNLU) */}
      {showAudioSetupModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Bildirim Sesleri
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Yeni sipariş ve garson çağrıları için ses bildirimlerini aktifleştirin
              </p>
            </div>

            {audioSetupError && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">{audioSetupError}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleEnableAudio}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                Sesleri Aktifleştir
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                ⚠️ Bu butona tıklamadan bildirim sesleri ÇALMAYACAKTIR
              </p>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                💡 <strong>Neden gerekli?</strong> Tarayıcılar otomatik sesleri engeller. 
                Seslerin çalması için bu butona tıklamanız gerekiyor.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ses test butonu */}
      <button
        onClick={() => {
          console.log('🔔 Test sesi çalıyor...')
          playNotificationSound()
        }}
        className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all hover:scale-105 z-40"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.414A2 2 0 001.991 13V11c0-.552.224-1.053.585-1.414m15.414 0L12 4l-5.99 5.586" />
        </svg>
        Ses Testi
      </button>
    </div>
  )
}