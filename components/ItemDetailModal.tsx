'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Minus, ShoppingCart, Star, Leaf, Flame } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import Image from 'next/image'
import { Item } from '@/lib/types'
import { ChefHat, Utensils, Info, Sparkles, ThumbsUp, AlertCircle, Clock } from 'lucide-react'
import { useParams } from 'next/navigation'

interface ItemDetailModalProps {
  item: Item | null
  isOpen: boolean
  onClose: () => void
}

interface Review {
  id: number
  customer_name: string
  rating: number
  comment: string
  created_at: string
  is_approved?: boolean // Added is_approved field
}

interface SimilarItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  tags: string[]
}

interface PairingItem {
  id: string
  name: string
  description: string
  price: number
  pairingReason: string
  image: string
}

export default function ItemDetailModal({ item, isOpen, onClose }: ItemDetailModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const { addToCart, setCartOpen, language } = useStore()
  const params = useParams()

  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [similarItems, setSimilarItems] = useState<SimilarItem[]>([])
  const [pairingItems, setPairingItems] = useState<PairingItem[]>([])
  const [frequentlyBought, setFrequentlyBought] = useState<any[]>([])
  const [showReviews, setShowReviews] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    customer_name: '',
    rating: 5,
    comment: ''
  })
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [translatedItem, setTranslatedItem] = useState<Item | null>(item)
  const [labels, setLabels] = useState({
    newProduct: 'YENİ ÜRÜN',
    vegan: 'VEGAN',
    spicy: 'ACILI',
    price: 'Fiyat',
    minutes: 'Dakika',
    serving: 'Porsiyon',
    quality: 'Kalite',
    ingredients: 'İçerik & Malzemeler',
    freshIngredients: 'Taze malzemeler ile özenle hazırlanmaktadır.',
    nutrition: 'Besin Değerleri',
    calories: 'Kalori',
    protein: 'Protein',
    carbs: 'Karbonhidrat',
    fat: 'Yağ',
    fiber: 'Lif',
    sugar: 'Şeker',
    sodium: 'Sodyum',
    origin: 'Menşei',
    storage: 'Saklama Koşulları',
    allergens: 'Alerjen Uyarısı',
    dietary: 'Diyet Bilgisi',
    reviews: 'Değerlendirmeler',
    reviewsCount: 'değerlendirme',
    frequentlyBought: 'Bunu Alanlar Şunları da Aldı',
    basedOnPreferences: 'Diğer müşterilerimizin tercihleri',
    selectVariant: 'Varyant Seç',
    addons: 'Ekstralar',
    quantity: 'Miktar',
    specialNote: 'Özel Not',
    addNote: 'Not ekleyin (opsiyonel)',
    total: 'Toplam',
    addToCart: 'Sepete Ekle',
    all: 'Tümü'
  })

  // Translate labels when language changes
  useEffect(() => {
    async function translateLabels() {
      if (language === 'tr') {
        setLabels({
          newProduct: 'YENİ ÜRÜN',
          vegan: 'VEGAN',
          spicy: 'ACILI',
          price: 'Fiyat',
          minutes: 'Dakika',
          serving: 'Porsiyon',
          quality: 'Kalite',
          ingredients: 'İçerik & Malzemeler',
          freshIngredients: 'Taze malzemeler ile özenle hazırlanmaktadır.',
          nutrition: 'Besin Değerleri',
          calories: 'Kalori',
          protein: 'Protein',
          carbs: 'Karbonhidrat',
          fat: 'Yağ',
          fiber: 'Lif',
          sugar: 'Şeker',
          sodium: 'Sodyum',
          origin: 'Menşei',
          storage: 'Saklama Koşulları',
          allergens: 'Alerjen Uyarısı',
          dietary: 'Diyet Bilgisi',
          reviews: 'Değerlendirmeler',
          reviewsCount: 'değerlendirme',
          frequentlyBought: 'Bunu Alanlar Şunları da Aldı',
          basedOnPreferences: 'Diğer müşterilerimizin tercihleri',
          selectVariant: 'Varyant Seç',
          addons: 'Ekstralar',
          quantity: 'Miktar',
          specialNote: 'Özel Not',
          addNote: 'Not ekleyin (opsiyonel)',
          total: 'Toplam',
          addToCart: 'Sepete Ekle',
          all: 'Tümü'
        })
        return
      }

      const { translateText } = await import('@/lib/client-translate')

      // Translate all labels in parallel for better performance
      const [
        newProduct, vegan, spicy, price, minutes, serving, quality,
        ingredients, freshIngredients, nutrition, calories, protein,
        carbs, fat, fiber, sugar, sodium, origin, storage, allergens,
        dietary, reviews, reviewsCount, frequentlyBought, basedOnPreferences,
        selectVariant, addons, quantity, specialNote, addNote, total,
        addToCart, all
      ] = await Promise.all([
        translateText('YENİ ÜRÜN', language),
        translateText('VEGAN', language),
        translateText('ACILI', language),
        translateText('Fiyat', language),
        translateText('Dakika', language),
        translateText('Porsiyon', language),
        translateText('Kalite', language),
        translateText('İçerik & Malzemeler', language),
        translateText('Taze malzemeler ile özenle hazırlanmaktadır.', language),
        translateText('Besin Değerleri', language),
        translateText('Kalori', language),
        translateText('Protein', language),
        translateText('Karbonhidrat', language),
        translateText('Yağ', language),
        translateText('Lif', language),
        translateText('Şeker', language),
        translateText('Sodyum', language),
        translateText('Menşei', language),
        translateText('Saklama Koşulları', language),
        translateText('Alerjen Uyarısı', language),
        translateText('Diyet Bilgisi', language),
        translateText('Değerlendirmeler', language),
        translateText('değerlendirme', language),
        translateText('Bunu Alanlar Şunları da Aldı', language),
        translateText('Diğer müşterilerimizin tercihleri', language),
        translateText('Varyant Seç', language),
        translateText('Ekstralar', language),
        translateText('Miktar', language),
        translateText('Özel Not', language),
        translateText('Not ekleyin (opsiyonel)', language),
        translateText('Toplam', language),
        translateText('Sepete Ekle', language),
        translateText('Tümü', language)
      ])

      setLabels({
        newProduct, vegan, spicy, price, minutes, serving, quality,
        ingredients, freshIngredients, nutrition, calories, protein,
        carbs, fat, fiber, sugar, sodium, origin, storage, allergens,
        dietary, reviews, reviewsCount, frequentlyBought, basedOnPreferences,
        selectVariant, addons, quantity, specialNote, addNote, total,
        addToCart, all
      })
    }

    translateLabels()
  }, [language])

  // Translate item content when language changes
  useEffect(() => {
    async function translateItemContent() {
      if (!item) return

      if (language === 'tr') {
        setTranslatedItem(item)
        return
      }

      const { translateText, translateArray } = await import('@/lib/client-translate')

      try {
        // Translate each field individually with proper null/undefined checks
        const translatedName = item.name ? await translateText(item.name, language) : item.name
        const translatedDescription = (item.description && item.description.trim())
          ? await translateText(item.description, language)
          : item.description
        const translatedIngredients = (item.ingredients && item.ingredients.trim())
          ? await translateText(item.ingredients, language)
          : item.ingredients
        const translatedOrigin = (item.origin && item.origin.trim())
          ? await translateText(item.origin, language)
          : item.origin
        const translatedStorageInstructions = (item.storageInstructions && item.storageInstructions.trim())
          ? await translateText(item.storageInstructions, language)
          : item.storageInstructions
        const translatedServingSize = (item.servingSize && item.servingSize.trim())
          ? await translateText(item.servingSize, language)
          : item.servingSize

        const translated = {
          ...item,
          name: translatedName,
          description: translatedDescription,
          ingredients: translatedIngredients,
          origin: translatedOrigin,
          storageInstructions: translatedStorageInstructions,
          servingSize: translatedServingSize,
          allergens: item.allergens && item.allergens.length > 0 ? await translateArray(item.allergens, language) : item.allergens,
          dietaryInfo: item.dietaryInfo && item.dietaryInfo.length > 0 ? await translateArray(item.dietaryInfo, language) : item.dietaryInfo,
          variants: item.variants && item.variants.length > 0 ? await Promise.all(item.variants.map(async (v) => ({
            ...v,
            name: await translateText(v.name, language)
          }))) : item.variants,
          addons: item.addons && item.addons.length > 0 ? await Promise.all(item.addons.map(async (a) => ({
            ...a,
            name: await translateText(a.name, language)
          }))) : item.addons
        }

        setTranslatedItem(translated)
      } catch (error) {
        console.error('Translation error:', error)
        setTranslatedItem(item) // Fallback to original if translation fails
      }
    }

    translateItemContent()
  }, [item, language])

  // Reset modal state on close
  useEffect(() => {
    if (!isOpen) {
      setSelectedVariant(null)
      setSelectedAddons([])
      setQuantity(1)
      setNotes('')
    }
  }, [isOpen])

  // Fetch recommendations function
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)

  useEffect(() => {
    if (!isOpen || !item?.id) {
      setRecommendations([])
      setFrequentlyBought([])
      setPairingItems([])
      setSimilarItems([])
      setIsLoadingRecommendations(false)
      return
    }

    let isMounted = true
    setIsLoadingRecommendations(true)

    const fetchRecommendations = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

        const res = await fetch(`/api/item/${item.id}/recommendations?lang=${language}`, {
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!isMounted) return
        
        if (res.ok) {
          const data = await res.json()
          setFrequentlyBought(data.frequentlyBoughtTogether || [])
          setPairingItems(data.aiPairings || [])
          setSimilarItems(data.similarItems || [])
        } else {
          setFrequentlyBought([])
          setPairingItems([])
          setSimilarItems([])
        }
      } catch (error) {
        // Silent fail - don't spam console
        if (isMounted) {
          setFrequentlyBought([])
          setPairingItems([])
          setSimilarItems([])
        }
      } finally {
        if (isMounted) {
          setIsLoadingRecommendations(false)
        }
      }
    }

    fetchRecommendations()

    return () => {
      isMounted = false
    }
  }, [isOpen, item?.id, language])

  // Fetch reviews
  useEffect(() => {
    if (isOpen && item?.id) {
      fetchReviews()
    }
  }, [isOpen, item?.id])

  const fetchReviews = async () => {
    if (!item?.id) return
    setLoadingReviews(true)
    try {
      const res = await fetch(`/api/item/${item.id}/reviews`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
        setAverageRating(parseFloat(data.averageRating) || 0)
        setTotalReviews(parseInt(data.totalReviews) || 0)
      } else {
        setReviews([])
        setAverageRating(0)
        setTotalReviews(0)
      }
    } catch (error) {
      // Silent fail
      setReviews([])
      setAverageRating(0)
      setTotalReviews(0)
    } finally {
      setLoadingReviews(false)
    }
  }

  if (!isOpen || !item || !translatedItem) return null

  const handleAddToCart = () => {
    addToCart(item, quantity, notes, selectedVariant || undefined, selectedAddons.length > 0 ? selectedAddons : undefined)
    setCartOpen(true)
    onClose()
    // Reset
    setQuantity(1)
    setNotes('')
    setSelectedVariant(null)
    setSelectedAddons([])
  }

  const calculateTotal = () => {
    let total = Number(item.price)
    if (selectedVariant && item.variants) {
      const variant = item.variants.find(v => v.id === selectedVariant)
      if (variant) total += variant.delta
    }
    if (selectedAddons.length > 0 && item.addons) {
      selectedAddons.forEach(addonId => {
        const addon = item.addons?.find(a => a.id === addonId)
        if (addon) total += addon.price
      })
    }
    return total * quantity
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return

    try {
      const res = await fetch(`/api/item/${item.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm)
      })

      if (res.ok) {
        setReviewForm({ customer_name: '', rating: 5, comment: '' })
        setShowReviewForm(false)
        fetchReviews()
      }
    } catch (error) {
      console.error('Error submitting review:', error)
    }
  }

  const nutritionInfo = {
    calories: item.calories || Math.floor(Number(item.price) * 8 + 150),
    protein: item.protein || Math.floor(Number(item.price) * 0.3),
    carbs: item.carbs || Math.floor(Number(item.price) * 0.5),
    fat: item.fat || Math.floor(Number(item.price) * 0.2),
    fiber: item.fiber !== null && item.fiber !== undefined ? item.fiber : Math.floor(Number(item.price) * 0.15),
    sugar: item.sugar !== null && item.sugar !== undefined ? item.sugar : Math.floor(Number(item.price) * 0.25),
    sodium: item.sodium !== null && item.sodium !== undefined ? item.sodium : Math.floor(Number(item.price) * 15),
  }

  const preparationTime = item.preparationTime || Math.floor(Math.random() * 10 + 10)
  const servingSize = item.servingSize || '1 porsiyon'
  const ingredients = item.ingredients && item.ingredients.trim() !== ''
    ? item.ingredients
    : 'Taze malzemeler ile özenle hazırlanmaktadır.'

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev => {
      if (prev.includes(addonId)) {
        return prev.filter(id => id !== addonId);
      }
      return [...prev, addonId];
    });
  };

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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50 overflow-hidden rounded-3xl shadow-2xl bg-white dark:bg-gray-900"
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
              {/* Hero Header */}
              <div className="relative w-full h-64 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-900">
                {item.image && (
                  <>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-900 via-transparent to-transparent" />
                  </>
                )}

                {/* Tags */}
                <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                  {item.tags?.includes('new') && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 text-orange-700 dark:text-orange-300 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm backdrop-blur-sm"
                    >
                      <Sparkles size={12} />
                      {labels.newProduct}
                    </motion.span>
                  )}
                  {item.tags?.includes('vegan') && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm backdrop-blur-sm"
                    >
                      <Leaf size={12} />
                      {labels.vegan}
                    </motion.span>
                  )}
                  {item.tags?.includes('spicy') && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm backdrop-blur-sm"
                    >
                      <Flame size={12} />
                      {labels.spicy}
                    </motion.span>
                  )}
                  {item.tags?.includes('popular' as any) && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm backdrop-blur-sm"
                    >
                      🔥 {language === 'tr' ? 'POPÜLER' : 'POPULAR'}
                    </motion.span>
                  )}
                </div>

                {/* Price & Rating */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{labels.price}</div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      ₺{(() => {
                        try {
                          const price = typeof item.price === 'number' ? item.price : parseFloat(item.price || '0')
                          return price.toFixed(2)
                        } catch (e) {
                          return '0.00'
                        }
                      })()}
                    </span>
                  </div>

                  <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-2 rounded-xl shadow-lg flex items-center gap-1.5">
                    <Star size={16} fill="white" className="text-white" />
                    <span className="text-lg font-bold text-white">
                      {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-5 py-6 space-y-5">
                {/* Title */}
                <div>
                  <h1 className="text-4xl text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-birthstone), cursive' }}>
                    {translatedItem.name}
                  </h1>
                </div>

                {/* Description */}
                {translatedItem.description && translatedItem.description.trim() !== '' && (
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
                    <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                      {translatedItem.description}
                    </p>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-4 text-center border border-cyan-100 dark:border-cyan-900/30">
                    <Clock size={20} className="text-cyan-600 dark:text-cyan-400 mx-auto mb-2" />
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{preparationTime}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{labels.minutes}</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-500/20 rounded-xl p-4 text-center border border-purple-100 dark:border-purple-900/30">
                    <Utensils size={20} className="text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">{servingSize}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{labels.serving}</p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 text-center border border-emerald-100 dark:border-emerald-900/30">
                    <Star size={20} className="text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">A+</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{labels.quality}</p>
                  </div>
                </div>

                {/* Ingredients */}
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl p-5 border border-amber-100 dark:border-amber-900/30">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Info size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{labels.ingredients}</h3>
                      {translatedItem.ingredients && translatedItem.ingredients.trim() !== '' ? (
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{translatedItem.ingredients}</p>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {labels.freshIngredients}
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                              <span>{language === 'tr' ? 'Günlük taze malzemeler kullanılır' : 'Daily fresh ingredients are used'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                              <span>{language === 'tr' ? 'Katkı maddesi içermez' : 'Contains no additives'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                              <span>{language === 'tr' ? 'Hijyenik koşullarda hazırlanır' : 'Prepared in hygienic conditions'}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nutrition */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center">
                      <Utensils size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{language === 'tr' ? 'Besin Değerleri' : 'Nutrition Facts'}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{language === 'tr' ? '100g başına ortalama değerler' : 'Average values per 100g'}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Main macros */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/30">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{language === 'tr' ? 'Enerji' : 'Energy'}</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{nutritionInfo.calories}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">kcal</div>
                      </div>
                      <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/30">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{language === 'tr' ? 'Protein' : 'Protein'}</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{nutritionInfo.protein}g</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{language === 'tr' ? 'Günlük' : 'Daily'} %{Math.round((nutritionInfo.protein / 50) * 100)}</div>
                      </div>
                      <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/30">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{language === 'tr' ? 'Karbonhidrat' : 'Carbohydrates'}</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{nutritionInfo.carbs}g</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{language === 'tr' ? 'Günlük' : 'Daily'} %{Math.round((nutritionInfo.carbs / 275) * 100)}</div>
                      </div>
                      <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/30">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{language === 'tr' ? 'Yağ' : 'Fat'}</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{nutritionInfo.fat}g</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{language === 'tr' ? 'Günlük' : 'Daily'} %{Math.round((nutritionInfo.fat / 70) * 100)}</div>
                      </div>
                    </div>

                    {/* Additional nutrition details */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/30">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{language === 'tr' ? 'Lif' : 'Fiber'}</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{nutritionInfo.fiber}g</div>
                      </div>
                      <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/30">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{language === 'tr' ? 'Şeker' : 'Sugar'}</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{nutritionInfo.sugar}g</div>
                      </div>
                      <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/30">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{language === 'tr' ? 'Sodyum' : 'Sodium'}</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{nutritionInfo.sodium}mg</div>
                      </div>
                      <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/30">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{language === 'tr' ? 'Doymuş Yağ' : 'Saturated Fat'}</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{(nutritionInfo.fat * 0.3).toFixed(1)}g</div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center italic">
                      {language === 'tr' ? '* Günlük referans alım değerleri 2000 kcal diyete göre hesaplanmıştır' : '* Daily reference intake values are calculated based on a 2000 kcal diet'}
                    </p>
                  </div>
                </div>

                {/* Origin */}
                {item.origin && item.origin.trim() !== '' && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Info size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{labels.origin}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{translatedItem.origin || item.origin}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Storage Instructions */}
                {item.storageInstructions && item.storageInstructions.trim() !== '' && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-900/30">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Info size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{labels.storage}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{translatedItem.storageInstructions || item.storageInstructions}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Allergens */}
                {translatedItem.allergens && Array.isArray(translatedItem.allergens) && translatedItem.allergens.length > 0 && (
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl p-5 border border-red-100 dark:border-red-900/30">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-pink-400 rounded-xl flex items-center justify-center flex-shrink-0">
                        <AlertCircle size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{labels.allergens}</h3>
                        <div className="flex flex-wrap gap-2">
                          {translatedItem.allergens.map((allergen, index) => (
                            <span
                              key={`${allergen}-${index}`}
                              className="bg-white/70 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium border border-red-100 dark:border-red-900/30"
                            >
                              {allergen}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dietary Info */}
                {translatedItem.dietaryInfo && Array.isArray(translatedItem.dietaryInfo) && translatedItem.dietaryInfo.length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-5 border border-green-100 dark:border-green-900/30">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Leaf size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{language === 'tr' ? 'Diyet Bilgisi' : 'Dietary Information'}</h3>
                        <div className="flex flex-wrap gap-2">
                          {translatedItem.dietaryInfo.map((info, index) => (
                            <span
                              key={`${info}-${index}`}
                              className="bg-white/70 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium border border-green-100 dark:border-green-900/30"
                            >
                              {info}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviews Section */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-5 border border-purple-100 dark:border-purple-900/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <ThumbsUp size={18} className="text-white sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {language === 'tr' ? 'Değerlendirmeler' : 'Reviews'}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {totalReviews} {language === 'tr' ? 'değerlendirme' : 'reviews'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-medium hover:from-purple-600 hover:to-pink-600 transition-all whitespace-nowrap flex-shrink-0 active:scale-95"
                    >
                      {showReviewForm ? (language === 'tr' ? 'İptal' : 'Cancel') : (language === 'tr' ? '+ Değerlendir' : '+ Review')}
                    </button>
                  </div>

                  {/* Review Form */}
                  {showReviewForm && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleSubmitReview}
                      className="mb-4 p-4 bg-white/70 dark:bg-gray-800/50 rounded-xl border border-purple-100 dark:border-purple-900/30"
                    >
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Adınız"
                          required
                          value={reviewForm.customer_name}
                          onChange={(e) => setReviewForm({ ...reviewForm, customer_name: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700 dark:text-gray-300">Puan:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              className="focus:outline-none"
                            >
                              <Star
                                size={24}
                                fill={star <= reviewForm.rating ? '#F59E0B' : 'none'}
                                className={star <= reviewForm.rating ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600'}
                              />
                            </button>
                          ))}
                        </div>
                        <textarea
                          placeholder="Yorumunuz (opsiyonel)"
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm resize-none"
                        />
                        <button
                          type="submit"
                          className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                        >
                          Gönder
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {loadingReviews ? (
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                        Yorumlar yükleniyor...
                      </p>
                    ) : reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div
                          key={review.id}
                          className="p-3 bg-white/70 dark:bg-gray-800/50 rounded-xl border border-purple-100 dark:border-purple-900/30"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                {review.customer_name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(review.created_at).toLocaleDateString('tr-TR')}
                              </p>
                            </div>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={14}
                                  fill={star <= review.rating ? '#F59E0B' : 'none'}
                                  className={star <= review.rating ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600'}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                        Henüz değerlendirme yapılmamış. İlk değerlendirmeyi siz yapın!
                      </p>
                    )}
                  </div>
                </div>

                {/* Frequently Bought Together - User Behavior Based */}
                {frequentlyBought.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/30">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                      <ThumbsUp size={20} className="text-blue-600 dark:text-blue-400" />
                      {language === 'tr' ? 'Bunu Alanlar Şunları da Aldı' : 'Frequently Bought Together'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      {language === 'tr' ? 'Diğer müşterilerimizin tercihleri' : 'Based on customer preferences'}
                    </p>
                    <div className="space-y-3">
                      {frequentlyBought.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex gap-3">
                            {item.image && (
                              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-1">
                                <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100">
                                  {item.name}
                                </h4>
                                <p className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                  ₺{(() => {
                                    try {
                                      const price = typeof item.price === 'number' ? item.price : parseFloat(item.price || '0')
                                      return price.toFixed(2)
                                    } catch (e) {
                                      return '0.00'
                                    }
                                  })()}
                                </p>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                {item.description}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg font-medium">
                                  {item.categoryName}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  • {item.frequency} {language === 'tr' ? 'kez birlikte alındı' : 'times ordered together'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pairing Items - AI Suggestions */}
                {pairingItems.length > 0 && (
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-5 border border-orange-100 dark:border-orange-900/30">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                      <ChefHat size={20} className="text-orange-600 dark:text-orange-400" />
                      Şef Önerisi: Bununla İyi Gider
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      Yapay zeka destekli lezzet uyumu
                    </p>
                    <div className="space-y-3">
                      {pairingItems.map((pairing) => (
                        <div
                          key={pairing.id}
                          className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-4 border border-orange-100 dark:border-orange-900/30 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex gap-3">
                            {pairing.image && (
                              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                                <Image
                                  src={pairing.image}
                                  alt={pairing.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-1">
                                <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100">
                                  {pairing.name}
                                </h4>
                                <p className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                  ₺{(() => {
                                    try {
                                      const price = typeof pairing.price === 'number' ? pairing.price : parseFloat(pairing.price || '0')
                                      return price.toFixed(2)
                                    } catch (e) {
                                      return '0.00'
                                    }
                                  })()}
                                </p>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                {pairing.description}
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400">
                                <Sparkles size={12} />
                                <span className="font-medium">{pairing.pairingReason}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Similar Items */}
                {similarItems.length > 0 && (
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-2xl p-5 border border-teal-100 dark:border-teal-900/30">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <Sparkles size={20} className="text-teal-600 dark:text-teal-400" />
                      Benzer Ürünler
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {similarItems.map((similar) => (
                        <div
                          key={similar.id}
                          className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-3 border border-teal-100 dark:border-teal-900/30 cursor-pointer hover:shadow-lg transition-shadow"
                        >
                          {similar.image && (
                            <div className="relative w-full h-20 mb-2 rounded-lg overflow-hidden">
                              <Image
                                src={similar.image}
                                alt={similar.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-1 mb-1">
                            {similar.name}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {similar.description}
                          </p>
                          <p className="text-base font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            ₺{(() => {
                              try {
                                const price = typeof similar.price === 'number' ? similar.price : parseFloat(similar.price || '0')
                                return price.toFixed(2)
                              } catch (e) {
                                return '0.00'
                              }
                            })()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info Footer */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/30">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Info size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5">
                        {language === 'tr' ? 'Sipariş Bilgisi' : 'Order Information'}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {language === 'tr'
                          ? 'Garsonumuzu çağırarak veya tezgaha gelerek sipariş verebilirsiniz. Detaylı bilgi için personelimize danışın.'
                          : 'You can order by calling our waiter or coming to the counter. For detailed information, please consult our staff.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-900/80 backdrop-blur-md px-5 py-4 border-t border-gray-200 dark:border-gray-800 z-30">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity === 1}
                          className="text-gray-700 dark:text-gray-300 disabled:text-gray-400 dark:disabled:text-gray-500 focus:outline-none"
                        >
                          -
                        </button>
                        <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="text-gray-700 dark:text-gray-300 focus:outline-none"
                        >
                          +
                        </button>
                      </div>

                      {/* Variants */}
                      {item.variants && item.variants.length > 0 && (
                        <div className="flex items-center gap-2">
                          <label htmlFor="variant" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Seçenek:</label>
                          <select
                            id="variant"
                            value={selectedVariant || ''}
                            onChange={(e) => setSelectedVariant(e.target.value || null)}
                            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            <option value="">Seçin</option>
                            {item.variants.map((variant) => (
                              <option key={variant.id} value={variant.id}>
                                {variant.name} (+{variant.delta.toFixed(2)} ₺)
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Addons */}
                      {item.addons && item.addons.length > 0 && (
                        <div className="flex items-center gap-2">
                          <label htmlFor="addons" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Ekstra:</label>
                          <select
                            id="addons"
                            multiple
                            value={selectedAddons}
                            onChange={(e) => {
                              const options = Array.from(e.target.selectedOptions, option => option.value);
                              setSelectedAddons(options);
                            }}
                            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            {item.addons.map((addon) => (
                              <option key={addon.id} value={addon.id}>
                                {addon.name} (+{addon.price.toFixed(2)} ₺)
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={handleAddToCart}
                      className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold shadow-lg hover:from-emerald-600 hover:to-teal-600 transition-all active:scale-95 flex items-center gap-2"
                    >
                      <ShoppingCart size={20} />
                      {language === 'tr' ? 'Sepete Ekle' : 'Add to Cart'} ({calculateTotal().toFixed(2)} ₺)
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}