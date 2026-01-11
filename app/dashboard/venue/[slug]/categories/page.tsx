
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react'

interface Category {
  id: number
  name: string
  display_order: number
  itemCount: number
}

export default function UserVenueCategories() {
  const params = useParams()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategory, setNewCategory] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')

  const loadCategories = async () => {
    try {
      const res = await fetch(`/api/user/venue/${params.slug}/categories`, {
        credentials: 'include'
      })
      
      if (res.status === 401) {
        router.push('/login')
        return
      }
      
      if (!res.ok) {
        console.error('Failed to load categories:', res.status)
        return
      }
      
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [params.slug])

  const handleAdd = async () => {
    if (!newCategory.trim()) return

    setAdding(true)

    try {
      const res = await fetch(`/api/user/venue/${params.slug}/categories`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newCategory })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setNewCategory('')
        await loadCategories()
      } else {
        alert(data.error || 'Kategori eklenemedi')
      }
    } catch (error) {
      console.error('Category add error:', error)
      alert('Bir hata oluştu')
    } finally {
      setAdding(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setEditingName(category.name)
  }

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return

    try {
      const res = await fetch(`/api/user/venue/${params.slug}/categories/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: editingName })
      })

      if (res.ok) {
        setEditingId(null)
        setEditingName('')
        await loadCategories()
      } else {
        const data = await res.json()
        alert(data.error || 'Kategori güncellenemedi')
      }
    } catch (error) {
      console.error('Category update error:', error)
      alert('Bir hata oluştu')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return

    try {
      await fetch(`/api/user/venue/${params.slug}/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      loadCategories()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#34C8B6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/dashboard/venue/${params.slug}`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Geri
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Kategoriler</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Yeni Kategori Ekle</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Kategori adı..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6]"
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button
              onClick={handleAdd}
              disabled={adding || !newCategory.trim()}
              className="px-6 py-3 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              {adding ? 'Ekleniyor...' : 'Ekle'}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {categories.map(category => (
            <div key={category.id} className="bg-white rounded-xl shadow p-5 hover:shadow-lg transition-all">
              {editingId === category.id ? (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6]"
                    onKeyPress={(e) => e.key === 'Enter' && handleUpdate(category.id)}
                    autoFocus
                  />
                  <button
                    onClick={() => handleUpdate(category.id)}
                    className="px-4 py-2 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Kaydet
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null)
                      setEditingName('')
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all"
                  >
                    İptal
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.itemCount} ürün</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
