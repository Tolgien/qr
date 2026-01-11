
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import SliderManagement from './SliderManagement'

interface VenueSettings {
  name: string
  slug: string
  logo?: string
  coverImage?: string
  description?: string
  theme?: string
  status: string
  onlineOrderingEnabled?: boolean
  address?: string
  phone?: string
  website?: string
  wifiPassword?: string
  languages?: string[]
}

export default function UserVenueSettings() {
  const params = useParams()
  const router = useRouter()
  const [settings, setSettings] = useState<VenueSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userMembershipTier, setUserMembershipTier] = useState<string>('free')

  useEffect(() => {
    // Fetch venue settings
    fetch(`/api/user/venue/${params.slug}/settings`, {
      credentials: 'include'
    })
      .then(res => {
        if (res.status === 401) {
          router.push('/login')
          return null
        }
        return res.json()
      })
      .then(data => {
        if (!data) return
        setSettings(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    // Fetch user profile to get membership tier
    fetch('/api/user/profile', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.membershipTier) {
          setUserMembershipTier(data.membershipTier)
        }
      })
      .catch(err => console.error('Error fetching user profile:', err))
  }, [params.slug, router])

  const handleSave = async () => {
    if (!settings) return

    setSaving(true)

    try {
      const res = await fetch(`/api/user/venue/${params.slug}/settings`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (res.ok) {
        alert('Ayarlar kaydedildi!')
      }
    } catch (error) {
      console.error(error)
      alert('Hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#34C8B6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!settings) return null

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
              <h1 className="text-2xl font-bold text-gray-900">Kafe Ayarları</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* Tema Seçimi - En Üstte */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              🎨 Menü Teması Seçin
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, theme: 'coffee' })}
                className={`p-5 border-2 rounded-xl text-left transition-all transform hover:scale-105 ${
                  settings.theme === 'coffee' 
                    ? 'border-amber-600 bg-amber-50 shadow-lg' 
                    : 'border-gray-200 hover:border-amber-300 bg-white'
                }`}
              >
                <div className="text-3xl mb-2">☕</div>
                <h4 className="font-bold text-gray-900 mb-1">Kahve Teması</h4>
                <p className="text-xs text-gray-600">Sıcak kahverengi tonlar</p>
                <div className="flex gap-2 mt-3">
                  <div className="w-6 h-6 rounded-full bg-amber-800"></div>
                  <div className="w-6 h-6 rounded-full bg-amber-600"></div>
                  <div className="w-6 h-6 rounded-full bg-amber-400"></div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setSettings({ ...settings, theme: 'restaurant' })}
                className={`p-5 border-2 rounded-xl text-left transition-all transform hover:scale-105 ${
                  settings.theme === 'restaurant' 
                    ? 'border-red-600 bg-red-50 shadow-lg' 
                    : 'border-gray-200 hover:border-red-300 bg-white'
                }`}
              >
                <div className="text-3xl mb-2">🍽️</div>
                <h4 className="font-bold text-gray-900 mb-1">Restoran Teması</h4>
                <p className="text-xs text-gray-600">Zarif kırmızı tonlar</p>
                <div className="flex gap-2 mt-3">
                  <div className="w-6 h-6 rounded-full bg-red-900"></div>
                  <div className="w-6 h-6 rounded-full bg-red-600"></div>
                  <div className="w-6 h-6 rounded-full bg-orange-500"></div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setSettings({ ...settings, theme: 'modern' })}
                className={`p-5 border-2 rounded-xl text-left transition-all transform hover:scale-105 ${
                  settings.theme === 'modern' 
                    ? 'border-teal-600 bg-teal-50 shadow-lg' 
                    : 'border-gray-200 hover:border-teal-300 bg-white'
                }`}
              >
                <div className="text-3xl mb-2">🌿</div>
                <h4 className="font-bold text-gray-900 mb-1">Modern Yeşil</h4>
                <p className="text-xs text-gray-600">Taze yeşil tonlar</p>
                <div className="flex gap-2 mt-3">
                  <div className="w-6 h-6 rounded-full bg-teal-700"></div>
                  <div className="w-6 h-6 rounded-full bg-teal-500"></div>
                  <div className="w-6 h-6 rounded-full bg-emerald-400"></div>
                </div>
              </button>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Genel Bilgiler</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kafe Adı</label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
            <input
              type="text"
              value={settings.slug}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1">URL adresi değiştirilemez</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
            <textarea
              value={settings.description || ''}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
            <input
              type="url"
              value={settings.logo || ''}
              onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6]"
            />
            {settings.logo && (
              <div className="mt-2">
                <img src={settings.logo} alt="Logo önizleme" className="h-16 object-contain" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kapak Görseli URL</label>
            <input
              type="url"
              value={settings.coverImage || ''}
              onChange={(e) => setSettings({ ...settings, coverImage: e.target.value })}
              placeholder="https://example.com/cover.jpg"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6]"
            />
            {settings.coverImage && (
              <div className="mt-2">
                <img src={settings.coverImage} alt="Kapak önizleme" className="w-full h-32 object-cover rounded-lg" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
            <textarea
              value={settings.address || ''}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6]"
              placeholder="Kafe adresinizi girin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
            <input
              type="tel"
              value={settings.phone || ''}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6]"
              placeholder="+90 555 123 4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <input
              type="url"
              value={settings.website || ''}
              onChange={(e) => setSettings({ ...settings, website: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6]"
              placeholder="https://www.example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">WiFi Şifresi</label>
            <input
              type="text"
              value={settings.wifiPassword || ''}
              onChange={(e) => setSettings({ ...settings, wifiPassword: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6]"
              placeholder="WiFi şifrenizi girin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
            <select
              value={settings.status}
              onChange={(e) => setSettings({ ...settings, status: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34C8B6]"
            >
              <option value="open">Açık</option>
              <option value="closed">Kapalı</option>
            </select>
          </div>

          {/* Dil Seçenekleri */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              🌍 Menü Dil Seçenekleri
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Menünüzde hangi dillerin görüneceğini seçin. Müşteriler seçtiğiniz diller arasından tercih yapabilir.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md bg-white">
                <input
                  type="checkbox"
                  checked={settings.languages?.includes('tr') || false}
                  onChange={(e) => {
                    const languages = settings.languages || []
                    if (e.target.checked) {
                      setSettings({ ...settings, languages: [...languages, 'tr'] })
                    } else {
                      const newLanguages = languages.filter(l => l !== 'tr')
                      if (newLanguages.length === 0) {
                        alert('En az bir dil seçili olmalıdır!')
                        return
                      }
                      setSettings({ ...settings, languages: newLanguages })
                    }
                  }}
                  className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">🇹🇷 Türkçe</div>
                  <div className="text-xs text-gray-500">Turkish</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md bg-white">
                <input
                  type="checkbox"
                  checked={settings.languages?.includes('en') || false}
                  onChange={(e) => {
                    const languages = settings.languages || []
                    if (e.target.checked) {
                      setSettings({ ...settings, languages: [...languages, 'en'] })
                    } else {
                      const newLanguages = languages.filter(l => l !== 'en')
                      if (newLanguages.length === 0) {
                        alert('En az bir dil seçili olmalıdır!')
                        return
                      }
                      setSettings({ ...settings, languages: newLanguages })
                    }
                  }}
                  className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">🇬🇧 İngilizce</div>
                  <div className="text-xs text-gray-500">English</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md bg-white">
                <input
                  type="checkbox"
                  checked={settings.languages?.includes('de') || false}
                  onChange={(e) => {
                    const languages = settings.languages || []
                    if (e.target.checked) {
                      setSettings({ ...settings, languages: [...languages, 'de'] })
                    } else {
                      const newLanguages = languages.filter(l => l !== 'de')
                      if (newLanguages.length === 0) {
                        alert('En az bir dil seçili olmalıdır!')
                        return
                      }
                      setSettings({ ...settings, languages: newLanguages })
                    }
                  }}
                  className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">🇩🇪 Almanca</div>
                  <div className="text-xs text-gray-500">German</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md bg-white">
                <input
                  type="checkbox"
                  checked={settings.languages?.includes('ar') || false}
                  onChange={(e) => {
                    const languages = settings.languages || []
                    if (e.target.checked) {
                      setSettings({ ...settings, languages: [...languages, 'ar'] })
                    } else {
                      const newLanguages = languages.filter(l => l !== 'ar')
                      if (newLanguages.length === 0) {
                        alert('En az bir dil seçili olmalıdır!')
                        return
                      }
                      setSettings({ ...settings, languages: newLanguages })
                    }
                  }}
                  className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">🇸🇦 Arapça</div>
                  <div className="text-xs text-gray-500">Arabic</div>
                </div>
              </label>
            </div>
          </div>

          {/* Online Ordering Toggle */}
          <div className={`p-6 rounded-xl border-2 ${
            userMembershipTier === 'premium' 
              ? 'bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  🛒 Online Sipariş
                  {userMembershipTier === 'premium' && (
                    <span className="text-xs bg-violet-500 text-white px-2 py-1 rounded-full">Premium</span>
                  )}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {userMembershipTier === 'premium' 
                    ? 'Müşterileriniz QR menüden direkt sipariş verebilir'
                    : 'Online sipariş özelliği sadece Premium üyelerde mevcuttur'
                  }
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.onlineOrderingEnabled || false}
                  onChange={(e) => {
                    if (userMembershipTier !== 'premium' && e.target.checked) {
                      alert('Online sipariş özelliği sadece Premium üyelerde mevcuttur. Lütfen üyeliğinizi yükseltin.')
                      return
                    }
                    setSettings({ ...settings, onlineOrderingEnabled: e.target.checked })
                  }}
                  disabled={userMembershipTier !== 'premium'}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer 
                  ${userMembershipTier === 'premium' ? 'peer-checked:bg-violet-600' : 'cursor-not-allowed opacity-50'}
                  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                  after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}
                ></div>
              </label>
            </div>
            {userMembershipTier !== 'premium' && (
              <a 
                href="/pricing" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <span>💎</span>
                Premium'a Geç
              </a>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>

        {/* Slider Yönetimi */}
        <div className="mt-6">
          <SliderManagement venueSlug={params.slug as string} />
        </div>
      </div>
    </div>
  )
}
