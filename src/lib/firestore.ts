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
import { db, isFirebaseConfigured } from './firebase'
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

function getAdminHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-admin-key': 'levix_admin_auth_sec_2026',
  }
}

export async function getProducts(onlyPublished = true): Promise<Product[]> {
  // 1. Try to fetch from backend server (/api/products) for shared multi-device catalog
  try {
    const res = await Promise.race([
      fetch(`/api/products?_t=${Date.now()}`, { cache: 'no-store' }),
      new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('timeout')), 6000)),
    ])
    if (res.ok) {
      const data = await res.json()
      if (data && Array.isArray(data.products)) {
        // Authoritative source: overwrite localStore so deleted products do not resurrect
        localStore.setProducts(data.products)
        return onlyPublished ? data.products.filter((p: Product) => p.isPublished) : data.products
      }
    }
  } catch {
    // Backend API offline or static client run; continue to Firestore & local
  }

  // 2. Try Cloud Firestore
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, PRODUCTS_COL)
      const q = onlyPublished
        ? query(colRef, where('isPublished', '==', true))
        : query(colRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        const firestoreList = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Product))
        localStore.setProducts(firestoreList)
        return firestoreList
      }
    } catch (err) {
      console.warn('Firestore getProducts note (using local cache):', err)
    }
  }

  // 3. Fallback to LocalStorage
  const local = localStore.getProducts()
  return onlyPublished ? local.filter((p) => p.isPublished) : local
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  // 1. Check localStore first for instant response
  const local = localStore.getProducts()
  const foundLocal = local.find((p) => p.slug === slug)
  if (foundLocal) return foundLocal

  // 2. Fetch fresh catalog from backend API if not in localStore
  try {
    const products = await getProducts(false)
    const foundApi = products.find((p) => p.slug === slug)
    if (foundApi) return foundApi
  } catch {}

  // 3. Fallback to Cloud Firestore
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, PRODUCTS_COL), where('slug', '==', slug))
      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0]
        return { id: docSnap.id, ...docSnap.data() } as Product
      }
    } catch (err) {
      console.warn('Firestore getProductBySlug failed:', err)
    }
  }
  return null
}

export async function getProductById(id: string): Promise<Product | null> {
  // 1. Check localStore first
  const local = localStore.getProducts()
  const foundLocal = local.find((p) => p.id === id)
  if (foundLocal) return foundLocal

  // 2. Fetch fresh catalog from backend API
  try {
    const products = await getProducts(false)
    const foundApi = products.find((p) => p.id === id)
    if (foundApi) return foundApi
  } catch {}

  // 3. Fallback to Cloud Firestore
  if (isFirebaseConfigured && db) {
    try {
      const docSnap = await getDoc(doc(db, PRODUCTS_COL, id))
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product
      }
    } catch (err) {
      console.warn('Firestore getProductById failed:', err)
    }
  }
  return null
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
  const existing = localStore.getProducts()
  const updated = [fullProduct, ...existing.filter((p) => p.id !== id)]
  localStore.setProducts(updated)

  // 2. Sync to Backend Server API for multi-device instant sharing
  try {
    const apiPromise = fetch('/api/products', {
      method: 'POST',
      headers: getAdminHeaders(),
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
  const existing = localStore.getProducts()
  localStore.setProducts(existing.filter((p) => p.id !== id))

  try {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE', headers: getAdminHeaders() })
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
    const apiPromise = fetch('/api/categories', {
      method: 'POST',
      headers: getAdminHeaders(),
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
    const apiPromise = fetch('/api/settings', {
      method: 'POST',
      headers: getAdminHeaders(),
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

// --- ORDERS ---
export async function getOrders(customerUid?: string): Promise<Order[]> {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, ORDERS_COL)
      const q = customerUid
        ? query(colRef, where('customerUid', '==', customerUid), orderBy('createdAt', 'desc'))
        : query(colRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Order))
      }
    } catch (err) {
      console.warn('Firestore getOrders failed, using localStore:', err)
    }
  }
  const local = localStore.getOrders()
  return customerUid ? local.filter((o) => o.customerUid === customerUid) : local
}

export async function getOrderById(
  id: string,
  callerUid?: string,
  callerEmail?: string
): Promise<Order | null> {
  // 1. Try Backend API with ownership verification
  try {
    const headers: Record<string, string> = {}
    if (callerUid) headers['x-customer-uid'] = callerUid
    if (callerEmail) headers['x-customer-email'] = callerEmail

    const res = await Promise.race([
      fetch(`/api/orders/${id}`, { headers }),
      new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500)),
    ])
    if (res.ok) {
      const data = await res.json()
      if (data && data.order) return data.order
    }
  } catch {}

  // 2. Try Firestore
  if (isFirebaseConfigured && db) {
    try {
      const docSnap = await getDoc(doc(db, ORDERS_COL, id))
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Order
      }
    } catch (err) {
      console.warn('Firestore getOrderById failed:', err)
    }
  }

  // 3. Fallback to LocalStorage
  const local = localStore.getOrders()
  return local.find((o) => o.id === id || o.orderNumber === id) || null
}

export async function saveOrder(order: Order): Promise<Order> {
  localStore.saveOrder(order)

  if (isFirebaseConfigured && db) {
    const firestoreOrder = async () => {
      try {
        await setDoc(doc(db, ORDERS_COL, order.id), {
          ...order,
          updatedAt: serverTimestamp(),
        })
      } catch (err) {
        console.warn('Firestore saveOrder note:', err)
      }
    }
    firestoreOrder().catch(() => {})
  }

  return order
}

export async function updateOrderFulfillment(
  orderId: string,
  updates: Partial<Order>
): Promise<void> {
  // 1. Immediately update local store in 0ms
  const existing = localStore.getOrders()
  const order = existing.find((o) => o.id === orderId)
  if (order) {
    localStore.updateOrder({ ...order, ...updates, updatedAt: new Date().toISOString() })
  }

  // 2. Broadcast immediately to any open tabs
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const ch = new BroadcastChannel('levix_store_sync')
      ch.postMessage({ type: 'ORDERS_UPDATED', orderId, updates })
      ch.close()
    }
  } catch {}

  // 3. Sync to Firestore in background
  if (isFirebaseConfigured && db) {
    const firestoreOrder = async () => {
      try {
        const timeoutPromise = new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 2500)
        )
        await Promise.race([
          updateDoc(doc(db, ORDERS_COL, orderId), {
            ...updates,
            updatedAt: serverTimestamp(),
          }),
          timeoutPromise,
        ])
      } catch (err) {
        console.warn('Firestore updateOrder note:', err)
      }
    }
    firestoreOrder().catch(() => {})
  }
}

// --- USER PROFILES & ADDRESSES ---
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (isFirebaseConfigured && db) {
    try {
      const docSnap = await getDoc(doc(db, USERS_COL, uid))
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile
      }
    } catch (err) {
      console.warn('Firestore getUserProfile failed:', err)
    }
  }
  return null
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, USERS_COL, profile.uid), profile, { merge: true })
    } catch (err) {
      console.error('Firestore saveUserProfile failed:', err)
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
