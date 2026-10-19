import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  ExternalLink,
} from 'lucide-react'
import { getOrderById } from '../../lib/firestore'
import { useAuth } from '../../context/AuthContext'
import { formatPrice, formatDate } from '../../lib/utils'
import type { Order, OrderFulfillmentStatus } from '../../types/order'

export const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const { currentUser, userProfile, isAdmin } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    if (!orderId) return
    const callerUid = currentUser?.uid || userProfile?.uid
    const callerEmail = currentUser?.email || userProfile?.email

    getOrderById(orderId, callerUid, callerEmail).then((res) => {
      if (res) {
        const isOwner =
          (callerUid && res.customerUid === callerUid) ||
          (callerEmail && res.customerEmail?.toLowerCase() === callerEmail.toLowerCase()) ||
          res.customerUid === 'guest'

        if (isOwner || isAdmin) {
          setOrder(res)
          setUnauthorized(false)
        } else {
          setOrder(null)
          setUnauthorized(true)
        }
      } else {
        setOrder(null)
      }
      setLoading(false)
    })
  }, [orderId, currentUser, userProfile, isAdmin])

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="w-6 h-6 border-2 border-levix-orange border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-levix-secondary">Loading order details...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h3 className="text-base font-bold text-levix-charcoal uppercase">Order Not Found</h3>
        <p className="text-xs text-levix-secondary mt-1 mb-4">
          The requested order could not be located.
        </p>
        <Link to="/account/orders" className="btn-primary text-xs uppercase tracking-wider">
          Return to Orders
        </Link>
      </div>
    )
  }

  // Tracking timeline steps
  const steps: OrderFulfillmentStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered']
  const currentStepIndex = steps.indexOf(order.fulfillmentStatus)

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-levix-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-1.5 text-xs text-levix-secondary hover:text-levix-orange transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders List</span>
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold uppercase tracking-wider text-levix-charcoal font-mono">
              {order.orderNumber}
            </h2>
            <span
              className={`px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border ${
                order.paymentStatus === 'Paid'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {order.paymentStatus}
            </span>
          </div>
          <p className="text-xs text-levix-secondary mt-0.5">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      {/* Visual Tracking Timeline */}
      <div className="border border-levix-border p-6 bg-levix-gray/30 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-levix-charcoal">
          Dispatch Timeline
        </h3>

        {order.fulfillmentStatus === 'Cancelled' ? (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            This order has been cancelled.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-2">
            {steps.map((step, idx) => {
              const isPassed = currentStepIndex >= idx
              const isCurrent = currentStepIndex === idx
              return (
                <div key={step} className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-colors ${
                      isPassed
                        ? 'bg-levix-orange text-white'
                        : 'bg-white border border-levix-border text-levix-secondary'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isCurrent
                        ? 'text-levix-orange'
                        : isPassed
                        ? 'text-levix-charcoal'
                        : 'text-levix-secondary'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Live Courier Tracking info if available */}
        {order.tracking?.trackingNumber && (
          <div className="mt-4 pt-4 border-t border-levix-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 border border-levix-border">
            <div>
              <p className="text-[11px] font-bold uppercase text-levix-secondary tracking-wider">
                Courier Partner: <span className="text-levix-charcoal">{order.tracking.courierName || 'BlueDart / Delhivery'}</span>
              </p>
              <p className="text-xs font-mono font-bold text-levix-charcoal mt-0.5">
                AWB / Tracking Number: {order.tracking.trackingNumber}
              </p>
            </div>
            {order.tracking.trackingUrl && (
              <a
                href={order.tracking.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary py-2 px-4 text-xs uppercase tracking-wider inline-flex items-center gap-1.5"
              >
                <span>Track on Courier Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Item Breakdown */}
      <div className="border border-levix-border p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-levix-charcoal pb-3 border-b border-levix-border">
          Order Items ({order.items.length})
        </h3>

        <div className="divide-y divide-levix-border">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center gap-4 text-xs">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-14 h-16 object-cover border border-levix-border bg-levix-gray shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Link
                  to={`/product/${item.slug}`}
                  className="font-bold text-sm text-levix-charcoal hover:text-levix-orange transition-colors truncate block"
                >
                  {item.name}
                </Link>
                <p className="text-levix-secondary mt-0.5">
                  SKU: {item.sku} {item.variantName ? `• ${item.variantName}` : ''}
                </p>
                <p className="text-levix-secondary mt-0.5">Quantity: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-levix-charcoal text-sm">{formatPrice(item.subtotal)}</p>
                <p className="text-[11px] text-levix-secondary">{formatPrice(item.unitPrice)} each</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-levix-border space-y-2 text-xs">
          <div className="flex justify-between text-levix-secondary">
            <span>Subtotal</span>
            <span className="font-semibold text-levix-charcoal">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-levix-secondary">
            <span>Express Shipping</span>
            <span className="font-semibold text-levix-charcoal">
              {order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee)}
            </span>
          </div>
          <div className="pt-2 border-t border-levix-border flex justify-between items-baseline">
            <span className="text-xs font-bold uppercase tracking-wider text-levix-charcoal">
              Total Amount
            </span>
            <span className="text-xl font-black text-levix-charcoal">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Destination Address Snapshot */}
      <div className="border border-levix-border p-6 space-y-2">
        <div className="flex items-center gap-2 pb-2 border-b border-levix-border">
          <MapPin className="w-4 h-4 text-levix-orange" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-levix-charcoal">
            Shipping Destination Snapshot
          </h3>
        </div>
        <div className="text-xs text-levix-charcoal leading-relaxed pt-1">
          <p className="font-bold">{order.shippingAddress.fullName}</p>
          <p>{order.shippingAddress.street}</p>
          {order.shippingAddress.apartment && <p>{order.shippingAddress.apartment}</p>}
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
            {order.shippingAddress.postalCode}
          </p>
          <p>{order.shippingAddress.country}</p>
          <p className="mt-1 text-levix-secondary">Phone: {order.shippingAddress.phone}</p>
        </div>
      </div>
    </div>
  )
}
