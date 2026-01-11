import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Item } from './types'

interface CartItem extends Item {
  quantity: number
  notes?: string
  selectedVariantId?: string
  selectedAddonIds?: string[]
}

interface StoreState {
  theme: 'light' | 'dark'
  language: 'en' | 'tr' | 'de' | 'ar'
  selectedCategory: string | null
  searchQuery: string
  cart: CartItem[]
  isCartOpen: boolean
  activeOrderId: number | null
  isOrderTrackingOpen: boolean
  isOrderMinimized: boolean
  waiterCallOpen: boolean
  toggleTheme: () => void
  setLanguage: (lang: 'en' | 'tr' | 'de' | 'ar') => void
  setSelectedCategory: (categoryId: string | null) => void
  setSearchQuery: (query: string) => void
  addToCart: (item: Item, quantity?: number, notes?: string, variantId?: string, addonIds?: string[]) => void
  removeFromCart: (itemId: string) => void
  updateCartItemQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  setCartOpen: (isOpen: boolean) => void
  setActiveOrder: (orderId: number | null) => void
  setOrderTrackingOpen: (isOpen: boolean) => void
  setOrderMinimized: (isMinimized: boolean) => void
  setWaiterCallOpen: (open: boolean) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'tr',
      selectedCategory: null,
      searchQuery: '',
      cart: [],
      isCartOpen: false,
      activeOrderId: null,
      isOrderTrackingOpen: false,
      isOrderMinimized: false,
      waiterCallOpen: false,

      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light'
          if (typeof window !== 'undefined') {
            document.documentElement.classList.toggle('dark', newTheme === 'dark')
          }
          return { theme: newTheme }
        }),

      setLanguage: (lang) => {
        console.log('Language changed to:', lang)
        return set({ language: lang })
      },

      setSelectedCategory: (categoryId) =>
        set({ selectedCategory: categoryId }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      addToCart: (item, quantity = 1, notes, variantId, addonIds) =>
        set((state) => {
          const existingItemIndex = state.cart.findIndex(
            (cartItem) =>
              cartItem.id === item.id &&
              cartItem.selectedVariantId === variantId &&
              JSON.stringify(cartItem.selectedAddonIds?.sort()) === JSON.stringify(addonIds?.sort())
          )

          if (existingItemIndex > -1) {
            const newCart = [...state.cart]
            newCart[existingItemIndex].quantity += quantity
            if (notes) newCart[existingItemIndex].notes = notes
            return { cart: newCart }
          }

          return {
            cart: [
              ...state.cart,
              { ...item, quantity, notes, selectedVariantId: variantId, selectedAddonIds: addonIds },
            ],
          }
        }),

      removeFromCart: (itemId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== itemId),
        })),

      updateCartItemQuantity: (itemId, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        })),

      clearCart: () => set({ cart: [] }),

      setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),

      setActiveOrder: (orderId) => set({ activeOrderId: orderId }),

      setOrderTrackingOpen: (isOpen) => set({ isOrderTrackingOpen: isOpen }),

      setOrderMinimized: (isMinimized) => set({ isOrderMinimized: isMinimized }),

      setWaiterCallOpen: (open) => set({ waiterCallOpen: open }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ theme: state.theme, language: state.language, cart: state.cart }),
    }
  )
)