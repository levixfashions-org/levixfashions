export interface ProductVariant {
  id: string
  name: string
  size?: string
  color?: string
  sku: string
  price?: number // in paise, optional override
  stock: number
  imageUrl?: string // color or variant specific photo
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  sku: string
  categoryId: string
  categoryName: string
  images: string[]
  colorImages?: Record<string, string> // maps color name to image URL
  price: number // in integer paise (e.g. 299900 = ₹2,999)
  salePrice?: number | null // in integer paise
  stock: number
  isPublished: boolean
  isFeatured: boolean
  isNewArrival?: boolean
  isBestseller?: boolean
  hasVariants: boolean
  variants?: ProductVariant[]
  details?: Record<string, string>
  seoTitle?: string
  seoDescription?: string
  createdAt?: any
  updatedAt?: any
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  imageUrl: string
  displayOrder: number
  isPublished: boolean
  isFeatured: boolean
}

export type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'bestsellers'

export interface FilterState {
  category: string
  minPrice: number
  maxPrice: number
  inStockOnly: boolean
  searchQuery: string
  sortBy: SortOption
}
