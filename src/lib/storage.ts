import type { Product, Category } from '../types/product'
import type { Order } from '../types/order'
import type { StoreSettings } from '../types/settings'
import { INITIAL_PRODUCTS } from '../data/initialProducts'
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
      if (data) {
        const stored: Category[] = JSON.parse(data)
        const storedIds = new Set(stored.map((c) => c.id))
        const missing = INITIAL_CATEGORIES.filter((c) => !storedIds.has(c.id))
        if (missing.length > 0) {
          const merged = [...stored, ...missing]
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(merged))
          return merged
        }
        return stored
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
      if (data) return JSON.parse(data)
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
