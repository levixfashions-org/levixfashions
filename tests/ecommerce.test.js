import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'

// Test helpers mirroring LEVIX business logic
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

describe('LEVIX E-Commerce Logic & Integrity Suite', () => {
  test('Integer Paise and Currency Formatting', () => {
    // 299900 paise = ₹2,999
    assert.equal(paiseToRupees(299900), 2999)
    assert.equal(rupeesToPaise(2999), 299900)

    // Formatted INR representation
    const formatted = formatPrice(299900).replace(/\u00a0/g, ' ')
    assert.match(formatted, /₹\s?2,999/)

    // Zero paise
    assert.match(formatPrice(0).replace(/\u00a0/g, ' '), /₹\s?0/)
  })

  test('Order Number Generation Format', () => {
    const orderNum = generateOrderNumber()
    assert.match(orderNum, /^LVX-\d{6}-\d{4}$/)
  })

  test('Free Shipping Threshold Calculations', () => {
    // Order below threshold (₹1,500 < ₹1,999): shipping applies
    const belowItems = [{ price: 150000, quantity: 1 }]
    const belowResult = calculateOrderTotals(belowItems, 199900, 14900)
    assert.equal(belowResult.subtotal, 150000)
    assert.equal(belowResult.shippingFee, 14900)
    assert.equal(belowResult.isFreeShipping, false)
    assert.equal(belowResult.total, 164900)

    // Order above threshold (₹2,500 >= ₹1,999): shipping is free (0)
    const aboveItems = [{ price: 250000, quantity: 1 }]
    const aboveResult = calculateOrderTotals(aboveItems, 199900, 14900)
    assert.equal(aboveResult.subtotal, 250000)
    assert.equal(aboveResult.shippingFee, 0)
    assert.equal(aboveResult.isFreeShipping, true)
    assert.equal(aboveResult.total, 250000)
  })

  test('Razorpay HMAC SHA256 Signature Verification', () => {
    const secret = 'TEST_RAZORPAY_SECRET_12345'
    const orderId = 'order_test_9876'
    const paymentId = 'pay_test_5432'

    // Compute genuine signature
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    assert.equal(verifyRazorpaySignature(orderId, paymentId, validSignature, secret), true)
    assert.equal(verifyRazorpaySignature(orderId, paymentId, 'tampered_signature', secret), false)
  })

  test('Cart line item aggregation prevents negative quantity', () => {
    const items = [
      { price: 100000, quantity: -5 }, // negative should clamp to 1
      { price: 200000, quantity: 2 },
    ]
    const result = calculateOrderTotals(items, 199900, 14900)
    assert.equal(result.subtotal, 100000 * 1 + 200000 * 2)
  })
})
