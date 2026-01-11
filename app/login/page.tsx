'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Mail, Lock, UserPlus, ArrowLeft } from 'lucide-react'

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const handleResendVerification = async () => {
    setResendingEmail(true)
    setResendSuccess(false)
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })

      const data = await response.json()

      if (response.ok) {
        setResendSuccess(true)
        setError('')
      } else {
        setError(data.error || 'E-posta gönderilemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setResendingEmail(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setNeedsVerification(false)
    setResendSuccess(false)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        console.log('Login successful')
        console.log('User:', data.user)
        
        localStorage.setItem('user', JSON.stringify(data.user))
        
        router.push('/dashboard')
      } else {
        if (data.requiresVerification) {
          setNeedsVerification(true)
        }
        setError(data.error || 'Giriş başarısız')
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop)',
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
      <div className="relative max-w-md w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2 text-center">Giriş Yap</h1>
        <p className="text-gray-600 text-center mb-8">QRim.net menünüzü yönetin</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
            {needsVerification && (
              <button
                onClick={handleResendVerification}
                disabled={resendingEmail}
                className="mt-3 w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {resendingEmail ? 'Gönderiliyor...' : 'Doğrulama E-postası Tekrar Gönder'}
              </button>
            )}
          </div>
        )}

        {resendSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            Doğrulama e-postası tekrar gönderildi! Lütfen gelen kutunuzu kontrol edin.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 md:py-3.5 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <LogIn className="w-4 h-4 md:w-5 md:h-5" />
            <span>{loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-xs md:text-sm mb-3">
            Hesabınız yok mu?
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 w-full py-3 md:py-3.5 bg-white border-2 border-[#34C8B6] text-[#34C8B6] rounded-lg font-semibold hover:bg-[#34C8B6] hover:text-white transition-all text-sm md:text-base"
          >
            <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
            <span>Yeni Hesap Oluştur</span>
          </Link>
        </div>
      </div>
    </div>
  )
}