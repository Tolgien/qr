'use client'

import { X, Minus, Package, Clock, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Order {
  id: number
  status: 'placed' | 'preparing' | 'ready' | 'delivered'
  total: number
  created_at: string
  estimated_time: number
}

export default function OrderTrackingModal() {
  const params = useParams()
  const { isOrderTrackingOpen, isOrderMinimized, setOrderTrackingOpen, setOrderMinimized, language } = useStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch orders with polling
  useEffect(() => {
    if (!isOrderTrackingOpen || !params?.slug) return

    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/venue/${params.slug}/customer-orders`, {
          cache: 'no-store'
        })
        
        if (res.ok) {
          const data = await res.json()
          setOrders(data.orders || [])
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchOrders()

    // Poll every 10 seconds
    const interval = setInterval(fetchOrders, 10000)

    return () => clearInterval(interval)
  }, [isOrderTrackingOpen, params?.slug])

  const text = {
    tr: {
      title: 'Siparişlerim',
      noOrders: 'Aktif sipariş bulunamadı',
      orderNumber: 'Sipariş',
      total: 'Toplam',
      estimatedTime: 'Tahmini Süre',
      minutes: 'dk',
      placed: 'Sipariş Alındı',
      preparing: 'Hazırlanıyor',
      ready: 'Hazır',
      delivered: 'Teslim Edildi',
      minimize: 'Küçült',
      close: 'Kapat',
      statusPlaced: 'Siparişiniz alındı',
      statusPreparing: 'Siparişiniz hazırlanıyor',
      statusReady: 'Siparişiniz hazır!',
      statusDelivered: 'Teslim edildi'
    },
    en: {
      title: 'My Orders',
      noOrders: 'No active orders found',
      orderNumber: 'Order',
      total: 'Total',
      estimatedTime: 'Estimated Time',
      minutes: 'min',
      placed: 'Order Placed',
      preparing: 'Preparing',
      ready: 'Ready',
      delivered: 'Delivered',
      minimize: 'Minimize',
      close: 'Close',
      statusPlaced: 'Your order has been placed',
      statusPreparing: 'Your order is being prepared',
      statusReady: 'Your order is ready!',
      statusDelivered: 'Delivered'
    },
    de: {
      title: 'Meine Bestellungen',
      noOrders: 'Keine aktiven Bestellungen gefunden',
      orderNumber: 'Bestellung',
      total: 'Gesamt',
      estimatedTime: 'Geschätzte Zeit',
      minutes: 'Min',
      placed: 'Bestellung aufgegeben',
      preparing: 'Wird vorbereitet',
      ready: 'Bereit',
      delivered: 'Geliefert',
      minimize: 'Minimieren',
      close: 'Schließen',
      statusPlaced: 'Ihre Bestellung wurde aufgegeben',
      statusPreparing: 'Ihre Bestellung wird vorbereitet',
      statusReady: 'Ihre Bestellung ist bereit!',
      statusDelivered: 'Geliefert'
    },
    ar: {
      title: 'طلباتي',
      noOrders: 'لم يتم العثور على طلبات نشطة',
      orderNumber: 'طلب',
      total: 'المجموع',
      estimatedTime: 'الوقت المقدر',
      minutes: 'دقيقة',
      placed: 'تم تقديم الطلب',
      preparing: 'قيد التحضير',
      ready: 'جاهز',
      delivered: 'تم التسليم',
      minimize: 'تصغير',
      close: 'إغلاق',
      statusPlaced: 'تم تقديم طلبك',
      statusPreparing: 'يتم تحضير طلبك',
      statusReady: 'طلبك جاهز!',
      statusDelivered: 'تم التسليم'
    }
  }

  const t = text[language]

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'placed': return t.statusPlaced
      case 'preparing': return t.statusPreparing
      case 'ready': return t.statusReady
      case 'delivered': return t.statusDelivered
      default: return t.statusPlaced
    }
  }

  const getProgressPercentage = (status: Order['status']) => {
    switch (status) {
      case 'placed': return 33
      case 'preparing': return 66
      case 'ready': return 100
      case 'delivered': return 100
      default: return 33
    }
  }

  const getStatusStep = (status: Order['status']) => {
    switch (status) {
      case 'placed': return 1
      case 'preparing': return 2
      case 'ready': return 3
      case 'delivered': return 3
      default: return 1
    }
  }

  // Floating button when minimized
  if (isOrderMinimized && isOrderTrackingOpen) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        onClick={() => setOrderMinimized(false)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-full shadow-2xl hover:shadow-emerald-500/50 transition-all hover:scale-110 active:scale-95"
      >
        <div className="relative">
          <Package size={28} />
          {orders.length > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
              {orders.length}
            </div>
          )}
        </div>
      </motion.button>
    )
  }

  if (!isOrderTrackingOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={() => setOrderTrackingOpen(false)}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-gray-800 w-full sm:max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Package className="text-emerald-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
              {orders.length > 0 && (
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-sm font-semibold">
                  {orders.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOrderMinimized(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                title={t.minimize}
              >
                <Minus size={24} className="text-gray-500 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setOrderTrackingOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                title={t.close}
              >
                <X size={24} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={64} />
                <p className="text-gray-500 dark:text-gray-400">{t.noOrders}</p>
              </div>
            ) : (
              orders.map((order) => {
                const currentStep = getStatusStep(order.status)
                const progress = getProgressPercentage(order.status)
                
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl p-6 shadow-lg border-2 border-emerald-200 dark:border-emerald-800"
                  >
                    {/* Order Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {t.orderNumber} #{order.id}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.created_at).toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t.total}</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          ₺{order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Status Message */}
                    <div className="mb-6">
                      <p className="text-center text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        {getStatusText(order.status)}
                      </p>
                      {order.status !== 'ready' && order.status !== 'delivered' && (
                        <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                          <Clock size={16} />
                          <p className="text-sm">
                            {t.estimatedTime}: ~{Math.round(order.estimated_time)} {t.minutes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="relative mb-4">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Status Steps */}
                    <div className="flex justify-between items-start">
                      {/* Placed */}
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 transition-all ${
                          currentStep >= 1 
                            ? 'bg-emerald-500 text-white scale-110' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                        }`}>
                          {currentStep > 1 ? <CheckCircle2 size={24} /> : '1'}
                        </div>
                        <span className={`text-xs text-center ${
                          currentStep >= 1 
                            ? 'text-emerald-600 dark:text-emerald-400 font-semibold' 
                            : 'text-gray-400'
                        }`}>
                          {t.placed}
                        </span>
                      </div>

                      {/* Preparing */}
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 transition-all ${
                          currentStep >= 2 
                            ? 'bg-emerald-500 text-white scale-110 animate-pulse' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                        }`}>
                          {currentStep > 2 ? <CheckCircle2 size={24} /> : '2'}
                        </div>
                        <span className={`text-xs text-center ${
                          currentStep >= 2 
                            ? 'text-emerald-600 dark:text-emerald-400 font-semibold' 
                            : 'text-gray-400'
                        }`}>
                          {t.preparing}
                        </span>
                      </div>

                      {/* Ready */}
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 transition-all ${
                          currentStep >= 3 
                            ? 'bg-emerald-500 text-white scale-110 animate-bounce' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                        }`}>
                          {currentStep >= 3 ? <CheckCircle2 size={24} /> : '3'}
                        </div>
                        <span className={`text-xs text-center ${
                          currentStep >= 3 
                            ? 'text-emerald-600 dark:text-emerald-400 font-semibold' 
                            : 'text-gray-400'
                        }`}>
                          {t.ready}
                        </span>
                      </div>
                    </div>

                    {/* Ready notification */}
                    {order.status === 'ready' && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mt-6 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 text-white p-6 rounded-2xl text-center shadow-2xl border-2 border-green-300"
                      >
                        <motion.div
                          animate={{ 
                            y: [0, -10, 0],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="text-5xl mb-3"
                        >
                          🚶
                        </motion.div>
                        <p className="font-bold text-2xl mb-2">
                          {language === 'tr' ? 'Siparişiniz Getiriliyor!' : 'Your Order is Coming!'}
                        </p>
                        <p className="text-green-100 text-sm">
                          {language === 'tr' ? 'Garsonumuz masanıza getiriyor' : 'Our waiter is bringing it to your table'}
                        </p>
                        <div className="mt-4 h-2 bg-white/30 rounded-full overflow-hidden">
                          <motion.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            className="h-full w-1/3 bg-white rounded-full"
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Delivered notification */}
                    {order.status === 'delivered' && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 20
                        }}
                        className="mt-6 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 text-white p-8 rounded-3xl text-center shadow-2xl border-4 border-white relative overflow-hidden"
                      >
                        <motion.div
                          animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0]
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            repeatDelay: 1
                          }}
                          className="text-7xl mb-4"
                        >
                          🎉
                        </motion.div>
                        <motion.p 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="font-bold text-3xl mb-3"
                        >
                          {language === 'tr' ? 'Siparişiniz Masanızda!' : 'Your Order Has Arrived!'}
                        </motion.p>
                        <motion.p 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="text-green-100 text-lg font-medium"
                        >
                          {language === 'tr' ? 'Afiyet Olsun! 🍽️' : 'Bon Appétit! 🍽️'}
                        </motion.p>
                        
                        {/* Confetti effect */}
                        <div className="absolute inset-0 pointer-events-none">
                          {[...Array(20)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ y: -20, x: Math.random() * 100 + '%', opacity: 0 }}
                              animate={{ 
                                y: '100%', 
                                opacity: [0, 1, 0],
                                rotate: Math.random() * 360
                              }}
                              transition={{
                                duration: 2 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2
                              }}
                              className="absolute w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: ['#FFD700', '#FF69B4', '#87CEEB', '#90EE90'][Math.floor(Math.random() * 4)]
                              }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
