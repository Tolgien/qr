'use client'

import { Category } from '@/lib/types'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { useState, useEffect } from 'react'

interface CategoryChipsProps {
  categories: Category[]
  selectedCategory: string | null
  onSelectCategory: (categoryId: string | null) => void
}

export default function CategoryChips({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryChipsProps) {
  const { language } = useStore()
  const [allLabel, setAllLabel] = useState('Tümü')

  useEffect(() => {
    async function translateLabel() {
      if (language === 'tr') {
        setAllLabel('Tümü')
        return
      }

      const { translateText } = await import('@/lib/client-translate')
      setAllLabel(await translateText('Tümü', language))
    }

    translateLabel()
  }, [language])

  return (
    <div className="sticky top-0 z-10 bg-surface-1 py-4 px-6">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
            selectedCategory === null
              ? 'bg-gradient-to-r from-brand-light to-brand-dark text-white shadow-lg'
              : 'bg-surface-2 text-text-1 border border-surface-3 hover:border-brand-light'
          }`}
        >
          {allLabel}
        </motion.button>
        {categories.map((category) => (
          <motion.button
            key={category.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCategory(category.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-brand-light to-brand-dark text-white shadow-lg'
                : 'bg-surface-2 text-text-1 border border-surface-3 hover:border-brand-light'
            }`}
          >
            {category.name}
          </motion.button>
        ))}
      </div>
    </div>
  )
}