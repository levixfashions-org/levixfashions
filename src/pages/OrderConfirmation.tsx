import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import confetti from 'canvas-confetti'
import {
  CheckCircle,
  Truck,
  MapPin,
} from 'lucide-react'
import { getOrderById } from '../lib/firestore'
import { formatPrice, formatDate } from '../lib/utils'
import { SEO } from '../components/common/SEO'
import type { Order } from '../types/order'

export const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) return

    getOrderById(orderId).then((data) => {
      setOrder(data)
      setLoading(false)

      // Fire celebratory confetti with LEVIX brand colors
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E87524', '#222222', '#FFF5ED', '#F8F8F8'],
        })
      } catch {}
    })
  }, [orderId])

  if (loading) {
    return (
      <div className="container-levix py-24 text-center">
        <div className="w-8 h-8 border-2 border-levix-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-levix-secondary uppercase tracking-wider font-semibold">
          Retrieving order details...
        </p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container-levix py-24 text-center">
        <h2 className="text-2xl font-bold uppercase text-levix-charcoal">Order Not Found</h2>
        <p className="text-xs text-levix-secondary mt-2 mb-6">
          Could not locate the requested order confirmation.
        </p>
        <Link to="/shop" className="btn-primary text-xs uppercase tracking-wider">
          Return to Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-levix-gray/30 min-h-screen py-10 sm:py-16">
      <SEO title={`Order Confirmed: ${order.orderNumber}`} />

      <div className="container-levix">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Success Banner */}
          <div className="bg-white border border-levix-border p-8 text-center shadow-subtle space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle className="w-8 h-8 stroke-[1.5]" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-levix-orange">
                Thank You For Your Order
              </p>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-levix-charcoal mt-1">
                Order Confirmed
              </h1>
              <p className="text-xs text-levix-secondary mt-1">
                A confirmation summary has been logged for{' '}
                <strong className="text-levix-charcoal font-semibold">{order.customerEmail}</strong>.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-levix-gray border border-levix-border text-xs font-mono font-bold text-levix-charcoal">
              <span>Order Number:</span>
              <span className="text-levix-orange">{order.orderNumber}</span>
            </div>
          </div>

          {/* Fulfillment & Tracking Status */}
          <div className="bg-white border border-levix-border p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-levix-border">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-levix-orange" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-levix-charcoal">
                  Fulfillment Status
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                {order.fulfillmentStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-levix-secondary uppercase tracking-wider text-[10px]">Payment</p>
                <p className="font-semibold text-levix-charcoal mt-0.5">
                  {order.paymentMethod === 'razorpay' ? 'Paid via Razorpay' : 'Cash on Delivery (Pending)'}
                </p>
              </div>
              <div>
                <p className="text-levix-secondary uppercase tracking-wider text-[10px]">Date Placed</p>
                <p className="font-semibold text-levix-charcoal mt-0.5">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-levix-secondary uppercase tracking-wider text-[10px]">Est. Dispatch</p>
                <p className="font-semibold text-levix-charcoal mt-0.5">Within 24 Business Hours</p>
              </div>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="bg-white border border-levix-border p-6 shadow-subtle space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-levix-charcoal pb-3 border-b border-levix-border">
              Purchased Items ({order.items.length})
            </h3>

            <div className="divide-y divide-levix-border">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-4 flex items-center gap-4 text-xs">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-20 object-cover border border-levix-border bg-levix-gray shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-levix-charcoal text-sm truncate">{item.name}</h4>
                    <p className="text-levix-secondary mt-0.5">
                      SKU: {item.sku} {item.variantName ? `• Variant: ${item.variantName}` : ''}
                    </p>
                    <p className="text-levix-secondary mt-0.5">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-levix-charcoal text-sm">
                      {formatPrice(item.subtotal)}
                    </p>
                    <p className="text-[11px] text-levix-secondary">
                      {formatPrice(item.unitPrice)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Breakdown */}
            <div className="pt-4 border-t border-levix-border space-y-2 text-xs">
              <div className="flex justify-between text-levix-secondary">
                <span>Subtotal</span>
                <span className="font-semibold text-levix-charcoal">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-levix-secondary">
                <span>Shipping</span>
                <span className="font-semibold text-levix-charcoal">
                  {order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee)}
                </span>
              </div>
              <div className="pt-2 border-t border-levix-border flex justify-between items-baseline">
                <span className="text-xs font-bold uppercase tracking-wider text-levix-charcoal">
                  Total Confirmed
                </span>
                <span className="text-xl font-black text-levix-charcoal">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address Snapshot */}
          <div className="bg-white border border-levix-border p-6 shadow-subtle space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-levix-border">
              <MapPin className="w-4 h-4 text-levix-orange" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-levix-charcoal">
                Delivery Destination
              </h3>
            </div>
            <div className="text-xs text-levix-charcoal leading-relaxed">
              <p className="font-bold">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              {order.shippingAddress.apartment && <p>{order.shippingAddress.apartment}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-1 text-levix-secondary">Contact: {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/account/orders"
              className="flex-1 btn-primary py-3.5 text-xs uppercase tracking-wider text-center"
            >
              Track in Customer Portal
            </Link>
            <Link
              to="/shop"
              className="flex-1 btn-secondary py-3.5 text-xs uppercase tracking-wider text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
