'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Category {
  id: number
  name: string
  display_order: number
  item_count: number
}

export default function CategoriesManagement() {
  const params = useParams()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [categoryName, setCategoryName] = useState('')

  const loadCategories = async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }

    try {
      const res = await fetch(`/api/admin/venue/${params.slug}/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        console.log('Categories loaded:', data)
        setCategories(data.categories || data || [])
        setLoading(false)
      } else {
        const error = await res.json()
        console.error('Error loading categories:', error)
        setLoading(false)
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [params.slug, router])

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setCategoryName(category.name)
    setShowModal(true)
  }

  const handleDelete = async (categoryId: number) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      return
    }

    const token = localStorage.getItem('adminToken')
    try {
      const res = await fetch(`/api/admin/venue/${params.slug}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        loadCategories()
      } else {
        const data = await res.json()
        alert(data.error || 'Kategori silinemedi')
      }
    } catch (error) {
      console.error(error)
      alert('Bir hata oluştu')
    }
  }

  const handleSave = async () => {
    const token = localStorage.getItem('adminToken')
    const url = editingCategory
      ? `/api/admin/venue/${params.slug}/categories/${editingCategory.id}`
      : `/api/admin/venue/${params.slug}/categories`

    try {
      const res = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: categoryName })
      })

      if (res.ok) {
        setShowModal(false)
        setEditingCategory(null)
        setCategoryName('')
        loadCategories()
      } else {
        const error = await res.json()
        alert(error.error || 'Kategori kaydedilemedi')
      }
    } catch (error) {
      console.error(error)
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
              <h1 className="text-2xl font-bold text-gray-900">Kategoriler</h1>
            </div>
            <button
              onClick={() => {
                setEditingCategory(null)
                setCategoryName('')
                setShowModal(true)
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-medium transition-colors"
            >
              + Yeni Kategori
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
              <p className="text-gray-500 text-sm mb-4">{category.item_count} ürün</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium text-gray-700 transition-colors"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="px-3 py-2 bg-red-100 hover:bg-red-200 rounded text-sm font-medium text-red-700 transition-colors"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori Adı
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Örn: İçecekler"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingCategory(null)
                  setCategoryName('')
                }}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={!categoryName.trim()}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 rounded-lg font-medium text-white transition-colors"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}