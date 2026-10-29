import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getOrders } from '../../lib/firestore'
import { formatPrice, formatDate } from '../../lib/utils'
import type { Order } from '../../types/order'

export const AccountOrders: React.FC = () => {
  const { userProfile, currentUser, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const uid = currentUser?.uid || userProfile?.uid

  useEffect(() => {
    // Wait until auth state is resolved so second customer account immediately sees orders (Fix 4)
    if (authLoading) return
    if (!uid) {
      setOrders([])
      setLoading(false)
      return
    }

    setLoading(true)
    getOrders(uid).then((res) => {
      setOrders(res)
      setLoading(false)
    })
  }, [uid, authLoading])

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-levix-secondary">Loading your order history...</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-levix-border p-6">
        <Package className="w-12 h-12 text-levix-secondary/50 mx-auto mb-3 stroke-1" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
          No Orders Placed Yet
        </h3>
        <p className="text-xs text-levix-secondary mt-1 mb-6 max-w-xs mx-auto">
          Explore our seasonal collection and your completed orders will be tracked here in real-time.
        </p>
        <Link to="/shop" className="btn-primary text-xs uppercase tracking-wider">
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-levix-border flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-levix-charcoal">
            Order History & Tracking
          </h2>
          <p className="text-xs text-levix-secondary mt-0.5">
            View real-time dispatch progress, line items, and invoice summaries.
          </p>
        </div>
        <span className="text-xs font-semibold text-levix-secondary">
          {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
        </span>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border border-levix-border hover:border-black/40 transition-colors p-5 bg-white space-y-4"
          >
            {/* Header: Order Number, Date, Status Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-levix-border text-xs">
              <div>
                <span className="font-mono font-bold text-levix-charcoal">{order.orderNumber}</span>
                <span className="text-levix-secondary ml-3">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                    order.paymentStatus === 'Paid'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {order.paymentStatus}
                </span>

                <span
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                    order.fulfillmentStatus === 'Delivered'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : order.fulfillmentStatus === 'Cancelled'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-black/5 text-black border-neutral-300'
                  }`}
                >
                  {order.fulfillmentStatus}
                </span>
              </div>
            </div>

            {/* Line items thumbnail preview */}
            <div className="flex flex-wrap items-center gap-3">
              {order.items.slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-12 h-14 object-cover border border-levix-border bg-levix-gray"
                  />
                  <div className="text-[11px] max-w-[140px] truncate">
                    <p className="font-medium text-levix-charcoal truncate">{item.name}</p>
                    <p className="text-levix-secondary">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
              {order.items.length > 4 && (
                <span className="text-xs text-levix-secondary font-medium">
                  +{order.items.length - 4} more
                </span>
              )}
            </div>

            {/* Footer: Total & View Details Link */}
            <div className="pt-3 border-t border-levix-border flex items-center justify-between text-xs">
              <div>
                <span className="text-levix-secondary">Total: </span>
                <span className="font-bold text-levix-charcoal text-sm">{formatPrice(order.total)}</span>
              </div>
              <Link
                to={`/account/orders/${order.id}`}
                className="btn-secondary py-1.5 px-3 text-xs uppercase tracking-wider inline-flex items-center gap-1 hover:border-black hover:text-black"
              >
                <span>Track & Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
