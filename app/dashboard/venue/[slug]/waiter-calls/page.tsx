
'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BellRing, Check, X, ArrowLeft, Volume2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface WaiterCall {
  id: number
  table_number: string
  message: string
  status: string
  created_at: string
}

export default function WaiterCallsPage() {
  const params = useParams()
  const router = useRouter()
  const [calls, setCalls] = useState<WaiterCall[]>([])
  const [loading, setLoading] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const previousCallCount = useRef<number>(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const soundInitialized = useRef(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/notification.mp3')
      audioRef.current.volume = 0.7
      
      const saved = localStorage.getItem('waiter_calls_sound_enabled')
      if (saved !== null) {
        setSoundEnabled(saved === 'true')
      } else {
        setSoundEnabled(true)
        localStorage.setItem('waiter_calls_sound_enabled', 'true')
      }
      soundInitialized.current = true
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('waiter_calls_sound_enabled', soundEnabled.toString())
    }
  }, [soundEnabled])

  const playNotificationSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(e => console.log('Audio play failed:', e))
    }
  }

  const fetchCalls = async () => {
    try {
      const res = await fetch(`/api/user/venue/${params.slug}/waiter-calls`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        const newCalls = data.calls || []
        
        if (!loading && newCalls.length > previousCallCount.current) {
          console.log('🔔 Yeni garson çağrısı! Ses çalınıyor...')
          playNotificationSound()
        }
        
        previousCallCount.current = newCalls.length
        setCalls(newCalls)
      } else if (res.status === 401 || res.status === 403) {
        console.error('Oturum süresi dolmuş, lütfen yeniden giriş yapın')
        router.push('/login')
      } else {
        console.error('Failed to load waiter calls:', res.status)
      }
    } catch (error) {
      console.error('Error fetching calls:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCalls()
    const interval = setInterval(fetchCalls, 3000)
    return () => clearInterval(interval)
  }, [params.slug])

  const handleStatusUpdate = async (callId: number, status: string) => {
    try {
      const res = await fetch(`/api/user/venue/${params.slug}/waiter-calls`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ callId, status })
      })
      if (res.ok) {
        fetchCalls()
      }
    } catch (error) {
      console.error('Error updating call:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Geri</span>
      </button>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-full">
            <BellRing className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Garson Çağrıları</h1>
            <p className="text-gray-600 dark:text-gray-400">Bekleyen çağrıları yönetin</p>
          </div>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
            soundEnabled
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
          title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
        >
          <Volume2 size={20} />
          <span>{soundEnabled ? 'Ses Açık' : 'Ses Kapalı'}</span>
        </button>
      </div>

      {calls.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <BellRing size={48} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Henüz Çağrı Yok
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Müşteriler garson çağırdığında burada görünecek
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {calls.map((call) => (
              <motion.div
                key={call.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border-2 border-orange-200 dark:border-orange-900"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-orange-100 dark:bg-orange-900 px-4 py-2 rounded-full">
                        <span className="text-orange-600 dark:text-orange-400 font-bold text-lg">
                          Masa {call.table_number}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(call.created_at).toLocaleString('tr-TR')}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-lg">
                      {call.message}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleStatusUpdate(call.id, 'completed')}
                      className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full transition-colors"
                      title="Tamamlandı"
                    >
                      <Check size={24} />
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(call.id, 'cancelled')}
                      className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-colors"
                      title="İptal"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
