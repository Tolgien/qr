
'use client'

import { ShoppingCart } from 'lucide-react'
import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'

export default function FloatingCartButton() {
  const { cart, setCartOpen } = useStore()
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  if (itemCount === 0) return null

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full p-4 shadow-2xl hover:shadow-emerald-500/50 transition-all hover:scale-110 active:scale-95"
      >
        <ShoppingCart size={24} />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {itemCount}
        </span>
      </motion.button>
    </AnimatePresence>
  )
}
