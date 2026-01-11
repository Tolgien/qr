'use client'

import { Search, X, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onFilterClick: () => void
  activeFilterCount?: number
}

export default function SearchBar({ value, onChange, onFilterClick, activeFilterCount = 0 }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)

  // Assuming 'language' is available in the scope or passed as a prop if needed.
  // For this example, we'll assume it's not directly used in the provided snippet's logic,
  // but if it were, it would need to be handled.
  // const language = 'tr'; // Example: If language were defined here

  return (
    <div className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex-1 flex items-center gap-3 bg-surface-2 rounded-2xl px-4 py-3 transition-all ${
            isFocused ? 'ring-2 ring-emerald-500' : ''
          }`}
        >
          <Search size={20} className="text-text-2" />
          <input
            type="text"
            placeholder="Menüde ara..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="flex-1 bg-transparent outline-none text-text-1 placeholder:text-text-2"
          />
          <AnimatePresence>
            {value && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={() => onChange('')}
                className="text-text-2 hover:text-text-1"
              >
                <X size={20} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onFilterClick}
          className="relative bg-surface-2 p-3 rounded-2xl hover:bg-surface-3 transition-colors"
        >
          <SlidersHorizontal size={20} className="text-text-1" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </motion.button>
      </div>
    </div>
  )
}