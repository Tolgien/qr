'use client'

import { ReactNode, useEffect, useState } from 'react'
import { Moon, Sun, Globe, Bell, Info } from 'lucide-react'
import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import AdminHeaderIcon from './AdminHeaderIcon'
import VenueInfoModal from './VenueInfoModal'

interface AppShellProps {
  children: React.ReactNode
  venueName?: string
  venue?: any
}

export default function AppShell({ children, venueName, venue }: AppShellProps) {
  const [mounted, setMounted] = useState(false)
  const [newOrdersCount, setNewOrdersCount] = useState(0)
  const [waiterCallsCount, setWaiterCallsCount] = useState(0) // Added for waiter calls count
  const { theme, toggleTheme, language, setLanguage } = useStore()
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [showVenueInfo, setShowVenueInfo] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkForNewOrders()

    // Poll for new orders every 10 seconds
    const interval = setInterval(checkForNewOrders, 10000)
    return () => clearInterval(interval)
  }, [])

  const checkForNewOrders = async () => {
    const token = localStorage.getItem('userToken') || localStorage.getItem('admin_token')
    if (!token) return

    try {
      // Get all venues for this user
      const venuesRes = await fetch('/api/user/venues', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!venuesRes.ok) return

      const { venues } = await venuesRes.json()
      let totalNewOrders = 0
      let totalWaiterCalls = 0

      // Check each venue for new orders and waiter calls
      for (const venue of venues) {
        const ordersRes = await fetch(`/api/user/venue/${venue.slug}/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (ordersRes.ok) {
          const { orders } = await ordersRes.json()
          const newOrders = orders.filter((o: any) => o.status === 'placed')
          totalNewOrders += newOrders.length
        }

        const callsRes = await fetch(`/api/user/venue/${venue.slug}/waiter-calls`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (callsRes.ok) {
          const { calls } = await callsRes.json()
          totalWaiterCalls += calls.length
        }
      }

      setNewOrdersCount(totalNewOrders)
      setWaiterCallsCount(totalWaiterCalls) // Update waiter calls count
    } catch (error) {
      console.error('Error checking orders:', error)
    }
  }

  if (!mounted) {
    return <div className="min-h-screen bg-surface-1">{children}</div>
  }

  return (
    <div className="min-h-screen bg-surface-1">
      <header className="sticky top-0 z-50 bg-surface-1/80 backdrop-blur-lg border-b border-surface-3">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold text-text-1">{venueName || 'QRim.net'}</h1>

          <div className="flex items-center gap-2">
            <AdminHeaderIcon />

            {/* Combined notification badge for new orders and waiter calls */}
            {(newOrdersCount > 0 || waiterCallsCount > 0) && (
              <button
                onClick={() => {
                  if (waiterCallsCount > 0) {
                    window.location.href = `/dashboard/venue/${venueName?.toLowerCase().replace(/\s+/g, '-')}/waiter-calls`
                  }
                }}
                className="relative p-2 hover:bg-surface-2 rounded-lg transition-colors"
                title={`${newOrdersCount} yeni sipariş, ${waiterCallsCount} garson çağrısı`}
              >
                <Bell className="w-5 h-5 text-emerald-600 animate-pulse" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {newOrdersCount + waiterCallsCount}
                </span>
              </button>
            )}

            <div className="flex items-center gap-2">
              {venue && (
                <button
                  onClick={() => setShowVenueInfo(true)}
                  className="relative p-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                  title={language === 'tr' ? 'Kafe Bilgileri' : 'Venue Information'}
                >
                  <Info className="w-5 h-5 text-white" strokeWidth={2.5} />
                </button>
              )}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="p-2 rounded-xl bg-surface-2 text-text-2 hover:bg-surface-3 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Switch language"
                >
                  <Globe size={20} />
                  <span className="ml-1 text-xs font-medium">{language.toUpperCase()}</span>
                </button>
                
                {showLanguageMenu && (
                  <div className="absolute right-0 mt-2 py-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    {(() => {
                      const languageNames: { [key: string]: { flag: string, name: string } } = {
                        'tr': { flag: '🇹🇷', name: 'Türkçe' },
                        'en': { flag: '🇬🇧', name: 'English' },
                        'de': { flag: '🇩🇪', name: 'Deutsch' },
                        'ar': { flag: '🇸🇦', name: 'العربية' }
                      }
                      
                      const supportedLanguages = ['tr', 'en', 'de', 'ar']
                      const venueLanguages = venue?.languages?.filter((lang: string) => 
                        supportedLanguages.includes(lang)
                      ) || []
                      
                      const displayLanguages = venueLanguages.length > 0 ? venueLanguages : ['tr', 'en']
                      
                      return displayLanguages.map((lang: string) => {
                        const langInfo = languageNames[lang]
                        if (!langInfo) return null
                        
                        return (
                          <button
                            key={lang}
                            onClick={() => {
                              setLanguage(lang as 'en' | 'tr' | 'de' | 'ar')
                              setShowLanguageMenu(false)
                            }}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                              language === lang ? 'bg-gray-100 dark:bg-gray-700' : ''
                            }`}
                          >
                            <span className="text-xl">{langInfo.flag}</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {langInfo.name}
                            </span>
                            {language === lang && (
                              <span className="ml-auto text-emerald-500">✓</span>
                            )}
                          </button>
                        )
                      })
                    })()}
                  </div>
                )}
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-surface-2 text-text-2 hover:bg-surface-3 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </motion.button>
          </div>
        </div>
      </header>

      <main onClick={() => setShowLanguageMenu(false)}>{children}</main>
      <VenueInfoModal
        venue={venue}
        isOpen={showVenueInfo}
        onClose={() => setShowVenueInfo(false)}
      />
    </div>
  )
}