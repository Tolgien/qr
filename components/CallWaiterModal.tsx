
'use client'

import { useEffect, useState } from 'react'
import { X, BellRing, Send } from 'lucide-react'
import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'

export default function CallWaiterModal() {
  const params = useParams()
  const { language, waiterCallOpen, setWaiterCallOpen } = useStore()
  const [tableNumber, setTableNumber] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // QR kod okununca localStorage'a kaydedilen masa numarasını al
    const storedTable = localStorage.getItem('current_table')
    if (storedTable) {
      setTableNumber(storedTable)
      console.log('✅ Masa numarası otomatik yüklendi:', storedTable)
    }
  }, [waiterCallOpen])

  useEffect(() => {
    if (waiterCallOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      setMessage('')
      setSuccess(false)
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [waiterCallOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tableNumber) return

    setLoading(true)
    try {
      // Get table token from localStorage for QR code validation
      const tableToken = localStorage.getItem('current_token')
      
      const res = await fetch('/api/waiter-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          venueSlug: params.slug,
          tableNumber,
          tableToken, // Include table token for validation
          message: message || (language === 'tr' ? 'Garson çağrıldı' : 'Waiter requested')
        })
      })

      if (res.ok) {
        const data = await res.json()
        // Save waiter call ID to localStorage for status tracking
        if (data.callId) {
          localStorage.setItem('current_waiter_call_id', data.callId.toString())
        }
        setSuccess(true)
        setTimeout(() => {
          setWaiterCallOpen(false)
        }, 2000)
      } else {
        const data = await res.json()
        alert(data.error || (language === 'tr' ? 'Garson çağrılamadı' : 'Failed to call waiter'))
      }
    } catch (error) {
      console.error('Error calling waiter:', error)
      alert(language === 'tr' ? 'Bir hata oluştu' : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!waiterCallOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setWaiterCallOpen(false)}
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <BellRing size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {language === 'tr' ? 'Garson Çağır' : 'Call Waiter'}
                  </h2>
                  <p className="text-sm opacity-90">
                    {language === 'tr' ? 'Size yardımcı olalım' : 'We are here to help'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWaiterCallOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {success ? (
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <motion.div
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {language === 'tr' ? 'Garson Çağrıldı!' : 'Waiter Called!'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'tr' ? 'En kısa sürede yanınızda olacağız' : 'We will be with you shortly'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border-2 border-orange-200 dark:border-orange-700">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🍽️</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {language === 'tr' ? 'Masa Numarası' : 'Table Number'}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {tableNumber || '—'}
                    </div>
                    {tableNumber && (
                      <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        {language === 'tr' ? '✓ QR kod ile otomatik yüklendi' : '✓ Auto-loaded from QR code'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'tr' ? 'Açıklama (İsteğe Bağlı)' : 'Message (Optional)'}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white resize-none"
                  placeholder={language === 'tr' ? 'Mesajınız...' : 'Your message...'}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !tableNumber}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={20} />
                    {language === 'tr' ? 'Garson Çağır' : 'Call Waiter'}
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
