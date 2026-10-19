import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'

// --- BUSINESS LOGIC HELPERS ---

function formatPrice(amountInPaise) {
  if (amountInPaise === undefined || amountInPaise === null || isNaN(amountInPaise)) {
    return '₹0'
  }
  const rupees = amountInPaise / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: amountInPaise % 100 === 0 ? 0 : 2,
  }).format(rupees)
}

function paiseToRupees(paise) {
  return Math.round((paise / 100) * 100) / 100
}

function rupeesToPaise(rupees) {
  return Math.round(rupees * 100)
}

function generateOrderNumber() {
  const prefix = 'LVX'
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${dateStr}-${random}`
}

function calculateOrderTotals(items, freeShippingThreshold = 199900, standardShippingFee = 14900) {
  let subtotal = 0
  for (const item of items) {
    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1))
    const price = Math.max(0, Math.floor(Number(item.price) || 0))
    subtotal += price * qty
  }
  const isFreeShipping = subtotal >= freeShippingThreshold
  const shippingFee = isFreeShipping ? 0 : standardShippingFee
  const total = subtotal + shippingFee
  return { subtotal, shippingFee, isFreeShipping, total }
}

function verifyRazorpaySignature(orderId, paymentId, signature, secret) {
  const body = `${orderId}|${paymentId}`
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return expected === signature
}

/**
 * Server-Side Price & Stock Validation Simulation
 * Mirrors hardened /api/orders/create
 */
function validateOrderItemsAgainstCatalog(clientItems, catalogMap) {
  let calculatedSubtotal = 0
  const validatedItems = []

  for (const item of clientItems) {
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1))
    const catalogProduct = catalogMap.get(item.productId)

    if (!catalogProduct) {
      throw new Error(`Product "${item.name}" is no longer available in catalog.`)
    }

    if (catalogProduct.isPublished === false) {
      throw new Error(`Product "${catalogProduct.name}" is currently unavailable.`)
    }

    if (catalogProduct.stock < quantity) {
      throw new Error(`Insufficient stock for "${catalogProduct.name}". Only ${catalogProduct.stock} available.`)
    }

    // Authoritative unit price in paise (client price is discarded)
    const trustedUnitPrice =
      catalogProduct.salePrice !== null && catalogProduct.salePrice > 0
        ? Number(catalogProduct.salePrice)
        : Number(catalogProduct.price)

    const lineSubtotal = trustedUnitPrice * quantity
    calculatedSubtotal += lineSubtotal

    validatedItems.push({
      productId: catalogProduct.id,
      name: catalogProduct.name,
      unitPrice: trustedUnitPrice,
      quantity,
      subtotal: lineSubtotal,
    })
  }

  const FREE_SHIPPING_THRESHOLD = 199900
  const STANDARD_SHIPPING_FEE = 14900
  const shippingFee = calculatedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE
  const total = calculatedSubtotal + shippingFee

  return { validatedItems, subtotal: calculatedSubtotal, shippingFee, total }
}

/**
 * IDOR / Access Control Simulation
 */
function canAccessOrder(order, callerUid, callerEmail, isAdmin) {
  if (isAdmin) return true
  if (callerUid && callerUid === order.customerUid) return true
  if (callerEmail && callerEmail.toLowerCase() === order.customerEmail?.toLowerCase()) return true
  if (order.customerUid === 'guest') return true
  return false
}

// --- TEST SUITES ---

describe('LEVIX E-Commerce Logic & Integrity Suite', () => {
  test('Integer Paise and Currency Formatting', () => {
    assert.equal(paiseToRupees(299900), 2999)
    assert.equal(rupeesToPaise(2999), 299900)

    const formatted = formatPrice(299900).replace(/\u00a0/g, ' ')
    assert.match(formatted, /₹\s?2,999/)
    assert.match(formatPrice(0).replace(/\u00a0/g, ' '), /₹\s?0/)
  })

  test('Order Number Generation Format', () => {
    const orderNum = generateOrderNumber()
    assert.match(orderNum, /^LVX-\d{6}-\d{4}$/)
  })

  test('Free Shipping Threshold Calculations', () => {
    // Below threshold (₹1,500 < ₹1,999): shipping applies
    const belowResult = calculateOrderTotals([{ price: 150000, quantity: 1 }], 199900, 14900)
    assert.equal(belowResult.subtotal, 150000)
    assert.equal(belowResult.shippingFee, 14900)
    assert.equal(belowResult.isFreeShipping, false)
    assert.equal(belowResult.total, 164900)

    // Above threshold (₹2,500 >= ₹1,999): free shipping
    const aboveResult = calculateOrderTotals([{ price: 250000, quantity: 1 }], 199900, 14900)
    assert.equal(aboveResult.subtotal, 250000)
    assert.equal(aboveResult.shippingFee, 0)
    assert.equal(aboveResult.isFreeShipping, true)
    assert.equal(aboveResult.total, 250000)
  })

  test('Razorpay HMAC SHA256 Signature Verification', () => {
    const secret = 'TEST_RAZORPAY_SECRET_12345'
    const orderId = 'order_test_9876'
    const paymentId = 'pay_test_5432'

    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    assert.equal(verifyRazorpaySignature(orderId, paymentId, validSignature, secret), true)
    assert.equal(verifyRazorpaySignature(orderId, paymentId, 'tampered_signature', secret), false)
  })

  test('Cart line item aggregation prevents negative quantity', () => {
    const items = [
      { price: 100000, quantity: -5 },
      { price: 200000, quantity: 2 },
    ]
    const result = calculateOrderTotals(items, 199900, 14900)
    assert.equal(result.subtotal, 100000 * 1 + 200000 * 2)
  })
})

describe('LEVIX Security & Defense Hardening Suite', () => {
  const catalog = new Map([
    [
      'prod-oversized-tee',
      {
        id: 'prod-oversized-tee',
        name: 'Heavyweight Minimal Tee',
        price: 199900, // ₹1,999
        salePrice: null,
        stock: 5,
        isPublished: true,
      },
    ],
    [
      'prod-hoodie-black',
      {
        id: 'prod-hoodie-black',
        name: 'French Terry Relaxed Hoodie',
        price: 349900, // ₹3,499
        salePrice: 299900, // on sale at ₹2,999
        stock: 2,
        isPublished: true,
      },
    ],
    [
      'prod-draft-item',
      {
        id: 'prod-draft-item',
        name: 'Unpublished Sample',
        price: 99900,
        salePrice: null,
        stock: 10,
        isPublished: false,
      },
    ],
  ])

  test('Price Tampering Defense: Discards client-side price manipulation', () => {
    // Attacker modifies request payload in browser DevTools to claim price = 1 paise
    const tamperedPayload = [
      {
        productId: 'prod-oversized-tee',
        name: 'Heavyweight Minimal Tee',
        price: 1, // Tampered ₹0.01!
        quantity: 1,
      },
    ]

    const validated = validateOrderItemsAgainstCatalog(tamperedPayload, catalog)

    // Server completely overrides the tampered price with the catalog price (199900)
    assert.equal(validated.validatedItems[0].unitPrice, 199900)
    assert.equal(validated.subtotal, 199900)
    assert.equal(validated.total, 199900) // Meets free shipping threshold
  })

  test('Sale Price Application: Uses salePrice when active', () => {
    const payload = [
      {
        productId: 'prod-hoodie-black',
        name: 'French Terry Relaxed Hoodie',
        price: 349900,
        quantity: 1,
      },
    ]

    const validated = validateOrderItemsAgainstCatalog(payload, catalog)
    assert.equal(validated.validatedItems[0].unitPrice, 299900)
    assert.equal(validated.subtotal, 299900)
  })

  test('Stock Validation: Rejects orders exceeding available inventory', () => {
    const excessivePayload = [
      {
        productId: 'prod-hoodie-black',
        name: 'French Terry Relaxed Hoodie',
        quantity: 10, // Stock is only 2!
      },
    ]

    assert.throws(
      () => validateOrderItemsAgainstCatalog(excessivePayload, catalog),
      /Insufficient stock/
    )
  })

  test('Catalog Protection: Rejects orders for unpublished products', () => {
    const draftPayload = [
      {
        productId: 'prod-draft-item',
        name: 'Unpublished Sample',
        quantity: 1,
      },
    ]

    assert.throws(
      () => validateOrderItemsAgainstCatalog(draftPayload, catalog),
      /currently unavailable/
    )
  })

  test('IDOR Protection: Customer A cannot view Customer B orders', () => {
    const customerOrder = {
      id: 'ord-1001',
      customerUid: 'uid-alice',
      customerEmail: 'alice@example.com',
      total: 199900,
    }

    // Alice can access her own order
    assert.equal(canAccessOrder(customerOrder, 'uid-alice', 'alice@example.com', false), true)

    // Bob cannot access Alice's order
    assert.equal(canAccessOrder(customerOrder, 'uid-bob', 'bob@example.com', false), false)

    // Admin can access Alice's order
    assert.equal(canAccessOrder(customerOrder, 'uid-admin', 'levixfashions@gmail.com', true), true)
  })

  test('Address Validation: Indian 6-Digit PIN Code Check', () => {
    const validPin = '500081'
    const invalidPin1 = '50081' // 5 digits
    const invalidPin2 = '50008A' // alphanumeric

    const pinRegex = /^\d{6}$/
    assert.equal(pinRegex.test(validPin), true)
    assert.equal(pinRegex.test(invalidPin1), false)
    assert.equal(pinRegex.test(invalidPin2), false)
  })
})
