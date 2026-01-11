
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, ArrowLeft, Pencil, Trash2, GripVertical, ArrowUpDown } from 'lucide-react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Item {
  id: number
  name: string
  description: string
  price: number | string
  image?: string
  category_name: string
  is_available: boolean
  is_featured: boolean
  display_order: number
}

type SortOption = 'manual' | 'category' | 'price-asc' | 'price-desc' | 'status'

function SortableItem({ item, onEdit, onDelete, onToggle }: { 
  item: Item
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  onToggle: (id: number, status: boolean) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-gray-50">
      <td className="px-4 py-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="w-5 h-5" />
        </button>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3 max-w-md">
          {item.image && (
            <div className="flex-shrink-0 w-16 h-16">
              <img className="w-16 h-16 rounded-lg object-cover" src={item.image} alt={item.name} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 mb-1 truncate">{item.name}</div>
            <div className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {item.description || 'Açıklama bulunmuyor'}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          {item.category_name}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
          ₺{typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price || '0').toFixed(2)}
        </span>
      </td>
      <td className="px-4 py-4 text-center">
        <button
          onClick={() => onToggle(item.id, item.is_available)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
            item.is_available 
              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          }`}
        >
          {item.is_available ? 'Stokta' : 'Tükendi'}
        </button>
      </td>
      <td className="px-4 py-4 text-center">
        {item.is_featured && (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full text-xs font-bold">
            <span>⭐</span> Kampanya
          </span>
        )}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(item.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-xs font-medium"
          >
            <Pencil className="w-3.5 h-3.5" />
            Düzenle
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-xs font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Sil
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function UserVenueItems() {
  const params = useParams()
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [displayItems, setDisplayItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [sortOption, setSortOption] = useState<SortOption>('manual')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetch(`/api/user/venue/${params.slug}/items`, {
      credentials: 'include'
    })
      .then(res => {
        if (res.status === 401) {
          router.push('/login')
          return null
        }
        return res.json()
      })
      .then(data => {
        if (!data) return
        const sortedItems = (data.items || []).sort((a: Item, b: Item) => 
          (a.display_order || 0) - (b.display_order || 0)
        )
        setItems(sortedItems)
        setDisplayItems(sortedItems)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.slug, router])

  useEffect(() => {
    let sorted = [...items]
    
    switch (sortOption) {
      case 'category':
        sorted.sort((a, b) => a.category_name.localeCompare(b.category_name, 'tr'))
        break
      case 'price-asc':
        sorted.sort((a, b) => {
          const priceA = typeof a.price === 'number' ? a.price : parseFloat(a.price || '0')
          const priceB = typeof b.price === 'number' ? b.price : parseFloat(b.price || '0')
          return priceA - priceB
        })
        break
      case 'price-desc':
        sorted.sort((a, b) => {
          const priceA = typeof a.price === 'number' ? a.price : parseFloat(a.price || '0')
          const priceB = typeof b.price === 'number' ? b.price : parseFloat(b.price || '0')
          return priceB - priceA
        })
        break
      case 'status':
        sorted.sort((a, b) => {
          if (a.is_available === b.is_available) return 0
          return a.is_available ? -1 : 1
        })
        break
      case 'manual':
      default:
        sorted.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        break
    }
    
    setDisplayItems(sorted)
  }, [sortOption, items])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = displayItems.findIndex((item) => item.id === active.id)
    const newIndex = displayItems.findIndex((item) => item.id === over.id)

    const newItems = arrayMove(displayItems, oldIndex, newIndex)
    setDisplayItems(newItems)

    // Update display_order in database
    const updatedItems = newItems.map((item, index) => ({
      id: item.id,
      display_order: index
    }))

    try {
      await fetch(`/api/user/venue/${params.slug}/items/reorder`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: updatedItems })
      })

      // Update local state
      setItems(newItems.map((item, index) => ({
        ...item,
        display_order: index
      })))
    } catch (error) {
      console.error('Reorder error:', error)
      // Revert on error
      setDisplayItems(items)
    }
  }

  const handleDelete = async (itemId: number) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const res = await fetch(`/api/user/venue/${params.slug}/items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.status === 401) {
        router.push('/login')
        return
      }

      if (res.ok) {
        const newItems = items.filter(item => item.id !== itemId)
        setItems(newItems)
        setDisplayItems(newItems)
      } else {
        alert('Ürün silinemedi')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Bir hata oluştu')
    }
  }

  const toggleAvailability = async (itemId: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/user/venue/${params.slug}/items/${itemId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_available: !currentStatus
        })
      })

      if (res.status === 401) {
        router.push('/login')
        return
      }

      if (res.ok) {
        const newItems = items.map(item => 
          item.id === itemId ? { ...item, is_available: !currentStatus } : item
        )
        setItems(newItems)
        setDisplayItems(newItems)
      }
    } catch (error) {
      console.error('Toggle error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#34C8B6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/dashboard/venue/${params.slug}`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Geri
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Ürünler</h1>
            </div>
            <Link
              href={`/dashboard/venue/${params.slug}/items/new`}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Yeni Ürün
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz ürün eklemediniz</h3>
            <p className="text-gray-600 mb-6">İlk ürününüzü ekleyerek menünüzü oluşturmaya başlayın</p>
            <Link
              href={`/dashboard/venue/${params.slug}/items/new`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#34C8B6] to-[#2AA897] text-white rounded-xl font-medium"
            >
              <Plus className="w-5 h-5" />
              İlk Ürünü Ekle
            </Link>
          </div>
        ) : (
          <>
            {/* Sorting Controls */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <ArrowUpDown className="w-5 h-5" />
                <span className="font-medium">Sıralama:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSortOption('manual')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortOption === 'manual'
                      ? 'bg-[#34C8B6] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Manuel Sıralama
                </button>
                <button
                  onClick={() => setSortOption('category')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortOption === 'category'
                      ? 'bg-[#34C8B6] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Kategoriye Göre
                </button>
                <button
                  onClick={() => setSortOption('price-asc')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortOption === 'price-asc'
                      ? 'bg-[#34C8B6] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Fiyat (Artan)
                </button>
                <button
                  onClick={() => setSortOption('price-desc')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortOption === 'price-desc'
                      ? 'bg-[#34C8B6] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Fiyat (Azalan)
                </button>
                <button
                  onClick={() => setSortOption('status')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortOption === 'status'
                      ? 'bg-[#34C8B6] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Duruma Göre
                </button>
              </div>
            </div>

            {sortOption === 'manual' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>İpucu:</strong> Manuel sıralama modunda ürünleri sürükleyerek yeniden sıralayabilirsiniz
                </p>
              </div>
            )}

            {/* Items Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                          {sortOption === 'manual' ? 'Sırala' : ''}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                          Ürün
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                          Kategori
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                          Fiyat
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                          Durum
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                          Kampanya
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <SortableContext
                        items={displayItems.map(item => item.id)}
                        strategy={verticalListSortingStrategy}
                        disabled={sortOption !== 'manual'}
                      >
                        {displayItems.map(item => (
                          <SortableItem
                            key={item.id}
                            item={item}
                            onEdit={(id) => router.push(`/dashboard/venue/${params.slug}/items/${id}`)}
                            onDelete={handleDelete}
                            onToggle={toggleAvailability}
                          />
                        ))}
                      </SortableContext>
                    </tbody>
                  </table>
                </DndContext>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
