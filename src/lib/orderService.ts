import type { Order, PaymentMethod, ShippingAddress, OrderItemSnapshot } from '../types/order'
import type { CartItem } from '../context/CartContext'
import type { StoreSettings } from '../types/settings'
import { auth } from './firebase'
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
  couponCode?: string
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
  let authoritativeOrder: Order | undefined = undefined

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (auth?.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken()
        headers['Authorization'] = `Bearer ${token}`
        headers['X-Firebase-Token'] = token
      } catch {}
    }

    const res = await fetch('/api/orders/create', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        customerUid,
        customerEmail,
        customerName,
        items,
        shippingAddress,
        paymentMethod,
        couponCode: payload.couponCode || undefined,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      razorpayOrderId = data.razorpayOrderId
      if (data.order) {
        authoritativeOrder = data.order
      }
      if (data.trackingToken && typeof localStorage !== 'undefined') {
        const tid = authoritativeOrder?.id || orderId
        localStorage.setItem(`levix_tracking_${tid}`, data.trackingToken)
      }
    } else {
      const errData = await res.json().catch(() => ({}))
      return { success: false, error: errData.error || 'Failed to place order.' }
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Could not connect to order server. Please check your connection and try again.' }
  }

  if (!authoritativeOrder) {
    return { success: false, error: 'Order could not be verified by the server. Please try again.' }
  }

  // Authoritative Order Object strictly from server
  const order: Order = authoritativeOrder

  // 3. Handle Cash on Delivery
  if (paymentMethod === 'cod') {
    if (!settings.codEnabled) {
      return { success: false, error: 'Cash on Delivery is currently disabled by store administrator.' }
    }
    if (order.total > settings.maxCodAmount) {
      return {
        success: false,
        error: `Order amount exceeds the maximum allowable limit for Cash on Delivery (₹${settings.maxCodAmount / 100}). Please use Online Payment.`,
      }
    }

    // Broadcast new order creation to open admin tabs
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const ch = new BroadcastChannel('levix_store_sync')
        ch.postMessage({ type: 'ORDER_CREATED', orderId: order.id, order })
        ch.close()
      } catch {}
    }

    return { success: true, order }
  }

  // 4. Handle Razorpay Online Payment
  if (paymentMethod === 'razorpay') {
    onPaymentStep?.('awaiting_payment')

    return new Promise((resolve) => {
      // Check if Razorpay SDK script is loaded
      if (typeof window.Razorpay === 'undefined') {
        resolve({
          success: false,
          error: 'Payment gateway failed to load. Please check your internet connection or use Cash on Delivery.',
        })
        return
      }

      // Initialize Genuine Razorpay Options
      const keyId = settings.razorpayKeyId || (authoritativeOrder as any)?.razorpayKeyId
      if (!keyId || keyId.includes('YOUR_') || keyId === 'rzp_test_LEVIX_DEFAULT') {
        resolve({
          success: false,
          error: 'Online payment gateway is not properly configured. Please contact store support or use Cash on Delivery.',
        })
        return
      }

      const options = {
        key: keyId,
        amount: order.total, // in paise
        currency: 'INR',
        name: 'LEVIX',
        description: `Order ${order.orderNumber}`,
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

          // Strict server-side verification: fail closed
          try {
            const verifyHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
            if (auth?.currentUser) {
              try {
                const token = await auth.currentUser.getIdToken()
                verifyHeaders['Authorization'] = `Bearer ${token}`
                verifyHeaders['X-Firebase-Token'] = token
              } catch {}
            }
            const trackingToken = typeof localStorage !== 'undefined'
              ? localStorage.getItem(`levix_tracking_${order.id}`)
              : null

            const verifyRes = await fetch('/api/orders/verify-razorpay', {
              method: 'POST',
              headers: verifyHeaders,
              body: JSON.stringify({
                orderId: order.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                trackingToken: trackingToken || undefined,
              }),
            })

            if (!verifyRes.ok) {
              const errData = await verifyRes.json().catch(() => ({}))
              resolve({
                success: false,
                error: errData.error || 'Payment verification failed on the server. If money was deducted, it will be refunded or credited.',
              })
              return
            }

            const verifyData = await verifyRes.json()
            const confirmedOrder: Order = verifyData.order || {
              ...order,
              paymentStatus: 'Paid',
              fulfillmentStatus: 'Confirmed',
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              updatedAt: new Date().toISOString(),
            }

            // Broadcast verified online order creation to open admin tabs
            if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
              try {
                const ch = new BroadcastChannel('levix_store_sync')
                ch.postMessage({ type: 'ORDER_CREATED', orderId: confirmedOrder.id, order: confirmedOrder })
                ch.close()
              } catch {}
            }

            resolve({
              success: true,
              order: confirmedOrder,
            })
          } catch (err: any) {
            resolve({
              success: false,
              error: err.message || 'Network error verifying payment. Please contact customer support.',
            })
          }
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
