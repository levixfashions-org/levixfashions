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

// --- PRODUCTS ---
export async function getProducts(onlyPublished = true): Promise<Product[]> {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, PRODUCTS_COL)
      const q = onlyPublished
        ? query(colRef, where('isPublished', '==', true))
        : query(colRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Product))
      }
    } catch (err) {
      console.warn('Firestore getProducts failed, falling back to localStore:', err)
    }
  }
  const local = localStore.getProducts()
  return onlyPublished ? local.filter((p) => p.isPublished) : local
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
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
  const local = localStore.getProducts()
  return local.find((p) => p.slug === slug) || null
}

export async function getProductById(id: string): Promise<Product | null> {
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
  const local = localStore.getProducts()
  return local.find((p) => p.id === id) || null
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

  if (isFirebaseConfigured && db) {
    try {
      const sanitized = cleanData({
        ...fullProduct,
        updatedAt: serverTimestamp(),
      })
      await setDoc(doc(db, PRODUCTS_COL, id), sanitized)
    } catch (err) {
      console.error('Failed to save product to Firestore:', err)
    }
  }

  // Update local storage
  const existing = localStore.getProducts()
  const updated = [fullProduct, ...existing.filter((p) => p.id !== id)]
  localStore.setProducts(updated)
  return fullProduct
}

export async function deleteProduct(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, PRODUCTS_COL, id))
    } catch (err) {
      console.error('Failed to delete product from Firestore:', err)
    }
  }
  const existing = localStore.getProducts()
  localStore.setProducts(existing.filter((p) => p.id !== id))
}

// --- CATEGORIES ---
export async function getCategories(): Promise<Category[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, CATEGORIES_COL), orderBy('displayOrder', 'asc'))
      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Category))
      }
    } catch (err) {
      console.warn('Firestore getCategories failed, using fallback:', err)
    }
  }
  return localStore.getCategories()
}

export async function saveCategory(category: Category): Promise<Category> {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, CATEGORIES_COL, category.id), category)
    } catch (err) {
      console.error('Failed to save category to Firestore:', err)
    }
  }
  const existing = localStore.getCategories()
  const updated = [category, ...existing.filter((c) => c.id !== category.id)]
  localStore.setCategories(updated)
  return category
}

// --- STORE SETTINGS ---
export async function getStoreSettings(): Promise<StoreSettings> {
  if (isFirebaseConfigured && db) {
    try {
      const docSnap = await getDoc(doc(db, SETTINGS_COL, 'general'))
      if (docSnap.exists()) {
        return docSnap.data() as StoreSettings
      }
    } catch (err) {
      console.warn('Firestore getStoreSettings failed:', err)
    }
  }
  return localStore.getSettings()
}

export async function saveStoreSettings(settings: StoreSettings): Promise<StoreSettings> {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, SETTINGS_COL, 'general'), settings)
    } catch (err) {
      console.error('Failed to save store settings to Firestore:', err)
    }
  }
  localStore.setSettings(settings)
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

export async function getOrderById(id: string): Promise<Order | null> {
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
  const local = localStore.getOrders()
  return local.find((o) => o.id === id || o.orderNumber === id) || null
}

export async function saveOrder(order: Order): Promise<Order> {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, ORDERS_COL, order.id), {
        ...order,
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error('Failed to save order to Firestore:', err)
    }
  }
  localStore.saveOrder(order)
  return order
}

export async function updateOrderFulfillment(
  orderId: string,
  updates: Partial<Order>
): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, ORDERS_COL, orderId), {
        ...updates,
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error('Failed to update order in Firestore:', err)
    }
  }
  const existing = localStore.getOrders()
  const order = existing.find((o) => o.id === orderId)
  if (order) {
    localStore.updateOrder({ ...order, ...updates, updatedAt: new Date().toISOString() })
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
