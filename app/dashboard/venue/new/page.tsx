
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'

export default function NewVenue() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: '',
    cover_image: '',
    status: 'open',
    languages: ['tr', 'en']
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const token = localStorage.getItem('token')
    try {
      const response = await fetch('/api/user/venues/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        router.push('/dashboard')
      } else {
        const error = await response.json()
        alert(error.error || 'Kafe eklenemedi')
      }
    } catch (err) {
      console.error(err)
      alert('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Yeni Kafe Ekle</h1>
              <p className="text-sm text-gray-600 mt-1">Dijital menünüzü oluşturmaya başlayın</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Kafe Adı *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value
                  setFormData({ 
                    ...formData, 
                    name,
                    slug: generateSlug(name)
                  })
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent transition-all"
                placeholder="Örn: Molto Cafe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent transition-all"
                placeholder="Örn: molto-cafe"
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span className="text-[#34C8B6]">🔗</span>
                Menü URL'si: <code className="bg-gray-100 px-2 py-1 rounded">/menu/{formData.slug || 'slug'}</code>
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent transition-all"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Kapak Resmi URL
              </label>
              <input
                type="url"
                value={formData.cover_image}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent transition-all"
                placeholder="https://example.com/cover.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Durum
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent transition-all"
              >
                <option value="open">Açık</option>
                <option value="closing">Yakında Kapanıyor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Diller
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.languages.includes('tr')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, languages: [...formData.languages, 'tr'] })
                      } else {
                        setFormData({ ...formData, languages: formData.languages.filter(l => l !== 'tr') })
                      }
                    }}
                    className="w-4 h-4 text-[#34C8B6] rounded focus:ring-[#34C8B6]"
                  />
                  <span className="ml-2 text-sm text-gray-700">🇹🇷 Türkçe</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.languages.includes('en')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, languages: [...formData.languages, 'en'] })
                      } else {
                        setFormData({ ...formData, languages: formData.languages.filter(l => l !== 'en') })
                      }
                    }}
                    className="w-4 h-4 text-[#34C8B6] rounded focus:ring-[#34C8B6]"
                  />
                  <span className="ml-2 text-sm text-gray-700">🇬🇧 English</span>
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] hover:from-[#2AA897] hover:to-[#34C8B6] rounded-xl text-white font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Ekleniyor...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Kafe Ekle
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
