
'use client'

import { useEffect, useState } from 'react'
import { Shield } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

export default function AdminHeaderIcon() {
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    setIsAdmin(!!token)
  }, [pathname])

  if (!isAdmin || pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => router.push('/admin')}
      className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl min-w-[44px] min-h-[44px] flex items-center justify-center"
      aria-label="Admin Panel"
      title="Admin Paneli"
    >
      <Shield size={20} />
    </motion.button>
  )
}
