'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Item {
  id: number
  name: string
  description: string
  price: number | string // Price can be a number or a string from API
  image?: string
  category_name: string
  is_available: boolean
}

export default function ItemsManagement() {
  const params = useParams()
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadItems = async () => {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin/login')
        return
      }

      try {
        const res = await fetch(`/api/admin/venue/${params.slug}/items`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (res.ok) {
          const data = await res.json()
          console.log('Items loaded:', data)
          setItems(data.items || data || [])
          setLoading(false)
        } else {
          const error = await res.json()
          console.error('Error loading items:', error)
          setLoading(false) // Stop loading even if there's an error
        }
      } catch (error) {
        console.error('Failed to load items:', error)
        setLoading(false) // Stop loading on network errors
      }
    }

    loadItems()
  }, [params.slug, router])

  const toggleAvailability = async (itemId: number, currentStatus: boolean) => {
    const token = localStorage.getItem('adminToken')
    try {
      await fetch(`/api/admin/venue/${params.slug}/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_available: !currentStatus })
      })
      setItems(items.map(item => 
        item.id === itemId ? { ...item, is_available: !currentStatus } : item
      ))
    } catch (err) {
      console.error(err)
      alert('Durum güncellenemedi')
    }
  }

  const handleDelete = async (itemId: number) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return
    }

    const token = localStorage.getItem('adminToken')
    try {
      const res = await fetch(`/api/admin/venue/${params.slug}/items/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        setItems(items.filter(item => item.id !== itemId))
      } else {
        const error = await res.json()
        console.error('Error deleting item:', error)
        alert('Ürün silinemedi')
      }
    } catch (error) {
      console.error('Failed to delete item:', error)
      alert('Bir hata oluştu')
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
              <h1 className="text-2xl font-bold text-gray-900">Ürünler</h1>
            </div>
            <button
              onClick={() => router.push(`/admin/venue/${params.slug}/items/new`)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-medium transition-colors"
            >
              + Yeni Ürün
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiyat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center min-w-[200px]">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover mr-3 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{item.name}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{item.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.category_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₺{typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price || '0').toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleAvailability(item.id, item.is_available)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.is_available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.is_available ? 'Mevcut' : 'Tükendi'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => router.push(`/admin/venue/${params.slug}/items/${item.id}`)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 rounded-lg font-medium transition-colors"
                      >
                        Düzenle
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg font-medium transition-colors"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}