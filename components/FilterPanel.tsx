'use client'

import { X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  filters: {
    priceRange: [number, number]
    allergens: string[]
    dietaryInfo: string[]
    tags: string[]
  }
  onFiltersChange: (filters: {
    priceRange: [number, number]
    allergens: string[]
    dietaryInfo: string[]
    tags: string[]
  }) => void
  maxPrice: number
}

const commonAllergens = [
  'gluten',
  'dairy',
  'eggs',
  'nuts',
  'soy',
  'fish',
  'shellfish',
]

const dietaryOptions = [
  { value: 'vegan', label: 'Vegan' },
  { value: 'vegetarian', label: 'Vejetaryen' },
  { value: 'gluten-free', label: 'Glütensiz' },
  { value: 'dairy-free', label: 'Sütsüz' },
  { value: 'halal', label: 'Helal' },
  { value: 'organic', label: 'Organik' },
]

const tagOptions = [
  { value: 'new', label: 'Yeni', color: 'bg-orange-100 text-orange-700' },
  { value: 'spicy', label: 'Baharatlı', color: 'bg-red-100 text-red-700' },
  { value: 'vegan', label: 'Vegan', color: 'bg-green-100 text-green-700' },
]

export default function FilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  maxPrice,
}: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    allergens: false,
    dietary: false,
    tags: false,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handlePriceChange = (value: number, index: 0 | 1) => {
    const newRange: [number, number] = [...filters.priceRange] as [number, number]
    newRange[index] = value
    onFiltersChange({ ...filters, priceRange: newRange })
  }

  const toggleAllergen = (allergen: string) => {
    const newAllergens = filters.allergens.includes(allergen)
      ? filters.allergens.filter((a) => a !== allergen)
      : [...filters.allergens, allergen]
    onFiltersChange({ ...filters, allergens: newAllergens })
  }

  const toggleDietary = (dietary: string) => {
    const newDietary = filters.dietaryInfo.includes(dietary)
      ? filters.dietaryInfo.filter((d) => d !== dietary)
      : [...filters.dietaryInfo, dietary]
    onFiltersChange({ ...filters, dietaryInfo: newDietary })
  }

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag]
    onFiltersChange({ ...filters, tags: newTags })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      priceRange: [0, maxPrice],
      allergens: [],
      dietaryInfo: [],
      tags: [],
    })
  }

  const activeFilterCount =
    filters.allergens.length +
    filters.dietaryInfo.length +
    filters.tags.length +
    (filters.priceRange[0] !== 0 || filters.priceRange[1] !== maxPrice ? 1 : 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Filter Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-surface-1 rounded-t-3xl z-50 max-h-[80vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-surface-2">
              <div className="flex items-center gap-3">
                <SlidersHorizontal size={24} className="text-text-1" />
                <div>
                  <h2 className="text-xl font-bold text-text-1">Filtreler</h2>
                  {activeFilterCount > 0 && (
                    <p className="text-sm text-text-2">{activeFilterCount} filtre aktif</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Temizle
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-surface-2 rounded-full transition-colors"
                >
                  <X size={24} className="text-text-1" />
                </button>
              </div>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Price Range */}
              <div className="bg-surface-2 rounded-2xl p-4">
                <button
                  onClick={() => toggleSection('price')}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <h3 className="font-semibold text-text-1">Fiyat Aralığı</h3>
                  {expandedSections.price ? (
                    <ChevronUp size={20} className="text-text-2" />
                  ) : (
                    <ChevronDown size={20} className="text-text-2" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSections.price && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between text-sm text-text-2">
                        <span>{filters.priceRange[0]} ₺</span>
                        <span>{filters.priceRange[1]} ₺</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="range"
                          min="0"
                          max={maxPrice}
                          step="5"
                          value={filters.priceRange[0]}
                          onChange={(e) => handlePriceChange(Number(e.target.value), 0)}
                          className="flex-1"
                        />
                        <input
                          type="range"
                          min="0"
                          max={maxPrice}
                          step="5"
                          value={filters.priceRange[1]}
                          onChange={(e) => handlePriceChange(Number(e.target.value), 1)}
                          className="flex-1"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Allergens */}
              <div className="bg-surface-2 rounded-2xl p-4">
                <button
                  onClick={() => toggleSection('allergens')}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <h3 className="font-semibold text-text-1">İçermemesi Gereken Alerjenler</h3>
                  {expandedSections.allergens ? (
                    <ChevronUp size={20} className="text-text-2" />
                  ) : (
                    <ChevronDown size={20} className="text-text-2" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSections.allergens && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="flex flex-wrap gap-2"
                    >
                      {commonAllergens.map((allergen) => (
                        <button
                          key={allergen}
                          onClick={() => toggleAllergen(allergen)}
                          className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                            filters.allergens.includes(allergen)
                              ? 'bg-emerald-500 text-white'
                              : 'bg-surface-1 text-text-1 border border-surface-3'
                          }`}
                        >
                          {allergen}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dietary Info */}
              <div className="bg-surface-2 rounded-2xl p-4">
                <button
                  onClick={() => toggleSection('dietary')}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <h3 className="font-semibold text-text-1">Diyet Bilgisi</h3>
                  {expandedSections.dietary ? (
                    <ChevronUp size={20} className="text-text-2" />
                  ) : (
                    <ChevronDown size={20} className="text-text-2" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSections.dietary && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="flex flex-wrap gap-2"
                    >
                      {dietaryOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => toggleDietary(option.value)}
                          className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                            filters.dietaryInfo.includes(option.value)
                              ? 'bg-emerald-500 text-white'
                              : 'bg-surface-1 text-text-1 border border-surface-3'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tags */}
              <div className="bg-surface-2 rounded-2xl p-4">
                <button
                  onClick={() => toggleSection('tags')}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <h3 className="font-semibold text-text-1">Etiketler</h3>
                  {expandedSections.tags ? (
                    <ChevronUp size={20} className="text-text-2" />
                  ) : (
                    <ChevronDown size={20} className="text-text-2" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSections.tags && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="flex flex-wrap gap-2"
                    >
                      {tagOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => toggleTag(option.value)}
                          className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                            filters.tags.includes(option.value)
                              ? 'bg-emerald-500 text-white'
                              : `${option.color} border border-current`
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Apply Button */}
            <div className="p-6 border-t border-surface-2">
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                Filtreleri Uygula
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}