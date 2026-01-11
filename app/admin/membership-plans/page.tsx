
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Plus, Trash2, DollarSign, Package, Edit2, X } from 'lucide-react'

interface MembershipPlan {
  id: number
  plan_type: string
  monthly_price: number
  yearly_price: number
  features: string[]
  is_active: boolean
  display_order: number
}

export default function MembershipPlansAdmin() {
  const router = useRouter()
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null)
  const [newFeature, setNewFeature] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }

    fetchPlans()
  }, [router])

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/membership-plans', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setPlans(data.plans)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (plan: MembershipPlan) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/membership-plans/${plan.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          monthlyPrice: plan.monthly_price,
          yearlyPrice: plan.yearly_price,
          features: plan.features,
          isActive: plan.is_active,
          displayOrder: plan.display_order
        })
      })

      if (response.ok) {
        setSuccess('Plan başarıyla güncellendi!')
        setEditingPlan(null)
        fetchPlans()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Güncelleme başarısız')
      }
    } catch (error) {
      console.error('Error saving plan:', error)
      setError('Bir hata oluştu')
    }
  }

  const handleAddFeature = (plan: MembershipPlan) => {
    if (newFeature.trim() && editingPlan) {
      setEditingPlan({
        ...editingPlan,
        features: [...editingPlan.features, newFeature.trim()]
      })
      setNewFeature('')
    }
  }

  const handleRemoveFeature = (index: number) => {
    if (editingPlan) {
      setEditingPlan({
        ...editingPlan,
        features: editingPlan.features.filter((_, i) => i !== index)
      })
    }
  }

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'free':
        return 'from-gray-500 to-slate-500'
      case 'basic':
        return 'from-blue-500 to-cyan-500'
      case 'premium':
        return 'from-violet-500 to-purple-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getPlanBgColor = (planType: string) => {
    switch (planType) {
      case 'free':
        return 'from-gray-50 to-slate-50'
      case 'basic':
        return 'from-blue-50 to-cyan-50'
      case 'premium':
        return 'from-violet-50 to-purple-50'
      default:
        return 'from-gray-50 to-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-xl shadow-md transition-all"
              >
                <ArrowLeft size={20} />
                Geri
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Üyelik Planları Yönetimi
                </h1>
                <p className="text-sm text-gray-500">Fiyat ve özellikleri düzenleyin</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gradient-to-br ${getPlanBgColor(plan.plan_type)} rounded-2xl p-6 shadow-lg border border-white/50`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${getPlanColor(plan.plan_type)} rounded-xl flex items-center justify-center`}>
                  <Package className="text-white" size={24} />
                </div>
                <button
                  onClick={() => setEditingPlan(plan)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-all"
                >
                  <Edit2 size={18} className="text-gray-600" />
                </button>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4 capitalize">
                {plan.plan_type}
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                  <span className="text-sm text-gray-600">Aylık</span>
                  <span className="text-xl font-bold text-gray-900">{plan.monthly_price}₺</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                  <span className="text-sm text-gray-600">Yıllık</span>
                  <span className="text-xl font-bold text-gray-900">{plan.yearly_price}₺</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700 mb-2">Özellikler:</p>
                {(Array.isArray(plan.features) ? plan.features : []).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 capitalize">
                {editingPlan.plan_type} Planını Düzenle
              </h3>
              <button
                onClick={() => {
                  setEditingPlan(null)
                  setNewFeature('')
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aylık Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingPlan.monthly_price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, monthly_price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yıllık Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingPlan.yearly_price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, yearly_price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Özellikler
                </label>
                <div className="space-y-2 mb-3">
                  {(Array.isArray(editingPlan.features) ? editingPlan.features : []).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <span className="flex-1 text-sm text-gray-700">{feature}</span>
                      <button
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddFeature(editingPlan)}
                    placeholder="Yeni özellik ekle..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => handleAddFeature(editingPlan)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Ekle
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setEditingPlan(null)
                    setNewFeature('')
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={() => handleSave(editingPlan)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg font-medium transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Kaydet
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
