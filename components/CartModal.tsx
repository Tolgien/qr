'use client'

import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function CartModal() {
  const params = useParams()
  const { cart, isCartOpen, setCartOpen, updateCartItemQuantity, removeFromCart, clearCart, language, setActiveOrder, setOrderTrackingOpen, setOrderMinimized } = useStore()
  const [tableNumber, setTableNumber] = useState('')
  const [orderNotes, setOrderNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tableToken, setTableToken] = useState<string | null>(null)
  const [onlineOrderingEnabled, setOnlineOrderingEnabled] = useState<boolean>(true) // Default to true, will be updated by API

  // Extract table token from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      const table = urlParams.get('table')

      if (token && table) {
        setTableToken(token)
        setTableNumber(table)
      }
    }
  }, [])

  // QR kod kontrolü - QR kod yoksa sipariş verilemez
  const hasValidQRCode = tableToken && tableNumber

  // Fetch venue online ordering status - runs on mount and when cart opens
  useEffect(() => {
    const fetchVenueSettings = async () => {
      if (!params?.slug) {
        console.log('❌ No slug available')
        return
      }
      
      try {
        console.log('🔄 Fetching venue settings for:', params.slug)
        const res = await fetch(`/api/venue/${params.slug}`, {
          cache: 'no-store'
        })
        
        if (res.ok) {
          const data = await res.json()
          console.log('📦 Full API Response:', data)
          console.log('🔍 Venue object:', data.venue)
          console.log('🎯 onlineOrderingEnabled value:', data.venue?.onlineOrderingEnabled)
          
          // API returns camelCase: onlineOrderingEnabled
          const rawValue = data.venue?.onlineOrderingEnabled
          const isEnabled = rawValue === true || rawValue === 1
          
          console.log('✅ Online ordering status:', {
            raw: rawValue,
            rawType: typeof rawValue,
            converted: isEnabled,
            willSet: isEnabled
          })
          
          setOnlineOrderingEnabled(isEnabled)
        } else {
          console.error('❌ Failed to fetch venue settings:', res.status)
          setOnlineOrderingEnabled(false)
        }
      } catch (error) {
        console.error('❌ Error fetching venue settings:', error)
        setOnlineOrderingEnabled(false)
      }
    }

    // Fetch when cart opens
    if (isCartOpen) {
      fetchVenueSettings()
    }
  }, [params?.slug, isCartOpen])

  const total = cart.reduce((sum, item) => {
    let itemPrice = Number(item.price)

    // Add variant price
    if (item.selectedVariantId && item.variants) {
      const variant = item.variants.find(v => v.id === item.selectedVariantId)
      if (variant) itemPrice += variant.delta
    }

    // Add addon prices
    if (item.selectedAddonIds && item.addons) {
      item.selectedAddonIds.forEach(addonId => {
        const addon = item.addons?.find(a => a.id === addonId)
        if (addon) itemPrice += addon.price
      })
    }

    return sum + (itemPrice * item.quantity)
  }, 0)

  const handleSubmitOrder = async () => {
    if (!tableNumber.trim()) {
      alert(t.enterTableNumber)
      return
    }
    
    console.log('🚀 Submit Order - Online Ordering Enabled:', onlineOrderingEnabled)
    
    if (!onlineOrderingEnabled) {
      alert(t.onlineOrderDisabled)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueSlug: params.slug,
          tableNumber: tableNumber.trim(),
          tableToken, // Include table token for validation
          items: cart.map(item => ({
            itemId: item.id,
            variantId: item.selectedVariantId,
            addonIds: item.selectedAddonIds || [],
            quantity: item.quantity,
            notes: item.notes || '',
          })),
          notes: orderNotes.trim(),
          total,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Clear cart immediately to prevent re-submission
        clearCart()
        
        // Set the active order and open tracking modal
        if (data.orderId) {
          setActiveOrder(data.orderId)
        }
        
        // Close cart and open order tracking (always full screen for new orders)
        setCartOpen(false)
        setOrderMinimized(false) // Ensure modal opens full screen
        setOrderTrackingOpen(true)
        
        // Reset form fields
        setTableNumber('')
        setOrderNotes('')
        setTableToken(null)
      } else {
        alert(data.error || t.orderFailed)
      }
    } catch (error) {
      alert(t.errorOccurred)
    } finally {
      setIsSubmitting(false)
    }
  }

  const text = {
    tr: {
      cart: 'Sepetim',
      empty: 'Sepetiniz boş',
      tableNumber: 'Masa Numarası',
      orderNotes: 'Sipariş Notu (Opsiyonel)',
      total: 'Toplam',
      placeOrder: 'Sipariş Ver',
      variant: 'Varyant',
      addons: 'Ekstralar',
      invalidTableToken: 'Geçersiz masa QR kodu. Lütfen tekrar deneyin.',
      onlineOrderDisabled: 'Online sipariş şu anda kapalı. Lütfen garsonunuza sipariş verin.',
      enterTableNumber: 'Lütfen masa numaranızı girin',
      orderFailed: 'Sipariş gönderilemedi',
      errorOccurred: 'Bir hata oluştu',
      qrCodeDetermined: 'QR kod ile belirlenir',
      submitting: 'Gönderiliyor...',
      scanQRCode: '⚠️ Sipariş vermek için lütfen masanızdaki QR kodu okutun'
    },
    en: {
      cart: 'My Cart',
      empty: 'Your cart is empty',
      tableNumber: 'Table Number',
      orderNotes: 'Order Notes (Optional)',
      total: 'Total',
      placeOrder: 'Place Order',
      variant: 'Variant',
      addons: 'Add-ons',
      invalidTableToken: 'Invalid table QR code. Please try again.',
      onlineOrderDisabled: 'Online ordering is currently disabled. Please order from your waiter.',
      enterTableNumber: 'Please enter your table number',
      orderFailed: 'Failed to submit order',
      errorOccurred: 'An error occurred',
      qrCodeDetermined: 'Determined by QR code',
      submitting: 'Submitting...',
      scanQRCode: '⚠️ Please scan the QR code on your table to place an order'
    },
    de: {
      cart: 'Mein Warenkorb',
      empty: 'Ihr Warenkorb ist leer',
      tableNumber: 'Tischnummer',
      orderNotes: 'Bestellnotizen (Optional)',
      total: 'Gesamt',
      placeOrder: 'Bestellung aufgeben',
      variant: 'Variante',
      addons: 'Extras',
      invalidTableToken: 'Ungültiger Tisch-QR-Code. Bitte versuchen Sie es erneut.',
      onlineOrderDisabled: 'Online-Bestellung ist derzeit deaktiviert. Bitte bestellen Sie bei Ihrem Kellner.',
      enterTableNumber: 'Bitte geben Sie Ihre Tischnummer ein',
      orderFailed: 'Bestellung konnte nicht übermittelt werden',
      errorOccurred: 'Ein Fehler ist aufgetreten',
      qrCodeDetermined: 'Durch QR-Code bestimmt',
      submitting: 'Wird gesendet...',
      scanQRCode: '⚠️ Bitte scannen Sie den QR-Code auf Ihrem Tisch, um eine Bestellung aufzugeben'
    },
    ar: {
      cart: 'سلتي',
      empty: 'سلتك فارغة',
      tableNumber: 'رقم الطاولة',
      orderNotes: 'ملاحظات الطلب (اختياري)',
      total: 'المجموع',
      placeOrder: 'تقديم الطلب',
      variant: 'متغير',
      addons: 'إضافات',
      invalidTableToken: 'رمز QR للطاولة غير صالح. يرجى المحاولة مرة أخرى.',
      onlineOrderDisabled: 'الطلب عبر الإنترنت معطل حاليًا. يرجى الطلب من النادل الخاص بك.',
      enterTableNumber: 'يرجى إدخال رقم طاولتك',
      orderFailed: 'فشل إرسال الطلب',
      errorOccurred: 'حدث خطأ',
      qrCodeDetermined: 'محدد بواسطة رمز QR',
      submitting: 'جاري الإرسال...',
      scanQRCode: '⚠️ يرجى مسح رمز QR على طاولتك لتقديم طلب'
    }
  }

  const t = text[language]

  if (!isCartOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={() => setCartOpen(false)}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-gray-800 w-full sm:max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <div className="flex items-center gap-3">
              <ShoppingBag className="text-emerald-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.cart}</h2>
            </div>
            <button
              onClick={() => setCartOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Cart Content */}
          <>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={64} />
                    <p className="text-gray-500 dark:text-gray-400">{t.empty}</p>
                  </div>
                ) : (
                  <>
                    {cart.map((item, index) => {
                      const variant = item.selectedVariantId && item.variants?.find(v => v.id === item.selectedVariantId)
                      const addons = item.selectedAddonIds?.map(id => item.addons?.find(a => a.id === id)).filter(Boolean)
                      let itemTotal = Number(item.price)
                      if (variant) itemTotal += variant.delta
                      if (addons) addons.forEach(addon => { if (addon) itemTotal += addon.price })

                      return (
                        <div key={`${item.id}-${index}`} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                          <div className="flex gap-4">
                            {item.image && (
                              <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{item.name}</h3>
                              {variant && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">{t.variant}: {variant.name}</p>
                              )}
                              {addons && addons.length > 0 && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {t.addons}: {addons.filter(Boolean).map(a => a!.name).join(', ')}
                                </p>
                              )}
                              {item.notes && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">"{item.notes}"</p>
                              )}
                              <div className="flex items-center justify-between mt-2">
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                  ₺{(itemTotal * item.quantity).toFixed(2)}
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => updateCartItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                                    className="p-1 bg-white dark:bg-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500"
                                  >
                                    <Minus size={16} />
                                  </button>
                                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                  <button
                                    onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                    className="p-1 bg-white dark:bg-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500"
                                  >
                                    <Plus size={16} />
                                  </button>
                                  <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-1 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    <div className="space-y-3 pt-4">
                      {!hasValidQRCode && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl">
                          <p className="text-yellow-800 dark:text-yellow-200 font-medium text-center">
                            {t.scanQRCode}
                          </p>
                        </div>
                      )}
                      <div className="relative">
                        <input
                          type="text"
                          value={tableNumber || t.qrCodeDetermined}
                          readOnly
                          placeholder={t.tableNumber}
                          className="w-full px-4 py-3 border dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                        />
                        {hasValidQRCode && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 dark:text-green-400">
                            ✓
                          </div>
                        )}
                      </div>
                      <textarea
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder={t.orderNotes}
                        rows={2}
                        className="w-full px-4 py-3 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="border-t dark:border-gray-700 p-6 space-y-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span className="text-gray-900 dark:text-white">{t.total}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">₺{total.toFixed(2)}</span>
                  </div>
                  
                  {!onlineOrderingEnabled && (
                    <div className="w-full p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-center">
                      <p className="text-yellow-800 font-medium">
                        {t.onlineOrderDisabled}
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting || !hasValidQRCode || !onlineOrderingEnabled}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{t.submitting}</span>
                      </div>
                    ) : (
                      t.placeOrder
                    )}
                  </button>
                </div>
              )}
            </>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}