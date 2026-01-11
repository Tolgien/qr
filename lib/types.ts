export type Venue = {
  id: string
  slug: string
  name: string
  description?: string
  logo?: string
  coverImage?: string
  website?: string
  wifiPassword?: string
  address?: string
  phone?: string
  status: 'open' | 'closing'
  languages: string[]
  averageRating?: number
  reviewCount?: number
  totalItems?: number
  totalCategories?: number
  totalOrders?: number
  theme?: string
  onlineOrderingEnabled?: boolean
}

export type Slider = {
  id: number
  venueId?: number
  image: string
  title?: string
  description?: string
  displayOrder: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type Category = {
  id: string
  venueId: string
  name: string
  order: number
  image?: string
}

export type Item = {
  id: string
  categoryId: string
  name: string
  description?: string
  price: number | string
  image?: string
  tags?: ('vegan' | 'spicy' | 'new')[]
  variants?: { id: string; name: string; delta: number }[]
  addons?: { id: string; name: string; price: number }[]
  allergens?: string[]
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  fiber?: number
  sugar?: number
  sodium?: number
  isAvailable?: boolean
  preparationTime?: number
  servingSize?: string
  ingredients?: string
  origin?: string
  storageInstructions?: string
  dietaryInfo?: string[]
  isFeatured?: boolean // Added isFeatured field
}

export type CartItem = {
  itemId: string
  variantId?: string
  addonIds?: string[]
  notes?: string
  qty: number
}

export type Order = {
  id: string
  venueId: string
  table?: string
  items: CartItem[]
  total: number
  status: 'placed' | 'preparing' | 'ready'
}