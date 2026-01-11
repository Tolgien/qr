'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Clock, CheckCircle, Package, Truck } from 'lucide-react'

interface Order {
  id: number
  status: string
  created_at: string
  estimated_time?: number
  total: number
}

export default function OrderTracker() {
  const params = useParams()
  const [activeOrders, setActiveOrders] = useState<Order[]>([])
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const slug = params.slug

  useEffect(() => {
    if (!slug) return

    let isMounted = true
    let interval: NodeJS.Timeout | null = null
    let errorCount = 0

    const fetchOrders = async () => {
      if (!isMounted) return

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

        const res = await fetch(`/api/venue/${slug}/customer-orders`, {
          credentials: 'include',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        clearTimeout(timeoutId)
        
        if (!isMounted) return

        if (res.ok) {
          const data = await res.json()
          const newOrders = data.orders || []
          errorCount = 0 // Reset error count on success

          setActiveOrders(prev => {
            // Check for status changes
            newOrders.forEach((newOrder: Order) => {
              const prevOrder = prev.find(o => o.id === newOrder.id)
              if (prevOrder && prevOrder.status !== newOrder.status) {
                showStatusNotification(newOrder.status)
              }
            })
            return newOrders
          })
        } else {
          errorCount++
          // Stop polling after 3 consecutive errors
          if (errorCount >= 3 && interval) {
            clearInterval(interval)
            interval = null
          }
        }
      } catch (error) {
        if (!isMounted) return
        
        errorCount++
        // Stop polling after 3 consecutive errors
        if (errorCount >= 3 && interval) {
          clearInterval(interval)
          interval = null
        }
      }
    }

    fetchOrders()
    interval = setInterval(fetchOrders, 30000) // 30 seconds - less frequent

    return () => {
      isMounted = false
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [slug])

  const showStatusNotification = (status: string) => {
    const messages: Record<string, string> = {
      'preparing': '👨‍🍳 Siparişiniz hazırlanıyor!',
      'ready': '😊 Siparişiniz hazırlandı, getiriliyor!',
      'delivered': '🎉 Siparişiniz teslim edildi. Afiyet olsun!'
    }

    if (messages[status]) {
      setNotificationMessage(messages[status])
      setShowNotification(true)

      // Ses çal
      const audio = new Audio('/notification.mp3')
      audio.volume = 0.5
      audio.play().catch(e => console.log('Audio play failed:', e))

      setTimeout(() => setShowNotification(false), 5000)
    }
  }

  const getProgress = (order: Order) => {
    const elapsed = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 1000 / 60)
    const total = order.estimated_time || 15
    const progress = Math.min((elapsed / total) * 100, 100)
    return { elapsed, total, progress }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'placed':
        return { icon: Clock, text: 'Sipariş Alındı', color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
      case 'preparing':
        return { icon: Package, text: 'Hazırlanıyor', color: 'text-blue-600', bgColor: 'bg-blue-50' }
      case 'ready':
        return { icon: CheckCircle, text: 'Hazır', color: 'text-green-600', bgColor: 'bg-green-50' }
      case 'delivered':
        return { icon: Truck, text: 'Teslim Edildi', color: 'text-gray-600', bgColor: 'bg-gray-50' }
      default:
        return { icon: Clock, text: status, color: 'text-gray-600', bgColor: 'bg-gray-50' }
    }
  }

  if (activeOrders.length === 0) return null

  return (
    <>
      {/* Bildirim Baloncuğu */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-emerald-500 p-4 min-w-[300px]">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {notificationMessage}
            </p>
          </div>
        </div>
      )}

      {/* Aktif Siparişler */}
      <div className="fixed bottom-20 right-4 z-40 space-y-3 max-w-sm">
        {activeOrders
          .filter(order => order.status !== 'delivered')
          .map((order) => {
            const { elapsed, total, progress } = getProgress(order)
            const statusInfo = getStatusInfo(order.status)
            const Icon = statusInfo.icon

            return (
              <div
                key={order.id}
                className={`${statusInfo.bgColor} rounded-2xl shadow-lg p-4 border-2 border-gray-200 dark:border-gray-700 backdrop-blur-sm`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${statusInfo.color} bg-white dark:bg-gray-800`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Sipariş #{order.id}
                    </p>
                    <p className={`text-xs ${statusInfo.color} font-medium`}>
                      {statusInfo.text}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-emerald-600">
                    ₺{typeof order.total === 'number' ? order.total.toFixed(2) : parseFloat(order.total).toFixed(2)}
                  </p>
                </div>

                {/* 3-Stage Progress Bar */}
                {(order.status === 'placed' || order.status === 'preparing' || order.status === 'ready') && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      {/* Stage 1: Placed */}
                      <div className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                        order.status === 'placed' || order.status === 'preparing' || order.status === 'ready'
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                      
                      {/* Stage 2: Preparing */}
                      <div className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                        order.status === 'preparing' || order.status === 'ready'
                          ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        {order.status === 'preparing' && (
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                          />
                        )}
                      </div>
                      
                      {/* Stage 3: Ready */}
                      <div className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                        order.status === 'ready'
                          ? 'bg-gradient-to-r from-green-400 to-green-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    </div>

                    {order.status === 'preparing' && (
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>{elapsed} dakika geçti</span>
                        <span>~{total} dakika</span>
                      </div>
                    )}
                  </div>
                )}

                {order.status === 'ready' && (
                  <div className="relative overflow-hidden">
                    <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 font-medium">
                      <span className="text-xl animate-bounce">🚶</span>
                      <span className="font-bold">Siparişiniz Getiriliyor!</span>
                    </div>
                    <div className="mt-2 h-1 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 animate-[slide_2s_ease-in-out_infinite]" style={{width: '40%'}}></div>
                    </div>
                  </div>
                )}

                {order.status === 'delivered' && (
                  <div className="relative overflow-hidden bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-4 rounded-xl border-2 border-emerald-300 dark:border-emerald-700">
                    <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400 font-medium">
                      <span className="text-3xl animate-bounce">🎉</span>
                      <div>
                        <p className="font-bold text-lg">Siparişiniz Masanızda!</p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-500">Afiyet olsun!</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </>
  )
}