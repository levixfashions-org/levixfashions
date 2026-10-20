import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
  Search,
  Truck,
  X,
  Save,
  RefreshCw,
  AlertTriangle,
  UserCheck,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getOrders, updateOrderFulfillment } from '../../lib/firestore'
import { formatPrice, formatDate } from '../../lib/utils'
import type { Order, OrderFulfillmentStatus, OrderPaymentStatus } from '../../types/order'

export const AdminOrders: React.FC = () => {
  const { currentUser, isAdmin, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(() => new Date())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Selected Order for Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Edit Modal States
  const [newFulfillmentStatus, setNewFulfillmentStatus] = useState<OrderFulfillmentStatus>('Pending')
  const [newPaymentStatus, setNewPaymentStatus] = useState<OrderPaymentStatus>('Pending')
  const [courierName, setCourierName] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingUrl, setTrackingUrl] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchOrders = useCallback(async (showFullSpinner = false) => {
    if (showFullSpinner) {
      setLoading(true)
    }
    setRefreshing(true)
    setError(null)
    try {
      const data = await getOrders()
      setOrders(data)
      setLastUpdated(new Date())
    } catch (err: any) {
      console.warn('Orders fetch error:', err)
      setError(err?.message || 'Failed to communicate with order server.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Initial load and real-time listeners (Loads immediately on mount with zero auth delay)
  useEffect(() => {
    fetchOrders(orders.length === 0)

    // 1. Listen for immediate order events from other tabs in this browser
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

    // 2. Auto-poll every 8 seconds so customer orders from phones & other devices appear live
    const pollInterval = setInterval(() => {
      fetchOrders(false)
    }, 8000)

    // 3. Immediately refresh when tab regains focus
    const onFocus = () => {
      fetchOrders(false)
    }
    window.addEventListener('focus', onFocus)

    return () => {
      ch?.close()
      clearInterval(pollInterval)
      window.removeEventListener('focus', onFocus)
    }
  }, [fetchOrders])

  // Filter & Search (Defensive against nulls)
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customerEmail?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(q)

      const matchesStatus =
        statusFilter === 'all' ||
        o.fulfillmentStatus === statusFilter ||
        o.paymentStatus === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, search, statusFilter])

  const handleOpenManageModal = (order: Order) => {
    setSelectedOrder(order)
    setNewFulfillmentStatus(order.fulfillmentStatus)
    setNewPaymentStatus(order.paymentStatus)
    setCourierName(order.tracking?.courierName || order.courier || 'BlueDart Express')
    setTrackingNumber(order.tracking?.trackingNumber || order.awb || '')
    setTrackingUrl(order.tracking?.trackingUrl || '')
    setInternalNotes(order.internalNotes || order.adminNote || '')
    setIsModalOpen(true)
  }

  const handleSaveOrderFulfillment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder) return

    setSaving(true)
    const updates: Partial<Order> = {
      fulfillmentStatus: newFulfillmentStatus,
      paymentStatus: newPaymentStatus,
      courier: courierName,
      awb: trackingNumber,
      adminNote: internalNotes,
      tracking: {
        courierName,
        trackingNumber,
        trackingUrl,
        shippedAt: newFulfillmentStatus === 'Shipped' ? new Date().toISOString() : selectedOrder.tracking?.shippedAt,
        deliveredAt: newFulfillmentStatus === 'Delivered' ? new Date().toISOString() : selectedOrder.tracking?.deliveredAt,
      },
      internalNotes,
    }

    try {
      await updateOrderFulfillment(selectedOrder.id, updates)

      // Update local state immediately
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o))
      )
      setIsModalOpen(false)
    } catch (err: any) {
      alert(`Could not update order: ${err.message || 'Status transition rejected'}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-levix-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-levix-orange mb-1">
            Logistics & Operations
          </p>
          <h1 className="text-2xl font-black uppercase tracking-tight text-levix-charcoal">
            Order Management
          </h1>
          <p className="text-xs text-levix-secondary mt-0.5">
            Total {orders.length} customer orders recorded.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-levix-secondary hidden sm:inline flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span>Updated {lastUpdated.toLocaleTimeString()}</span>
          </span>
          <button
            type="button"
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="btn-secondary py-2 px-3 text-xs uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer shadow-xs hover:border-levix-orange hover:text-levix-orange"
            title="Refresh orders list from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-levix-orange' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Warning: Customer Session Detected */}
      {!isAdmin && currentUser && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold uppercase tracking-wider text-amber-800">
              Customer Account Session Active ({currentUser.email})
            </p>
            <p className="mt-1">
              You are currently authenticated in this browser as customer <strong className="font-mono">{currentUser.email}</strong>.
              Orders are loaded securely using your store administrative key. To perform admin status changes or manage settings with full credentials, please ensure you sign in with the designated store administrator account (<strong className="font-mono">levixfashions@gmail.com</strong>).
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-900 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold uppercase tracking-wider text-red-800">Server Communication Warning</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchOrders(true)}
            className="btn-secondary py-1 px-3 text-xs uppercase tracking-wider cursor-pointer hover:border-red-400"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order #, Customer Name, or Email..."
            className="form-input text-xs pl-9 py-2"
          />
          <Search className="w-4 h-4 text-levix-secondary absolute left-3 top-2.5" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-input text-xs py-2 w-full sm:w-56 cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <optgroup label="Fulfillment">
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </optgroup>
          <optgroup label="Payment">
            <option value="Paid">Paid</option>
            <option value="COD unpaid">COD unpaid</option>
            <option value="Refunded">Refunded</option>
          </optgroup>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-levix-border shadow-subtle overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-levix-border bg-levix-gray text-levix-secondary uppercase tracking-wider">
              <th className="py-3 px-4">Order #</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Items</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4">Fulfillment</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-levix-border">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-levix-secondary">
                  Loading orders...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-levix-secondary">
                  No orders found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-levix-gray/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-levix-charcoal">
                    {order.orderNumber}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-levix-charcoal">{order.customerName || order.shippingAddress?.fullName || 'Customer'}</p>
                    <p className="text-[11px] text-levix-secondary truncate max-w-[140px]">
                      {order.customerEmail || order.shippingAddress?.email || '—'}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-levix-secondary whitespace-nowrap">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-levix-charcoal">
                    {(Array.isArray(order.items) ? order.items : []).reduce((s, i) => s + (Number(i.quantity) || 1), 0)} pcs
                  </td>
                  <td className="py-3 px-4 font-bold text-levix-charcoal">
                    {formatPrice(order.total)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                        order.paymentStatus === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : order.paymentStatus === 'COD unpaid'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                        order.fulfillmentStatus === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : order.fulfillmentStatus === 'Cancelled'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-levix-soft-orange text-levix-orange border-levix-orange/30'
                      }`}
                    >
                      {order.fulfillmentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenManageModal(order)}
                      className="btn-secondary py-1 px-3 text-xs uppercase hover:border-levix-orange hover:text-levix-orange"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Management & Tracking Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full border border-levix-border shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-levix-border">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-levix-orange">
                  Fulfillment & Payment
                </span>
                <h3 className="text-base font-bold uppercase tracking-wider text-levix-charcoal font-mono">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-levix-secondary hover:text-levix-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Address Details Snapshot */}
            <div className="p-4 bg-levix-gray border border-levix-border text-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="font-bold text-levix-secondary uppercase text-[10px]">Client Details</p>
                <p className="font-semibold text-levix-charcoal mt-1">{selectedOrder.customerName}</p>
                <p className="text-levix-secondary">{selectedOrder.customerEmail}</p>
                <p className="text-levix-secondary">{selectedOrder.shippingAddress.phone}</p>
              </div>
              <div>
                <p className="font-bold text-levix-secondary uppercase text-[10px]">Shipping Address</p>
                <p className="text-levix-charcoal mt-1">{selectedOrder.shippingAddress.street}</p>
                {selectedOrder.shippingAddress.apartment && <p>{selectedOrder.shippingAddress.apartment}</p>}
                <p>
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{' '}
                  {selectedOrder.shippingAddress.postalCode}
                </p>
              </div>
            </div>

            {/* Purchased Items List */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-levix-charcoal">
                Order Items ({selectedOrder.items.length})
              </p>
              <div className="divide-y divide-levix-border border border-levix-border text-xs max-h-40 overflow-y-auto">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-10 h-12 object-cover border border-levix-border"
                      />
                      <div>
                        <p className="font-semibold text-levix-charcoal">{item.name}</p>
                        <p className="text-[11px] text-levix-secondary">
                          Qty: {item.quantity} • {item.variantName || 'Standard'}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-levix-charcoal">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Update Controls Form */}
            <form onSubmit={handleSaveOrderFulfillment} className="space-y-4 text-xs pt-2 border-t border-levix-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Fulfillment Status *</label>
                  <select
                    value={newFulfillmentStatus}
                    onChange={(e) => setNewFulfillmentStatus(e.target.value as OrderFulfillmentStatus)}
                    className="form-input cursor-pointer font-semibold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Payment Status *</label>
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value as OrderPaymentStatus)}
                    className="form-input cursor-pointer font-semibold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="COD unpaid">COD unpaid</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
              </div>

              {/* Shipment Tracking details */}
              <div className="p-4 bg-levix-gray border border-levix-border space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-levix-charcoal flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-levix-orange" />
                  <span>Shipment & Dispatch Tracking Details</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Courier Partner</label>
                    <input
                      type="text"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      placeholder="e.g. BlueDart Express"
                      className="form-input py-2"
                    />
                  </div>

                  <div>
                    <label className="form-label">AWB / Tracking Number</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. BD987654321IN"
                      className="form-input py-2 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Public Tracking URL</label>
                  <input
                    type="url"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    placeholder="https://track.bluedart.com/..."
                    className="form-input py-2 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Internal Audit Notes</label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Verified payment with bank, packaged in gift box."
                  className="form-input"
                />
              </div>

              <div className="pt-4 border-t border-levix-border flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 btn-primary py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Updating Order...' : 'Save Order Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary py-3 px-6 text-xs uppercase tracking-wider"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
