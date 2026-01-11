'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Upload, Sparkles } from 'lucide-react'
import AlertModal from '@/components/AlertModal'

interface Category {
  id: number
  name: string
}

export default function NewItemPage() {
  const params = useParams()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isAiEnriching, setIsAiEnriching] = useState(false)
  const [aiProgress, setAiProgress] = useState(0)
  const [userTier, setUserTier] = useState<string>('free')
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean
    title?: string
    message: string
    type: 'error' | 'success' | 'warning' | 'info'
  }>({
    isOpen: false,
    message: '',
    type: 'info'
  })
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

  const showAlert = (message: string, type: 'error' | 'success' | 'warning' | 'info' = 'error', title?: string) => {
    setAlertModal({
      isOpen: true,
      message,
      type,
      title
    })
  }

  const closeAlert = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }))
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, profileRes] = await Promise.all([
          fetch(`/api/user/venue/${params.slug}/categories`),
          fetch('/api/user/profile')
        ])

        if (categoriesRes.status === 401 || profileRes.status === 401) {
          router.push('/login')
          return
        }

        const [categoriesData, profileData] = await Promise.all([
          categoriesRes.json(),
          profileRes.json()
        ])

        console.log('✅ Profile loaded:', profileData)
        console.log('✅ Membership tier from API:', profileData.membershipTier)
        
        setCategories(categoriesData.categories || [])
        
        const tier = profileData.membershipTier || 'free'
        console.log('✅ Setting userTier state to:', tier)
        setUserTier(tier)
        
        // Verify state was set
        setTimeout(() => {
          console.log('✅ UserTier state after update:', tier)
        }, 100)
        
        setLoading(false)
      } catch (error) {
        console.error('❌ Error loading data:', error)
        setLoading(false)
      }
    }

    loadData()
  }, [params.slug, router])

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
        showAlert('Resim başarıyla yüklendi!', 'success', 'Başarılı')
      } else {
        const errorData = await res.json()
        console.error('❌ Upload failed:', errorData)
        showAlert(errorData.error || 'Resim yüklenemedi', 'error', 'Hata')
      }
    } catch (error) {
      console.error('❌ Upload error:', error)
      showAlert('Resim yükleme hatası. Lütfen tekrar deneyin.', 'error', 'Hata')
    } finally {
      setUploading(false)
    }
  }

  const handleAIEnrich = async () => {
    console.log('🚀 AI Enrich started')
    console.log('UserTier:', userTier)
    
    if (!formData.name) {
      showAlert('Lütfen önce ürün adını girin', 'warning', 'Uyarı')
      return
    }

    if (userTier === 'free') {
      console.log('❌ User tier is free, showing alert')
      showAlert('AI zenginleştirme özelliği Premium üyelere özeldir. Lütfen üyeliğinizi yükseltin.', 'warning', 'Premium Özellik')
      return
    }

    console.log('✅ Starting AI enrichment...')
    setIsAiEnriching(true)
    setAiProgress(0)

    // Progress animation
    const progressInterval = setInterval(() => {
      setAiProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 300)

    try {
      const response = await fetch('/api/ai/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productName: formData.name }),
      })

      if (response.ok) {
        try {
          const data = await response.json()
          console.log('📦 AI Response:', data)
          setAiProgress(100)

          setTimeout(() => {
          setFormData(prev => ({
            ...prev,
            description: data.description || prev.description,
            image: data.image || prev.image,
            calories: data.calories?.toString() || prev.calories,
            protein: data.protein?.toString() || prev.protein,
            carbs: data.carbs?.toString() || prev.carbs,
            fat: data.fat?.toString() || prev.fat,
            fiber: data.fiber?.toString() || prev.fiber,
            sugar: data.sugar?.toString() || prev.sugar,
            sodium: data.sodium?.toString() || prev.sodium,
            ingredients: data.ingredients || prev.ingredients,
            allergens: Array.isArray(data.allergens) 
              ? data.allergens.join(', ') 
              : (typeof data.allergens === 'string' ? data.allergens : prev.allergens),
            tags: Array.isArray(data.tags) 
              ? data.tags.join(', ') 
              : (typeof data.tags === 'string' ? data.tags : prev.tags),
            dietary_info: Array.isArray(data.dietary_info) 
              ? data.dietary_info.join(', ') 
              : (typeof data.dietary_info === 'string' ? data.dietary_info : prev.dietary_info),
            origin: data.origin || prev.origin,
            storage_instructions: data.storage_instructions || prev.storage_instructions,
            preparation_time: data.preparation_time?.toString() || prev.preparation_time,
            serving_size: data.serving_size || prev.serving_size,
          }))
          console.log('✅ Form data updated successfully')
        }, 500)
        } catch (jsonError) {
          console.error('❌ Error parsing AI response:', jsonError)
          showAlert('AI yanıtı işlenirken hata oluştu', 'error', 'Hata')
        }
      } else {
        try {
          const error = await response.json()
          
          if (error.errorCode === 'AI_OVERLOADED') {
            showAlert(
              'AI servisi şu anda yoğun. Lütfen 10-20 saniye bekleyip tekrar deneyin. Sistem otomatik olarak tekrar deneyecektir.',
              'warning',
              'Servis Yoğun'
            )
          } else if (error.errorCode === 'RATE_LIMITED') {
            showAlert(
              'Çok fazla istek gönderildi. Lütfen 30 saniye bekleyip tekrar deneyin.',
              'warning',
              'Hız Sınırı'
            )
          } else {
            showAlert(
              `AI zenginleştirme başarısız: ${error.error || 'Bilinmeyen hata'}`,
              'error',
              'Hata'
            )
          }
        } catch (jsonError) {
          console.error('❌ Error parsing AI error response:', jsonError)
          showAlert('AI zenginleştirme başarısız. Lütfen tekrar deneyin.', 'error', 'Hata')
        }
      }
    } catch (error) {
      console.error('AI enrich error:', error)
      showAlert('AI zenginleştirme sırasında bir hata oluştu. Lütfen tekrar deneyin.', 'error', 'Hata')
    } finally {
      clearInterval(progressInterval)
      setTimeout(() => {
        setIsAiEnriching(false)
        setAiProgress(0)
      }, 1000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.price || !formData.categoryId) {
      showAlert('Lütfen zorunlu alanları doldurun', 'warning', 'Uyarı')
      return
    }

    setSubmitting(true)

    try {
      // First check if user can add more items
      const venueRes = await fetch(`/api/user/venue/${params.slug}`)

      if (venueRes.status === 401) {
        router.push('/login')
        return
      }

      if (!venueRes.ok) {
        showAlert('Kafe bilgileri alınamadı', 'error', 'Hata')
        setSubmitting(false)
        return
      }

      const venueData = await venueRes.json()

      if (!venueData || !venueData.id) {
        showAlert('Kafe bilgileri hatalı', 'error', 'Hata')
        setSubmitting(false)
        return
      }

      const limitRes = await fetch('/api/user/check-limits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ venueId: venueData.id, type: 'item' })
      })

      if (limitRes.status === 401) {
        router.push('/login')
        return
      }

      const limitData = await limitRes.json()

      if (!limitData.canAdd) {
        showAlert(limitData.reason || 'Ürün ekleme limitinize ulaştınız', 'warning', 'Limit Aşıldı')
        setSubmitting(false)
        return
      }

      // Helper function to safely parse numbers
      const parseNum = (val: string) => {
        if (!val || val.trim() === '') return null
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }

      const parseIntNum = (val: string) => {
        if (!val || val.trim() === '') return null
        const num = parseInt(val)
        return isNaN(num) ? null : num
      }

      const safeString = (val: string) => {
        return val && val.trim() !== '' ? val.trim() : null
      }

      const safeArray = (val: string) => {
        if (!val || val.trim() === '') return []
        return val.split(',').map(item => item.trim()).filter(item => item !== '')
      }

      const requestBody = {
        name: formData.name.trim(),
        description: safeString(formData.description),
        price: parseFloat(formData.price),
        categoryId: parseInt(formData.categoryId),
        image: safeString(formData.image),
        tags: safeArray(formData.tags),
        allergens: safeArray(formData.allergens),
        isAvailable: formData.isAvailable,
        isFeatured: formData.isFeatured,
        calories: parseNum(formData.calories),
        protein: parseNum(formData.protein),
        carbs: parseNum(formData.carbs),
        fat: parseNum(formData.fat),
        fiber: parseNum(formData.fiber),
        sugar: parseNum(formData.sugar),
        sodium: parseIntNum(formData.sodium),
        preparation_time: parseIntNum(formData.preparation_time),
        serving_size: safeString(formData.serving_size),
        ingredients: safeString(formData.ingredients),
        origin: safeString(formData.origin),
        storage_instructions: safeString(formData.storage_instructions),
        dietary_info: safeArray(formData.dietary_info)
      }

      console.log('📤 Sending item data:', requestBody)

      const res = await fetch(`/api/user/venue/${params.slug}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (res.status === 401) {
        router.push('/login')
        return
      }

      if (res.ok) {
        try {
          const data = await res.json()
          console.log('✅ Item created successfully with ID:', data.id)
          router.push(`/dashboard/venue/${params.slug}/items`)
        } catch (jsonError) {
          console.error('❌ Error parsing success response:', jsonError)
          // Başarılı ama JSON parse edilemedi, yine de yönlendir
          router.push(`/dashboard/venue/${params.slug}/items`)
        }
      } else {
        try {
          const error = await res.json()
          console.error('❌ Item creation failed:', error)
          showAlert(error.error || 'Ürün eklenemedi', 'error', 'Hata')
        } catch (jsonError) {
          console.error('❌ Error parsing error response:', jsonError)
          showAlert('Ürün eklenemedi - Sunucu hatası', 'error', 'Hata')
        }
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error)
      let errorMessage = 'Bilinmeyen bir hata oluştu'
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error)
      }
      
      showAlert('Bir hata oluştu: ' + errorMessage, 'error', 'Hata')
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
              <h1 className="text-2xl font-bold text-gray-900">Yeni Ürün Ekle</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori *</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6] text-sm sm:text-base"
              >
                <option value="">Kategori Seçin</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Adı *</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6] text-sm sm:text-base"
                  placeholder="Örn: Espresso"
                />
                <button
                  type="button"
                  onClick={() => {
                    console.log('🤖 AI button clicked')
                    console.log('Current userTier:', userTier)
                    console.log('Product name:', formData.name)
                    console.log('Is enriching:', isAiEnriching)
                    handleAIEnrich()
                  }}
                  disabled={!formData.name || isAiEnriching || userTier === 'free'}
                  className={`w-full sm:w-auto px-4 py-2 sm:py-3 text-white rounded-lg flex items-center justify-center gap-2 relative overflow-hidden transition-all text-sm sm:text-base ${
                    !formData.name || isAiEnriching || userTier === 'free'
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                  }`}
                  title={userTier === 'free' ? 'Premium özellik - Lütfen yükseltme yapın' : 'AI ile zenginleştir'}
                >
                  {isAiEnriching && (
                    <div
                      className="absolute inset-0 bg-purple-400 transition-all duration-300 ease-out"
                      style={{ width: `${aiProgress}%` }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Sparkles size={18} className={isAiEnriching ? 'animate-spin' : ''} />
                    {isAiEnriching ? `${Math.round(aiProgress)}%` : 'AI'}
                  </span>
                </button>
              </div>
              {isAiEnriching && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300 ease-out"
                      style={{ width: `${aiProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    AI ile ürün bilgileri zenginleştiriliyor...
                  </p>
                </div>
              )}
              {userTier === 'free' && (
                <p className="text-xs text-amber-600 mt-1">
                  💎 AI zenginleştirme Premium üyelere özeldir
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6] text-sm sm:text-base"
              placeholder="Ürün açıklaması..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fiyat (₺) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6] text-sm sm:text-base"
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
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                  {uploading ? 'Yükleniyor...' : 'Resim Yükle'}
                </label>
              </div>
              {formData.image && (
                <img src={formData.image} alt="Preview" className="mt-2 w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Görsel URL (alternatif)</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6] text-sm sm:text-base"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Etiketler (virgülle ayırın)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="vegan, gluten-free, yeni"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6] text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alerjenler (virgülle ayırın)</label>
              <input
                type="text"
                value={formData.allergens}
                onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                placeholder="süt, yumurta, gluten"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6] text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="border-t pt-4 sm:pt-6 mt-4 sm:mt-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Besin Değerleri</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Kalori</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent text-sm sm:text-base"
                  placeholder="250"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Protein (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Karbonhidrat (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Yağ (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Lif (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.fiber}
                  onChange={(e) => setFormData({ ...formData, fiber: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Şeker (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.sugar}
                  onChange={(e) => setFormData({ ...formData, sugar: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent text-sm sm:text-base"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Sodyum (mg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.sodium}
                  onChange={(e) => setFormData({ ...formData, sodium: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4 sm:pt-6 mt-4 sm:mt-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Ürün Detayları</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Hazırlama Süresi (dk)</label>
                  <input
                    type="number"
                    value={formData.preparation_time}
                    onChange={(e) => setFormData({ ...formData, preparation_time: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent text-sm sm:text-base"
                    placeholder="15"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Porsiyon Boyutu</label>
                  <input
                    type="text"
                    value={formData.serving_size}
                    onChange={(e) => setFormData({ ...formData, serving_size: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent text-sm sm:text-base"
                    placeholder="1 porsiyon (250g)"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">İçerik & Malzemeler</label>
                <textarea
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent text-sm sm:text-base"
                  rows={3}
                  placeholder="Malzeme listesi..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Menşei</label>
                  <input
                    type="text"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent text-sm sm:text-base"
                    placeholder="Türkiye"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Diyet Bilgisi (virgülle ayırın)</label>
                  <input
                    type="text"
                    value={formData.dietary_info}
                    onChange={(e) => setFormData({ ...formData, dietary_info: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent text-sm sm:text-base"
                    placeholder="vegetarian, halal"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Saklama Talimatları</label>
                <textarea
                  value={formData.storage_instructions}
                  onChange={(e) => setFormData({ ...formData, storage_instructions: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent text-sm sm:text-base"
                  rows={2}
                  placeholder="Serin ve kuru bir yerde saklayın"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4 sm:pt-6 mt-4 sm:mt-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Badge Seçenekleri</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Ürününüze uygun badge'leri seçin (tags alanına eklenecektir)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
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

          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAvailable"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="w-4 h-4 sm:w-5 sm:h-5 text-[#34C8B6] rounded focus:ring-[#34C8B6]"
              />
              <label htmlFor="isAvailable" className="text-xs sm:text-sm font-medium text-gray-700">Stokta mevcut</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 rounded focus:ring-amber-500"
              />
              <label htmlFor="isFeatured" className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="text-amber-500">⭐</span> Kampanyalı Ürün (Menüde öne çıkar)
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 text-sm sm:text-base"
          >
            {submitting ? 'Ekleniyor...' : 'Ürünü Ekle'}
          </button>
        </form>
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  )
}