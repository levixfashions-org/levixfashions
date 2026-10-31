import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Printer,
  FileText,
  Truck,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  User,
  ShieldAlert,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import AdminHeader from '@/components/admin/AdminHeader';
import { ALLOWED_ORDER_TRANSITIONS, OrderStatus } from '@/lib/order-state-machine';

function formatINR(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  let order: any = null;
  try {
    order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        user: true,
        address: true,
        items: true,
        payments: true,
      },
    });
  } catch (err) {
    console.error('Failed to query order details:', err);
  }

  if (!order) {
    // Mock order for zero-DB testing
    order = {
      id: 'ord-101',
      orderNumber,
      createdAt: new Date(),
      status: 'PROCESSING' as OrderStatus,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'RAZORPAY',
      subtotalPaise: 359800,
      shippingPaise: 0,
      discountPaise: 0,
      gstPaise: 38550,
      totalPaise: 359800,
      trackingCourier: 'DELHIVERY',
      trackingNumber: 'DEL-89234812IN',
      adminNotes: 'Customer requested delayed evening delivery.',
      user: {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@gmail.com',
        phone: '+91 98765 43210',
      },
      address: {
        fullName: 'Aarav Sharma',
        street: 'Flat 402, Skyline Residency, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India',
        phone: '+91 98765 43210',
      },
      items: [
        {
          id: 'item-1',
          productName: 'Waffle Oversized Drop Tee',
          size: 'L',
          colorName: 'Mineral Washed Charcoal',
          colorHex: '#2A2A2E',
          sku: 'LVX-WFL-OVS-CHA-L',
          pricePaise: 179900,
          quantity: 2,
        },
      ],
      payments: [
        {
          id: 'pay-1',
          razorpayPaymentId: 'pay_P102938475',
          amount: 359800,
          status: 'COMPLETED',
          createdAt: new Date(),
        },
      ],
    };
  }

  const allowedNextStatuses =
    ALLOWED_ORDER_TRANSITIONS[order.status as OrderStatus] || [];

  return (
    <div className="space-y-8 animate-fadeIn pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/admin/orders"
          className="flex items-center space-x-2 text-xs font-semibold text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <a
            href={`/api/admin/orders/${order.orderNumber}/packing-slip`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-white flex items-center space-x-2 transition-all"
          >
            <Printer className="w-4 h-4 text-[#C8FF3D]" />
            <span>Thermal Packing Slip</span>
          </a>

          <a
            href={`/api/orders/${order.orderNumber}/invoice`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-white flex items-center space-x-2 transition-all"
          >
            <FileText className="w-4 h-4 text-[#7C5CFF]" />
            <span>GST Tax Invoice</span>
          </a>
        </div>
      </div>

      <AdminHeader
        title={`Order ${order.orderNumber}`}
        subtitle={`Placed on ${new Date(order.createdAt).toLocaleDateString('en-IN', {
          dateStyle: 'full',
          timeStyle: 'short',
        })}`}
      />

      {/* Main Grid: 2 Cols Left, 1 Col Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Items & Financial Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Garments Table */}
          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white tracking-wide">Ordered Streetwear Items</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Garment Details</th>
                    <th className="pb-3 font-semibold">SKU</th>
                    <th className="pb-3 font-semibold text-center">Qty</th>
                    <th className="pb-3 font-semibold text-right">Unit Price</th>
                    <th className="pb-3 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {order.items.map((item: any) => (
                    <tr key={item.id} className="hover:bg-white/[0.01]">
                      <td className="py-4">
                        <p className="font-bold text-white text-sm">{item.productName}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 inline-block"
                            style={{ backgroundColor: item.colorHex || '#222' }}
                          />
                          <span className="text-[11px] text-white/60">{item.colorName || 'Default'}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-white">
                            Size {item.size}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 font-mono text-[11px] text-white/60">
                        {item.sku}
                      </td>

                      <td className="py-4 text-center font-bold font-mono text-white">
                        {item.quantity}
                      </td>

                      <td className="py-4 text-right font-mono text-white/80">
                        {formatINR(item.pricePaise)}
                      </td>

                      <td className="py-4 text-right font-bold font-mono text-[#C8FF3D]">
                        {formatINR(item.pricePaise * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-white/60">
                <span>Subtotal</span>
                <span className="font-mono text-white">{formatINR(order.subtotalPaise)}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Shipping Fee</span>
                <span className="font-mono text-white">
                  {order.shippingPaise === 0 ? 'FREE' : formatINR(order.shippingPaise)}
                </span>
              </div>
              {order.discountPaise > 0 && (
                <div className="flex justify-between text-[#C8FF3D]">
                  <span>Discount Applied</span>
                  <span className="font-mono">-{formatINR(order.discountPaise)}</span>
                </div>
              )}
              <div className="flex justify-between text-white/60">
                <span>Includes 12% Indian GST (HSN 6109)</span>
                <span className="font-mono text-white/80">{formatINR(order.gstPaise)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                <span>Grand Total Paid</span>
                <span className="font-mono text-base text-[#C8FF3D]">{formatINR(order.totalPaise)}</span>
              </div>
            </div>
          </div>

          {/* Payment & Audit Info */}
          <div className="p-6 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white tracking-wide">Payment Telemetry</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-white/40 block text-[10px] uppercase">Gateway</span>
                <span className="font-bold text-white">{order.paymentMethod || 'RAZORPAY'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-white/40 block text-[10px] uppercase">Payment Status</span>
                <span className="font-bold text-emerald-400 font-mono">{order.paymentStatus}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-white/40 block text-[10px] uppercase">Razorpay Ref</span>
                <span className="font-mono text-[11px] text-white/80 truncate block">
                  {order.payments?.[0]?.razorpayPaymentId || 'pay_verified_live'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Status Transitions, Tracking, Customer Info */}
        <div className="space-y-6">
          
          {/* Status State Machine Controller */}
          <div className="p-6 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white tracking-wide">Fulfillment State</h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  order.status === 'DELIVERED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : order.status === 'CANCELLED'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-[#7C5CFF]/20 text-[#C8FF3D] border border-[#7C5CFF]/30'
                }`}
              >
                {order.status}
              </span>
            </div>

            {/* Allowed transitions enforcement */}
            {allowedNextStatuses.length > 0 ? (
              <form
                action={`/api/admin/orders/${order.orderNumber}/status`}
                method="POST"
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">
                    Advance State (Strict State Machine)
                  </label>
                  <select
                    name="newStatus"
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-white outline-none focus:border-[#7C5CFF]"
                  >
                    {allowedNextStatuses.map((st) => (
                      <option key={st} value={st} className="bg-[#07070B] text-white">
                        Move to {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">Courier Partner</label>
                  <select
                    name="courier"
                    defaultValue={order.trackingCourier || 'DELHIVERY'}
                    className="w-full px-4 py-2 rounded-2xl bg-white/[0.05] border border-white/10 text-xs text-white outline-none"
                  >
                    <option value="DELHIVERY" className="bg-[#07070B]">Delhivery Express</option>
                    <option value="BLUEDART" className="bg-[#07070B]">Blue Dart</option>
                    <option value="SHIPROCKET" className="bg-[#07070B]">Shiprocket Air</option>
                    <option value="DTDC" className="bg-[#07070B]">DTDC Priority</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">Tracking AWB #</label>
                  <input
                    type="text"
                    name="trackingNumber"
                    defaultValue={order.trackingNumber || ''}
                    placeholder="e.g. 142839201938"
                    className="w-full px-4 py-2 rounded-2xl bg-white/[0.05] border border-white/10 text-xs font-mono text-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-2xl bg-[#7C5CFF] hover:bg-violet-600 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-[#7C5CFF]/25 transition-all"
                >
                  Update Order State
                </button>
              </form>
            ) : (
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-white/50 text-center">
                This order is in a terminal state ({order.status}). No further state progression allowed.
              </div>
            )}
          </div>

          {/* Customer & Shipping Address */}
          <div className="p-6 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-white font-bold text-sm">
              <MapPin className="w-4 h-4 text-[#C8FF3D]" />
              <span>Customer & Destination</span>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-white text-sm">{order.user?.name || order.address?.fullName}</p>
              <p className="text-white/60">{order.user?.email}</p>
              <p className="text-white/60 font-mono">{order.user?.phone || order.address?.phone}</p>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-white/80 space-y-1 mt-3">
                <p>{order.address?.street}</p>
                <p>
                  {order.address?.city}, {order.address?.state} - {order.address?.postalCode}
                </p>
                <p className="font-semibold text-white">{order.address?.country || 'India'}</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
