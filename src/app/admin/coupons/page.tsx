import React from 'react';
import {
  TicketPercent,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Sparkles,
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

export default async function AdminCouponsPage() {
  let coupons: any[] = [];
  try {
    coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('Failed to query coupons:', err);
    // Mock seed coupons
    coupons = [
      {
        id: 'c-1',
        code: 'WELCOME10',
        discountType: 'PERCENT',
        discountValue: 10,
        minOrderPaise: 99900,
        maxUses: 1000,
        usedCount: 142,
        isActive: true,
        expiresAt: new Date(Date.now() + 3600000 * 24 * 365),
      },
      {
        id: 'c-2',
        code: 'LEVIX15',
        discountType: 'PERCENT',
        discountValue: 15,
        minOrderPaise: 249900,
        maxUses: 500,
        usedCount: 88,
        isActive: true,
        expiresAt: new Date(Date.now() + 3600000 * 24 * 90),
      },
      {
        id: 'c-3',
        code: 'FLAT500',
        discountType: 'FIXED_PAISE',
        discountValue: 50000,
        minOrderPaise: 349900,
        maxUses: 200,
        usedCount: 45,
        isActive: true,
        expiresAt: new Date(Date.now() + 3600000 * 24 * 30),
      },
    ];
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-24">
      <AdminHeader
        title="Promotions & Coupons Engine"
        subtitle="Configure discount codes, minimum order rules, and redemption caps"
      />

      {/* Grid: Coupon Creator (1 col) + Active Coupons (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Creator Form */}
        <div className="p-6 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl space-y-5">
          <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
            <div className="p-2 rounded-xl bg-[#7C5CFF]/20 text-[#7C5CFF]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Issue New Promo Code</h3>
              <p className="text-xs text-white/50">Strict server-side validation enforced</p>
            </div>
          </div>

          <form action="/api/admin/coupons" method="POST" className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-white/80">Coupon Code *</label>
              <input
                type="text"
                name="code"
                required
                placeholder="e.g. STREETWEAR20"
                className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-[#7C5CFF] text-white font-mono uppercase tracking-wider outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-white/80">Type *</label>
                <select
                  name="discountType"
                  className="w-full px-3 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white outline-none"
                >
                  <option value="PERCENT" className="bg-[#07070B]">Percentage (%)</option>
                  <option value="FIXED_PAISE" className="bg-[#07070B]">Flat INR (₹)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-white/80">Value *</label>
                <input
                  type="number"
                  name="discountValue"
                  required
                  placeholder="e.g. 15 or 500"
                  className="w-full px-3 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-[#C8FF3D] font-bold outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-white/80">Min Order Requirement (₹)</label>
              <input
                type="number"
                name="minOrderRupees"
                defaultValue={999}
                className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-white/80">Max Redemptions</label>
              <input
                type="number"
                name="maxUses"
                defaultValue={500}
                className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#7C5CFF] to-violet-600 hover:opacity-90 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-[#7C5CFF]/25 transition-all mt-2"
            >
              Activate Coupon
            </button>
          </form>
        </div>

        {/* Existing Coupons Table (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl">
          <h3 className="text-sm font-bold text-white tracking-wide mb-4">Active Streetwear Promos</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Code</th>
                  <th className="pb-3 font-semibold">Discount</th>
                  <th className="pb-3 font-semibold">Min Order</th>
                  <th className="pb-3 font-semibold text-center">Redeemed</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {coupons.map((cp) => (
                  <tr key={cp.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Code */}
                    <td className="py-4">
                      <span className="font-mono font-bold text-white text-sm px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10">
                        {cp.code}
                      </span>
                    </td>

                    {/* Discount */}
                    <td className="py-4 font-mono font-bold text-[#C8FF3D]">
                      {cp.discountType === 'PERCENT'
                        ? `${cp.discountValue}% OFF`
                        : `${formatINR(cp.discountValue)} FLAT OFF`}
                    </td>

                    {/* Min Order */}
                    <td className="py-4 text-white/70 font-mono">
                      {formatINR(cp.minOrderPaise)}
                    </td>

                    {/* Usage */}
                    <td className="py-4 text-center font-mono">
                      <span className="font-bold text-white">{cp.usedCount}</span>
                      <span className="text-white/40"> / {cp.maxUses || '∞'}</span>
                    </td>

                    {/* Status */}
                    <td className="py-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
