'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import SliderManagement from './SliderManagement'

interface VenueSettings {
  name: string
  logo: string
  cover_image: string
  website: string
  wifi_password: string
  address: string
  phone: string
  status: string
}

export default function VenueSettings() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [formData, setFormData] = useState<VenueSettings>({
    name: '',
    logo: '',
    cover_image: '',
    website: '',
    wifi_password: '',
    address: '',
    phone: '',
    status: 'open'
  })

  useEffect(() => {
    fetchVenueSettings()
  }, [])

  const fetchVenueSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/venue/${params.slug}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({
          name: data.name || '',
          logo: data.logo || '',
          cover_image: data.coverImage || '',
          website: data.website || '',
          wifi_password: data.wifiPassword || '',
          address: data.address || '',
          phone: data.phone || '',
          status: data.status || 'open'
        })
      }
    } catch (error) {
      console.error('Error fetching venue settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    const token = localStorage.getItem('adminToken')

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({ ...formData, logo: data.url })
      } else {
        const error = await response.json()
        alert(error.error || 'Logo yüklenemedi')
      }
    } catch (error) {
      console.error('Logo upload error:', error)
      alert('Logo yükleme hatası')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCover(true)
    const token = localStorage.getItem('adminToken')

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({ ...formData, cover_image: data.url })
      } else {
        const error = await response.json()
        alert(error.error || 'Kapak resmi yüklenemedi')
      }
    } catch (error) {
      console.error('Cover upload error:', error)
      alert('Kapak resmi yükleme hatası')
    } finally {
      setUploadingCover(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        alert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.')
        router.push('/admin/login')
        return
      }

      console.log('Submitting form data:', formData)
      console.log('Token exists:', !!token)

      const response = await fetch(`/api/admin/venue/${params.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      console.log('Response status:', response.status)

      if (response.status === 401) {
        const error = await response.json()
        alert(`Oturum hatası: ${error.error || 'Lütfen tekrar giriş yapın'}`)
        localStorage.removeItem('adminToken')
        router.push('/admin/login')
        return
      }

      if (response.ok) {
        alert('Ayarlar başarıyla kaydedildi!')
        router.push(`/admin/venue/${params.slug}`)
      } else {
        const error = await response.json()
        console.error('Server error:', error)
        alert(`Hata: ${error.error || 'Ayarlar kaydedilemedi'}`)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Yükleniyor...</div>
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
              <h1 className="text-2xl font-bold text-gray-900">Kafe Ayarları</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Genel Bilgiler</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kafe İsmi</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
              <input 
                type="text" 
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-2" 
                placeholder="https://example.com/logo.jpg veya aşağıdan dosya yükleyin"
              />
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 transition-colors">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      {uploadingLogo ? 'Yükleniyor...' : 'Logo Seç'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
                {formData.logo && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                    <img 
                      src={formData.logo} 
                      alt="Logo preview" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF veya WebP (Max 5MB)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kapak Resmi
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.cover_image}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="https://example.com/cover.jpg veya aşağıdan dosya yükleyin"
                />
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 transition-colors">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {uploadingCover ? 'Yükleniyor...' : 'Kapak Resmi Seç'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      disabled={uploadingCover}
                      className="hidden"
                    />
                  </label>
                  {formData.cover_image && (
                    <div className="w-32 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                      <img 
                        src={formData.cover_image} 
                        alt="Kapak önizleme" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">JPG, PNG, GIF veya WebP (Max 5MB)</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input 
                type="url" 
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                placeholder="https://www.example.com"
              />
              <p className="text-xs text-gray-500 mt-1">Kafe web sitenizin URL'si</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
              <textarea 
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                placeholder="Kafe adresinizi girin"
              />
              <p className="text-xs text-gray-500 mt-1">Müşterilerinize gösterilecek tam adres</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                placeholder="+90 555 123 4567"
              />
              <p className="text-xs text-gray-500 mt-1">İletişim telefon numarası</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">WiFi Şifresi</label>
              <input 
                type="text" 
                value={formData.wifi_password}
                onChange={(e) => setFormData({ ...formData, wifi_password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                placeholder="WiFi şifrenizi girin"
              />
              <p className="text-xs text-gray-500 mt-1">Müşterilerinizle paylaşılacak WiFi şifresi</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="open">Açık</option>
                <option value="closing">Yakında Kapanıyor</option>
              </select>
            </div>
          </form>
        </div>

        {/* Slider Yönetimi - Modern Component */}
        <div className="mt-6">
          <SliderManagement venueSlug={params.slug as string} />
        </div>
      </div>
    </div>
  )
}