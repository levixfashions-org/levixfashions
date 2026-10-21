export type OrderFulfillmentStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Return requested'

export type OrderPaymentStatus =
  | 'Pending'
  | 'Paid'
  | 'Failed'
  | 'COD unpaid'
  | 'Refunded'
  | 'Partially refunded'

export type PaymentMethod = 'razorpay' | 'cod'

export interface OrderItemSnapshot {
  productId: string
  name: string
  slug: string
  imageUrl: string
  sku: string
  variantId?: string
  variantName?: string
  unitPrice: number // in paise
  quantity: number
  subtotal: number // in paise = unitPrice * quantity
}

export interface ShippingAddress {
  fullName: string
  email: string
  phone: string
  street: string
  apartment?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface TrackingDetails {
  courierName?: string
  trackingNumber?: string
  trackingUrl?: string
  shippedAt?: any
  deliveredAt?: any
}

export interface Order {
  id: string
  orderNumber: string
  customerUid: string
  trackingToken?: string
  customerEmail: string
  customerName: string
  items: OrderItemSnapshot[]
  shippingAddress: ShippingAddress
  subtotal: number // in paise
  shippingFee: number // in paise
  discount: number // in paise
  total: number // in paise = subtotal + shippingFee - discount
  paymentMethod: PaymentMethod
  paymentStatus: OrderPaymentStatus
  fulfillmentStatus: OrderFulfillmentStatus
  razorpayOrderId?: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  tracking?: TrackingDetails
  courier?: string
  awb?: string
  adminNote?: string
  internalNotes?: string
  createdAt: any
  updatedAt: any
}
