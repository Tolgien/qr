'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-verified'>('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('Doğrulama kodu bulunamadı.')
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (response.ok) {
          if (data.message && data.message.includes('zaten doğrulanmış')) {
            setStatus('already-verified')
            setMessage(data.message)
          } else {
            setStatus('success')
            setMessage(data.message || 'E-posta adresiniz başarıyla doğrulandı!')
            setEmail(data.email)
            
            setTimeout(() => {
              router.push('/login')
            }, 3000)
          }
        } else {
          setStatus('error')
          setMessage(data.error || 'Doğrulama işlemi başarısız oldu.')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Bir hata oluştu. Lütfen tekrar deneyin.')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="mb-6">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                E-posta Doğrulanıyor...
              </h1>
              <p className="text-gray-600">Lütfen bekleyin</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mb-6">
                <svg
                  className="mx-auto h-16 w-16 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Başarılı! ✅
              </h1>
              <p className="text-gray-600 mb-4">{message}</p>
              {email && (
                <p className="text-sm text-gray-500 mb-4">
                  {email}
                </p>
              )}
              <p className="text-sm text-gray-500">
                3 saniye içinde giriş sayfasına yönlendirileceksiniz...
              </p>
              <Link
                href="/login"
                className="mt-6 inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
              >
                Şimdi Giriş Yap
              </Link>
            </>
          )}

          {status === 'already-verified' && (
            <>
              <div className="mb-6">
                <svg
                  className="mx-auto h-16 w-16 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Zaten Doğrulanmış
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link
                href="/login"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Giriş Yap
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mb-6">
                <svg
                  className="mx-auto h-16 w-16 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Doğrulama Başarısız
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
                >
                  Giriş Sayfasına Dön
                </Link>
                <p className="text-sm text-gray-500">
                  Doğrulama linkinizin süresi dolmuş olabilir. Giriş yapmayı deneyin ve yeni bir doğrulama e-postası isteyin.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Yükleniyor...
            </h1>
            <p className="text-gray-600">Lütfen bekleyin</p>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
