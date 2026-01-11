'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Upload, Trash2, Sparkles } from 'lucide-react'

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
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isAiEnriching, setIsAiEnriching] = useState(false)
  const [aiProgress, setAiProgress] = useState(0)
  const [userTier, setUserTier] = useState<string>('free')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    image: '',
    tags: '',
    allergens: '',
    isAvailable: true,
    isFeatured: false,
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
    dietary_info: ''
  })

  useEffect(() => {
    Promise.all([
      fetch(`/api/user/venue/${params.slug}/categories`),
      fetch(`/api/user/venue/${params.slug}/items/${params.id}`),
      fetch('/api/user/profile')
    ])
      .then(([catRes, itemRes, profileRes]) => {
        if (catRes.status === 401 || itemRes.status === 401 || profileRes.status === 401) {
          router.push('/login')
          return Promise.reject('Unauthorized')
        }
        return Promise.all([catRes.json(), itemRes.json(), profileRes.json()])
      })
      .then(([catData, itemData, profileData]) => {
        setCategories(catData.categories || [])
        setUserTier(profileData.user?.membership_tier || 'free')
        if (itemData) {
          const item = itemData
          setFormData({
            name: item.name || '',
            description: item.description || '',
            price: item.price?.toString() || '',
            categoryId: item.category_id?.toString() || '',
            image: item.image || '',
            tags: item.tags?.join(', ') || '',
            allergens: item.allergens?.join(', ') || '',
            isAvailable: item.is_available ?? true,
            isFeatured: item.is_featured ?? false,
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
            dietary_info: item.dietary_info?.join(', ') || ''
          })
        }
        setLoading(false)
      })
      .catch((error) => {
        if (error !== 'Unauthorized') {
          setLoading(false)
        }
      })
  }, [params.slug, params.id, router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })

      if (res.status === 401) {
        router.push('/login')
        return
      }

      if (res.ok) {
        const data = await res.json()
        setFormData(prev => ({ ...prev, image: data.url }))
      } else {
        alert('Resim yüklenemedi')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Resim yükleme hatası')
    } finally {
      setUploading(false)
    }
  }

  const handleAiEnrichment = async () => {
    if (userTier !== 'premium') {
      alert('Bu özellik yalnızca premium kullanıcılar için geçerlidir.')
      return
    }

    setIsAiEnriching(true)
    setAiProgress(0)

    try {
      const res = await fetch(`/api/user/venue/${params.slug}/items/${params.id}/ai-enrich`, {
        method: 'POST'
      })

      if (res.status === 401) {
        router.push('/login')
        return
      }

      if (res.ok) {
        const reader = res.body?.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        while (true) {
          const { done, value } = await reader!.read()
          buffer += decoder.decode(value, { stream: !done })
          if (done) break

          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.substring(6))
              if (data.progress !== undefined) {
                setAiProgress(data.progress)
              }
              if (data.name) setFormData(prev => ({ ...prev, name: data.name }))
              if (data.description) setFormData(prev => ({ ...prev, description: data.description }))
              if (data.tags) setFormData(prev => ({ ...prev, tags: data.tags.join(', ') }))
              if (data.allergens) setFormData(prev => ({ ...prev, allergens: data.allergens.join(', ') }))
              if (data.dietary_info) setFormData(prev => ({ ...prev, dietary_info: data.dietary_info.join(', ') }))
            }
          }
        }
        alert('Ürün AI ile zenginleştirildi!')
      } else {
        const error = await res.json()
        alert(error.error || 'AI zenginleştirme başarısız oldu')
      }
    } catch (error) {
      console.error('AI enrichment error:', error)
      alert('AI zenginleştirme sırasında bir hata oluştu')
    } finally {
      setIsAiEnriching(false)
      setAiProgress(0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.price || !formData.categoryId) {
      alert('Lütfen zorunlu alanları doldurun')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch(`/api/user/venue/${params.slug}/items/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          categoryId: parseInt(formData.categoryId),
          image: formData.image,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
          allergens: formData.allergens ? formData.allergens.split(',').map(a => a.trim()) : [],
          isAvailable: formData.isAvailable,
          isFeatured: formData.isFeatured,
          calories: formData.calories ? parseFloat(formData.calories) : null,
          protein: formData.protein ? parseFloat(formData.protein) : null,
          carbs: formData.carbs ? parseFloat(formData.carbs) : null,
          fat: formData.fat ? parseFloat(formData.fat) : null,
          fiber: formData.fiber ? parseFloat(formData.fiber) : null,
          sugar: formData.sugar ? parseFloat(formData.sugar) : null,
          sodium: formData.sodium ? parseFloat(formData.sodium) : null,
          preparation_time: formData.preparation_time ? parseInt(formData.preparation_time) : null,
          serving_size: formData.serving_size || null,
          ingredients: formData.ingredients || null,
          origin: formData.origin || null,
          storage_instructions: formData.storage_instructions || null,
          dietary_info: formData.dietary_info ? formData.dietary_info.split(',').map(d => d.trim()) : []
        })
      })

      if (res.status === 401) {
        router.push('/login')
        return
      }

      if (res.ok) {
        router.push(`/dashboard/venue/${params.slug}/items`)
      } else {
        const error = await res.json()
        alert(error.error || 'Ürün güncellenemedi')
      }
    } catch (error) {
      console.error(error)
      alert('Bir hata oluştu')
    } finally {
      setSubmitting(false)
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
                onClick={() => router.push(`/dashboard/venue/${params.slug}/items`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Geri
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Ürün Düzenle</h1>
            </div>
            {userTier === 'premium' && (
              <button
                onClick={handleAiEnrichment}
                disabled={isAiEnriching || submitting}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5" />
                {isAiEnriching ? `AI Zenginleştirme (%${aiProgress.toFixed(0)})` : 'AI ile Zenginleştir'}
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori *</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6]"
              >
                <option value="">Kategori Seçin</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Adı *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6]"
                placeholder="Örn: Espresso"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6]"
              placeholder="Ürün açıklaması..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fiyat (₺) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Görsel</label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  {uploading ? 'Yükleniyor...' : 'Resim Yükle'}
                </label>
              </div>
              {formData.image && (
                <img src={formData.image} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Görsel URL (alternatif)</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6]"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Etiketler (virgülle ayırın)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="vegan, gluten-free, yeni"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alerjenler (virgülle ayırın)</label>
              <input
                type="text"
                value={formData.allergens}
                onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                placeholder="süt, yumurta, gluten"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6]"
              />
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Besin Değerleri</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kalori</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Karbonhidrat (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Yağ (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lif (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.fiber}
                  onChange={(e) => setFormData({ ...formData, fiber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Şeker (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.sugar}
                  onChange={(e) => setFormData({ ...formData, sugar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sodyum (mg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.sodium}
                  onChange={(e) => setFormData({ ...formData, sodium: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ürün Detayları</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hazırlama Süresi (dk)</label>
                  <input
                    type="number"
                    value={formData.preparation_time}
                    onChange={(e) => setFormData({ ...formData, preparation_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent"
                    placeholder="15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Porsiyon Boyutu</label>
                  <input
                    type="text"
                    value={formData.serving_size}
                    onChange={(e) => setFormData({ ...formData, serving_size: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent"
                    placeholder="1 porsiyon (250g)"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">İçerik & Malzemeler</label>
                <textarea
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent"
                  rows={3}
                  placeholder="Malzeme listesi..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Menşei</label>
                  <input
                    type="text"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent"
                    placeholder="Türkiye"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Diyet Bilgisi (virgülle ayırın)</label>
                  <input
                    type="text"
                    value={formData.dietary_info}
                    onChange={(e) => setFormData({ ...formData, dietary_info: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent"
                    placeholder="vegetarian, halal"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Saklama Talimatları</label>
                <textarea
                  value={formData.storage_instructions}
                  onChange={(e) => setFormData({ ...formData, storage_instructions: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent"
                  rows={2}
                  placeholder="Serin ve kuru bir yerde saklayın"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Badge Seçenekleri</h3>
            <p className="text-sm text-gray-600 mb-4">Ürününüze uygun badge'leri seçin (tags alanına eklenecektir)</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  id="badge_new"
                  checked={formData.tags.includes('new')}
                  onChange={(e) => {
                    const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t)
                    if (e.target.checked) {
                      tags.push('new')
                    } else {
                      const index = tags.indexOf('new')
                      if (index > -1) tags.splice(index, 1)
                    }
                    setFormData({ ...formData, tags: tags.join(', ') })
                  }}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <label htmlFor="badge_new" className="flex-1 cursor-pointer">
                  <span className="bg-gradient-to-r from-amber-100 to-orange-100 text-orange-700 px-2 py-1 rounded-lg text-xs font-semibold">
                    ✨ YENİ ÜRÜN
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  id="badge_vegan"
                  checked={formData.tags.includes('vegan')}
                  onChange={(e) => {
                    const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t)
                    if (e.target.checked) {
                      tags.push('vegan')
                    } else {
                      const index = tags.indexOf('vegan')
                      if (index > -1) tags.splice(index, 1)
                    }
                    setFormData({ ...formData, tags: tags.join(', ') })
                  }}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <label htmlFor="badge_vegan" className="flex-1 cursor-pointer">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-semibold">
                    🌱 VEGAN
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  id="badge_spicy"
                  checked={formData.tags.includes('spicy')}
                  onChange={(e) => {
                    const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t)
                    if (e.target.checked) {
                      tags.push('spicy')
                    } else {
                      const index = tags.indexOf('spicy')
                      if (index > -1) tags.splice(index, 1)
                    }
                    setFormData({ ...formData, tags: tags.join(', ') })
                  }}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <label htmlFor="badge_spicy" className="flex-1 cursor-pointer">
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-xs font-semibold">
                    🌶️ ACILI
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  id="badge_popular"
                  checked={formData.tags.includes('popular')}
                  onChange={(e) => {
                    const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t)
                    if (e.target.checked) {
                      tags.push('popular')
                    } else {
                      const index = tags.indexOf('popular')
                      if (index > -1) tags.splice(index, 1)
                    }
                    setFormData({ ...formData, tags: tags.join(', ') })
                  }}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="badge_popular" className="flex-1 cursor-pointer">
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-xs font-semibold">
                    🔥 POPÜLER
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAvailable"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="w-5 h-5 text-[#34C8B6] rounded focus:ring-[#34C8B6]"
              />
              <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">Stokta mevcut</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
              />
              <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="text-amber-500">⭐</span> Kampanyalı Ürün (Menüde öne çıkar)
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {submitting ? 'Güncelleniyor...' : 'Güncelle'}
          </button>
        </form>
      </div>
    </div>
  )
}