'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  type?: 'error' | 'success' | 'warning' | 'info'
}

export default function AlertModal({ isOpen, onClose, title, message, type = 'info' }: AlertModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const colors = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const titleColors = {
    error: 'text-red-900',
    success: 'text-green-900',
    warning: 'text-yellow-900',
    info: 'text-blue-900'
  }

  const buttonColors = {
    error: 'bg-red-600 hover:bg-red-700',
    success: 'bg-green-600 hover:bg-green-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className={`border-l-4 p-6 ${colors[type]}`}>
          <div className="flex items-start justify-between mb-4">
            {title && (
              <h3 className={`text-lg font-semibold ${titleColors[type]}`}>
                {title}
              </h3>
            )}
            <button
              onClick={onClose}
              className="ml-auto -mr-2 -mt-2 p-2 rounded-full hover:bg-white/50 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <p className={`text-sm leading-relaxed ${titleColors[type]}`}>
            {message}
          </p>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${buttonColors[type]}`}
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  )
}
