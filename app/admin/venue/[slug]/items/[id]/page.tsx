'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Category {
  id: number
  name: string
}

export default function EditItemPage() {
  const params = useParams()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false) // Added state for uploading
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    image: '',
    is_available: true,
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    sugar: '',
    sodium: '',
    preparation_time: '',
    serving_size: '',
    ingredients: '',
    origin: '',
    storage_instructions: '',
    allergens: '',
    dietary_info: '',
    tag_new: false,
    tag_vegan: false,
    tag_spicy: false
  })

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin/login')
        return
      }

      try {
        // Load categories
        const catRes = await fetch(`/api/admin/venue/${params.slug}/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (catRes.ok) {
          const catData = await catRes.json()
          setCategories(catData.categories || [])
        }

        // Load item
        const itemRes = await fetch(`/api/admin/venue/${params.slug}/items/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (itemRes.ok) {
          const item = await itemRes.json()
          setFormData({
            category_id: item.category_id.toString(),
            name: item.name,
            description: item.description || '',
            price: item.price.toString(),
            image: item.image || '',
            is_available: item.is_available,
            calories: item.calories?.toString() || '',
            protein: item.protein?.toString() || '',
            carbs: item.carbs?.toString() || '',
            fat: item.fat?.toString() || '',
            fiber: item.fiber?.toString() || '',
            sugar: item.sugar?.toString() || '',
            sodium: item.sodium?.toString() || '',
            preparation_time: item.preparation_time?.toString() || '',
            serving_size: item.serving_size || '',
            ingredients: item.ingredients || '',
            origin: item.origin || '',
            storage_instructions: item.storage_instructions || '',
            allergens: item.allergens?.join(', ') || '',
            dietary_info: item.dietary_info?.join(', ') || '',
            tag_new: item.tags?.includes('new') || false,
            tag_vegan: item.tags?.includes('vegan') || false,
            tag_spicy: item.tags?.includes('spicy') || false
          })
        }

        setLoading(false)
      } catch (error) {
        console.error('Failed to load data:', error)
        setLoading(false)
      }
    }

    loadData()
  }, [params.slug, params.id, router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const token = localStorage.getItem('admin_token')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        setFormData(prev => ({ ...prev, image: data.url }))
      } else {
        const error = await res.json()
        alert(error.error || 'Resim yüklenemedi')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Resim yükleme hatası')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const token = localStorage.getItem('adminToken')

    try {
      const res = await fetch(`/api/admin/venue/${params.slug}/items/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          category_id: parseInt(formData.category_id),
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          image: formData.image,
          is_available: formData.is_available,
          calories: formData.calories ? parseInt(formData.calories) : null,
          protein: formData.protein ? parseFloat(formData.protein) : null,
          carbs: formData.carbs ? parseFloat(formData.carbs) : null,
          fat: formData.fat ? parseFloat(formData.fat) : null,
          fiber: formData.fiber ? parseFloat(formData.fiber) : null,
          sugar: formData.sugar ? parseFloat(formData.sugar) : null,
          sodium: formData.sodium ? parseInt(formData.sodium) : null,
          preparation_time: formData.preparation_time ? parseInt(formData.preparation_time) : null,
          serving_size: formData.serving_size,
          ingredients: formData.ingredients,
          origin: formData.origin,
          storage_instructions: formData.storage_instructions,
          allergens: formData.allergens ? formData.allergens.split(',').map(a => a.trim()) : [],
          dietary_info: formData.dietary_info ? formData.dietary_info.split(',').map(d => d.trim()) : [],
          tags: [
            formData.tag_new ? 'new' : null,
            formData.tag_vegan ? 'vegan' : null,
            formData.tag_spicy ? 'spicy' : null
          ].filter(Boolean)
        })
      })

      if (res.ok) {
        router.push(`/admin/venue/${params.slug}/items`)
      } else {
        const error = await res.json()
        alert(error.error || 'Ürün güncellenemedi')
        setSubmitting(false)
      }
    } catch (error) {
      console.error(error)
      alert('Bir hata oluştu')
      setSubmitting(false)
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
                onClick={() => router.push(`/admin/venue/${params.slug}/items`)}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Geri
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Ürün Düzenle</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Kategori Seçin</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ürün Adı *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Örn: Espresso"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Ürün açıklaması..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fiyat (₺) *
              </label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resim URL
              </label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-2"
                placeholder="https://example.com/image.jpg"
              />
              {/* Image Upload Button */}
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resim Yükle
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {uploading && <p className="text-xs text-gray-500 mt-1">Yükleniyor...</p>}
              </div>
            </div>


            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Besin Değerleri</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kalori (kcal)</label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="250"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="12.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Karbonhidrat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.carbs}
                    onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="30.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yağ (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.fat}
                    onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="8.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lif (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.fiber}
                    onChange={(e) => setFormData({ ...formData, fiber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="3.2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Şeker (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.sugar}
                    onChange={(e) => setFormData({ ...formData, sugar: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="5.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sodyum (mg)</label>
                  <input
                    type="number"
                    value={formData.sodium}
                    onChange={(e) => setFormData({ ...formData, sodium: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="200"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ürün Detayları</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hazırlama Süresi (dk)</label>
                  <input
                    type="number"
                    value={formData.preparation_time}
                    onChange={(e) => setFormData({ ...formData, preparation_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Porsiyon Boyutu</label>
                  <input
                    type="text"
                    value={formData.serving_size}
                    onChange={(e) => setFormData({ ...formData, serving_size: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="1 porsiyon (250g)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">İçerik & Malzemeler</label>
                  <textarea
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Ürünün detaylı içerik ve malzeme açıklaması..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Bu bilgi ürün detay sayfasında "İçerik & Malzemeler" bölümünde gösterilecektir.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Menşei</label>
                  <input
                    type="text"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Kolombiya"
                  />
                  <p className="text-xs text-gray-500 mt-1">Bu bilgi ürün detay sayfasında "Menşei" bölümünde gösterilecektir.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Saklama Koşulları</label>
                  <textarea
                    value={formData.storage_instructions}
                    onChange={(e) => setFormData({ ...formData, storage_instructions: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Serin ve kuru yerde saklayınız"
                  />
                  <p className="text-xs text-gray-500 mt-1">Bu bilgi ürün detay sayfasında "Saklama Koşulları" bölümünde gösterilecektir.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alerjenler (virgülle ayırın)</label>
                  <input
                    type="text"
                    value={formData.allergens}
                    onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Süt, Fındık, Gluten"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Diyet Bilgisi (virgülle ayırın)</label>
                  <input
                    type="text"
                    value={formData.dietary_info}
                    onChange={(e) => setFormData({ ...formData, dietary_info: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="vegan, gluten-free, halal"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Badge Seçenekleri</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="tag_new"
                    checked={formData.tag_new}
                    onChange={(e) => setFormData({ ...formData, tag_new: e.target.checked })}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="tag_new" className="ml-2 text-sm text-gray-700 flex items-center gap-2">
                    <span className="bg-gradient-to-r from-amber-100 to-orange-100 text-orange-700 px-2 py-1 rounded-lg text-xs font-semibold">YENİ ÜRÜN</span>
                    Yeni Ürün Badge'i
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="tag_vegan"
                    checked={formData.tag_vegan}
                    onChange={(e) => setFormData({ ...formData, tag_vegan: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="tag_vegan" className="ml-2 text-sm text-gray-700 flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-semibold">VEGAN</span>
                    Vegan Badge'i
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="tag_spicy"
                    checked={formData.tag_spicy}
                    onChange={(e) => setFormData({ ...formData, tag_spicy: e.target.checked })}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="tag_spicy" className="ml-2 text-sm text-gray-700 flex items-center gap-2">
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-xs font-semibold">ACILI</span>
                    Acılı Badge'i
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center border-t pt-6 mt-6">
              <input
                type="checkbox"
                id="is_available"
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="is_available" className="ml-2 text-sm text-gray-700">
                Mevcut
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push(`/admin/venue/${params.slug}/items`)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
              >
                {submitting ? 'Güncelleniyor...' : 'Güncelle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}