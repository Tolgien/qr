'use client'

import { Venue } from '@/lib/types'
import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'
import Image from 'next/image'
import { useStore } from '@/lib/store'

interface VenueHeaderProps {
  venue: Venue
}

export default function VenueHeader({ venue }: VenueHeaderProps) {
  const { language } = useStore()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full h-48 bg-surface-2 rounded-b-3xl overflow-hidden"
    >
      {venue.coverImage && (
        <Image
          src={venue.coverImage}
          alt={venue.name}
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-end justify-between">
          <div className="flex-1">
            <h1 className="text-4xl text-white mb-1" style={{ fontFamily: 'var(--font-style-script)' }}>
              {venue.name}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                venue.status === 'open'
                  ? 'bg-success text-white'
                  : 'bg-warning text-white'
              }`}>
                {venue.status === 'open'
                  ? (language === 'tr' ? 'Açık' : 'Open')
                  : (language === 'tr' ? 'Yakında Kapanıyor' : 'Closing Soon')
                }
              </span>
            </div>
          </div>
          {venue.logo && (
            <div className="w-16 h-16 bg-white rounded-2xl shadow-elev-2 overflow-hidden">
              <Image
                src={venue.logo}
                alt={`${venue.name} logo`}
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}