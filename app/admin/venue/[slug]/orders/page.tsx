
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  Eye,
  X,
  ChevronDown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface OrderItem {
  id: number
  item_name: string
  variant_name?: string
  quantity: number
  price: number
  notes?: string
  addons?: Array<{ name: string, price: number }>
}

interface Order {
  id: number
  table_number: string
  total: number
  status: string
  created_at: string
  items: OrderItem[]
}

interface Stats {
  totalOrders: number
  totalRevenue: number
  avgOrderValue: number
  pendingOrders: number
  todayOrders: number
  todayRevenue: number
}

export default function AdminOrdersManagement() {
  const params = useParams()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    pendingOrders: 0,
    todayOrders: 0,
    todayRevenue: 0
  })

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')

  useEffect(() => {
    loadOrders()
    const interval = setInterval(loadOrders, 30000)
    return () => clearInterval(interval)
  }, [params.slug])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter, dateFilter])

  const loadOrders = async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }

    try {
      const res = await fetch(`/api/admin/venue/${params.slug}/orders/detailed`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      
      if (data.orders) {
        setOrders(data.orders)
        calculateStats(data.orders)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (ordersList: Order[]) => {
    const totalOrders = ordersList.length
    const totalRevenue = ordersList.reduce((sum, order) => sum + order.total, 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const pendingOrders = ordersList.filter(o => o.status === 'placed' || o.status === 'preparing').length

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayOrders = ordersList.filter(o => new Date(o.created_at) >= today)
    const todayOrdersCount = todayOrders.length
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0)

    setStats({
      totalOrders,
      totalRevenue,
      avgOrderValue,
      pendingOrders,
      todayOrders: todayOrdersCount,
      todayRevenue
    })
  }

  const filterOrders = () => {
    let filtered = [...orders]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toString().includes(searchTerm) ||
        order.table_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => item.item_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at)
        switch (dateFilter) {
          case 'today':
            return orderDate.toDateString() === now.toDateString()
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            return orderDate >= weekAgo
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            return orderDate >= monthAgo
          default:
            return true
        }
      })
    }

    setFilteredOrders(filtered)
  }

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    const token = localStorage.getItem('adminToken')
    if (!token) return

    try {
      await fetch(`/api/order/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      loadOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/admin/venue/${params.slug}`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Geri
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Sipariş Yönetimi</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Toplam Sipariş</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Toplam Gelir</p>
                <p className="text-xl font-bold text-gray-900">₺{stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Ort. Sipariş</p>
                <p className="text-xl font-bold text-gray-900">₺{stats.avgOrderValue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Bekleyen</p>
                <p className="text-xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Bugün</p>
                <p className="text-xl font-bold text-gray-900">{stats.todayOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Bugün Gelir</p>
                <p className="text-xl font-bold text-gray-900">₺{stats.todayRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Sipariş, masa veya ürün ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="placed">Alındı</option>
              <option value="preparing">Hazırlanıyor</option>
              <option value="ready">Hazır</option>
              <option value="delivered">Teslim Edildi</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">Tüm Zamanlar</option>
              <option value="today">Bugün</option>
              <option value="week">Son 7 Gün</option>
              <option value="month">Son 30 Gün</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-16 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sipariş bulunamadı</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Filtrelere uygun sipariş yok'
                : 'Henüz sipariş yok'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow hover:shadow-lg transition-all border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                          #{order.id}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Masa: <span className="font-semibold">{order.table_number}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(order.created_at).toLocaleString('tr-TR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {order.items.length} ürün
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600 mb-2">
                        ₺{order.total.toFixed(2)}
                      </p>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Detaylar
                      </button>
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  <div className="border-t pt-4 space-y-2">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex justify-between items-start text-sm">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {item.quantity}x {item.item_name}
                          </p>
                          {item.variant_name && (
                            <p className="text-xs text-gray-500">• {item.variant_name}</p>
                          )}
                        </div>
                        <span className="text-gray-700 font-semibold">₺{item.price.toFixed(2)}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{order.items.length - 3} ürün daha...
                      </p>
                    )}
                  </div>

                  {/* Status Actions */}
                  <div className="border-t pt-4 mt-4 flex gap-2">
                    {order.status === 'placed' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Hazırlanmaya Başla
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Hazır Olarak İşaretle
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                      >
                        Teslim Edildi
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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

              <div className="p-6 space-y-6">
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
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Sipariş Detayları</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {item.quantity}x {item.item_name}
                            </p>
                            {item.variant_name && (
                              <p className="text-sm text-gray-600 mt-1">
                                Varyant: {item.variant_name}
                              </p>
                            )}
                          </div>
                          <span className="text-lg font-bold text-emerald-600">
                            ₺{item.price.toFixed(2)}
                          </span>
                        </div>
                        
                        {item.addons && item.addons.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Ekstralar:</p>
                            {item.addons.map((addon, idx) => (
                              <p key={idx} className="text-sm text-gray-600">
                                • {addon.name} (+₺{addon.price.toFixed(2)})
                              </p>
                            ))}
                          </div>
                        )}
                        
                        {item.notes && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Not:</p>
                            <p className="text-sm text-gray-600 italic">"{item.notes}"</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Toplam</span>
                    <span className="text-3xl font-bold text-emerald-600">
                      ₺{selectedOrder.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
