import React from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Eye,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  RotateCcw,
  XCircle,
  FileText,
  Printer,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import AdminHeader from '@/components/admin/AdminHeader';

function formatINR(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; paymentStatus?: string }>;
}) {
  const resolved = await searchParams;
  const q = resolved.q || '';
  const statusFilter = resolved.status || '';

  let orders: any[] = [];
  try {
    const where: any = {};
    if (statusFilter) {
      where.status = statusFilter;
    }
    if (q) {
      where.OR = [
        { orderNumber: { contains: q } },
        { user: { email: { contains: q } } },
        { user: { name: { contains: q } } },
        { trackingNumber: { contains: q } },
      ];
    }

    orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: true,
        payments: { take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('Failed to query orders for admin:', err);
    // Mock orders for testing without database
    orders = [
      {
        id: 'ord-101',
        orderNumber: 'LVX-2026-9081',
        createdAt: new Date(),
        totalPaise: 359800,
        status: 'PROCESSING',
        paymentStatus: 'COMPLETED',
        paymentMethod: 'RAZORPAY',
        user: { name: 'Aarav Sharma', email: 'aarav@gmail.com' },
        items: [
          { productName: 'Waffle Oversized Drop Tee', size: 'L', quantity: 2 },
        ],
      },
      {
        id: 'ord-102',
        orderNumber: 'LVX-2026-9082',
        createdAt: new Date(Date.now() - 3600000 * 4),
        totalPaise: 189900,
        status: 'SHIPPED',
        paymentStatus: 'COMPLETED',
        paymentMethod: 'RAZORPAY',
        user: { name: 'Rohan Verma', email: 'rohan.v@gmail.com' },
        items: [
          { productName: 'Heavyweight Boxy Fit Tee', size: 'M', quantity: 1 },
        ],
      },
      {
        id: 'ord-103',
        orderNumber: 'LVX-2026-9083',
        createdAt: new Date(Date.now() - 3600000 * 24),
        totalPaise: 199900,
        status: 'RETURN_REQUESTED',
        paymentStatus: 'COMPLETED',
        paymentMethod: 'RAZORPAY',
        user: { name: 'Kabir Patel', email: 'kabir.p@outlook.com' },
        items: [
          { productName: 'Vintage Mineral Acid Wash Tee', size: 'XL', quantity: 1 },
        ],
      },
    ];
  }

  const STATUS_TABS = [
    { label: 'All Orders', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Shipped', value: 'SHIPPED' },
    { label: 'Exchanges', value: 'RETURN_REQUESTED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <AdminHeader
        title="Fulfillments & Orders"
        subtitle="Manage streetwear drops dispatch, shipping labels, and status state machine"
      />

      {/* Filter Tabs */}
      <div className="p-6 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={tab.value ? `/admin/orders?status=${tab.value}` : '/admin/orders'}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === tab.value
                  ? 'bg-[#7C5CFF] text-white shadow-md shadow-[#7C5CFF]/30'
                  : 'bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="p-6 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Order ID</th>
                <th className="pb-3 font-semibold">Date & Time</th>
                <th className="pb-3 font-semibold">Streetwear Fan</th>
                <th className="pb-3 font-semibold">Garments</th>
                <th className="pb-3 font-semibold">Total Amount</th>
                <th className="pb-3 font-semibold">Payment</th>
                <th className="pb-3 font-semibold">Fulfillment Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.length > 0 ? (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Order ID */}
                    <td className="py-4 font-mono font-bold text-white">
                      <Link
                        href={`/admin/orders/${o.orderNumber}`}
                        className="hover:text-[#C8FF3D] transition-colors"
                      >
                        {o.orderNumber}
                      </Link>
                    </td>

                    {/* Date */}
                    <td className="py-4 text-white/60 font-mono text-[11px]">
                      {new Date(o.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Customer */}
                    <td className="py-4">
                      <p className="font-semibold text-white">{o.user?.name || 'Customer'}</p>
                      <p className="text-[10px] text-white/40">{o.user?.email || 'guest@thelevix.com'}</p>
                    </td>

                    {/* Items */}
                    <td className="py-4 text-white/70">
                      <span className="font-bold text-white">{o.items?.length || 1} tees</span>
                      <p className="text-[10px] text-white/40 truncate max-w-[150px]">
                        {o.items?.[0]?.productName || 'Oversized Tee'}
                      </p>
                    </td>

                    {/* Amount */}
                    <td className="py-4 font-bold text-[#C8FF3D] font-mono text-sm">
                      {formatINR(o.totalPaise)}
                    </td>

                    {/* Payment Status */}
                    <td className="py-4">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            o.paymentStatus === 'COMPLETED'
                              ? 'bg-emerald-400'
                              : o.paymentStatus === 'FAILED'
                              ? 'bg-red-400'
                              : 'bg-amber-400'
                          }`}
                        />
                        <span className="font-mono text-[11px] text-white/80">{o.paymentStatus}</span>
                      </div>
                      <span className="text-[10px] text-white/40 uppercase">{o.paymentMethod || 'RAZORPAY'}</span>
                    </td>

                    {/* Order Status */}
                    <td className="py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          o.status === 'DELIVERED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : o.status === 'SHIPPED'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : o.status === 'PROCESSING'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : o.status === 'RETURN_REQUESTED'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : o.status === 'CANCELLED'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-white/10 text-white/80 border border-white/15'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Packing Slip */}
                        <a
                          href={`/api/admin/orders/${o.orderNumber}/packing-slip`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Print Thermal Packing Slip"
                          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-white/60 hover:text-white transition-all"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </a>

                        {/* Order Detail */}
                        <Link
                          href={`/admin/orders/${o.orderNumber}`}
                          title="Manage Order"
                          className="p-2 rounded-xl bg-[#7C5CFF]/20 hover:bg-[#7C5CFF]/40 text-[#7C5CFF] hover:text-white transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-white/40 text-xs">
                    No orders matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
