'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, ArrowRight, Crown, ArrowLeft } from 'lucide-react'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')

    if (token) {
      // Store token and redirect to dashboard
      localStorage.setItem('userToken', token)

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } else {
      router.push('/login')
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F3EB] to-[#E8E2D5] flex items-center justify-center px-4">
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/90 hover:bg-white backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all text-gray-700 font-medium"
        >
          <ArrowLeft size={20} />
          Ana Sayfa
        </button>
      </div>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">
          Ödeme Başarılı!
        </h1>

        <p className="text-gray-600 mb-6">
          Üyeliğiniz başarıyla oluşturuldu. Dashboard'a yönlendiriliyorsunuz...
        </p>

        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#34C8B6]"></div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#F7F3EB] to-[#E8E2D5] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#34C8B6]"></div>
          </div>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}