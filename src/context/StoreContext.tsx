import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Product, Category } from '../types/product'
import type { StoreSettings } from '../types/settings'
import {
  getProducts,
  getCategories,
  getStoreSettings,
  saveProduct,
  deleteProduct,
  saveCategory,
  saveStoreSettings,
  seedFirestoreDatabase,
} from '../lib/firestore'
import { INITIAL_SETTINGS } from '../data/initialSettings'
import { localStore } from '../lib/storage'

interface StoreContextType {
  products: Product[]
  categories: Category[]
  settings: StoreSettings
  loading: boolean
  error: string | null
  refreshStore: () => Promise<void>
  updateStoreSettings: (newSettings: StoreSettings) => Promise<void>
  addProductOrUpdate: (product: Partial<Product> & { name: string }) => Promise<Product>
  removeProduct: (id: string) => Promise<void>
  addCategoryOrUpdate: (category: Category) => Promise<Category>
  seedInitialData: () => Promise<{ success: boolean; message: string }>
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronously initialize with local data for zero-latency instant rendering
  const [products, setProducts] = useState<Product[]>(() => localStore.getProducts())
  const [categories, setCategories] = useState<Category[]>(() => localStore.getCategories())
  const [settings, setSettings] = useState<StoreSettings>(() => localStore.getSettings())
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      // Fetch products, categories, and settings with individual error isolation
      const [prodResult, catResult, setResult] = await Promise.allSettled([
        getProducts(false),
        getCategories(),
        getStoreSettings(),
      ])

      if (prodResult.status === 'fulfilled' && Array.isArray(prodResult.value)) {
        setProducts((prev) => {
          if (
            prev.length === prodResult.value.length &&
            JSON.stringify(prev) === JSON.stringify(prodResult.value)
          ) {
            return prev
          }
          return prodResult.value
        })
      }

      if (catResult.status === 'fulfilled' && Array.isArray(catResult.value)) {
        setCategories((prev) => {
          if (
            prev.length === catResult.value.length &&
            JSON.stringify(prev) === JSON.stringify(catResult.value)
          ) {
            return prev
          }
          return catResult.value
        })
      }

      if (setResult.status === 'fulfilled' && setResult.value) {
        setSettings((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(setResult.value)) {
            return prev
          }
          return setResult.value
        })
      }
      setError(null)
    } catch (err: any) {
      console.warn('Store data fetch background sync:', err?.message || err)
    }
  }, [])

  // Targeted lightweight heartbeat to refresh only products (price & stock), cutting server load by 66%
  const refreshProductsOnly = useCallback(async () => {
    try {
      const freshProducts = await getProducts(false)
      if (Array.isArray(freshProducts)) {
        setProducts((prev) => {
          if (
            prev.length === freshProducts.length &&
            JSON.stringify(prev) === JSON.stringify(freshProducts)
          ) {
            return prev
          }
          return freshProducts
        })
      }
    } catch {}
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Real-time live synchronization across tabs and in background
  useEffect(() => {
    let channel: BroadcastChannel | null = null
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('levix_store_sync')
        channel.onmessage = (event) => {
          if (event.data?.type === 'PRODUCTS_UPDATED' && Array.isArray(event.data.products)) {
            setProducts(event.data.products)
          } else if (event.data?.type === 'CATEGORIES_UPDATED' && Array.isArray(event.data.categories)) {
            setCategories(event.data.categories)
          } else if (event.data?.type === 'SETTINGS_UPDATED' && event.data.settings) {
            setSettings(event.data.settings)
          }
        }
      }
    } catch (e) {
      console.warn('BroadcastChannel setup note:', e)
    }

    // Auto-update whenever the user focuses or switches back to this browser tab
    const handleActive = () => {
      loadData()
    }
    window.addEventListener('focus', handleActive)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadData()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // Storage event sync (instant cross-tab update backup)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'levix_products_v2') {
        setProducts(localStore.getProducts())
      } else if (e.key === 'levix_categories_v1') {
        setCategories(localStore.getCategories())
      } else if (e.key === 'levix_settings_v1') {
        setSettings(localStore.getSettings())
      }
    }
    window.addEventListener('storage', handleStorage)

    // Lightweight heartbeat only polls products when the tab is visible
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refreshProductsOnly()
      }
    }, 8000)

    return () => {
      if (channel) channel.close()
      window.removeEventListener('focus', handleActive)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('storage', handleStorage)
      clearInterval(interval)
    }
  }, [loadData, refreshProductsOnly])

  const updateStoreSettings = async (newSettings: StoreSettings) => {
    const saved = await saveStoreSettings(newSettings)
    setSettings(saved)
    try {
      if ('BroadcastChannel' in window) {
        const ch = new BroadcastChannel('levix_store_sync')
        ch.postMessage({ type: 'SETTINGS_UPDATED', settings: saved })
        ch.close()
      }
    } catch {}
  }

  const addProductOrUpdate = async (productData: Partial<Product> & { name: string }) => {
    const saved = await saveProduct(productData)
    setProducts((prev) => {
      const next = [saved, ...prev.filter((p) => p.id !== saved.id)]
      try {
        if ('BroadcastChannel' in window) {
          const ch = new BroadcastChannel('levix_store_sync')
          ch.postMessage({ type: 'PRODUCTS_UPDATED', products: next })
          ch.close()
        }
      } catch {}
      return next
    })
    return saved
  }

  const removeProduct = async (id: string) => {
    await deleteProduct(id)
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id)
      try {
        if ('BroadcastChannel' in window) {
          const ch = new BroadcastChannel('levix_store_sync')
          ch.postMessage({ type: 'PRODUCTS_UPDATED', products: next })
          ch.close()
        }
      } catch {}
      return next
    })
  }

  const addCategoryOrUpdate = async (catData: Category) => {
    const saved = await saveCategory(catData)
    setCategories((prev) => {
      const next = [saved, ...prev.filter((c) => c.id !== saved.id)]
      try {
        if ('BroadcastChannel' in window) {
          const ch = new BroadcastChannel('levix_store_sync')
          ch.postMessage({ type: 'CATEGORIES_UPDATED', categories: next })
          ch.close()
        }
      } catch {}
      return next
    })
    return saved
  }

  const seedInitialData = async () => {
    const res = await seedFirestoreDatabase()
    await loadData()
    return res
  }

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        settings,
        loading,
        error,
        refreshStore: loadData,
        updateStoreSettings,
        addProductOrUpdate,
        removeProduct,
        addCategoryOrUpdate,
        seedInitialData,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = () => {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}
