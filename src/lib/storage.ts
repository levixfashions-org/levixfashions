import type { Product, Category } from '../types/product'
import type { Order } from '../types/order'
import type { StoreSettings } from '../types/settings'
import { INITIAL_CATEGORIES } from '../data/initialCategories'
import { INITIAL_SETTINGS } from '../data/initialSettings'

const STORAGE_KEYS = {
  CART: 'levix_cart_v1',
  WISHLIST: 'levix_wishlist_v1',
  PRODUCTS: 'levix_products_v2',
  CATEGORIES: 'levix_categories_v1',
  SETTINGS: 'levix_settings_v1',
  ORDERS: 'levix_orders_v1',
  ADDRESSES: 'levix_addresses_v1',
}

export const localStore = {
  getCart: (): any[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CART)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },
  setCart: (items: any[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items))
    } catch {}
  },

  getWishlist: (): string[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WISHLIST)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },
  setWishlist: (productIds: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(productIds))
    } catch {}
  },

  getProducts: (): Product[] => {
    try {
      // Clean up any old cached demo products
      localStorage.removeItem('levix_products_v1')
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
      if (data) {
        return JSON.parse(data)
      }
      return []
    } catch {
      return []
    }
  },
  setProducts: (products: Product[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
    } catch (e) {
      console.warn('LocalStorage quota limit reached, clearing secondary caches:', e)
      try {
        localStorage.removeItem('levix_cart_v1')
        localStorage.removeItem('levix_wishlist_v1')
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
      } catch (err2) {
        console.error('Failed to persist products to localStorage:', err2)
      }
    }
  },

  getCategories: (): Category[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
      const REMOVED_IDS = new Set(['cat-accessories', 'cat-footwear', 'cat-headwear', 'cat-outerwear', 'cat-essentials'])
      const REMOVED_SLUGS = new Set(['accessories', 'footwear', 'headwear', 'outerwear', 'essentials'])

      if (data) {
        const stored: Category[] = JSON.parse(data)
        const filtered = stored.filter((c) => !REMOVED_IDS.has(c.id) && !REMOVED_SLUGS.has(c.slug))
        const storedIds = new Set(filtered.map((c) => c.id))
        const missing = INITIAL_CATEGORIES.filter((c) => !storedIds.has(c.id))
        const merged = [...filtered, ...missing]
        if (merged.length !== stored.length || missing.length > 0) {
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(merged))
        }
        return merged
      }
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES))
      return INITIAL_CATEGORIES
    } catch {
      return INITIAL_CATEGORIES
    }
  },
  setCategories: (categories: Category[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
    } catch {}
  },

  getSettings: (): StoreSettings => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (data) {
        const parsed = JSON.parse(data)
        if (parsed.productCardBgColor && ['#add8e6', 'blue', '#0000ff'].includes(String(parsed.productCardBgColor).toLowerCase())) {
          parsed.productCardBgColor = '#f0f0f0'
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...INITIAL_SETTINGS, ...parsed }))
        }
        return { ...INITIAL_SETTINGS, ...parsed }
      }
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS))
      return INITIAL_SETTINGS
    } catch {
      return INITIAL_SETTINGS
    }
  },
  setSettings: (settings: StoreSettings) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
    } catch {}
  },

  getOrders: (): Order[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },
  saveOrder: (order: Order) => {
    try {
      const existing = localStore.getOrders()
      const updated = [order, ...existing.filter((o) => o.id !== order.id)]
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated))
    } catch {}
  },
  updateOrder: (updatedOrder: Order) => {
    try {
      const existing = localStore.getOrders()
      const updated = existing.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated))
    } catch {}
  },
}
