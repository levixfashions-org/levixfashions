import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  DollarSign,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowRight,
  Plus,
  Package,
  RefreshCw,
} from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { getOrders, getAdminHeaders } from '../../lib/firestore'
import { formatPrice, formatDate } from '../../lib/utils'
import type { Order } from '../../types/order'

export const AdminDashboard: React.FC = () => {
  const { products } = useStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(() => new Date())

  const fetchOrders = useCallback(async (showFullSpinner = false) => {
    if (showFullSpinner) {
      setLoading(true)
    }
    setRefreshing(true)
    try {
      const data = await getOrders()
      setOrders(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.warn('Dashboard orders fetch error:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders(orders.length === 0)

    // Listen to real-time order creation across tabs
    let ch: BroadcastChannel | null = null
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        ch = new BroadcastChannel('levix_store_sync')
        ch.onmessage = (event) => {
          if (event.data?.type === 'ORDER_CREATED' || event.data?.type === 'ORDERS_UPDATED') {
            fetchOrders(false)
          }
        }
      } catch {}
    }

    // Incremental polling every 30 seconds while tab is visible (Fix N4: no full-table hammering)
    const pollInterval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        try {
          const since = lastUpdated.toISOString()
          const headers = await getAdminHeaders()
          const res = await fetch(`/api/orders?updatedSince=${encodeURIComponent(since)}`, { headers })
          if (res.ok) {
            const data = await res.json()
            if (data && Array.isArray(data.orders) && data.orders.length > 0) {
              setOrders((prev) => {
                const incomingMap = new Map<string, Order>(data.orders.map((o: Order) => [o.id, o]))
                const updatedList = prev.map((o) => incomingMap.get(o.id) || o)
                const existingIds = new Set(prev.map((o) => o.id))
                const brandNew = data.orders.filter((o: Order) => !existingIds.has(o.id))
                return [...brandNew, ...updatedList]
              })
              setLastUpdated(new Date())
            }
          }
        } catch (err) {
          console.warn('Dashboard incremental orders note:', err)
        }
      }
    }, 30000)

    return () => {
      ch?.close()
      clearInterval(pollInterval)
    }
  }, [fetchOrders, lastUpdated])

  // Real Metric Calculations
  const totalOrders = orders.length

  // Paid Revenue: sum of all orders where paymentStatus is 'Paid'
  const paidRevenue = useMemo(() => {
    return orders
      .filter((o) => o.paymentStatus === 'Paid')
      .reduce((sum, o) => sum + o.total, 0)
  }, [orders])

  // Orders requiring processing: fulfillment status is Pending or Confirmed
  const pendingProcessing = useMemo(() => {
    return orders.filter(
      (o) => o.fulfillmentStatus === 'Pending' || o.fulfillmentStatus === 'Confirmed'
    ).length
  }, [orders])

  // Low stock products: stock <= 5
  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock <= 5).length
  }, [products])

  const recentOrders = useMemo(() => {
    return [...orders].slice(0, 5)
  }, [orders])

  return (
    <div className="space-y-8">
      {/* Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-black mb-1">
            Store Analytics
          </p>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-levix-charcoal">
            Executive Dashboard
          </h1>
          <p className="text-xs text-levix-secondary mt-1">
            Real-time performance metrics, orders requiring action, and catalog inventory controls.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="btn-secondary py-2 px-3 text-xs uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer shadow-xs hover:border-black hover:text-black"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-black' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <Link
            to="/admin/products"
            className="btn-primary py-2 px-4 text-xs uppercase tracking-wider inline-flex items-center gap-2 self-start sm:self-auto shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Product</span>
          </Link>
        </div>
      </div>

      {/* Zero Products Banner */}
      {products.length === 0 && (
        <div className="p-6 bg-black/5 border-2 border-dashed border-neutral-300 rounded-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
                Your Catalog is Ready for Products
              </h2>
              <p className="text-xs text-levix-secondary mt-0.5">
                All 13 luxury collections are established. Capture or upload photos from your phone camera or gallery to launch your items.
              </p>
            </div>
          </div>
          <Link
            to="/admin/products"
            className="btn-primary py-2.5 px-5 text-xs uppercase tracking-wider inline-flex items-center gap-2 shrink-0 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Product</span>
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Paid Revenue */}
        <div className="bg-white border border-levix-border p-6 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-levix-secondary">
            <span className="text-xs font-bold uppercase tracking-wider">Paid Revenue</span>
            <div className="w-8 h-8 bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-levix-charcoal">
              {formatPrice(paidRevenue)}
            </span>
            <p className="text-[11px] text-levix-secondary mt-1">Verified settled payments</p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-levix-border p-6 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-levix-secondary">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-levix-charcoal">{totalOrders}</span>
            <p className="text-[11px] text-levix-secondary mt-1">All historical purchases</p>
          </div>
        </div>

        {/* Pending Fulfillment */}
        <div className="bg-white border border-levix-border p-6 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-levix-secondary">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Dispatch</span>
            <div className="w-8 h-8 bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-amber-600">{pendingProcessing}</span>
            <p className="text-[11px] text-levix-secondary mt-1">Requires fulfillment action</p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-levix-border p-6 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-levix-secondary">
            <span className="text-xs font-bold uppercase tracking-wider">Low Stock SKUs</span>
            <div className="w-8 h-8 bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-red-600">{lowStockCount}</span>
            <p className="text-[11px] text-levix-secondary mt-1">Stock ≤ 5 units remaining</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white border border-levix-border p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-levix-border">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
              Recent Orders
            </h2>
            <p className="text-xs text-levix-secondary mt-0.5">
              Live customer transactions recorded in database.
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold uppercase tracking-wider text-black hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-levix-secondary">Loading orders...</div>
        ) : recentOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-levix-secondary">
            No customer orders placed yet. Place a test order from the storefront.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-levix-border bg-levix-gray text-levix-secondary uppercase tracking-wider">
                  <th className="py-2.5 px-3">Order Number</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Fulfillment</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-levix-border">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-levix-gray/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-levix-charcoal">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-levix-charcoal">{order.customerName || order.shippingAddress?.fullName || 'Customer'}</p>
                      <p className="text-[11px] text-levix-secondary truncate max-w-[140px]">
                        {order.customerEmail || order.shippingAddress?.email || '—'}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-levix-secondary whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3 px-3 font-bold text-levix-charcoal">
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-black/5 text-black border border-neutral-300">
                        {order.fulfillmentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/admin/orders?search=${order.orderNumber}`}
                        className="text-xs font-semibold text-black hover:underline"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
