
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, QrCode, Download, Trash2, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface TableToken {
  id: number
  table_number: string
  token: string
  is_active: boolean
  created_at: string
  last_used: string | null
}

export default function TablesPage() {
  const params = useParams()
  const router = useRouter()
  const [tokens, setTokens] = useState<TableToken[]>([])
  const [loading, setLoading] = useState(true)
  const [newTableNumber, setNewTableNumber] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchTokens()
  }, [])

  const fetchTokens = async () => {
    try {
      const res = await fetch(`/api/user/venue/${params.slug}/table-tokens`)
      const data = await res.json()
      setTokens(data.tokens || [])
    } catch (error) {
      console.error('Error fetching tokens:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateToken = async () => {
    if (!newTableNumber.trim()) return

    setGenerating(true)
    try {
      const res = await fetch(`/api/user/venue/${params.slug}/table-tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber: newTableNumber })
      })

      if (res.ok) {
        setNewTableNumber('')
        fetchTokens()
      } else {
        const error = await res.json()
        alert(error.error || 'Hata oluştu')
      }
    } catch (error) {
      console.error('Error generating token:', error)
      alert('Token oluşturulurken hata oluştu')
    } finally {
      setGenerating(false)
    }
  }

  const deactivateToken = async (id: number) => {
    if (!confirm('Bu masa QR kodunu deaktif etmek istediğinize emin misiniz?')) return

    try {
      const res = await fetch(`/api/user/venue/${params.slug}/table-tokens?id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchTokens()
      }
    } catch (error) {
      console.error('Error deactivating token:', error)
    }
  }

  const downloadQRCode = (tableNumber: string, token: string) => {
    const baseUrl = window.location.origin
    const qrUrl = `${baseUrl}/menu/${params.slug}?table=${encodeURIComponent(tableNumber)}&token=${token}`
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(qrUrl)}&format=png`
    
    const link = document.createElement('a')
    link.href = qrApiUrl
    link.download = `masa-${tableNumber}-qr.png`
    link.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#34C8B6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/venue/${params.slug}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <QrCode className="w-8 h-8 text-[#34C8B6]" />
            Masa QR Kodları
          </h1>
          <p className="text-gray-600 mt-2">
            Her masa için güvenli QR kod oluşturun. Müşteriler sadece masalarındaki QR kodu okutarak sipariş verebilir.
          </p>
        </div>

        {/* Generate New Token */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Yeni Masa QR Kodu Oluştur</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newTableNumber}
              onChange={(e) => setNewTableNumber(e.target.value)}
              placeholder="Masa numarası (örn: 1, A1, VIP-1)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#34C8B6] focus:border-transparent"
            />
            <button
              onClick={generateToken}
              disabled={generating || !newTableNumber.trim()}
              className="px-6 py-3 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Oluştur
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tokens List */}
        <div className="grid gap-4">
          {tokens.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Henüz masa QR kodu oluşturulmamış</p>
            </div>
          ) : (
            tokens.map((token) => (
              <div
                key={token.id}
                className={`bg-white rounded-2xl shadow-lg p-6 ${!token.is_active ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#34C8B6] to-[#2AA897] rounded-xl flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Masa {token.table_number}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {token.is_active ? (
                          <span className="text-green-600">✓ Aktif</span>
                        ) : (
                          <span className="text-red-600">✗ Deaktif</span>
                        )}
                      </p>
                      {token.last_used && (
                        <p className="text-xs text-gray-400 mt-1">
                          Son kullanım: {new Date(token.last_used).toLocaleString('tr-TR')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadQRCode(token.table_number, token.token)}
                      className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      İndir
                    </button>
                    {token.is_active && (
                      <button
                        onClick={() => deactivateToken(token.id)}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Deaktif Et
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Nasıl Kullanılır?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Her masa için QR kod oluşturun ve yazdırın</li>
            <li>• QR kodları masaların üzerine yapıştırın</li>
            <li>• Müşteriler QR kodu okutarak sipariş verebilir</li>
            <li>• Başka masanın QR kodunu okuyan müşteri o masaya sipariş veremez</li>
            <li>• Güvenlik için tokenları düzenli olarak yenileyebilirsiniz</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
