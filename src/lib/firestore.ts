import { auth } from './firebase'
import { localStore } from './storage'
import type { Product, Category } from '../types/product'
import type { Order } from '../types/order'
import type { StoreSettings } from '../types/settings'
import type { UserProfile } from '../types/user'

/**
 * Generates admin authentication headers using verified Firebase Auth tokens.
 * Static master keys are deprecated and removed.
 */
export async function getAdminHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (auth?.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    } catch (e) {
      console.warn('Failed to retrieve Firebase ID token:', e)
    }
  }
  return headers
}

// In-Memory Short-Lived Cache (Deduplicates rapid concurrent paints, auto-invalidates on edit)
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

  if (productsCache) {
    return onlyPublished ? productsCache.data.filter((p) => p.isPublished) : productsCache.data
  }

  return []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await Promise.race([
      fetch(`/api/products/${encodeURIComponent(slug)}`),
      new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
    ])
    if (res.ok) {
      const data = await res.json()
      if (data && data.product) return data.product
    }
  } catch {}

  const products = await getProducts(false)
  return products.find((p) => p.slug === slug) || null
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const res = await Promise.race([
      fetch(`/api/products/${encodeURIComponent(id)}`),
      new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
    ])
    if (res.ok) {
      const data = await res.json()
      if (data && data.product) return data.product
    }
  } catch {}

  const products = await getProducts(false)
  return products.find((p) => p.id === id) || null
}

export async function saveProduct(product: Partial<Product> & { name: string }): Promise<Product> {
  invalidateProductsCache()

  const id = product.id || `prod-${Date.now()}`
  const now = new Date().toISOString()
  const fullProduct: Product = {
    id,
    name: product.name,
    slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    description: product.description || '',
    shortDescription: product.shortDescription || '',
    sku: product.sku || `SKU-${Date.now()}`,
    categoryId: product.categoryId || '',
    categoryName: product.categoryName || '',
    images: product.images || [],
    colorImages: product.colorImages || {},
    price: product.price || 0,
    salePrice: product.salePrice,
    stock: product.stock !== undefined ? product.stock : 0,
    hasVariants: Boolean(product.hasVariants),
    variants: product.variants || [],
    isPublished: product.isPublished !== undefined ? product.isPublished : true,
    isFeatured: Boolean(product.isFeatured),
    isNewArrival: Boolean(product.isNewArrival),
    isBestseller: Boolean(product.isBestseller),
    details: product.details || {},
    seoTitle: product.seoTitle || '',
    seoDescription: product.seoDescription || '',
    createdAt: product.createdAt || now,
    updatedAt: now,
  }

  // 1. Optimistic local cache update
  const existing = localStore.getProducts()
  const updated = [fullProduct, ...existing.filter((p) => p.id !== id)]
  localStore.setProducts(updated)

  // 2. Authoritative save to Backend MySQL API
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

  return fullProduct
}

export async function deleteProduct(id: string): Promise<void> {
  invalidateProductsCache()
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
}

// --- CATEGORIES ---
export async function getCategories(): Promise<Category[]> {
  try {
    const res = await Promise.race([
      fetch('/api/categories'),
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

  return localStore.getCategories()
}

export async function saveCategory(category: Category): Promise<Category> {
  const existing = localStore.getCategories()
  const updated = [category, ...existing.filter((c) => c.id !== category.id)]
  localStore.setCategories(updated)

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

  return category
}

// --- STORE SETTINGS ---
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const res = await Promise.race([
      fetch('/api/settings'),
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

  return localStore.getSettings()
}

export async function saveStoreSettings(settings: StoreSettings): Promise<StoreSettings> {
  localStore.setSettings(settings)

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

  return settings
}

// --- ORDERS ---
export async function getOrders(customerUid?: string): Promise<Order[]> {
  if (customerUid && customerUid !== 'guest' && auth?.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken()
      const res = await fetch('/api/orders/mine', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  if (customerUid === 'guest') {
    return []
  }

  const headers = await getAdminHeaders()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 6000)

  try {
    const res = await fetch('/api/orders', {
      headers,
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
  _callerUid?: string,
  _callerEmail?: string,
  trackingToken?: string
): Promise<Order | null> {
  try {
    const headers: Record<string, string> = {}
    if (auth?.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken()
        headers['Authorization'] = `Bearer ${token}`
      } catch {}
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

  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const ch = new BroadcastChannel('levix_store_sync')
      ch.postMessage({ type: 'ORDERS_UPDATED', orderId, updates })
      ch.close()
    }
  } catch {}
}

// --- USER PROFILES & ADDRESSES ---
export async function getUserProfile(_uid?: string): Promise<UserProfile | null> {
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

// Database Seeding Helper (Invokes backend seeding endpoint)
export async function seedFirestoreDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    const headers = await getAdminHeaders()
    const res = await fetch('/api/admin/seed', {
      method: 'POST',
      headers,
    })
    if (res.ok) {
      return {
        success: true,
        message: 'Database successfully seeded with initial categories, products, and store settings via MySQL API.',
      }
    }
    const errData = await res.json().catch(() => ({}))
    return {
      success: false,
      message: errData.error || 'Server seeding endpoint failed.',
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to seed database: ${error.message || error}`,
    }
  }
}
