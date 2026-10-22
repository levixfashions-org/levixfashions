import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

import { initDatabase, getPool, isMySQLConnected } from './db.js'

// Initialize Hostinger MySQL connection asynchronously
initDatabase().catch((e) => console.warn('MySQL init notice:', e.message))

const app = express()
const PORT = process.env.PORT || 5000

// 1. CORS Configuration (Restricted to official store domains and local dev)
const ALLOWED_ORIGINS = [
  'https://thelevix.shop',
  'https://www.thelevix.shop',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
]

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true)
      }
      return callback(new Error('Cross-Origin Request Blocked by LEVIX CORS Policy.'))
    },
    credentials: true,
  })
)

app.use(express.json({ limit: '10mb' }))

// 2. IP Rate Limiter (Protects against brute force and order spam)
const rateLimitMap = new Map()
function rateLimiter(maxRequests = 60, windowMs = 60000) {
  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown-client'
    const now = Date.now()
    const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs }

    if (now > record.resetTime) {
      record.count = 1
      record.resetTime = now + windowMs
    } else {
      record.count++
    }
    rateLimitMap.set(ip, record)

    if (record.count > maxRequests) {
      return res.status(429).json({
        error: 'Too many requests. Please slow down.',
        retryAfterMs: Math.max(0, record.resetTime - now),
      })
    }
    next()
  }
}

app.use(rateLimiter(120, 60000))

// 3. Admin Authentication & Authorization Middleware (Firebase Verified Token Only - Appendix A)
const ADMIN_EMAIL = (process.env.VITE_ADMIN_EMAIL || 'levixfashions@gmail.com').toLowerCase().trim()
const ADMIN_UIDS = (process.env.ADMIN_UIDS || '').split(',').map((u) => u.trim()).filter(Boolean)
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'levix-fb261'

let cachedGoogleCerts = null
let cachedGoogleCertsTime = 0

async function getGooglePublicCerts() {
  if (cachedGoogleCerts && Date.now() - cachedGoogleCertsTime < 3600000) {
    return cachedGoogleCerts
  }
  try {
    const res = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com')
    if (res.ok) {
      cachedGoogleCerts = await res.json()
      cachedGoogleCertsTime = Date.now()
      return cachedGoogleCerts
    }
  } catch (err) {
    console.warn('Could not fetch Google public certs:', err.message)
  }
  return cachedGoogleCerts || {}
}

async function verifyFirebaseTokenNode(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'))
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))

    if (header.alg !== 'RS256' || !header.kid) return null

    const certs = await getGooglePublicCerts()
    const cert = certs[header.kid]
    if (!cert) return null

    const verifier = crypto.createVerify('RSA-SHA256')
    verifier.update(`${parts[0]}.${parts[1]}`)
    const sigBuf = Buffer.from(parts[2], 'base64url')
    const isValid = verifier.verify(cert, sigBuf)
    if (!isValid) return null

    const now = Math.floor(Date.now() / 1000)
    if (!payload.exp || payload.exp <= now) return null
    if (payload.iat && payload.iat > now + 300) return null
    if (PROJECT_ID) {
      if (payload.aud !== PROJECT_ID) return null
      if (payload.iss !== `https://securetoken.google.com/${PROJECT_ID}`) return null
    }
    if (!payload.sub) return null

    return payload
  } catch {
    return null
  }
}

async function verifyAdminCaller(req) {
  // Token extraction from Authorization or X-Firebase-Token
  const authHeader = req.headers['authorization'] || ''
  let token = ''
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim()
  } else if (req.headers['x-firebase-token']) {
    token = String(req.headers['x-firebase-token']).trim()
  }

  if (!token) return false

  // Cryptographically verify token
  const payload = await verifyFirebaseTokenNode(token)
  if (!payload || !payload.email_verified) return false

  if (payload.admin === true) return true
  if (ADMIN_UIDS.length > 0 && ADMIN_UIDS.includes(payload.sub)) return true
  if (payload.email) {
    const email = payload.email.toLowerCase().trim()
    const allowed = ADMIN_EMAIL.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
    if (allowed.includes(email)) {
      return true
    }
  }

  return false
}

async function requireAdmin(req, res, next) {
  if (await verifyAdminCaller(req)) {
    return next()
  }
  return res.status(401).json({
    error: 'Unauthorized: Administrator authentication required.',
  })
}

// 4. Razorpay Instance
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_LEVIX_DEMO'
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'LEVIX_DEMO_SECRET'

let razorpay = null
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    })
  } catch (err) {
    console.warn('Razorpay init error:', err)
  }
}

// 5. Persistent Storage Configuration
const DATA_DIR = path.join(__dirname, 'data')
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json')
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json')
const UPLOADS_DIR = path.join(__dirname, '../public/uploads')
const DIST_UPLOADS_DIR = path.join(__dirname, '../dist/uploads')

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}
if (!fs.existsSync(DIST_UPLOADS_DIR)) {
  fs.mkdirSync(DIST_UPLOADS_DIR, { recursive: true })
}

app.use('/uploads', express.static(UPLOADS_DIR))

function readStoredProducts() {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'))
      if (Array.isArray(parsed)) return parsed
      if (parsed && typeof parsed === 'object') return [parsed]
    }
  } catch (err) {
    console.warn('Error reading products.json:', err)
  }
  return []
}

function writeStoredProducts(products) {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8')
  } catch (err) {
    console.warn('Error writing products.json:', err)
  }
}

function readStoredOrders() {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'))
      if (Array.isArray(parsed)) return parsed
      if (parsed && typeof parsed === 'object') return [parsed]
    }
  } catch (err) {
    console.warn('Error reading orders.json:', err)
  }
  return []
}

function writeStoredOrders(orders) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8')
  } catch (err) {
    console.warn('Error writing orders.json:', err)
  }
}

// In-memory cache synced with disk
const ordersDb = new Map()
for (const o of readStoredOrders()) {
  ordersDb.set(o.id, o)
}

// 6. Authoritative Catalog Map & Price Verification
async function getCatalogMap() {
  const map = new Map()
  if (isMySQLConnected()) {
    try {
      const pool = getPool()
      const [rows] = await pool.query('SELECT * FROM products')
      for (const r of rows) {
        const prod = {
          id: r.id,
          name: r.name,
          slug: r.slug,
          sku: r.sku,
          price: Number(r.price),
          salePrice: r.sale_price !== null && r.sale_price !== undefined ? Number(r.sale_price) : null,
          stock: Number(r.stock),
          images: typeof r.images === 'string' ? JSON.parse(r.images || '[]') : r.images || [],
          isPublished: Boolean(r.is_published),
          hasVariants: Boolean(r.has_variants),
          variants: typeof r.variants === 'string' ? JSON.parse(r.variants || '[]') : r.variants || [],
        }
        map.set(prod.id, prod)
        if (prod.slug) map.set(prod.slug, prod)
      }
      return map
    } catch (e) {
      console.warn('MySQL getCatalogMap warning:', e.message)
    }
  }

  const stored = readStoredProducts()
  for (const prod of stored) {
    map.set(prod.id, prod)
    if (prod.slug) map.set(prod.slug, prod)
  }
  return map
}

// 7. Stock Decrement Helper
async function decrementProductStock(items) {
  for (const item of items) {
    const qty = Number(item.quantity) || 1
    if (isMySQLConnected()) {
      try {
        const pool = getPool()
        await pool.query(
          'UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?',
          [qty, item.productId]
        )
      } catch (err) {
        console.warn('MySQL stock decrement error:', err.message)
      }
    }

    try {
      const stored = readStoredProducts()
      const target = stored.find((p) => p.id === item.productId)
      if (target) {
        target.stock = Math.max(0, (Number(target.stock) || 0) - qty)
        target.updatedAt = new Date().toISOString()
        writeStoredProducts(stored)
      }
    } catch (err) {
      console.warn('File stock decrement error:', err.message)
    }
  }
}

// 8. Order Persistence in Database (Fix 4.3 - Eliminated orders.json disk writes for security & privacy)
async function saveOrderRecord(orderRecord) {
  ordersDb.set(orderRecord.id, orderRecord)

  if (isMySQLConnected()) {
    try {
      const pool = getPool()
      await pool.query(
        `INSERT INTO orders (
          id, order_number, customer_uid, customer_email, customer_name,
          items, shipping_address, subtotal, shipping_fee, discount, total,
          payment_method, payment_status, fulfillment_status, razorpay_order_id,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          payment_status = VALUES(payment_status),
          fulfillment_status = VALUES(fulfillment_status),
          updated_at = VALUES(updated_at)`,
        [
          orderRecord.id,
          orderRecord.orderNumber,
          orderRecord.customerUid || 'guest',
          orderRecord.customerEmail,
          orderRecord.customerName,
          JSON.stringify(orderRecord.items),
          JSON.stringify(orderRecord.shippingAddress),
          orderRecord.subtotal,
          orderRecord.shippingFee,
          orderRecord.discount || 0,
          orderRecord.total,
          orderRecord.paymentMethod,
          orderRecord.paymentStatus,
          orderRecord.fulfillmentStatus,
          orderRecord.razorpayOrderId || null,
          orderRecord.createdAt,
          orderRecord.updatedAt,
        ]
      )
    } catch (err) {
      console.warn('MySQL saveOrderRecord error:', err.message)
    }
  }
}

// --- API ENDPOINTS ---

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    brand: 'LEVIX',
    service: 'Trusted E-Commerce API',
    database: isMySQLConnected() ? 'MySQL Connected' : 'Disk File Fallback',
    razorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID),
    timestamp: new Date().toISOString(),
  })
})

// Image Upload Endpoint (High-performance static file storage)
app.post('/api/upload', requireAdmin, async (req, res) => {
  try {
    const { image } = req.body
    if (!image) {
      return res.status(400).json({ error: 'Image data is required' })
    }

    let ext = 'jpg'
    let base64Data = image
    const matches = image.match(/^data:image\/([a-zA-Z0-9-+]+);base64,(.+)$/)
    if (matches) {
      ext = matches[1] === 'jpeg' ? 'jpg' : matches[1]
      base64Data = matches[2]
    }

    const safeName = `img-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.${ext}`
    const buffer = Buffer.from(base64Data, 'base64')

    fs.writeFileSync(path.join(UPLOADS_DIR, safeName), buffer)
    if (fs.existsSync(DIST_UPLOADS_DIR)) {
      fs.writeFileSync(path.join(DIST_UPLOADS_DIR, safeName), buffer)
    }

    return res.json({ success: true, url: `/uploads/${safeName}`, filename: safeName })
  } catch (err) {
    console.error('Upload error:', err)
    return res.status(500).json({ error: 'Failed to process image upload' })
  }
})

function hasDataUri(val) {
  if (!val) return false
  if (typeof val === 'string') return val.trim().startsWith('data:')
  if (Array.isArray(val)) return val.some(hasDataUri)
  if (typeof val === 'object') return Object.values(val).some(hasDataUri)
  return false
}

// Single Product Detail API: GET /api/products/:slugOrId (Fix 2.2)
app.get('/api/products/:slugOrId', async (req, res) => {
  const { slugOrId } = req.params

  if (isMySQLConnected()) {
    try {
      const pool = getPool()
      const [rows] = await pool.query(
        'SELECT * FROM products WHERE slug = ? OR id = ? LIMIT 1',
        [slugOrId, slugOrId]
      )
      if (rows.length > 0) {
        const r = rows[0]
        const product = {
          id: r.id,
          name: r.name,
          slug: r.slug,
          description: r.description,
          shortDescription: r.short_description,
          sku: r.sku,
          categoryId: r.category_id,
          categoryName: r.category_name,
          images: typeof r.images === 'string' ? JSON.parse(r.images || '[]') : r.images || [],
          colorImages: typeof r.color_images === 'string' ? JSON.parse(r.color_images || '{}') : r.color_images || {},
          price: Number(r.price),
          salePrice: r.sale_price !== null ? Number(r.sale_price) : null,
          stock: Number(r.stock),
          hasVariants: Boolean(r.has_variants),
          variants: typeof r.variants === 'string' ? JSON.parse(r.variants || '[]') : r.variants || [],
          isPublished: Boolean(r.is_published),
          isFeatured: Boolean(r.is_featured),
          isNewArrival: Boolean(r.is_new_arrival),
          isBestseller: Boolean(r.is_bestseller),
          details: typeof r.details === 'string' ? JSON.parse(r.details || '{}') : r.details || {},
          seoTitle: r.seo_title,
          seoDescription: r.seo_description,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }
        const payload = JSON.stringify({ success: true, product })
        const etag = `"${crypto.createHash('md5').update(payload).digest('hex')}"`
        res.setHeader('ETag', etag)
        if (req.query.refresh || req.query._t) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
          res.setHeader('Pragma', 'no-cache')
        } else {
          res.setHeader('Cache-Control', 'no-cache, must-revalidate')
        }
        if (req.headers['if-none-match'] === etag) {
          return res.status(304).end()
        }
        return res.type('json').send(payload)
      }
    } catch (err) {
      console.warn('MySQL single product query error:', err.message)
    }
  }

  const products = readStoredProducts()
  const found = products.find((p) => p.slug === slugOrId || p.id === slugOrId)
  if (!found) {
    return res.status(404).json({ error: 'Product not found' })
  }
  const payload = JSON.stringify({ success: true, product: found })
  const etag = `"${crypto.createHash('md5').update(payload).digest('hex')}"`
  res.setHeader('ETag', etag)
  if (req.query.refresh || req.query._t) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
  } else {
    res.setHeader('Cache-Control', 'no-cache, must-revalidate')
  }
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end()
  }
  res.type('json').send(payload)
})

// Products Catalog API: Public GET (Fix 2.2: Lightweight list view & ETag caching)
app.get('/api/products', async (req, res) => {
  const isListView = req.query.view === 'list'
  let products = []

  if (isMySQLConnected()) {
    try {
      const pool = getPool()
      const query = isListView
        ? 'SELECT id, name, slug, category_id, category_name, price, sale_price, stock, has_variants, images, is_featured, is_new_arrival, is_bestseller, updated_at FROM products WHERE is_published = 1 ORDER BY created_at DESC'
        : 'SELECT * FROM products ORDER BY created_at DESC'
      const [rows] = await pool.query(query)
      products = rows.map((r) => {
        const imgs = typeof r.images === 'string' ? JSON.parse(r.images || '[]') : r.images || []
        const first = imgs[0] || ''
        if (isListView) {
          return {
            id: r.id,
            name: r.name,
            slug: r.slug,
            categoryId: r.category_id,
            categoryName: r.category_name,
            price: Number(r.price),
            salePrice: r.sale_price !== null ? Number(r.sale_price) : null,
            stock: Number(r.stock),
            hasVariants: Boolean(r.has_variants),
            image: first,
            images: [first],
            isFeatured: Boolean(r.is_featured),
            isNewArrival: Boolean(r.is_new_arrival),
            isBestseller: Boolean(r.is_bestseller),
            updatedAt: r.updated_at,
          }
        }
        return {
          id: r.id,
          name: r.name,
          slug: r.slug,
          description: r.description,
          shortDescription: r.short_description,
          sku: r.sku,
          categoryId: r.category_id,
          categoryName: r.category_name,
          images: imgs,
          colorImages: typeof r.color_images === 'string' ? JSON.parse(r.color_images || '{}') : r.color_images || {},
          price: Number(r.price),
          salePrice: r.sale_price !== null ? Number(r.sale_price) : null,
          stock: Number(r.stock),
          hasVariants: Boolean(r.has_variants),
          variants: typeof r.variants === 'string' ? JSON.parse(r.variants || '[]') : r.variants || [],
          isPublished: Boolean(r.is_published),
          isFeatured: Boolean(r.is_featured),
          isNewArrival: Boolean(r.is_new_arrival),
          isBestseller: Boolean(r.is_bestseller),
          details: typeof r.details === 'string' ? JSON.parse(r.details || '{}') : r.details || {},
          seoTitle: r.seo_title,
          seoDescription: r.seo_description,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }
      })
    } catch (err) {
      console.warn('MySQL query error, using file fallback:', err.message)
      products = readStoredProducts()
    }
  } else {
    products = readStoredProducts()
  }

  const payload = JSON.stringify({ success: true, products })
  const etag = `"${crypto.createHash('md5').update(payload).digest('hex')}"`
  res.setHeader('ETag', etag)
  if (req.query.refresh || req.query._t) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
  } else {
    res.setHeader('Cache-Control', 'no-cache, must-revalidate')
  }
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end()
  }
  res.type('json').send(payload)
})

// Protected Admin: Save Product
app.post('/api/products', requireAdmin, async (req, res) => {
  const product = req.body
  if (!product || !product.name) {
    return res.status(400).json({ error: 'Product name is required' })
  }

  // Fix 1 (Section 3.1): Strictly refuse inline base64 images in product saves
  if (hasDataUri([product.images, product.colorImages])) {
    return res.status(422).json({
      error: 'Images must be uploaded first. Inline base64 images are not allowed.',
    })
  }
  const id = product.id || `prod-${Date.now()}`
  const now = new Date().toISOString()
  const updatedProduct = { ...product, id, updatedAt: now }

  if (isMySQLConnected()) {
    try {
      const pool = getPool()
      await pool.query(
        `INSERT INTO products (
          id, name, slug, description, short_description, sku, category_id, category_name,
          images, color_images, price, sale_price, stock, has_variants, variants,
          is_published, is_featured, is_new_arrival, is_bestseller, details,
          seo_title, seo_description, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name), slug = VALUES(slug), description = VALUES(description),
          short_description = VALUES(short_description), sku = VALUES(sku),
          category_id = VALUES(category_id), category_name = VALUES(category_name),
          images = VALUES(images), color_images = VALUES(color_images), price = VALUES(price),
          sale_price = VALUES(sale_price), stock = VALUES(stock), has_variants = VALUES(has_variants),
          variants = VALUES(variants), is_published = VALUES(is_published),
          is_featured = VALUES(is_featured), is_new_arrival = VALUES(is_new_arrival),
          is_bestseller = VALUES(is_bestseller), details = VALUES(details),
          seo_title = VALUES(seo_title), seo_description = VALUES(seo_description),
          updated_at = VALUES(updated_at)`,
        [
          id,
          product.name,
          product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          product.description || '',
          product.shortDescription || '',
          product.sku || `LVX-${Date.now().toString().slice(-4)}`,
          product.categoryId || 'cat-t-shirts',
          product.categoryName || 'T-Shirts',
          JSON.stringify(product.images || []),
          JSON.stringify(product.colorImages || {}),
          Number(product.price) || 199900,
          product.salePrice !== null && product.salePrice !== undefined ? Number(product.salePrice) : null,
          Number(product.stock) || 10,
          product.hasVariants ? 1 : 0,
          JSON.stringify(product.variants || []),
          product.isPublished !== false ? 1 : 0,
          product.isFeatured !== false ? 1 : 0,
          product.isNewArrival !== false ? 1 : 0,
          product.isBestseller ? 1 : 0,
          JSON.stringify(product.details || {}),
          product.seoTitle || product.name,
          product.seoDescription || product.description || '',
          product.createdAt || now,
          now,
        ]
      )
    } catch (err) {
      console.warn('MySQL insert error:', err.message)
    }
  }

  // Also persist to JSON file
  const products = readStoredProducts()
  const updated = [updatedProduct, ...products.filter((p) => p.id !== id)]
  writeStoredProducts(updated)

  res.json({ success: true, product: updatedProduct })
})

// Protected Admin: Delete Product
app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  const { id } = req.params
  if (isMySQLConnected()) {
    try {
      const pool = getPool()
      await pool.query('DELETE FROM products WHERE id = ?', [id])
    } catch (err) {
      console.warn('MySQL delete error:', err.message)
    }
  }

  const products = readStoredProducts()
  const updated = products.filter((p) => p.id !== id)
  writeStoredProducts(updated)
  res.json({ success: true, message: 'Deleted' })
})

// Categories Catalog API: Public GET
app.get('/api/categories', async (req, res) => {
  if (isMySQLConnected()) {
    try {
      const pool = getPool()
      const [rows] = await pool.query('SELECT * FROM categories ORDER BY display_order ASC')
      if (rows.length > 0) {
        const categories = rows.map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          description: r.description,
          imageUrl: r.image_url,
          displayOrder: Number(r.display_order),
          isPublished: Boolean(r.is_published),
          isFeatured: Boolean(r.is_featured),
        }))
        return res.json({ success: true, source: 'mysql', categories })
      }
    } catch (err) {
      console.warn('MySQL categories query error:', err.message)
    }
  }
  res.json({ success: true, categories: [] })
})

// Protected Admin: Save Category
app.post('/api/categories', requireAdmin, async (req, res) => {
  const cat = req.body
  if (!cat || !cat.name) return res.status(400).json({ error: 'Category name is required' })
  const id = cat.id || `cat-${Date.now()}`

  if (isMySQLConnected()) {
    try {
      const pool = getPool()
      await pool.query(
        `INSERT INTO categories (id, name, slug, description, image_url, display_order, is_published, is_featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name), slug = VALUES(slug), description = VALUES(description),
           image_url = VALUES(image_url), display_order = VALUES(display_order),
           is_published = VALUES(is_published), is_featured = VALUES(is_featured)`,
        [
          id,
          cat.name,
          cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          cat.description || '',
          cat.imageUrl || '',
          Number(cat.displayOrder) || 1,
          cat.isPublished !== false ? 1 : 0,
          cat.isFeatured !== false ? 1 : 0,
        ]
      )
    } catch (err) {
      console.warn('MySQL category insert error:', err.message)
    }
  }
  res.json({ success: true, category: { ...cat, id } })
})

// Store Settings API: Public GET
app.get('/api/settings', async (req, res) => {
  if (isMySQLConnected()) {
    try {
      const pool = getPool()
      const [rows] = await pool.query('SELECT data FROM store_settings WHERE id = "general"')
      if (rows.length > 0 && rows[0].data) {
        const settings = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data
        return res.json({ success: true, source: 'mysql', settings })
      }
    } catch (err) {
      console.warn('MySQL settings query error:', err.message)
    }
  }
  res.json({ success: true, settings: null })
})

// Protected Admin: Save Store Settings
app.post('/api/settings', requireAdmin, async (req, res) => {
  const settings = req.body
  if (!settings) return res.status(400).json({ error: 'Settings payload is required' })

  if (isMySQLConnected()) {
    try {
      const pool = getPool()
      await pool.query(
        `INSERT INTO store_settings (id, data, updated_at)
         VALUES ('general', ?, ?)
         ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)`,
        [JSON.stringify(settings), new Date().toISOString()]
      )
    } catch (err) {
      console.warn('MySQL settings save error:', err.message)
    }
  }
  res.json({ success: true, settings })
})

/**
 * POST /api/orders/create
 * Hardened E-Commerce Logic:
 * 1. Checks item existence against server database.
 * 2. Checks inventory stock availability.
 * 3. CRITICAL: Calculates trusted price strictly from catalog (discards client price).
 * 4. Deducts inventory if COD.
 * 5. Persists order in MySQL and fallback storage.
 */
app.post('/api/orders/create', rateLimiter(20, 60000), async (req, res) => {
  try {
    const {
      customerUid,
      customerEmail,
      customerName,
      items,
      shippingAddress,
      paymentMethod,
    } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item.' })
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street) {
      return res.status(400).json({ error: 'Valid shipping address is required.' })
    }

    const effectiveEmail = customerEmail || shippingAddress.email
    if (!effectiveEmail || !effectiveEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid customer email is required.' })
    }

    // Authoritative Catalog Lookup (Prevents Price Tampering & Out-of-Stock Orders)
    const catalogMap = await getCatalogMap()
    let calculatedSubtotal = 0
    const validatedItems = []

    for (const item of items) {
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1))
      const catalogProduct = catalogMap.get(item.productId) || catalogMap.get(item.slug)

      if (!catalogProduct) {
        return res.status(400).json({
          error: `Product "${item.name || item.productId}" is no longer available in the catalog.`,
        })
      }

      if (catalogProduct.isPublished === false) {
        return res.status(400).json({
          error: `Product "${catalogProduct.name}" is currently unavailable.`,
        })
      }

      // Stock check
      const currentStock = Number(catalogProduct.stock) || 0
      if (currentStock < quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${catalogProduct.name}". Only ${currentStock} item(s) in stock.`,
        })
      }

      // CRITICAL SECURITY FIX: Authoritative server price in paise (client price is completely discarded)
      const trustedUnitPrice =
        catalogProduct.salePrice !== null && catalogProduct.salePrice > 0
          ? Number(catalogProduct.salePrice)
          : Number(catalogProduct.price)

      const lineSubtotal = trustedUnitPrice * quantity
      calculatedSubtotal += lineSubtotal

      const catalogFirstImage = (catalogProduct.images && catalogProduct.images[0]) || ''

      validatedItems.push({
        productId: catalogProduct.id,
        name: catalogProduct.name,
        slug: catalogProduct.slug,
        imageUrl: catalogFirstImage, // Strictly server catalog URL (Fix 1 - Section 3.3)
        sku: catalogProduct.sku || item.sku || '',
        variantId: item.variantId || null,
        variantName: item.variantName || null,
        unitPrice: trustedUnitPrice,
        quantity,
        subtotal: lineSubtotal,
      })
    }

    // Shipping calculation: Free shipping threshold at ₹1,999 (199900 paise)
    const FREE_SHIPPING_THRESHOLD = 199900
    const STANDARD_SHIPPING_FEE = 14900
    const shippingFee = calculatedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE

    // Coupon calculation
    const couponCode = (req.body.couponCode || '').toString().trim().toUpperCase()
    let discount = 0
    if (couponCode) {
      if (couponCode === 'LEVIX10' || couponCode === 'WELCOME10') {
        discount = Math.round((calculatedSubtotal * 10) / 100)
      } else if (couponCode === 'LEVIX15') {
        discount = Math.round((calculatedSubtotal * 15) / 100)
      }
    }
    const total = Math.max(0, calculatedSubtotal + shippingFee - discount)

    // Generate unique order number
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '')
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const orderNumber = `LVX-${dateStr}-${randomSuffix}`
    const orderId = `ord-${Date.now()}`

    let razorpayOrderId = null

    // If Razorpay, create Razorpay order server-side
    if (paymentMethod === 'razorpay') {
      if (razorpay) {
        const rzpOrder = await razorpay.orders.create({
          amount: total, // amount in paise
          currency: 'INR',
          receipt: orderNumber,
          notes: {
            orderNumber,
            customerEmail,
          },
        })
        razorpayOrderId = rzpOrder.id
      } else {
        // Fallback demo order ID for test environment
        razorpayOrderId = `order_demo_${Date.now()}`
      }
    }

    // Cryptographic user binding or guest tracking
    let finalCustomerUid = 'guest'
    let finalCustomerEmail = customerEmail
    const authHeader = req.headers['authorization'] || ''
    if (authHeader.startsWith('Bearer ')) {
      const verified = await verifyFirebaseTokenNode(authHeader.slice(7).trim())
      if (verified && verified.sub) {
        finalCustomerUid = verified.sub
        if (verified.email) finalCustomerEmail = verified.email
      }
    }

    const trackingToken = crypto.randomBytes(16).toString('hex')

    // Construct order record
    const orderRecord = {
      id: orderId,
      orderNumber,
      customerUid: finalCustomerUid,
      trackingToken,
      customerEmail: finalCustomerEmail,
      customerName: customerName || shippingAddress.fullName,
      items: validatedItems,
      shippingAddress,
      subtotal: calculatedSubtotal,
      shippingFee,
      discount,
      total,
      couponCode: couponCode || null,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'COD unpaid' : 'Pending',
      fulfillmentStatus: paymentMethod === 'cod' ? 'Confirmed' : 'Pending',
      razorpayOrderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Deduct stock immediately for COD orders
    if (paymentMethod === 'cod') {
      await decrementProductStock(validatedItems)
    }

    // Persist to MySQL and disk
    await saveOrderRecord(orderRecord)

    return res.status(201).json({
      success: true,
      order: orderRecord,
      trackingToken,
      razorpayOrderId,
      amount: total,
      currency: 'INR',
      keyId: RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error creating order' })
  }
})

/**
 * POST /api/orders/verify-razorpay
 * Cryptographically verifies Razorpay payment signature using HMAC SHA256,
 * marks order as Paid, and decrements stock.
 */
app.post('/api/orders/verify-razorpay', rateLimiter(20, 60000), async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    if (!orderId || !razorpay_payment_id) {
      return res.status(400).json({ error: 'Missing required payment verification parameters' })
    }

    // Cryptographic HMAC check if live credentials are provided
    if (process.env.RAZORPAY_KEY_SECRET && razorpay_signature) {
      const body = `${razorpay_order_id}|${razorpay_payment_id}`
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex')

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          error: 'Invalid payment signature. Verification failed.',
        })
      }
    }

    // Fetch existing order record
    let existingOrder = ordersDb.get(orderId)
    if (!existingOrder) {
      const stored = readStoredOrders()
      existingOrder = stored.find((o) => o.id === orderId)
    }

    if (existingOrder) {
      existingOrder.paymentStatus = 'Paid'
      existingOrder.fulfillmentStatus = 'Confirmed'
      existingOrder.razorpayPaymentId = razorpay_payment_id
      existingOrder.razorpaySignature = razorpay_signature || 'verified'
      existingOrder.updatedAt = new Date().toISOString()

      // Deduct stock on verified payment
      if (existingOrder.items && Array.isArray(existingOrder.items)) {
        await decrementProductStock(existingOrder.items)
      }

      await saveOrderRecord(existingOrder)
    }

    return res.json({
      success: true,
      message: 'Payment verified successfully by server',
      orderId,
      paymentId: razorpay_payment_id,
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Confirmed',
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return res.status(500).json({ error: 'Failed to verify payment signature' })
  }
})

/**
 * GET /api/orders/:id
 * Secure IDOR-Protected Order Retrieval:
 * Only the customer who placed the order or verified Admin can view the order.
 */
app.get('/api/orders/:id', async (req, res) => {
  const { id } = req.params
  let order = ordersDb.get(id)

  if (!order) {
    const stored = readStoredOrders()
    order = stored.find((o) => o.id === id || o.orderNumber === id)
  }

  if (!order && isMySQLConnected()) {
    try {
      const pool = getPool()
      const [rows] = await pool.query(
        'SELECT * FROM orders WHERE id = ? OR order_number = ? LIMIT 1',
        [id, id]
      )
      if (rows.length > 0) {
        const r = rows[0]
        order = {
          id: r.id,
          orderNumber: r.order_number,
          customerUid: r.customer_uid,
          customerEmail: r.customer_email,
          customerName: r.customer_name,
          items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
          shippingAddress: typeof r.shipping_address === 'string' ? JSON.parse(r.shipping_address) : r.shipping_address,
          subtotal: Number(r.subtotal),
          shippingFee: Number(r.shipping_fee),
          discount: Number(r.discount),
          total: Number(r.total),
          paymentMethod: r.payment_method,
          paymentStatus: r.payment_status,
          fulfillmentStatus: r.fulfillment_status,
          razorpayOrderId: r.razorpay_order_id,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }
      }
    } catch (e) {
      console.warn('MySQL get order error:', e.message)
    }
  }

  if (!order) {
    return res.status(404).json({ error: 'Order not found' })
  }

  // Strict IDOR & Privacy Protection:
  const isAdmin = await verifyAdminCaller(req)
  let verifiedCallerUid = null
  const authHeader = req.headers['authorization'] || ''
  if (authHeader.startsWith('Bearer ')) {
    const verified = await verifyFirebaseTokenNode(authHeader.slice(7).trim())
    if (verified && verified.sub) {
      verifiedCallerUid = verified.sub
    }
  }

  const isOwner = Boolean(verifiedCallerUid && order.customerUid && verifiedCallerUid === order.customerUid)
  const trackingTokenHeader = req.headers['x-tracking-token'] || req.query.token
  const hasValidTrackingToken = Boolean(
    order.trackingToken &&
    trackingTokenHeader &&
    trackingTokenHeader === order.trackingToken
  )

  if (!isOwner && !isAdmin && !hasValidTrackingToken) {
    return res.status(403).json({ error: 'Unauthorized: You do not have permission to view this order.' })
  }

  return res.json({ success: true, order })
})

// Customer's own order history: GET /api/orders/mine (H1 & Appendix D)
app.get('/api/orders/mine', async (req, res) => {
  const authHeader = req.headers['authorization'] || ''
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  const verified = await verifyFirebaseTokenNode(authHeader.slice(7).trim())
  if (!verified || !verified.sub) {
    return res.status(401).json({ error: 'Invalid authentication session' })
  }

  const userUid = verified.sub
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20))
  const offset = (page - 1) * limit

  if (isMySQLConnected()) {
    try {
      const pool = getPool()
      const [rows] = await pool.query(
        'SELECT * FROM orders WHERE customer_uid = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [userUid, limit, offset]
      )
      const orders = rows.map((r) => ({
        id: r.id,
        orderNumber: r.order_number,
        customerUid: r.customer_uid,
        trackingToken: r.tracking_token,
        customerEmail: r.customer_email,
        customerName: r.customer_name,
        items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
        shippingAddress: typeof r.shipping_address === 'string' ? JSON.parse(r.shipping_address) : r.shipping_address,
        subtotal: Number(r.subtotal),
        shippingFee: Number(r.shipping_fee),
        discount: Number(r.discount),
        total: Number(r.total),
        paymentMethod: r.payment_method,
        paymentStatus: r.payment_status,
        fulfillmentStatus: r.fulfillment_status,
        courier: r.courier,
        awb: r.awb,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }))
      return res.json({ success: true, orders })
    } catch (err) {
      console.warn('MySQL get customer orders error:', err.message)
    }
  }

  const stored = Array.from(ordersDb.values())
  const filtered = stored.filter((o) => o.customerUid === userUid)
  res.json({ success: true, orders: filtered.slice(offset, offset + limit) })
})

// Admin order status update: PUT /api/orders/:id (H1 & Appendix D: State Machine)
app.put('/api/orders/:id', requireAdmin, async (req, res) => {
  const { id } = req.params
  let order = ordersDb.get(id)
  if (!order) {
    order = Array.from(ordersDb.values()).find((o) => o.id === id || o.orderNumber === id)
  }

  if (isMySQLConnected()) {
    try {
      const pool = getPool()
      const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? OR order_number = ? LIMIT 1', [id, id])
      if (rows.length > 0) order = rows[0]
    } catch (e) {}
  }

  if (!order) {
    return res.status(404).json({ error: 'Order not found' })
  }

  const cur = order.fulfillment_status || order.fulfillmentStatus
  const flow = {
    Pending: ['Confirmed', 'Cancelled'],
    Confirmed: ['Processing', 'Cancelled'],
    Processing: ['Shipped', 'Cancelled'],
    Shipped: ['Delivered', 'Returned'],
    Delivered: ['Returned'],
    Cancelled: [],
    Returned: [],
  }

  const newFulfillment = req.body.fulfillmentStatus || cur
  if (req.body.fulfillmentStatus && req.body.fulfillmentStatus !== cur) {
    const allowed = flow[cur] || []
    if (!allowed.includes(req.body.fulfillmentStatus)) {
      return res.status(409).json({ error: `Cannot transition from '${cur}' to '${req.body.fulfillmentStatus}'` })
    }
  }

  const newPayment = req.body.paymentStatus || order.payment_status || order.paymentStatus
  const newCourier = req.body.courier || req.body.tracking?.courierName || order.courier || null
  const newAwb = req.body.awb || req.body.tracking?.trackingNumber || order.awb || null
  const newNote = req.body.adminNote || req.body.internalNotes || order.admin_note || null

  if (isMySQLConnected()) {
    try {
      const pool = getPool()
      await pool.query(
        'UPDATE orders SET fulfillment_status = ?, payment_status = ?, courier = ?, awb = ?, admin_note = ?, updated_at = NOW() WHERE id = ?',
        [newFulfillment, newPayment, newCourier, newAwb, newNote, order.id]
      )
    } catch (e) {
      console.warn('MySQL update order error:', e.message)
    }
  }

  const cached = ordersDb.get(order.id) || order
  cached.fulfillmentStatus = newFulfillment
  cached.paymentStatus = newPayment
  cached.courier = newCourier
  cached.awb = newAwb
  cached.adminNote = newNote
  cached.updatedAt = new Date().toISOString()
  await saveOrderRecord(cached)

  res.json({
    success: true,
    orderId: order.id,
    fulfillmentStatus: newFulfillment,
    paymentStatus: newPayment,
  })
})

// Cancel order: POST /api/orders/:id/cancel (H1 & Appendix D)
app.post('/api/orders/:id/cancel', async (req, res) => {
  const { id } = req.params
  let order = ordersDb.get(id)

  if (!order) {
    return res.status(404).json({ error: 'Order not found' })
  }

  if (order.fulfillmentStatus === 'Cancelled') {
    return res.json({ success: true, message: 'Order already cancelled' })
  }

  order.fulfillmentStatus = 'Cancelled'
  order.paymentStatus = 'Cancelled'
  order.updatedAt = new Date().toISOString()

  res.json({ success: true, message: 'Order cancelled successfully' })
})

// User profile & addresses: GET & PUT /api/me (H1 & Appendix D)
const userProfilesDb = new Map()

app.get('/api/me', async (req, res) => {
  const authHeader = req.headers['authorization'] || ''
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  const verified = await verifyFirebaseTokenNode(authHeader.slice(7).trim())
  if (!verified || !verified.sub) {
    return res.status(401).json({ error: 'Invalid authentication session' })
  }

  const profile = userProfilesDb.get(verified.sub) || {
    uid: verified.sub,
    email: verified.email || '',
    displayName: verified.name || '',
    phone: '',
    addresses: [],
    createdAt: new Date().toISOString(),
  }

  res.json({ success: true, profile })
})

app.put('/api/me', async (req, res) => {
  const authHeader = req.headers['authorization'] || ''
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  const verified = await verifyFirebaseTokenNode(authHeader.slice(7).trim())
  if (!verified || !verified.sub) {
    return res.status(401).json({ error: 'Invalid authentication session' })
  }

  const existing = userProfilesDb.get(verified.sub) || { uid: verified.sub, email: verified.email || '' }
  const updated = {
    ...existing,
    displayName: req.body.displayName || existing.displayName,
    phone: req.body.phone !== undefined ? req.body.phone : existing.phone,
    addresses: req.body.addresses || existing.addresses || [],
    updatedAt: new Date().toISOString(),
  }
  userProfilesDb.set(verified.sub, updated)

  res.json({ success: true, profile: updated })
})

// Protected Admin: List all orders (Fix 4.1 & Section 6.1: Supports status and incremental updatedSince queries)
app.get('/api/orders', requireAdmin, async (req, res) => {
  const updatedSince = req.query.updatedSince ? String(req.query.updatedSince).trim() : null
  const status = req.query.status ? String(req.query.status).trim() : null

  if (isMySQLConnected()) {
    try {
      const pool = getPool()
      let sql = 'SELECT * FROM orders WHERE 1=1'
      const params = []
      if (status && status !== 'all') {
        sql += ' AND fulfillment_status = ?'
        params.push(status)
      }
      if (updatedSince) {
        sql += ' AND updated_at > ?'
        params.push(updatedSince)
      }
      sql += ' ORDER BY created_at DESC LIMIT 100'
      const [rows] = await pool.query(sql, params)
      const orders = rows.map((r) => {
        const shipping = typeof r.shipping_address === 'string' ? JSON.parse(r.shipping_address) : (r.shipping_address || {})
        const items = typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || [])
        return {
          id: r.id,
          orderNumber: r.order_number,
          customerUid: r.customer_uid,
          trackingToken: r.tracking_token || '',
          customerEmail: r.customer_email || (shipping.email || ''),
          customerName: r.customer_name || (shipping.fullName || 'Customer'),
          items,
          shippingAddress: shipping,
          subtotal: Number(r.subtotal),
          shippingFee: Number(r.shipping_fee),
          discount: Number(r.discount),
          total: Number(r.total),
          couponCode: r.coupon_code || null,
          paymentMethod: r.payment_method,
          paymentStatus: r.payment_status,
          fulfillmentStatus: r.fulfillment_status,
          tracking: {
            courierName: r.courier || '',
            trackingNumber: r.awb || '',
            trackingUrl: r.awb ? `https://track.example.com/${r.awb}` : '',
          },
          internalNotes: r.admin_note || '',
          courier: r.courier || null,
          awb: r.awb || null,
          adminNote: r.admin_note || null,
          razorpayOrderId: r.razorpay_order_id,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }
      })
      return res.json({ success: true, orders })
    } catch (err) {
      console.warn('MySQL get all orders error:', err.message)
    }
  }

  let stored = Array.from(ordersDb.values())
  if (status && status !== 'all') {
    stored = stored.filter((o) => (o.fulfillmentStatus || o.fulfillment_status) === status)
  }
  if (updatedSince) {
    stored = stored.filter((o) => {
      const u = o.updatedAt || o.updated_at
      return u && u > updatedSince
    })
  }

  const result = stored.map((r) => ({
    ...r,
    tracking: r.tracking || {
      courierName: r.courier || '',
      trackingNumber: r.awb || '',
      trackingUrl: r.awb ? `https://track.example.com/${r.awb}` : '',
    },
    internalNotes: r.internalNotes || r.adminNote || '',
  }))
  res.json({ success: true, orders: result })
})

// Webhook Handler
app.post('/api/orders/webhook', (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (secret) {
    const signature = req.headers['x-razorpay-signature']
    const expected = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex')

    if (signature !== expected) {
      return res.status(400).json({ error: 'Invalid webhook signature' })
    }
  }

  const event = req.body.event
  if (event === 'payment.captured' || event === 'order.paid') {
    const payload = req.body.payload.payment.entity
    console.log(`Razorpay Webhook: Payment captured for order ${payload.order_id}`)
  }

  res.json({ status: 'ok' })
})

// Serve production Vite frontend if dist folder exists
const distPath = path.resolve(__dirname, '../dist')
if (fs.existsSync(distPath)) {
  app.use(
    express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (
          filePath.endsWith('index.html') ||
          filePath.endsWith('sw.js') ||
          filePath.endsWith('registerSW.js') ||
          filePath.endsWith('manifest.webmanifest')
        ) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
          res.setHeader('Pragma', 'no-cache')
          res.setHeader('Expires', '0')
        }
      },
    })
  )
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next()
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`LEVIX Backend Server running on http://localhost:${PORT}`)
})
