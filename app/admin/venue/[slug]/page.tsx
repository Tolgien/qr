'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, List, MessageSquare, Settings, PlusCircle, Eye, ShoppingCart } from 'lucide-react'

interface VenueData {
  id: number
  slug: string
  name: string
  logo?: string
  coverImage?: string
  website?: string
  wifiPassword?: string
  address?: string
  phone?: string
  status?: string
  totalItems: number
  totalCategories: number
  totalOrders: number
}

export default function VenueManagement() {
  const params = useParams()
  const router = useRouter()
  const [venue, setVenue] = useState<VenueData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadVenue = async () => {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin/login')
        return
      }

      try {
        const res = await fetch(`/api/admin/venue/${params.slug}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            router.push('/admin/login')
            return
          }
          throw new Error('Kafe verileri yüklenemedi')
        }

        const data = await res.json()
        setVenue(data)
      } catch (err) {
        console.error(err)
        // Token geçersizse veya başka bir hata oluşursa login'e yönlendir
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }
    loadVenue()
  }, [params.slug, router])


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Kafe bulunamadı veya yetkiniz yok.</p>
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
                onClick={() => router.push('/admin')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Geri
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{venue.name}</h1>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('adminToken')
                router.push('/admin/login')
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium transition-colors"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Toplam Ürün</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{venue.totalItems}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Kategoriler</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{venue.totalCategories}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Toplam Sipariş</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{venue.totalOrders}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href={`/admin/venue/${params.slug}/items`} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left">
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="text-lg font-semibold text-gray-900">Ürünleri Yönet</h3>
            <p className="text-gray-500 text-sm mt-2">Menü ürünlerini ekle, düzenle veya sil</p>
          </Link>

          <Link href={`/admin/venue/${params.slug}/categories`} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-lg font-semibold text-gray-900">Kategorileri Yönet</h3>
            <p className="text-gray-500 text-sm mt-2">Menü kategorilerini organize et</p>
          </Link>

          <Link href={`/admin/venue/${params.slug}/orders`} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-900">Siparişleri Gör</h3>
            <p className="text-gray-500 text-sm mt-2">Siparişleri takip et ve yönet</p>
          </Link>

          <Link href={`/admin/venue/${params.slug}/reviews`} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-lg font-semibold text-gray-900">Yorumları Yönet</h3>
            <p className="text-gray-500 text-sm mt-2">Müşteri yorumlarını onayla ve yönet</p>
          </Link>

          <Link href={`/admin/venue/${params.slug}/settings`} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-lg font-semibold text-gray-900">Kafe Ayarları</h3>
            <p className="text-gray-500 text-sm mt-2">Logo, kapak resmi, çalışma saatleri</p>
          </Link>

          <button
            onClick={() => window.open(`/menu/${params.slug}`, '_blank')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow p-6 hover:shadow-lg transition-all text-left"
          >
            <div className="text-4xl mb-4">👁️</div>
            <h3 className="text-lg font-semibold">Menüyü Görüntüle</h3>
            <p className="text-emerald-100 text-sm mt-2">Müşteri görünümünü kontrol et</p>
          </button>

          <button
            onClick={() => {
              const url = `${window.location.origin}/menu/${params.slug}`
              navigator.clipboard.writeText(url)
              alert('QR Menü linki kopyalandı!')
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow p-6 hover:shadow-lg transition-all text-left"
          >
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-lg font-semibold">QR Link Kopyala</h3>
            <p className="text-blue-100 text-sm mt-2">Menü linkini paylaş</p>
          </button>
        </div>
      </div>
    </div>
  )
}