'use client'

import { useState, useEffect } from 'react'
import { Slider } from '@/lib/types'
import Image from 'next/image'
import { Trash2, Plus, Eye, EyeOff, Save } from 'lucide-react'

interface SliderManagementProps {
  venueSlug: string
}

export default function SliderManagement({ venueSlug }: SliderManagementProps) {
  const [sliders, setSliders] = useState<Slider[]>([])
  const [editingSliders, setEditingSliders] = useState<Slider[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchSliders()
  }, [venueSlug])

  useEffect(() => {
    setEditingSliders(sliders)
    setHasChanges(false)
  }, [sliders])

  const fetchSliders = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/venue/${venueSlug}/sliders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSliders(data.sliders || [])
      }
    } catch (error) {
      console.error('Error fetching sliders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSlider = async () => {
    if (sliders.length >= 3) {
      alert('Maksimum 3 slider ekleyebilirsiniz')
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/venue/${venueSlug}/sliders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          image: '',
          title: '',
          description: '',
          isActive: true
        })
      })

      if (response.ok) {
        fetchSliders()
      } else {
        const error = await response.json()
        alert(error.error || 'Slider eklenemedi')
      }
    } catch (error) {
      console.error('Error adding slider:', error)
      alert('Bir hata oluştu')
    }
  }

  const handleSaveSlider = async (sliderId: number) => {
    const slider = editingSliders.find(s => s.id === sliderId)
    if (!slider) return

    setSaving(sliderId)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/venue/${venueSlug}/sliders/${sliderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          image: slider.image,
          title: slider.title,
          description: slider.description,
          isActive: slider.isActive
        })
      })

      if (response.ok) {
        await fetchSliders()
      } else {
        alert('Slider güncellenemedi')
      }
    } catch (error) {
      console.error('Error updating slider:', error)
      alert('Bir hata oluştu')
    } finally {
      setSaving(null)
    }
  }

  const handleDeleteSlider = async (sliderId: number) => {
    if (!confirm('Bu slider\'ı silmek istediğinize emin misiniz?')) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/venue/${venueSlug}/sliders/${sliderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchSliders()
      } else {
        alert('Slider silinemedi')
      }
    } catch (error) {
      console.error('Error deleting slider:', error)
      alert('Bir hata oluştu')
    }
  }

  const handleMoveSlider = async (sliderId: number, direction: 'up' | 'down') => {
    const currentIndex = editingSliders.findIndex(s => s.id === sliderId)
    if (currentIndex === -1) return
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= editingSliders.length) return

    const newOrder = [...editingSliders]
    const [removed] = newOrder.splice(currentIndex, 1)
    newOrder.splice(newIndex, 0, removed)

    setEditingSliders(newOrder)

    const sliderIds = newOrder.map(s => s.id)

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/venue/${venueSlug}/sliders/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sliderIds })
      })

      if (response.ok) {
        fetchSliders()
      }
    } catch (error) {
      console.error('Error reordering sliders:', error)
    }
  }

  const updateEditingSlider = (sliderId: number, updates: Partial<Slider>) => {
    setEditingSliders(prev =>
      prev.map(s => s.id === sliderId ? { ...s, ...updates } : s)
    )
    setHasChanges(true)
  }

  const hasSliderChanges = (sliderId: number) => {
    const original = sliders.find(s => s.id === sliderId)
    const editing = editingSliders.find(s => s.id === sliderId)
    if (!original || !editing) return false

    return (
      original.image !== editing.image ||
      original.title !== editing.title ||
      original.description !== editing.description ||
      original.isActive !== editing.isActive
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Slider Yönetimi</h2>
          <p className="text-sm text-gray-600 mt-1">Ana sayfada görünecek slider\'ları yönetin (maksimum 3)</p>
        </div>
        <button
          onClick={handleAddSlider}
          disabled={sliders.length >= 3}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            sliders.length >= 3
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
          }`}
        >
          <Plus size={20} />
          Yeni Slider Ekle ({sliders.length}/3)
        </button>
      </div>

      {editingSliders.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz slider eklenmemiş</h3>
          <p className="text-gray-600">Müşterilerinize özel kampanya ve görselleri gösterin!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {editingSliders.map((slider, index) => (
            <div
              key={slider.id}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 p-6 hover:border-purple-300 transition-all"
            >
              <div className="flex items-start gap-6">
                {/* Preview Image */}
                <div className="relative w-80 h-48 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-lg">
                  {slider.image ? (
                    <Image
                      src={slider.image}
                      alt={slider.title || 'Slider'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-6xl">📸</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  {slider.title && (
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="font-bold text-lg drop-shadow-lg line-clamp-1">{slider.title}</h4>
                      {slider.description && (
                        <p className="text-sm opacity-90 drop-shadow line-clamp-2">{slider.description}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Görsel
                    </label>
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              updateEditingSlider(slider.id, { image: reader.result as string })
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                      />
                      <div className="text-xs text-gray-500">veya URL ile:</div>
                      <input
                        type="text"
                        value={slider.image.startsWith('data:') ? '' : slider.image}
                        onChange={(e) => updateEditingSlider(slider.id, { image: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Başlık
                    </label>
                    <input
                      type="text"
                      value={slider.title || ''}
                      onChange={(e) => updateEditingSlider(slider.id, { title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                      placeholder="Slider başlığı"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Açıklama
                    </label>
                    <textarea
                      value={slider.description || ''}
                      onChange={(e) => updateEditingSlider(slider.id, { description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all resize-none"
                      placeholder="Slider açıklaması"
                    />
                  </div>

                  {/* Save Button */}
                  {hasSliderChanges(slider.id) && (
                    <button
                      onClick={() => handleSaveSlider(slider.id)}
                      disabled={saving === slider.id}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
                    >
                      {saving === slider.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Değişiklikleri Kaydet
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => updateEditingSlider(slider.id, { isActive: !slider.isActive })}
                    className={`p-3 rounded-xl transition-all ${
                      slider.isActive
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    title={slider.isActive ? 'Aktif' : 'Pasif'}
                  >
                    {slider.isActive ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleMoveSlider(slider.id, 'up')}
                      disabled={index === 0}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="Yukarı taşı"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleMoveSlider(slider.id, 'down')}
                      disabled={index === editingSliders.length - 1}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="Aşağı taşı"
                    >
                      ▼
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteSlider(slider.id)}
                    className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                    title="Sil"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between px-2">
                <span className="text-sm font-medium text-gray-600">
                  Sıra: #{index + 1}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  slider.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {slider.isActive ? '✓ Aktif' : '○ Pasif'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
