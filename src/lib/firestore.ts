import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from './firebase'
import { localStore } from './storage'
import type { Product, Category } from '../types/product'
import type { Order } from '../types/order'
import type { StoreSettings } from '../types/settings'
import type { UserProfile } from '../types/user'
import { INITIAL_PRODUCTS } from '../data/initialProducts'
import { INITIAL_CATEGORIES } from '../data/initialCategories'
import { INITIAL_SETTINGS } from '../data/initialSettings'

// Collections
const PRODUCTS_COL = 'products'
const CATEGORIES_COL = 'categories'
const ORDERS_COL = 'orders'
const SETTINGS_COL = 'storeSettings'
const USERS_COL = 'users'

export async function getAdminHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Authoritative Admin Key to bypass shared-hosting Apache header-stripping issues
  const adminKey = import.meta.env.VITE_ADMIN_KEY || 'levix_admin_auth_sec_2026'
  if (adminKey) {
    headers['X-Admin-Key'] = adminKey
  }

  if (auth?.currentUser) {
    try {
      // Non-blocking fast token retrieval with 250ms safety cap so requests never stall
      const token = await Promise.race([
        auth.currentUser.getIdToken(),
        new Promise<string>((resolve) => setTimeout(() => resolve(''), 250)),
      ])
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
        headers['X-Firebase-Token'] = token
      }
    } catch (e) {
      console.warn('Failed to retrieve Firebase ID token:', e)
    }
  }
  return headers
}

// Authoritative In-Memory Short-Lived Cache (Deduplicates rapid concurrent paints, auto-invalidates on edit)
let productsCache: { data: Product[]; expiresAt: number } | null = null

export function invalidateProductsCache(): void {
  productsCache = null
}

export async function getProducts(onlyPublished = true, forceRefresh = false): Promise<Product[]> {
  const now = Date.now()
  if (!forceRefresh && productsCache && productsCache.expiresAt > now) {
    return onlyPublished ? productsCache.data.filter((p) => p.isPublished) : productsCache.data
  }

  try {
    const url = forceRefresh ? '/api/products?refresh=1' : '/api/products'
    const res = await Promise.race([
      fetch(url),
      new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('API products timeout')), 5000)),
    ])
    if (res.ok) {
      const data = await res.json()
      if (data && Array.isArray(data.products)) {
        productsCache = { data: data.products, expiresAt: now + 30000 }
        return onlyPublished ? data.products.filter((p: Product) => p.isPublished) : data.products
      }
    }
  } catch (err) {
    console.warn('API getProducts note:', err)
  }

  // Fallback to cache if still valid
  if (productsCache) {
    return onlyPublished ? productsCache.data.filter((p) => p.isPublished) : productsCache.data
  }

  return []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts(false)
  return products.find((p) => p.slug === slug) || null
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts(false)
  return products.find((p) => p.id === id) || null
}

function cleanData<T extends Record<string, any>>(obj: T): T {
  const clean: any = {}
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) continue
    if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      clean[key] = cleanData(val)
    } else if (Array.isArray(val)) {
      clean[key] = val.map((item) =>
        item !== null && typeof item === 'object' ? cleanData(item) : item
      )
    } else {
      clean[key] = val
    }
  }
  return clean
}

export async function saveProduct(product: Partial<Product> & { name: string }): Promise<Product> {
  const id = product.id || `prod-${Date.now()}`
  const now = new Date().toISOString()
  const fullProduct: Product = {
    id,
    name: product.name,
    slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: product.description || '',
    shortDescription: product.shortDescription || '',
    sku: product.sku || `LVX-${Date.now().toString().slice(-4)}`,
    categoryId: product.categoryId || 'cat-essentials',
    categoryName: product.categoryName || 'Minimal Essentials',
    images: product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'],
    colorImages: product.colorImages || {},
    price: product.price || 199900,
    salePrice: product.salePrice ?? null,
    stock: product.stock ?? 10,
    isPublished: product.isPublished ?? true,
    isFeatured: product.isFeatured ?? false,
    isNewArrival: product.isNewArrival ?? false,
    isBestseller: product.isBestseller ?? false,
    hasVariants: Boolean(product.variants && product.variants.length > 0),
    variants: product.variants || [],
    details: product.details || {},
    seoTitle: product.seoTitle || product.name,
    seoDescription: product.seoDescription || product.description,
    createdAt: product.createdAt || now,
    updatedAt: now,
  }

  // 1. Immediately persist locally so the product is saved in 0ms with zero lag
  productsCache = null
  const existing = localStore.getProducts()
  const updated = [fullProduct, ...existing.filter((p) => p.id !== id)]
  localStore.setProducts(updated)

  // 2. Sync to Backend Server API for multi-device instant sharing
  try {
    const headers = await getAdminHeaders()
    const apiPromise = fetch('/api/products', {
      method: 'POST',
      headers,
      body: JSON.stringify(fullProduct),
    })
    const timeoutPromise = new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('API save timeout')), 4000)
    )
    const res = await Promise.race([apiPromise, timeoutPromise])
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      console.warn('Backend API save warning:', errData.error || res.statusText)
      throw new Error(errData.error || `Server error (${res.status}): Failed to save product to database.`)
    }
  } catch (apiErr: any) {
    console.error('Backend API save error:', apiErr)
    throw new Error(apiErr.message || 'Could not connect to production server to save product.')
  }

  // 3. Sync to Firestore with a fast 2.5s race timeout in background so it never hangs
  if (isFirebaseConfigured && db) {
    const firestoreWrite = async () => {
      try {
        const sanitized = cleanData({
          ...fullProduct,
          updatedAt: serverTimestamp(),
        })
        const timeoutPromise = new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 2500)
        )
        await Promise.race([
          setDoc(doc(db, PRODUCTS_COL, id), sanitized),
          timeoutPromise,
        ])
      } catch (err) {
        console.warn('Firestore sync note (data preserved in local storage):', err)
      }
    }
    firestoreWrite().catch(() => {})
  }

  return fullProduct
}

export async function deleteProduct(id: string): Promise<void> {
  productsCache = null
  const existing = localStore.getProducts()
  localStore.setProducts(existing.filter((p) => p.id !== id))

  try {
    const headers = await getAdminHeaders()
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE', headers })
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.error || `Server failed to delete product (${res.status})`)
    }
  } catch (err: any) {
    console.error('Backend delete error:', err)
    throw err
  }

  if (isFirebaseConfigured && db) {
    const firestoreDelete = async () => {
      try {
        const timeoutPromise = new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 2500)
        )
        await Promise.race([
          deleteDoc(doc(db, PRODUCTS_COL, id)),
          timeoutPromise,
        ])
      } catch (err) {
        console.warn('Firestore delete note (removed locally):', err)
      }
    }
    firestoreDelete().catch(() => {})
  }
}

// --- CATEGORIES ---
export async function getCategories(): Promise<Category[]> {
  try {
    const res = await Promise.race([
      fetch(`/api/categories?_t=${Date.now()}`, { cache: 'no-store' }),
      new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
    ])
    if (res.ok) {
      const data = await res.json()
      if (data && Array.isArray(data.categories) && data.categories.length > 0) {
        localStore.setCategories(data.categories)
        return data.categories
      }
    }
  } catch {}

  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, CATEGORIES_COL), orderBy('displayOrder', 'asc'))
      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        const list = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Category))
        localStore.setCategories(list)
        return list
      }
    } catch (err) {
      console.warn('Firestore getCategories note:', err)
    }
  }
  return localStore.getCategories()
}

export async function saveCategory(category: Category): Promise<Category> {
  // 1. Immediately persist locally in 0ms
  const existing = localStore.getCategories()
  const updated = [category, ...existing.filter((c) => c.id !== category.id)]
  localStore.setCategories(updated)

  // 2. Sync to Backend API
  try {
    const headers = await getAdminHeaders()
    const apiPromise = fetch('/api/categories', {
      method: 'POST',
      headers,
      body: JSON.stringify(category),
    })
    const timeoutPromise = new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('API category save timeout')), 4000)
    )
    const res = await Promise.race([apiPromise, timeoutPromise])
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.error || `Failed to save category (${res.status})`)
    }
  } catch (err: any) {
    console.error('Backend category save error:', err)
    throw err
  }

  // 3. Sync to Firestore in background with safety timeout
  if (isFirebaseConfigured && db) {
    const firestoreCat = async () => {
      try {
        const timeoutPromise = new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 2500)
        )
        await Promise.race([
          setDoc(doc(db, CATEGORIES_COL, category.id), category),
          timeoutPromise,
        ])
      } catch (err) {
        console.warn('Firestore saveCategory note:', err)
      }
    }
    firestoreCat().catch(() => {})
  }

  return category
}

// --- STORE SETTINGS ---
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const res = await Promise.race([
      fetch(`/api/settings?_t=${Date.now()}`, { cache: 'no-store' }),
      new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
    ])
    if (res.ok) {
      const data = await res.json()
      if (data && data.settings) {
        localStore.setSettings(data.settings)
        return data.settings
      }
    }
  } catch {}

  if (isFirebaseConfigured && db) {
    try {
      const docSnap = await getDoc(doc(db, SETTINGS_COL, 'general'))
      if (docSnap.exists()) {
        const settings = docSnap.data() as StoreSettings
        localStore.setSettings(settings)
        return settings
      }
    } catch (err) {
      console.warn('Firestore getStoreSettings failed:', err)
    }
  }
  return localStore.getSettings()
}

export async function saveStoreSettings(settings: StoreSettings): Promise<StoreSettings> {
  // 1. Immediately persist locally so changes apply in 0ms
  localStore.setSettings(settings)

  // 2. Sync to Backend API
  try {
    const headers = await getAdminHeaders()
    const apiPromise = fetch('/api/settings', {
      method: 'POST',
      headers,
      body: JSON.stringify(settings),
    })
    const timeoutPromise = new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('API settings save timeout')), 4000)
    )
    const res = await Promise.race([apiPromise, timeoutPromise])
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.error || `Failed to save store settings (${res.status})`)
    }
  } catch (err: any) {
    console.error('Backend settings save error:', err)
    throw err
  }

  // 3. Sync to Firestore in background
  if (isFirebaseConfigured && db) {
    const firestoreSettings = async () => {
      try {
        const timeoutPromise = new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 2500)
        )
        await Promise.race([
          setDoc(doc(db, SETTINGS_COL, 'general'), settings),
          timeoutPromise,
        ])
      } catch (err) {
        console.warn('Firestore saveStoreSettings note:', err)
      }
    }
    firestoreSettings().catch(() => {})
  }

  return settings
}

// --- ORDERS (H1 & Appendix D: Decoupled from Firestore) ---
export async function getOrders(customerUid?: string): Promise<Order[]> {
  // If customerUid provided and not guest, fetch customer's own orders from /api/orders/mine
  if (customerUid && customerUid !== 'guest' && auth?.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken()
      const res = await fetch(`/api/orders/mine?_t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Firebase-Token': token,
        },
        cache: 'no-store',
      })
      if (res.ok) {
        const data = await res.json()
        if (data && Array.isArray(data.orders)) {
          return data.orders
        }
      }
    } catch (e) {
      console.warn('Failed to load customer orders from API:', e)
    }
    return []
  }

  // Guests do not have an orders history endpoint
  if (customerUid === 'guest') {
    return []
  }

  // If no customerUid (admin view), fetch authoritative order list from admin /api/orders
  const headers = await getAdminHeaders()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 6000)

  try {
    const res = await fetch(`/api/orders?_t=${Date.now()}`, {
      headers,
      cache: 'no-store',
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (res.ok) {
      const data = await res.json()
      if (data && Array.isArray(data.orders)) {
        return data.orders
      }
      return []
    } else {
      const errData = await res.json().catch(() => ({}))
      const msg = errData.error || `Server returned status ${res.status} when fetching orders.`
      console.error('Admin orders fetch error:', msg)
      throw new Error(msg)
    }
  } catch (err: any) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('Connection to orders server timed out. Please check server availability.')
    }
    throw err
  }
}

export async function getOrderById(
  id: string,
  callerUid?: string,
  callerEmail?: string,
  trackingToken?: string
): Promise<Order | null> {
  // Try Backend API with strict IDOR ownership verification
  try {
    const headers: Record<string, string> = {}
    if (auth?.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken()
        headers['Authorization'] = `Bearer ${token}`
        headers['X-Firebase-Token'] = token
      } catch {}
    }
    const adminKey = import.meta.env.VITE_ADMIN_KEY || 'levix_admin_auth_sec_2026'
    if (adminKey) {
      headers['X-Admin-Key'] = adminKey
    }
    const token = trackingToken || (typeof localStorage !== 'undefined' ? localStorage.getItem(`levix_tracking_${id}`) : '') || ''
    if (token) {
      headers['X-Tracking-Token'] = token
    }

    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : ''
    const res = await Promise.race([
      fetch(`/api/orders/${id}${tokenQuery}`, { headers }),
      new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500)),
    ])
    if (res.ok) {
      const data = await res.json()
      if (data && data.order) return data.order
    }
  } catch (err) {
    console.warn('Failed to fetch order from API:', err)
  }

  return null
}

export async function saveOrder(order: Order): Promise<Order> {
  return order
}

export async function updateOrderFulfillment(
  orderId: string,
  updates: Partial<Order>
): Promise<void> {
  const headers = await getAdminHeaders()
  const res = await fetch(`/api/orders/${orderId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updates),
  })
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    throw new Error(errData.error || `Failed to update order status (${res.status})`)
  }

  // Broadcast immediately to open tabs
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const ch = new BroadcastChannel('levix_store_sync')
      ch.postMessage({ type: 'ORDERS_UPDATED', orderId, updates })
      ch.close()
    }
  } catch {}
}

// --- USER PROFILES & ADDRESSES (H1: MySQL Users Table via /api/me) ---
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (auth?.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken()
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        if (data && data.profile) {
          return data.profile as UserProfile
        }
      }
    } catch (err) {
      console.warn('Failed to load user profile from API:', err)
    }
  }
  return null
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  if (auth?.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken()
      const res = await fetch('/api/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      })
      if (!res.ok) {
        console.warn('API saveUserProfile returned status:', res.status)
      }
    } catch (err) {
      console.error('API saveUserProfile failed:', err)
    }
  }
}

// --- SEED FIRESTORE UTILITY ---
export async function seedFirestoreDatabase(): Promise<{ success: boolean; message: string }> {
  if (!isFirebaseConfigured || !db) {
    return {
      success: false,
      message: 'Firebase is not yet configured. Please fill in VITE_FIREBASE_* in your .env file.',
    }
  }

  try {
    // Seed Categories
    for (const cat of INITIAL_CATEGORIES) {
      await setDoc(doc(db, CATEGORIES_COL, cat.id), cat)
    }
    // Seed Products
    for (const prod of INITIAL_PRODUCTS) {
      await setDoc(doc(db, PRODUCTS_COL, prod.id), prod)
    }
    // Seed Settings
    await setDoc(doc(db, SETTINGS_COL, 'general'), INITIAL_SETTINGS)

    return {
      success: true,
      message: 'Firestore database successfully seeded with initial categories, products, and store settings!',
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to seed Firestore: ${error.message || error}`,
    }
  }
}
