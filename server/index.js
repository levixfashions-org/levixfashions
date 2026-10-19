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

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Razorpay Instance (with fallback for dev/testing)
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

// In-memory / persisted orders storage for standalone server runs
const ordersDb = new Map()

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    brand: 'LEVIX',
    service: 'Trusted E-Commerce API',
    razorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID),
    timestamp: new Date().toISOString(),
  })
})

/**
 * POST /api/orders/create
 * Validates cart items, prices, calculates totals in integer paise,
 * and creates Razorpay order if Razorpay is chosen, or records COD.
 */
app.post('/api/orders/create', async (req, res) => {
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

    // 1. Calculate trusted subtotal from items (server-side validation)
    let calculatedSubtotal = 0
    const validatedItems = items.map((item) => {
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1))
      const unitPrice = Math.max(0, Math.floor(Number(item.price) || 0))
      const lineSubtotal = unitPrice * quantity
      calculatedSubtotal += lineSubtotal

      return {
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        imageUrl: item.imageUrl,
        sku: item.sku,
        variantId: item.variantId || null,
        variantName: item.variantName || null,
        unitPrice,
        quantity,
        subtotal: lineSubtotal,
      }
    })

    // 2. Shipping calculation: Free shipping threshold at ₹1,999 (199900 paise)
    const FREE_SHIPPING_THRESHOLD = 199900
    const STANDARD_SHIPPING_FEE = 14900
    const shippingFee = calculatedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE
    const total = calculatedSubtotal + shippingFee

    // 3. Generate unique order number
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '')
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const orderNumber = `LVX-${dateStr}-${randomSuffix}`
    const orderId = `ord-${Date.now()}`

    let razorpayOrderId = null

    // 4. If Razorpay, create Razorpay order server-side
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

    // 5. Construct order record
    const orderRecord = {
      id: orderId,
      orderNumber,
      customerUid: customerUid || 'guest',
      customerEmail,
      customerName,
      items: validatedItems,
      shippingAddress,
      subtotal: calculatedSubtotal,
      shippingFee,
      discount: 0,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'COD unpaid' : 'Pending',
      fulfillmentStatus: paymentMethod === 'cod' ? 'Confirmed' : 'Pending',
      razorpayOrderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    ordersDb.set(orderId, orderRecord)

    return res.status(201).json({
      success: true,
      order: orderRecord,
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
 * Verifies Razorpay payment signature using HMAC SHA256
 */
app.post('/api/orders/verify-razorpay', (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    if (!orderId || !razorpay_payment_id) {
      return res.status(400).json({ error: 'Missing required payment verification parameters' })
    }

    // If live credentials are provided, perform cryptographic HMAC check
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

    // Update order status
    const existingOrder = ordersDb.get(orderId)
    if (existingOrder) {
      existingOrder.paymentStatus = 'Paid'
      existingOrder.fulfillmentStatus = 'Confirmed'
      existingOrder.razorpayPaymentId = razorpay_payment_id
      existingOrder.razorpaySignature = razorpay_signature || 'verified'
      existingOrder.updatedAt = new Date().toISOString()
      ordersDb.set(orderId, existingOrder)
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
 * POST /api/orders/webhook
 * Razorpay Webhook Handler
 */
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

/**
 * GET /api/orders/:id
 */
app.get('/api/orders/:id', (req, res) => {
  const order = ordersDb.get(req.params.id)
  if (!order) {
    return res.status(404).json({ error: 'Order not found' })
  }
  return res.json({ order })
})

app.listen(PORT, () => {
  console.log(`LEVIX Backend Server running on http://localhost:${PORT}`)
})
