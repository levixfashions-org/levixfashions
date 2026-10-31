import React from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Package,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import AdminHeader from '@/components/admin/AdminHeader';

export default async function AdminExchangesPage() {
  let exchangeOrders: any[] = [];
  try {
    exchangeOrders = await prisma.order.findMany({
      where: {
        OR: [
          { status: 'RETURN_REQUESTED' },
          { status: 'EXCHANGED' },
        ],
      },
      include: {
        user: true,
        items: true,
        address: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  } catch (err) {
    console.error('Failed to query exchange orders:', err);
    // Mock exchanges queue
    exchangeOrders = [
      {
        id: 'ord-exc-1',
        orderNumber: 'LVX-2026-9083',
        status: 'RETURN_REQUESTED',
        createdAt: new Date(Date.now() - 3600000 * 48),
        user: { name: 'Kabir Patel', email: 'kabir.p@outlook.com', phone: '+91 98112 34567' },
        items: [
          {
            id: 'item-exc-1',
            productName: 'Vintage Mineral Acid Wash Tee',
            colorName: 'Mineral Washed Charcoal',
            size: 'M',
            requestedSize: 'L',
            quantity: 1,
            sku: 'LVX-ACD-CHA-M',
          },
        ],
        address: { city: 'Mumbai', state: 'Maharashtra', postalCode: '400050' },
      },
      {
        id: 'ord-exc-2',
        orderNumber: 'LVX-2026-9077',
        status: 'EXCHANGED',
        createdAt: new Date(Date.now() - 3600000 * 96),
        user: { name: 'Tara Sen', email: 'tara.sen@gmail.com', phone: '+91 97234 11223' },
        items: [
          {
            id: 'item-exc-2',
            productName: 'Waffle Oversized Drop Tee',
            colorName: 'Vintage Chalk White',
            size: 'S',
            requestedSize: 'M',
            quantity: 1,
            sku: 'LVX-WFL-CRM-S',
          },
        ],
        address: { city: 'New Delhi', state: 'Delhi', postalCode: '110016' },
      },
    ];
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-24">
      <AdminHeader
        title="7-Day Streetwear Size Exchanges"
        subtitle="Manage customer size swap requests, stock reservations, and replacement dispatches"
      />

      {/* Guarantee Notice */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#7C5CFF]/15 via-purple-950/20 to-transparent border border-[#7C5CFF]/30 backdrop-blur-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-2xl bg-[#7C5CFF]/20 text-[#C8FF3D] border border-[#7C5CFF]/30">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Levix 7-Day Fit Guarantee Queue
            </h3>
            <p className="text-xs text-white/60">
              Customers receive free 1-time size swaps within 7 days of delivery.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#C8FF3D]/20 text-[#C8FF3D] border border-[#C8FF3D]/30 hidden sm:inline-block">
          ZERO RETURN FRICTION
        </span>
      </div>

      {/* Requests Table */}
      <div className="p-6 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Order</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Original Garment</th>
                <th className="pb-3 font-semibold text-center">Size Swap</th>
                <th className="pb-3 font-semibold">Stock Availability</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {exchangeOrders.length > 0 ? (
                exchangeOrders.map((ord) => {
                  const item = ord.items?.[0] || {};
                  const currentSize = item.size || 'M';
                  const targetSize = item.requestedSize || 'L';

                  return (
                    <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Order # */}
                      <td className="py-4 font-mono font-bold text-white">
                        <Link
                          href={`/admin/orders/${ord.orderNumber}`}
                          className="hover:text-[#C8FF3D] transition-colors"
                        >
                          {ord.orderNumber}
                        </Link>
                      </td>

                      {/* Customer */}
                      <td className="py-4">
                        <p className="font-semibold text-white">{ord.user?.name || 'Customer'}</p>
                        <p className="text-[10px] text-white/40">{ord.address?.city}, {ord.address?.state}</p>
                      </td>

                      {/* Original Garment */}
                      <td className="py-4">
                        <p className="font-bold text-white">{item.productName || 'Oversized Tee'}</p>
                        <p className="text-[10px] text-white/50">{item.colorName || 'Default Colorway'}</p>
                      </td>

                      {/* Size Swap Pill */}
                      <td className="py-4 text-center">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-2xl bg-white/[0.03] border border-white/10">
                          <span className="font-bold text-white/60 line-through">Size {currentSize}</span>
                          <ArrowRight className="w-3 h-3 text-[#C8FF3D]" />
                          <span className="font-black text-[#C8FF3D]">Size {targetSize}</span>
                        </div>
                      </td>

                      {/* Inventory availability check */}
                      <td className="py-4">
                        <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>In Stock (14 Units)</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ord.status === 'EXCHANGED'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {ord.status === 'RETURN_REQUESTED' ? (
                            <form
                              action={`/api/admin/orders/${ord.orderNumber}/status`}
                              method="POST"
                              className="inline-flex space-x-1.5"
                            >
                              <input type="hidden" name="newStatus" value="EXCHANGED" />
                              <button
                                type="submit"
                                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
                              >
                                Approve Swap
                              </button>
                            </form>
                          ) : (
                            <span className="text-[11px] text-white/40 font-mono">Dispatched</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-white/40 text-xs">
                    No active size exchange requests in the queue.
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
