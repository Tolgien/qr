'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, User, Mail, Lock, LogIn, Check, Crown, Zap, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [dbPlans, setDbPlans] = useState<any[]>([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly')
  const isUpgrade = searchParams.get('upgrade') === 'true'
  const planFromUrl = searchParams.get('plan') || 'free'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    membershipTier: planFromUrl
  })

  useEffect(() => {
    fetch('/api/membership-plans')
      .then(res => res.json())
      .then(data => {
        setDbPlans(data.plans || [])
        setPlansLoading(false)
      })
      .catch(err => {
        console.error('Error fetching plans:', err)
        setPlansLoading(false)
      })
  }, [])

  const getIconForPlan = (planType: string) => {
    const icons: Record<string, any> = {
      'free': User,
      'basic': Zap,
      'premium': Crown
    }
    return icons[planType.toLowerCase()] || User
  }

  const getColorForPlan = (planType: string) => {
    const colors: Record<string, string> = {
      'free': 'from-slate-200 to-slate-300',
      'basic': 'from-sky-300 to-blue-300',
      'premium': 'from-violet-300 to-purple-300'
    }
    return colors[planType.toLowerCase()] || 'from-slate-200 to-slate-300'
  }

  const getBorderForPlan = (planType: string) => {
    const borders: Record<string, string> = {
      'free': 'border-slate-200',
      'basic': 'border-sky-200',
      'premium': 'border-violet-200'
    }
    return borders[planType.toLowerCase()] || 'border-slate-200'
  }

  const getBgColorForPlan = (planType: string) => {
    const bgColors: Record<string, string> = {
      'free': 'bg-slate-50',
      'basic': 'bg-sky-50',
      'premium': 'bg-violet-50'
    }
    return bgColors[planType.toLowerCase()] || 'bg-slate-50'
  }

  const plans = dbPlans.map(dbPlan => {
    const planType = String(dbPlan.planType || dbPlan.plan_type || 'free').toLowerCase().trim()
    const monthlyPrice = parseFloat(String(dbPlan.monthlyPrice || dbPlan.monthly_price || 0))
    const yearlyPrice = parseFloat(String(dbPlan.yearlyPrice || dbPlan.yearly_price || 0))
    
    let features = []
    if (Array.isArray(dbPlan.features) && dbPlan.features.length > 0) {
      features = dbPlan.features
    } else {
      const defaultFeatures: Record<string, string[]> = {
        'free': ['5 Kategori', '20 Ürün', 'Temel Özellikler'],
        'basic': ['Sınırsız Kategori', 'Sınırsız Ürün', 'Gelişmiş Analitik', 'Email Destek'],
        'premium': ['Tüm Basic Özellikler', 'Öncelikli Destek', 'Özel Tasarım', 'API Erişimi']
      }
      features = defaultFeatures[planType] || defaultFeatures['free']
    }

    const displayPrice = billingPeriod === 'monthly' 
      ? (monthlyPrice === 0 ? '0₺' : `${monthlyPrice.toLocaleString('tr-TR')}₺/ay`)
      : (yearlyPrice === 0 ? '0₺' : `${yearlyPrice.toLocaleString('tr-TR')}₺/yıl`)

    const monthlySavings = monthlyPrice > 0 && yearlyPrice > 0 
      ? Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100)
      : 0

    return {
      id: planType,
      name: planType.charAt(0).toUpperCase() + planType.slice(1),
      price: displayPrice,
      monthlyPrice,
      yearlyPrice,
      savings: monthlySavings,
      icon: getIconForPlan(planType),
      color: getColorForPlan(planType),
      border: getBorderForPlan(planType),
      bgColor: getBgColorForPlan(planType),
      features,
      popular: planType === 'premium'
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor')
      return
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          membershipTier: formData.membershipTier
        })
      })

      const data = await response.json()

      if (response.ok) {
        if (data.requiresVerification) {
          setSuccess(true)
          setSuccessMessage(data.message || 'Kayıt başarılı! Lütfen e-postanızı kontrol edin.')
        } else if (data.requiresPayment && data.paymentPageUrl) {
          window.location.href = data.paymentPageUrl
        } else {
          localStorage.setItem('userToken', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          router.push('/dashboard')
        }
      } else {
        setError(data.error || 'Kayıt başarısız')
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-8">
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A]/80 via-[#1A1A1A]/70 to-[#2A2A2A]/80 backdrop-blur-sm"></div>
      </div>

      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/90 hover:bg-white backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all text-[#1A1A1A] font-medium"
        >
          <ArrowLeft size={20} />
          Ana Sayfa
        </button>
      </div>
      <div className="relative max-w-4xl w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              {isUpgrade ? 'Premium\'a Geçin' : 'Hemen Başlayın'}
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            {isUpgrade 
              ? 'Tüm premium özelliklere hemen erişin' 
              : 'QRim.net ile menünüzü oluşturmaya başlayın'
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">{successMessage}</p>
                <p className="text-sm">
                  Size gönderdiğimiz e-postadaki doğrulama linkine tıklayarak hesabınızı aktifleştirebilirsiniz.
                </p>
                <Link 
                  href="/login" 
                  className="inline-block mt-3 text-sm font-medium text-green-700 hover:text-green-800 underline"
                >
                  Giriş sayfasına dön
                </Link>
              </div>
            </div>
          </div>
        )}

        {plansLoading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3 text-gray-600">
              <div className="w-6 h-6 border-3 border-[#34C8B6] border-t-transparent rounded-full animate-spin"></div>
              <span>Planlar yükleniyor...</span>
            </div>
          </div>
        )}

        {!plansLoading && plans.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            Üyelik planları yüklenemedi.
          </div>
        )}

        {!plansLoading && plans.length > 0 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Billing Period Toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-3 bg-gray-100 p-1.5 rounded-xl">
              <button
                type="button"
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-[#34C8B6] shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Aylık
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all relative ${
                  billingPeriod === 'yearly'
                    ? 'bg-white text-[#34C8B6] shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yıllık
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                  İndirimli
                </span>
              </button>
            </div>
          </div>

          {/* Membership Plan Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Üyelik Planı Seçin
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const Icon = plan.icon
                const isSelected = formData.membershipTier === plan.id
                return (
                  <div
                    key={plan.id}
                    onClick={() => setFormData({ ...formData, membershipTier: plan.id })}
                    className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all ${
                      isSelected
                        ? `${plan.border} ${plan.bgColor} shadow-lg`
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-gradient-to-r from-violet-400 to-purple-400 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md">
                          Popüler
                        </span>
                      </div>
                    )}
                    {billingPeriod === 'yearly' && plan.savings > 0 && (
                      <div className="absolute -top-3 right-4">
                        <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md">
                          %{plan.savings} İndirim
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <Icon className={`w-6 h-6 ${
                        isSelected 
                          ? plan.id === 'free' 
                            ? 'text-slate-600' 
                            : plan.id === 'basic' 
                              ? 'text-sky-600' 
                              : 'text-violet-600'
                          : 'text-gray-400'
                      }`} />
                      {isSelected && (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          plan.id === 'free' 
                            ? 'bg-gradient-to-r from-slate-400 to-slate-500' 
                            : plan.id === 'basic' 
                              ? 'bg-gradient-to-r from-sky-400 to-blue-400' 
                              : 'bg-gradient-to-r from-violet-400 to-purple-400'
                        }`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-[#1A1A1A] mb-1">{plan.name}</h3>
                    <p className={`text-2xl font-bold mb-3 ${
                      plan.id === 'free' 
                        ? 'text-slate-600' 
                        : plan.id === 'basic' 
                          ? 'text-sky-600' 
                          : 'text-violet-600'
                    }`}>{plan.price}</p>
                    <ul className="space-y-2">
                      {plan.features.map((feature: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                          <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            plan.id === 'free' 
                              ? 'text-slate-500' 
                              : plan.id === 'basic' 
                                ? 'text-sky-500' 
                                : 'text-violet-500'
                          }`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
            {(formData.membershipTier === 'basic' || formData.membershipTier === 'premium') && (
              <p className="mt-3 text-sm text-emerald-600 text-center font-medium">
                ✨ 14 gün ücretsiz deneme! Kayıt sonrası hemen tüm özelliklere erişebilirsiniz.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Soyad
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre Tekrar
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 md:py-3.5 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
            <span>{loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}</span>
          </button>
        </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-xs md:text-sm mb-3">
            Zaten hesabınız var mı?
          </p>
          <Link 
            href="/login" 
            className="inline-flex items-center justify-center gap-2 w-full py-3 md:py-3.5 bg-white border-2 border-[#34C8B6] text-[#34C8B6] rounded-lg font-semibold hover:bg-[#34C8B6] hover:text-white transition-all text-sm md:text-base"
          >
            <LogIn className="w-4 h-4 md:w-5 md:h-5" />
            <span>Giriş Yap</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function Register() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop)' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A]/80 via-[#1A1A1A]/70 to-[#2A2A2A]/80 backdrop-blur-sm"></div>
        </div>
        <div className="relative max-w-4xl w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 text-center border border-white/20">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#34C8B6]"></div>
          </div>
        </div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}