'use client'

import { Item } from '@/lib/types'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Leaf, Flame, Sparkles } from 'lucide-react'
import { useStore } from '@/lib/store'
import { useState, useEffect } from 'react'
import { translateText } from '@/lib/client-translate'

interface ItemCardProps {
  item: Item
  onClick: () => void
  theme?: string
}

export default function ItemCard({ item, onClick, theme: themeProp }: ItemCardProps) {
  const { language } = useStore()
  const [translatedName, setTranslatedName] = useState(item.name)
  const [translatedDescription, setTranslatedDescription] = useState(item.description || '')

  useEffect(() => {
    async function translate() {
      if (language === 'en') {
        const name = await translateText(item.name, 'en')
        const desc = item.description ? await translateText(item.description, 'en') : ''
        setTranslatedName(name)
        setTranslatedDescription(desc)
      } else {
        setTranslatedName(item.name)
        setTranslatedDescription(item.description || '')
      }
    }
    translate()
  }, [item.name, item.description, language])

  const getThemeStyles = (theme: string) => {
    switch (theme) {
      case 'coffee':
        return {
          card: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-2 border-amber-200 dark:border-amber-800 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300",
          gradient: "from-amber-400 via-orange-400 to-amber-500",
          tagBg: "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200",
          tagNew: "bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900 text-orange-700 dark:text-orange-300",
          tagVegan: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
          tagSpicy: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300",
          price: "text-xl font-bold text-amber-900 dark:text-amber-100",
          scale: 1.02
        }
      case 'restaurant':
        return {
          card: "bg-white dark:bg-gray-900 border-2 border-red-200 dark:border-red-800 rounded-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300",
          gradient: "from-red-500 via-rose-500 to-orange-500",
          tagBg: "bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200",
          tagNew: "bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 text-red-700 dark:text-red-300",
          tagVegan: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300",
          tagSpicy: "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200",
          price: "text-xl font-bold text-red-900 dark:text-red-100",
          scale: 1.03
        }
      case 'modern':
      default:
        return {
          card: "bg-white dark:bg-gray-900 border border-teal-100 dark:border-teal-800 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300",
          gradient: "from-teal-400 via-emerald-400 to-cyan-400",
          tagBg: "bg-teal-50 dark:bg-teal-900 text-teal-800 dark:text-teal-200",
          tagNew: "bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 text-emerald-700 dark:text-emerald-300",
          tagVegan: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
          tagSpicy: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300",
          price: "text-xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent",
          scale: 1.02
        }
    }
  }

  // Use provided theme or default to 'modern'
  const theme = getThemeStyles(themeProp || 'modern')

  return (
    <motion.div
      whileHover={{ scale: theme.scale }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        console.log('ItemCard clicked:', item.name)
        onClick()
      }}
      className={theme.card}
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {/* Gradient Accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.gradient} opacity-60`} />

      {/* Content Container */}
      <div className="flex gap-4 p-4">
        {item.image && (
          <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
            <Image
              src={item.image}
              alt={item.name}
              width={96}
              height={96}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 flex-1 line-clamp-1 text-left" style={{ fontFamily: 'var(--font-birthstone), cursive' }}>
              {translatedName}
            </h3>
            <div className="flex gap-1.5 flex-shrink-0">
              {item.tags?.includes('new') && (
                <span className={`px-2 py-0.5 rounded-lg text-xs font-medium flex items-center gap-1 ${theme.tagNew}`}>
                  <Sparkles size={10} />
                  {language === 'tr' ? 'YENİ' : 'NEW'}
                </span>
              )}
              {item.tags?.includes('vegan') && (
                <span className={`p-1 rounded-lg ${theme.tagVegan}`}>
                  <Leaf size={12} />
                </span>
              )}
              {item.tags?.includes('spicy') && (
                <span className={`p-1 rounded-lg ${theme.tagSpicy}`}>
                  <Flame size={12} />
                </span>
              )}
              {item.tags?.includes('popular' as any) && (
                <span className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-lg text-xs font-medium">
                  🔥
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-auto leading-relaxed text-left">
            {translatedDescription}
          </p>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <span className={theme.price}>
              ₺{(() => {
                try {
                  const price = typeof item.price === 'number' ? item.price : parseFloat(item.price || '0')
                  return price.toFixed(2)
                } catch (e) {
                  return '0.00'
                }
              })()}
            </span>

            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {language === 'tr' ? 'Detaylar için tıklayın' : 'Click for details'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}