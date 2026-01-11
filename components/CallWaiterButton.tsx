
'use client'

import { BellRing } from 'lucide-react'
import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'

export default function CallWaiterButton() {
  const { setWaiterCallOpen } = useStore()

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        onClick={() => setWaiterCallOpen(true)}
        className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full p-4 shadow-2xl hover:shadow-orange-500/50 transition-all hover:scale-110 active:scale-95"
        title="Garson Çağır"
      >
        <BellRing size={24} />
      </motion.button>
    </AnimatePresence>
  )
}
