'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface SystemSettings {
  iyzicoApiKey: string
  iyzicoSecretKey: string
  iyzicoUri: string
  openAiApiKey?: string
  useOpenAI?: boolean
  openAiModel?: string
  googleTranslateApiKey?: string
  useGoogleTranslate?: boolean
  resendApiKey?: string
  resendFromEmail?: string
  requireEmailVerification?: boolean
}

export default function AdminSettings() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SystemSettings>({
    iyzicoApiKey: '',
    iyzicoSecretKey: '',
    iyzicoUri: 'https://sandbox-api.iyzipay.com'
  })
  const [showSecrets, setShowSecrets] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      } else if (response.status === 401) {
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        alert('Ayarlar başarıyla kaydedildi!')
      } else {
        alert('Ayarlar kaydedilemedi')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
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
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Geri
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Sistem Ayarları</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Iyzico Ödeme Entegrasyonu</h2>
            <p className="text-sm text-gray-600">
              Iyzico API anahtarlarınızı buradan yönetebilirsiniz. Bu ayarlar tüm ödeme işlemleri için kullanılacaktır.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={settings.iyzicoApiKey}
                  onChange={(e) => setSettings({ ...settings, iyzicoApiKey: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="sandbox-YOUR_API_KEY"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Iyzico panelinden alacağınız API anahtarı
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secret Key
              </label>
              <div className="relative">
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={settings.iyzicoSecretKey}
                  onChange={(e) => setSettings({ ...settings, iyzicoSecretKey: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="sandbox-YOUR_SECRET_KEY"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Iyzico panelinden alacağınız gizli anahtar
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API URL
              </label>
              <select
                value={settings.iyzicoUri}
                onChange={(e) => setSettings({ ...settings, iyzicoUri: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="https://sandbox-api.iyzipay.com">Sandbox (Test)</option>
                <option value="https://api.iyzipay.com">Production (Canlı)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Test ortamı için Sandbox, canlı ödemeler için Production seçin
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showSecrets"
                checked={showSecrets}
                onChange={(e) => setShowSecrets(e.target.checked)}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="showSecrets" className="text-sm text-gray-700">
                API anahtarlarını göster
              </label>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Bilgi</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Test ödemeleri için Sandbox modunu kullanın</li>
                <li>Canlıya almadan önce mutlaka test edin</li>
                <li>API anahtarlarınızı kimseyle paylaşmayın</li>
                <li>Ayarları değiştirdikten sonra uygulamanın yeniden başlatılması gerekmez</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">OpenAI API Entegrasyonu</h2>
              <p className="text-sm text-gray-600">
                AI özellikleri için OpenAI API kullanmak isterseniz API anahtarınızı buradan girebilirsiniz.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="useOpenAI"
                  checked={settings.useOpenAI || false}
                  onChange={(e) => setSettings({ ...settings, useOpenAI: e.target.checked })}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-5 h-5"
                />
                <label htmlFor="useOpenAI" className="text-sm font-medium text-gray-700">
                  OpenAI API kullan (Kapalıysa Anthropic Claude kullanılır)
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key
                </label>
                <div className="relative">
                  <input
                    type={showSecrets ? 'text' : 'password'}
                    value={settings.openAiApiKey || ''}
                    onChange={(e) => setSettings({ ...settings, openAiApiKey: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="sk-..."
                    disabled={!settings.useOpenAI}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  OpenAI Platform'dan alacağınız API anahtarı
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI Model
                </label>
                <select
                  value={settings.openAiModel || 'gpt-4o-mini'}
                  onChange={(e) => setSettings({ ...settings, openAiModel: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  disabled={!settings.useOpenAI}
                >
                  <option value="gpt-4o">GPT-4o (En güçlü)</option>
                  <option value="gpt-4o-mini">GPT-4o Mini (Ekonomik)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (En ucuz)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Kullanılacak OpenAI model versiyonu
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Bilgi</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>OpenAI API ücretli bir servistir</li>
                  <li>API anahtarı için OpenAI Platform kullanın</li>
                  <li>Model seçimi maliyet ve performansı etkiler</li>
                  <li>Kapalıysa varsayılan olarak Anthropic Claude kullanılır</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Google Translate Entegrasyonu</h2>
              <p className="text-sm text-gray-600">
                Menü çevirisi için Google Translate API kullanmak isterseniz API anahtarınızı buradan girebilirsiniz.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="useGoogleTranslate"
                  checked={settings.useGoogleTranslate || false}
                  onChange={(e) => setSettings({ ...settings, useGoogleTranslate: e.target.checked })}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-5 h-5"
                />
                <label htmlFor="useGoogleTranslate" className="text-sm font-medium text-gray-700">
                  Google Translate API kullan (Kapalıysa Anthropic Claude kullanılır)
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Translate API Key
                </label>
                <div className="relative">
                  <input
                    type={showSecrets ? 'text' : 'password'}
                    value={settings.googleTranslateApiKey || ''}
                    onChange={(e) => setSettings({ ...settings, googleTranslateApiKey: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="AIza..."
                    disabled={!settings.useGoogleTranslate}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Google Cloud Console'dan alacağınız API anahtarı
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Önemli</h3>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                  <li>Google Translate API ücretli bir servistir</li>
                  <li>API anahtarı için Google Cloud Console kullanın</li>
                  <li>Translation API'yi projenizde aktif edin</li>
                  <li>Kapalıysa varsayılan olarak Anthropic Claude kullanılır</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Resend E-posta Servisi</h2>
              <p className="text-sm text-gray-600">
                E-posta doğrulama için Resend API kullanabilirsiniz. API anahtarınızı buradan girebilirsiniz.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resend API Key
                </label>
                <div className="relative">
                  <input
                    type={showSecrets ? 'text' : 'password'}
                    value={settings.resendApiKey || ''}
                    onChange={(e) => setSettings({ ...settings, resendApiKey: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="re_..."
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Resend Dashboard'dan alacağınız API anahtarı
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gönderen E-posta Adresi
                </label>
                <input
                  type="email"
                  value={settings.resendFromEmail || ''}
                  onChange={(e) => setSettings({ ...settings, resendFromEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="noreply@yourdomain.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Doğrulama e-postalarının gönderileceği adres (Resend'de onaylanmış domain olmalı)
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Bilgi</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Resend hesabı oluşturmak için <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline">resend.com</a> adresini ziyaret edin</li>
                  <li>API anahtarı için Resend Dashboard kullanın</li>
                  <li>Gönderen e-posta adresinizin domain'ini Resend'de doğrulamanız gerekir</li>
                  <li>Test için onboarding@resend.dev adresini kullanabilirsiniz (domain doğrulama gerektirmez)</li>
                  <li>Bu alanlar boş bırakılırsa varsayılan Replit Resend entegrasyonu kullanılır</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">E-posta Doğrulama</h2>
              <p className="text-sm text-gray-600">
                Yeni kullanıcıların hesap oluştururken e-posta adreslerini doğrulamalarını zorunlu kılabilirsiniz.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="requireEmailVerification"
                  checked={settings.requireEmailVerification || false}
                  onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-5 h-5"
                />
                <label htmlFor="requireEmailVerification" className="text-sm font-medium text-gray-700">
                  E-posta doğrulama zorunluluğu (Bot kullanıcıları engeller)
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Bilgi</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Açık olduğunda yeni kullanıcılar kayıt sonrası e-postalarına gelen doğrulama linkine tıklamalıdır</li>
                  <li>E-posta doğrulanmadan giriş yapılamaz</li>
                  <li>Bot kullanıcıları e-posta kutusuna erişemediği için hesap oluşturamaz</li>
                  <li>Kapalı olduğunda kullanıcılar doğrudan kayıt olduktan sonra giriş yapabilir</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}