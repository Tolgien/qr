
'use client'

import { Venue } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Phone, Globe, Wifi } from 'lucide-react'
import { useStore } from '@/lib/store'

interface VenueInfoModalProps {
  venue: Venue
  isOpen: boolean
  onClose: () => void
}

export default function VenueInfoModal({ venue, isOpen, onClose }: VenueInfoModalProps) {
  const { language } = useStore()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-50 overflow-hidden rounded-3xl shadow-2xl bg-white dark:bg-gray-900"
            style={{ maxHeight: '90vh' }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-lg"
            >
              <X size={20} strokeWidth={2} />
            </button>

            {/* Scrollable Content */}
            <div className="relative h-full overflow-y-auto scrollbar-hide">
              <div className="px-5 py-6 space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {language === 'tr' ? 'Kafe Bilgileri' : 'Venue Information'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'tr' ? 'İletişim ve ulaşım bilgileri' : 'Contact and location information'}
                  </p>
                </div>
              {venue.address && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                  <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {language === 'tr' ? 'Adres' : 'Address'}
                    </p>
                    <p className="text-gray-900 dark:text-white">{venue.address}</p>
                  </div>
                </div>
              )}

              {venue.phone && (
                <a
                  href={`tel:${venue.phone}`}
                  className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {language === 'tr' ? 'Telefon' : 'Phone'}
                    </p>
                    <p className="text-gray-900 dark:text-white underline">{venue.phone}</p>
                  </div>
                </a>
              )}

              {venue.website && (
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {language === 'tr' ? 'Web Sitesi' : 'Website'}
                    </p>
                    <p className="text-gray-900 dark:text-white underline">
                      {language === 'tr' ? 'Ziyaret Et' : 'Visit Website'}
                    </p>
                  </div>
                </a>
              )}

              {venue.wifiPassword && (
                <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <Wifi className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {language === 'tr' ? 'WiFi Şifresi' : 'WiFi Password'}
                    </p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                      {venue.wifiPassword}
                    </p>
                  </div>
                </div>
              )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
