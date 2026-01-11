'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import AppShell from '@/components/AppShell'
import VenueHeader from '@/components/VenueHeader'
import CategoryChips from '@/components/CategoryChips'
import ItemCard from '@/components/ItemCard'
import FloatingCartButton from '@/components/FloatingCartButton'
import CallWaiterButton from '@/components/CallWaiterButton'
import WaiterComingModal from '@/components/WaiterComingModal'
import CallWaiterModal from '@/components/CallWaiterModal'
import SearchBar from '@/components/SearchBar'
import ItemDetailModal from '@/components/ItemDetailModal'
import FilterPanel from '@/components/FilterPanel'
import CartModal from '@/components/CartModal'
import OrderTrackingModal from '@/components/OrderTrackingModal'
import OrderTracker from '@/components/OrderTracker' // Import OrderTracker
import { Venue, Category, Item, Slider } from '@/lib/types'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { translateText, translateArray } from '@/lib/client-translate'
import Image from 'next/image'

export default function MenuPage() {
  const params = useParams()
  const { language } = useStore()
  const [venue, setVenue] = useState<Venue | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [sliders, setSliders] = useState<Slider[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [waiterComingModalOpen, setWaiterComingModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    priceRange: [0, 1000] as [number, number],
    allergens: [] as string[],
    dietaryInfo: [] as string[],
    tags: [] as string[],
  })
  const [maxPrice, setMaxPrice] = useState(1000)

  const handleItemClick = (item: Item) => {
    console.log('Item clicked:', item)
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    console.log('Modal closing')
    setIsModalOpen(false)
    setSelectedItem(null)
  }

  // QR kod parametrelerini localStorage'a kaydet
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      const table = urlParams.get('table')

      if (token && table) {
        localStorage.setItem('current_table', table)
        localStorage.setItem('current_token', token)
        console.log('✅ QR kod bilgileri kaydedildi - Masa:', table)
      }
    }
  }, [])

  // Garson çağrısı durumunu kontrol et
  useEffect(() => {
    const checkWaiterCallStatus = async () => {
      const callId = localStorage.getItem('current_waiter_call_id')
      if (!callId) return

      try {
        const res = await fetch(`/api/waiter-call?callId=${callId}`)
        if (res.ok) {
          const data = await res.json()
          
          // Status "completed" ise modal göster ve localStorage'ı temizle
          if (data.call && data.call.status === 'completed') {
            console.log('🎉 Garson çağrısı onaylandı!')
            setWaiterComingModalOpen(true)
            localStorage.removeItem('current_waiter_call_id')
          }
        }
      } catch (error) {
        console.error('Error checking waiter call status:', error)
      }
    }

    // İlk kontrol
    checkWaiterCallStatus()

    // Her 3 saniyede bir kontrol et
    const interval = setInterval(checkWaiterCallStatus, 3000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/venue/${params.slug}`)
        const data = await res.json()
        setVenue(data.venue)
        setCategories(data.categories)

        // Ensure all prices are numbers
        const normalizedItems = data.items.map((item: Item) => ({
          ...item,
          price: Number(item.price)
        }))

        setItems(normalizedItems)
        setFilteredItems(normalizedItems)

        // Calculate max price
        const prices = normalizedItems.map((item: Item) => Number(item.price))
        const max = Math.max(...prices, 100)
        const calculatedMaxPrice = Math.ceil(max / 10) * 10
        setMaxPrice(calculatedMaxPrice)
        setFilters(prev => ({ ...prev, priceRange: [0, calculatedMaxPrice] }))

        // Fetch sliders
        const slidersRes = await fetch(`/api/venue/${params.slug}/sliders`)
        if (slidersRes.ok) {
          const slidersData = await slidersRes.json()
          setSliders(slidersData.sliders || [])
        }
      } catch (error) {
        console.error('Error fetching venue data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.slug])

  // Auto-slide carousel
  useEffect(() => {
    if (sliders.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliders.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [sliders.length])

  // Translate items on client-side when language changes
  const [translatedItems, setTranslatedItems] = useState<Item[]>(items)
  const [translatedCategories, setTranslatedCategories] = useState<Category[]>(categories)
  const [isTranslating, setIsTranslating] = useState(false)

  useEffect(() => {
    async function translateContent() {
      if (language === 'tr') {
        setTranslatedItems(items)
        setTranslatedCategories(categories)
        return
      }

      setIsTranslating(true)
      try {
        // Translate items
        const itemsPromises = items.map(async (item) => {
          const [
            name,
            description,
            allergens,
            dietaryInfo,
            servingSize,
            ingredients,
            origin,
            storageInstructions,
            variants,
            addons
          ] = await Promise.all([
            translateText(item.name, language),
            item.description ? translateText(item.description, language) : item.description,
            translateArray(item.allergens || [], language),
            translateArray(item.dietaryInfo || [], language),
            item.servingSize ? translateText(item.servingSize, language) : item.servingSize,
            item.ingredients ? translateText(item.ingredients, language) : item.ingredients,
            item.origin ? translateText(item.origin, language) : item.origin,
            item.storageInstructions ? translateText(item.storageInstructions, language) : item.storageInstructions,
            Promise.all((item.variants || []).map(async (v) => ({
              ...v,
              name: await translateText(v.name, language)
            }))),
            Promise.all((item.addons || []).map(async (a) => ({
              ...a,
              name: await translateText(a.name, language)
            })))
          ])

          return {
            ...item,
            name,
            description,
            allergens,
            dietaryInfo,
            servingSize,
            ingredients,
            origin,
            storageInstructions,
            variants,
            addons
          }
        })

        const translatedItemsResult = await Promise.all(itemsPromises)
        setTranslatedItems(translatedItemsResult)

        // Translate categories
        const categoriesPromises = categories.map(async (cat) => ({
          ...cat,
          name: await translateText(cat.name, language)
        }))

        const translatedCategoriesResult = await Promise.all(categoriesPromises)
        setTranslatedCategories(translatedCategoriesResult)
      } catch (error) {
        console.error('Translation failed:', error)
        setTranslatedItems(items)
        setTranslatedCategories(categories)
      } finally {
        setIsTranslating(false)
      }
    }

    translateContent()
  }, [items, categories, language])

  useEffect(() => {
    let filtered = translatedItems

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((item) => item.categoryId === selectedCategory)
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort: Featured items first
    filtered.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1
      if (!a.isFeatured && b.isFeatured) return 1
      return 0
    })

    // Price filter
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) {
      filtered = filtered.filter(
        (item) => {
          const itemPrice = Number(item.price)
          return itemPrice >= filters.priceRange[0] && itemPrice <= filters.priceRange[1]
        }
      )
    }

    // Allergen filter (exclude items with selected allergens)
    if (filters.allergens.length > 0) {
      filtered = filtered.filter(
        (item) => !item.allergens?.some((allergen) => filters.allergens.includes(allergen))
      )
    }

    // Dietary filter
    if (filters.dietaryInfo.length > 0) {
      filtered = filtered.filter((item) => {
        const itemDietary = item.dietaryInfo?.map((d) => d.toLowerCase()) || []
        return filters.dietaryInfo.some((diet) => itemDietary.includes(diet.toLowerCase()))
      })
    }

    // Tag filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter((item) =>
        filters.tags.some((tag) => item.tags?.includes(tag as 'vegan' | 'spicy' | 'new'))
      )
    }

    setFilteredItems(filtered)
  }, [selectedCategory, searchQuery, translatedItems, filters, maxPrice])

  const activeFilterCount =
    filters.allergens.length +
    filters.dietaryInfo.length +
    filters.tags.length +
    (filters.priceRange[0] !== 0 || filters.priceRange[1] !== maxPrice ? 1 : 0)

  if (loading || isTranslating) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-brand-dark border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-2">
              {isTranslating
                ? (language === 'tr' ? 'Çevriliyor...' : 'Translating...')
                : (language === 'tr' ? 'Menü yükleniyor...' : 'Loading menu...')}
            </p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (!venue) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-text-2">{language === 'tr' ? 'Mekan bulunamadı' : 'Venue not found'}</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell venueName={venue.name} venue={venue}>
      <VenueHeader venue={venue} />

      {/* Modern Slider Carousel */}
      {sliders.length > 0 && (
        <div className="relative w-full px-4 py-6 md:px-6 md:py-8">
          <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-3xl shadow-2xl bg-gray-900">
            {sliders.map((slider, index) => (
              <motion.div
                key={slider.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: currentSlide === index ? 1 : 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
                style={{ pointerEvents: currentSlide === index ? 'auto' : 'none' }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={slider.image}
                    alt={slider.title || 'Slider'}
                    fill
                    sizes="100vw"
                    className="object-cover rounded-3xl"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-3xl" />
                
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10 text-white">
                  {slider.title && (
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: currentSlide === index ? 1 : 0, y: currentSlide === index ? 0 : 20 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="text-3xl md:text-5xl font-bold mb-3 drop-shadow-2xl"
                    >
                      {slider.title}
                    </motion.h2>
                  )}
                  {slider.description && (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: currentSlide === index ? 1 : 0, y: currentSlide === index ? 0 : 20 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="text-base md:text-lg max-w-2xl drop-shadow-lg opacity-95"
                    >
                      {slider.description}
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Dot Navigation */}
            {sliders.length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                {sliders.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      currentSlide === index
                        ? 'bg-white w-8'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="pb-24 bg-surface-1">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onFilterClick={() => setIsFilterOpen(true)}
          activeFilterCount={activeFilterCount}
        />

        {/* Featured Items Section - Large Banner Style */}
        {!selectedCategory && !searchQuery && filteredItems.some(item => item.isFeatured) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 mb-6"
          >
            {filteredItems
              .filter(item => item.isFeatured)
              .map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleItemClick(item)}
                  className="relative bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-3xl p-1 shadow-2xl cursor-pointer overflow-hidden"
                >
                  {/* Animated Background Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/50 via-orange-500/50 to-red-500/50 animate-pulse" />

                  {/* Main Content Container */}
                  <div className="relative bg-white dark:bg-gray-900 rounded-3xl overflow-hidden">
                    {/* Large Image Section */}
                    {item.image && (
                      <div className="relative w-full h-64 md:h-80">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 800px"
                          className="object-cover"
                          priority
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                        {/* Floating Campaign Badge */}
                        <div className="absolute top-4 left-4 z-20">
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatType: "reverse"
                            }}
                            className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 text-white px-6 py-3 rounded-2xl text-base font-black shadow-2xl flex items-center gap-3 border-2 border-white"
                          >
                            <span className="text-3xl">🔥</span>
                            <div className="flex flex-col items-start">
                              <span className="text-xs opacity-90 leading-tight">
                                {language === 'tr' ? 'ÖZEL' : 'SPECIAL'}
                              </span>
                              <span className="text-lg uppercase tracking-wider leading-tight">
                                {language === 'tr' ? 'KAMPANYA' : 'OFFER'}
                              </span>
                            </div>
                          </motion.div>
                        </div>

                        {/* Tags on Image */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                          {item.tags?.includes('new') && (
                            <span className="bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2">
                              <span>✨</span>
                              {language === 'tr' ? 'YENİ' : 'NEW'}
                            </span>
                          )}
                          {item.tags?.includes('popular' as any) && (
                            <span className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2">
                              <span>🔥</span>
                              {language === 'tr' ? 'POPÜLER' : 'POPULAR'}
                            </span>
                          )}
                        </div>

                        {/* Product Info Overlay on Image */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                          <h2 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-2xl" style={{ fontFamily: 'var(--font-birthstone), cursive' }}>
                            {item.name}
                          </h2>
                          <p className="text-base md:text-lg mb-4 line-clamp-2 drop-shadow-lg opacity-95">
                            {item.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-baseline gap-3">
                              <span className="text-5xl md:text-6xl font-black drop-shadow-2xl">
                                ₺{(() => {
                                  try {
                                    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price || '0')
                                    return price.toFixed(2)
                                  } catch (e) {
                                    return '0.00'
                                  }
                                })()}
                              </span>
                              <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-bold border border-white/30">
                                {language === 'tr' ? 'ÖZEL FİYAT' : 'SPECIAL PRICE'}
                              </span>
                            </div>

                            <div className="flex gap-2">
                              {item.tags?.includes('vegan') && (
                                <span className="bg-green-500 text-white p-3 rounded-xl text-xl shadow-lg">
                                  🌱
                                </span>
                              )}
                              {item.tags?.includes('spicy') && (
                                <span className="bg-red-500 text-white p-3 rounded-xl text-xl shadow-lg">
                                  🌶️
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bottom Section with CTA */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 px-6 py-5 border-t-4 border-amber-400">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl animate-bounce">👆</span>
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {language === 'tr' ? 'Detayları görmek için tıklayın!' : 'Click to see details!'}
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
                          {language === 'tr' ? 'İNCELE' : 'VIEW'}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </motion.section>
        )}

        <CategoryChips
          categories={translatedCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <div className="px-4 space-y-8">
          {translatedCategories.map((category) => {
            const categoryItems = filteredItems.filter(
              (item) => item.categoryId === category.id
            )

            if (categoryItems.length === 0) return null

            return (
              <motion.section
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-text-1 mb-4">
                  {category.name}
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {categoryItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onClick={() => handleItemClick(item)}
                      theme={venue?.theme}
                    />
                  ))}
                </div>
              </motion.section>
            )
          })}

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-2 text-lg">{language === 'tr' ? 'Ürün bulunamadı' : 'No items found'}</p>
            </div>
          )}
        </div>
      </div>

      <FloatingCartButton />
      <CallWaiterButton />
      <CartModal />
      <CallWaiterModal />
      <OrderTrackingModal />
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        maxPrice={maxPrice}
      />
      <OrderTracker /> {/* Render OrderTracker */}

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />

      {/* Waiter Coming Modal */}
      <WaiterComingModal 
        isOpen={waiterComingModalOpen} 
        onClose={() => setWaiterComingModalOpen(false)} 
      />
    </AppShell>
  )
}