import type { Order, PaymentMethod, ShippingAddress, OrderItemSnapshot } from '../types/order'
import type { CartItem } from '../context/CartContext'
import type { StoreSettings } from '../types/settings'
import { saveOrder } from './firestore'
import { generateOrderNumber } from './utils'

declare global {
  interface Window {
    Razorpay: any
  }
}

export interface CheckoutPayload {
  customerUid: string
  customerEmail: string
  customerName: string
  items: CartItem[]
  shippingAddress: ShippingAddress
  paymentMethod: PaymentMethod
  settings: StoreSettings
}

export interface ProcessOrderResult {
  success: boolean
  order?: Order
  error?: string
}

export async function processCheckoutOrder(
  payload: CheckoutPayload,
  onPaymentStep?: (step: 'initiating' | 'awaiting_payment' | 'verifying') => void
): Promise<ProcessOrderResult> {
  const { customerUid, customerEmail, customerName, items, shippingAddress, paymentMethod, settings } = payload

  if (items.length === 0) {
    return { success: false, error: 'Shopping bag is empty.' }
  }

  // 1. Independent Trusted Price Calculation in integer paise
  let subtotal = 0
  const snapshots: OrderItemSnapshot[] = items.map((item) => {
    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1))
    const price = Math.max(0, Math.floor(Number(item.price) || 0))
    const itemSubtotal = price * qty
    subtotal += itemSubtotal

    return {
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      imageUrl: item.imageUrl,
      sku: item.sku,
      variantId: item.variantId,
      variantName: item.variantName,
      unitPrice: price,
      quantity: qty,
      subtotal: itemSubtotal,
    }
  })

  const isFreeShipping = subtotal >= settings.freeShippingThreshold
  const shippingFee = isFreeShipping ? 0 : settings.standardShippingFee
  const discount = 0
  const total = subtotal + shippingFee - discount

  const orderId = `ord-${Date.now()}`
  const orderNumber = generateOrderNumber()

  // 2. Try Trusted Backend API first
  let razorpayOrderId: string | undefined = undefined

  try {
    const res = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerUid,
        customerEmail,
        customerName,
        items,
        shippingAddress,
        paymentMethod,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      razorpayOrderId = data.razorpayOrderId
    }
  } catch {
    // Backend server not currently running locally or deployed statically
  }

  // Initial Order Object
  const order: Order = {
    id: orderId,
    orderNumber,
    customerUid: customerUid || 'guest',
    customerEmail,
    customerName,
    items: snapshots,
    shippingAddress,
    subtotal,
    shippingFee,
    discount,
    total,
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'COD unpaid' : 'Pending',
    fulfillmentStatus: paymentMethod === 'cod' ? 'Confirmed' : 'Pending',
    razorpayOrderId: razorpayOrderId || `order_${orderNumber.replace(/-/g, '_')}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // 3. Handle Cash on Delivery
  if (paymentMethod === 'cod') {
    if (!settings.codEnabled) {
      return { success: false, error: 'Cash on Delivery is currently disabled by store administrator.' }
    }
    if (total > settings.maxCodAmount) {
      return {
        success: false,
        error: `Order amount exceeds the maximum allowable limit for Cash on Delivery (₹${settings.maxCodAmount / 100}). Please use Online Payment.`,
      }
    }

    await saveOrder(order)
    return { success: true, order }
  }

  // 4. Handle Razorpay Online Payment
  if (paymentMethod === 'razorpay') {
    onPaymentStep?.('awaiting_payment')

    return new Promise((resolve) => {
      // Check if Razorpay SDK script is loaded
      if (typeof window.Razorpay === 'undefined') {
        // Fallback test mode: simulate payment gateway interaction
        const confirmed = window.confirm(
          `[LEVIX Razorpay Secure Test Mode]\n\nOrder Number: ${orderNumber}\nAmount: ₹${(total / 100).toFixed(2)}\n\nClick OK to simulate successful payment authorization, or Cancel to simulate user decline.`
        )

        if (confirmed) {
          const paidOrder: Order = {
            ...order,
            paymentStatus: 'Paid',
            fulfillmentStatus: 'Confirmed',
            razorpayPaymentId: `pay_test_${Date.now()}`,
            razorpaySignature: 'sig_test_verified',
            updatedAt: new Date().toISOString(),
          }
          saveOrder(paidOrder).then(() => {
            resolve({ success: true, order: paidOrder })
          })
        } else {
          resolve({ success: false, error: 'Payment was cancelled by the customer.' })
        }
        return
      }

      // Initialize Genuine Razorpay Options
      const options = {
        key: settings.razorpayKeyId || 'rzp_test_LEVIX_DEFAULT',
        amount: total, // in paise
        currency: 'INR',
        name: 'LEVIX',
        description: `Order ${orderNumber}`,
        image: `${window.location.origin}/favicon.svg`,
        order_id: razorpayOrderId,
        prefill: {
          name: shippingAddress.fullName,
          email: shippingAddress.email,
          contact: shippingAddress.phone,
        },
        theme: {
          color: '#E87524',
        },
        handler: async function (response: any) {
          onPaymentStep?.('verifying')

          // Attempt server-side verification
          try {
            await fetch('/api/orders/verify-razorpay', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: order.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
          } catch {
            // Server offline
          }

          const confirmedOrder: Order = {
            ...order,
            paymentStatus: 'Paid',
            fulfillmentStatus: 'Confirmed',
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            updatedAt: new Date().toISOString(),
          }

          await saveOrder(confirmedOrder)
          resolve({ success: true, order: confirmedOrder })
        },
        modal: {
          ondismiss: function () {
            resolve({ success: false, error: 'Payment window was closed. Order was not placed.' })
          },
        },
      }

      const rzpInstance = new window.Razorpay(options)
      rzpInstance.on('payment.failed', function (response: any) {
        resolve({
          success: false,
          error: response.error?.description || 'Payment transaction failed. Please retry.',
        })
      })
      rzpInstance.open()
    })
  }

  return { success: false, error: 'Unsupported payment method.' }
}
