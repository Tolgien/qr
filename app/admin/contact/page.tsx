
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Trash2, Eye, EyeOff, Calendar, User, Phone as PhoneIcon, MessageSquare } from 'lucide-react'

interface ContactMessage {
  id: number
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  is_read: boolean
  created_at: string
}

export default function AdminContactPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }

    fetchMessages()
  }, [router])

  const fetchMessages = async () => {
    const token = localStorage.getItem('adminToken')
    try {
      const response = await fetch('/api/admin/contact', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRead = async (id: number, currentStatus: boolean) => {
    const token = localStorage.getItem('adminToken')
    try {
      const response = await fetch(`/api/admin/contact/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isRead: !currentStatus })
      })

      if (response.ok) {
        fetchMessages()
      }
    } catch (error) {
      console.error('Error updating message:', error)
    }
  }

  const deleteMessage = async (id: number) => {
    if (!confirm('Bu mesajı silmek istediğinizden emin misiniz?')) return

    const token = localStorage.getItem('adminToken')
    try {
      const response = await fetch(`/api/admin/contact/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        fetchMessages()
        setSelectedMessage(null)
      }
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const unreadCount = messages.filter(m => !m.is_read).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Mesajlar yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Mail className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    İletişim Mesajları
                  </h1>
                  <p className="text-sm text-gray-500">
                    {messages.length} mesaj • {unreadCount} okunmamış
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {messages.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-2xl border-2 border-dashed border-gray-300">
            <Mail className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Henüz mesaj yok</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Messages List */}
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedMessage(message)}
                  className={`bg-white rounded-2xl p-6 shadow-lg cursor-pointer border-2 transition-all ${
                    selectedMessage?.id === message.id
                      ? 'border-emerald-500'
                      : message.is_read
                      ? 'border-gray-100'
                      : 'border-amber-200 bg-amber-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 truncate">{message.name}</h3>
                        {!message.is_read && (
                          <span className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full font-medium">
                            Yeni
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{message.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleRead(message.id, message.is_read)
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {message.is_read ? (
                          <Eye className="w-4 h-4 text-gray-400" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-amber-500" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteMessage(message.id)
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {message.subject && (
                    <p className="text-sm font-medium text-gray-700 mb-2">{message.subject}</p>
                  )}

                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{message.message}</p>

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(message.created_at).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Message Detail */}
            {selectedMessage && (
              <div className="lg:sticky lg:top-8 h-fit">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl p-8 shadow-xl border border-emerald-100"
                >
                  <div className="flex items-start justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Mesaj Detayı</h2>
                    <button
                      onClick={() => deleteMessage(selectedMessage.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center">
                        <User className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Gönderen</p>
                        <p className="font-semibold text-gray-900">{selectedMessage.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center">
                        <Mail className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <a href={`mailto:${selectedMessage.email}`} className="font-medium text-blue-600 hover:underline">
                          {selectedMessage.email}
                        </a>
                      </div>
                    </div>

                    {selectedMessage.phone && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                          <PhoneIcon className="text-white" size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Telefon</p>
                          <a href={`tel:${selectedMessage.phone}`} className="font-medium text-purple-600 hover:underline">
                            {selectedMessage.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center">
                        <Calendar className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tarih</p>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedMessage.created_at).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedMessage.subject && (
                    <div className="mb-6">
                      <label className="text-sm font-medium text-gray-600 mb-2 block">Konu</label>
                      <p className="text-lg font-semibold text-gray-900">{selectedMessage.subject}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Mesaj
                    </label>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => toggleRead(selectedMessage.id, selectedMessage.is_read)}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2"
                    >
                      {selectedMessage.is_read ? <EyeOff size={18} /> : <Eye size={18} />}
                      {selectedMessage.is_read ? 'Okunmadı İşaretle' : 'Okundu İşaretle'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
