import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
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
  invalidateProductsCache,
} from '../lib/firestore'
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

// Shared singleton BroadcastChannel instance (avoids early close truncation bugs)
let broadcastChannelInstance: BroadcastChannel | null = null

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return null
  if (!broadcastChannelInstance) {
    try {
      broadcastChannelInstance = new BroadcastChannel('levix_store_sync')
    } catch (e) {
      console.warn('BroadcastChannel creation error:', e)
    }
  }
  return broadcastChannelInstance
}

function broadcastStoreEvent(event: { type: string; [key: string]: any }) {
  const ch = getBroadcastChannel()
  if (ch) {
    try {
      ch.postMessage(event)
    } catch (e) {
      console.warn('BroadcastChannel postMessage failed:', e)
    }
  }
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('levix_store_internal_sync', { detail: event }))
    } catch {}
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronously initialize with local data for zero-latency instant rendering
  const [products, setProducts] = useState<Product[]>(() => localStore.getProducts())
  const [categories, setCategories] = useState<Category[]>(() => localStore.getCategories())
  const [settings, setSettings] = useState<StoreSettings>(() => localStore.getSettings())
  const [loading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async (force = false) => {
    try {
      // Fetch products, categories, and settings with individual error isolation
      const [prodResult, catResult, setResult] = await Promise.allSettled([
        getProducts(false, force),
        getCategories(),
        getStoreSettings(),
      ])

      if (prodResult.status === 'fulfilled' && Array.isArray(prodResult.value)) {
        setProducts((prev) => {
          if (
            !force &&
            prev.length === prodResult.value.length &&
            JSON.stringify(prev) === JSON.stringify(prodResult.value)
          ) {
            return prev
          }
          localStore.setProducts(prodResult.value)
          return prodResult.value
        })
      }

      if (catResult.status === 'fulfilled' && Array.isArray(catResult.value)) {
        setCategories((prev) => {
          if (
            !force &&
            prev.length === catResult.value.length &&
            JSON.stringify(prev) === JSON.stringify(catResult.value)
          ) {
            return prev
          }
          localStore.setCategories(catResult.value)
          return catResult.value
        })
      }

      if (setResult.status === 'fulfilled' && setResult.value) {
        setSettings((prev) => {
          if (!force && JSON.stringify(prev) === JSON.stringify(setResult.value)) {
            return prev
          }
          localStore.setSettings(setResult.value)
          return setResult.value
        })
      }
      setError(null)
    } catch (err: any) {
      console.warn('Store data fetch background sync:', err?.message || err)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Real-time live synchronization across tabs and throttled refresh (Fix 2.1)
  const lastLoad = useRef(0)
  const refreshIfStale = useCallback(() => {
    if (Date.now() - lastLoad.current < 30_000) return // at most once every 30 seconds on visibility change
    lastLoad.current = Date.now()
    loadData(true)
  }, [loadData])

  useEffect(() => {
    const handleIncomingSync = (data: any) => {
      if (!data || !data.type) return
      if (data.type === 'PRODUCTS_UPDATED' && Array.isArray(data.products)) {
        invalidateProductsCache()
        setProducts(data.products)
        localStore.setProducts(data.products)
      } else if (data.type === 'CATEGORIES_UPDATED' && Array.isArray(data.categories)) {
        setCategories(data.categories)
        localStore.setCategories(data.categories)
      } else if (data.type === 'SETTINGS_UPDATED' && data.settings) {
        setSettings(data.settings)
        localStore.setSettings(data.settings)
      }
    }

    const ch = getBroadcastChannel()
    const handleChannelMessage = (event: MessageEvent) => {
      handleIncomingSync(event.data)
    }
    if (ch) {
      ch.addEventListener('message', handleChannelMessage)
    }

    const handleCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent
      handleIncomingSync(customEvent.detail)
    }
    window.addEventListener('levix_store_internal_sync', handleCustomEvent)

    // Single throttled refresh on tab visibility (revalidates when switching to this tab)
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        refreshIfStale()
      }
    }
    document.addEventListener('visibilitychange', onVisible)

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

    return () => {
      if (ch) {
        ch.removeEventListener('message', handleChannelMessage)
      }
      window.removeEventListener('levix_store_internal_sync', handleCustomEvent)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('storage', handleStorage)
    }
  }, [loadData, refreshIfStale])

  const updateStoreSettings = async (newSettings: StoreSettings) => {
    const saved = await saveStoreSettings(newSettings)
    setSettings(saved)
    localStore.setSettings(saved)
    broadcastStoreEvent({ type: 'SETTINGS_UPDATED', settings: saved })
  }

  const addProductOrUpdate = async (productData: Partial<Product> & { name: string }) => {
    const tempId = productData.id || `prod-${Date.now()}`

    // 1. Optimistic instant local update in 0ms so price/cost changes reflect without lag
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === tempId)
      const next = exists
        ? prev.map((p) => (p.id === tempId ? ({ ...p, ...productData } as Product) : p))
        : [{ ...productData, id: tempId } as Product, ...prev]
      localStore.setProducts(next)
      broadcastStoreEvent({ type: 'PRODUCTS_UPDATED', products: next })
      return next
    })

    // 2. Persist to authoritative backend API
    const saved = await saveProduct(productData)

    // 3. Update with confirmed server product and re-sync across all components & tabs
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === saved.id)
      const next = exists
        ? prev.map((p) => (p.id === saved.id ? saved : p))
        : [saved, ...prev]
      localStore.setProducts(next)
      broadcastStoreEvent({ type: 'PRODUCTS_UPDATED', products: next })
      return next
    })

    return saved
  }

  const removeProduct = async (id: string) => {
    // 1. Optimistic removal in 0ms
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id)
      localStore.setProducts(next)
      broadcastStoreEvent({ type: 'PRODUCTS_UPDATED', products: next })
      return next
    })

    // 2. Persist removal to backend
    await deleteProduct(id)
  }

  const addCategoryOrUpdate = async (catData: Category) => {
    const saved = await saveCategory(catData)
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === saved.id)
      const next = exists
        ? prev.map((c) => (c.id === saved.id ? saved : c))
        : [saved, ...prev]
      localStore.setCategories(next)
      broadcastStoreEvent({ type: 'CATEGORIES_UPDATED', categories: next })
      return next
    })
    return saved
  }

  const seedInitialData = async () => {
    const res = await seedFirestoreDatabase()
    await loadData(true)
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
        refreshStore: () => loadData(true),
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
