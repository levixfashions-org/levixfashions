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
      // Race fetch against a 3.5s timeout so mobile networks never freeze on Firestore
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Network timeout')), 3500)
      )

      const fetchPromise = Promise.all([
        getProducts(false),
        getCategories(),
        getStoreSettings(),
      ])

      const [fetchedProducts, fetchedCategories, fetchedSettings] = await Promise.race([
        fetchPromise,
        timeoutPromise,
      ])

      setProducts(fetchedProducts)
      setCategories(fetchedCategories)
      setSettings(fetchedSettings)
      setError(null)
    } catch (err: any) {
      console.warn('Store data fetch background sync:', err?.message || err)
      // Keep existing synchronous data, do not crash
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const updateStoreSettings = async (newSettings: StoreSettings) => {
    const saved = await saveStoreSettings(newSettings)
    setSettings(saved)
  }

  const addProductOrUpdate = async (productData: Partial<Product> & { name: string }) => {
    const saved = await saveProduct(productData)
    setProducts((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)])
    return saved
  }

  const removeProduct = async (id: string) => {
    await deleteProduct(id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const addCategoryOrUpdate = async (catData: Category) => {
    const saved = await saveCategory(catData)
    setCategories((prev) => [saved, ...prev.filter((c) => c.id !== saved.id)])
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
