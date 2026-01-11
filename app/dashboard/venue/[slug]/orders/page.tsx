'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Clock, CheckCircle, Package, Truck, Check } from 'lucide-react'

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
  items: OrderItem[]
}

export default function UserVenueOrders() {
  const params = useParams()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
    // Poll for updates every 30 seconds
    const interval = setInterval(loadOrders, 30000)
    return () => clearInterval(interval)
  }, [params.slug])

  const loadOrders = async () => {
    try {
      const res = await fetch(`/api/user/venue/${params.slug}/orders`, {
        credentials: 'include'
      })
      
      if (res.status === 401) {
        router.push('/login')
        return
      }
      
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsDelivered = async (orderId: number) => {
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
      console.error('Error updating order:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'placed': return <Clock className="text-yellow-500" size={20} />
      case 'preparing': return <Package className="text-blue-500" size={20} />
      case 'ready': return <CheckCircle className="text-green-500" size={20} />
      case 'delivered': return <Truck className="text-gray-500" size={20} />
      default: return <Clock className="text-gray-500" size={20} />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/dashboard/venue/${params.slug}`)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
                Geri
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Siparişler</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-16 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Henüz sipariş yok</h3>
            <p className="text-gray-600 dark:text-gray-400">Gelen siparişler burada görünecek</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
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
                        ₺{parseFloat(order.total as any).toFixed(2)}
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

                  {order.status !== 'delivered' && (
                    <div className="border-t dark:border-gray-700 pt-4 mt-4">
                      <button
                        onClick={() => markAsDelivered(order.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
                      >
                        <Check className="w-5 h-5" />
                        Tamamlandı Olarak İşaretle
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}