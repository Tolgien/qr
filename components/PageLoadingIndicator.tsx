
'use client'

import { Suspense, useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

function PageLoadingIndicatorInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  // Sayfa değiştiğinde loading'i kapat
  useEffect(() => {
    setLoading(false)
  }, [pathname, searchParams])

  // Sayfa ilk yüklendiğinde loading'i kapat
  useEffect(() => {
    setLoading(false)
  }, [])

  useEffect(() => {
    let isNavigating = false

    const handleStart = () => {
      if (!isNavigating) {
        isNavigating = true
        setLoading(true)
      }
    }

    const handleComplete = () => {
      isNavigating = false
      setLoading(false)
    }

    // Link tıklamalarını dinle
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')
      
      if (anchor && anchor.href && !anchor.target && anchor.href.startsWith(window.location.origin)) {
        handleStart()
        // Güvenlik için timeout ekle
        setTimeout(handleComplete, 5000)
      }
    }

    // Popstate (geri/ileri butonları) için
    const handlePopState = () => {
      handleComplete()
    }

    document.addEventListener('click', handleClick)
    window.addEventListener('popstate', handlePopState)

    // Sayfa tamamen yüklendiğinde
    if (document.readyState === 'complete') {
      handleComplete()
    } else {
      window.addEventListener('load', handleComplete)
    }

    return () => {
      document.removeEventListener('click', handleClick)
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('load', handleComplete)
    }
  }, [])

  return (
    <AnimatePresence>
      {loading && (
        <>
          {/* Top Progress Bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 1, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#34C8B6] via-[#D7A449] to-[#34C8B6] z-[9999] origin-left"
          />

          {/* Center Loading Spinner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#F7F3EB]/60 backdrop-blur-sm z-[9998] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-4"
            >
              {/* Spinning Circle */}
              <div className="relative w-16 h-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 border-4 border-[#34C8B6]/20 border-t-[#34C8B6] rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-2 border-4 border-[#D7A449]/20 border-t-[#D7A449] rounded-full"
                />
              </div>

              {/* Loading Text */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2"
              >
                <span className="text-[#1A1A1A] font-medium">Yükleniyor</span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                >
                  .
                </motion.span>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function PageLoadingIndicator() {
  return (
    <Suspense fallback={null}>
      <PageLoadingIndicatorInner />
    </Suspense>
  )
}
