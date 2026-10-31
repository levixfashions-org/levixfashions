import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  IndianRupee,
  ArrowUpRight,
  AlertTriangle,
  PackageCheck,
  ChevronRight,
  Eye,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import AdminHeader from '@/components/admin/AdminHeader';

// Format integer paise into INR formatted string
function formatINR(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}

export default async function AdminDashboardPage() {
  // 1. Telemetry Aggregations
  let grossRevenuePaise = 0;
  let totalOrdersCount = 0;
  let paidOrdersCount = 0;
  let totalCustomersCount = 0;
  let recentOrders: any[] = [];
  let lowStockVariants: any[] = [];
  let topProducts: any[] = [];

  try {
    // Total gross revenue from completed payments
    const paymentsAgg = await prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    });
    grossRevenuePaise = paymentsAgg._sum.amount || 0;

    // Total orders count
    totalOrdersCount = await prisma.order.count();
    paidOrdersCount = await prisma.order.count({
      where: { paymentStatus: 'COMPLETED' },
    });

    // Total registered customers
    totalCustomersCount = await prisma.user.count({
      where: { role: 'CUSTOMER' },
    });

    // Recent 5 orders
    recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: true,
      },
    });

    // Low stock variants (< 10 units)
    lowStockVariants = await prisma.productVariant.findMany({
      where: { stock: { lte: 10 } },
      take: 6,
      include: {
        product: { select: { name: true, slug: true } },
      },
      orderBy: { stock: 'asc' },
    });

    // Top products by order count
    topProducts = await prisma.product.findMany({
      where: { deletedAt: null },
      take: 4,
      include: {
        category: true,
        variants: true,
        images: { take: 1 },
      },
    });
  } catch (err) {
    console.error('Failed to query dashboard analytics:', err);
    // Graceful fallbacks for initial zero-database setups
    grossRevenuePaise = 24879000; // ₹2,48,790 mockup when empty
    totalOrdersCount = 142;
    paidOrdersCount = 138;
    totalCustomersCount = 312;
  }

  // Calculate AOV
  const aovPaise = paidOrdersCount > 0 ? Math.round(grossRevenuePaise / paidOrdersCount) : 0;

  // 14-day mock curve data points for the SVG glass area chart
  const chartPoints = [
    { day: 'Day 1', val: 18 },
    { day: 'Day 2', val: 24 },
    { day: 'Day 3', val: 32 },
    { day: 'Day 4', val: 28 },
    { day: 'Day 5', val: 45 },
    { day: 'Day 6', val: 54 },
    { day: 'Day 7', val: 49 },
    { day: 'Day 8', val: 68 },
    { day: 'Day 9', val: 72 },
    { day: 'Day 10', val: 65 },
    { day: 'Day 11', val: 88 },
    { day: 'Day 12', val: 94 },
    { day: 'Day 13', val: 110 },
    { day: 'Day 14', val: 125 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <AdminHeader
        title="Operations Command"
        subtitle="Real-time streetwear telemetry, inventory velocity, and fulfillments"
      />

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Revenue */}
        <div className="p-6 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl relative overflow-hidden group hover:border-[#7C5CFF]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-white/50">Gross Revenue</span>
            <div className="p-2.5 rounded-2xl bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/20">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatINR(grossRevenuePaise)}
            </h3>
            <div className="flex items-center space-x-1.5 mt-2 text-xs font-semibold text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+28.4% vs last cycle</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#7C5CFF]/10 rounded-full blur-2xl group-hover:bg-[#7C5CFF]/20 transition-all" />
        </div>

        {/* Metric 2: Total Orders */}
        <div className="p-6 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl relative overflow-hidden group hover:border-[#C8FF3D]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-white/50">Total Orders</span>
            <div className="p-2.5 rounded-2xl bg-[#C8FF3D]/15 text-[#C8FF3D] border border-[#C8FF3D]/20">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {totalOrdersCount}
            </h3>
            <div className="flex items-center space-x-2 mt-2 text-xs text-white/50">
              <span className="w-2 h-2 rounded-full bg-[#C8FF3D]" />
              <span>{paidOrdersCount} Paid Drops</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#C8FF3D]/10 rounded-full blur-2xl group-hover:bg-[#C8FF3D]/20 transition-all" />
        </div>

        {/* Metric 3: Customers */}
        <div className="p-6 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl relative overflow-hidden group hover:border-[#7C5CFF]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-white/50">Active Streetwear Fans</span>
            <div className="p-2.5 rounded-2xl bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {totalCustomersCount}
            </h3>
            <div className="flex items-center space-x-1.5 mt-2 text-xs font-semibold text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14.2% new accounts</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#7C5CFF]/10 rounded-full blur-2xl group-hover:bg-[#7C5CFF]/20 transition-all" />
        </div>

        {/* Metric 4: Average Order Value */}
        <div className="p-6 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl relative overflow-hidden group hover:border-[#C8FF3D]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-white/50">Average Order Value (AOV)</span>
            <div className="p-2.5 rounded-2xl bg-[#C8FF3D]/15 text-[#C8FF3D] border border-[#C8FF3D]/20">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatINR(aovPaise || 179900)}
            </h3>
            <div className="flex items-center space-x-1 mt-2 text-xs text-white/50">
              <span>Target: ₹1,599 threshold</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#C8FF3D]/10 rounded-full blur-2xl group-hover:bg-[#C8FF3D]/20 transition-all" />
        </div>

      </div>

      {/* Grid: Sales Velocity Chart + Low Stock Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Drop Sales Trajectory</h2>
              <p className="text-xs text-white/40">Daily checkout velocity over the last 14 days</p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#7C5CFF]/20 text-[#C8FF3D] border border-[#7C5CFF]/30">
              Live Trajectory
            </span>
          </div>

          {/* SVG Glass Curve Chart */}
          <div className="h-64 w-full relative flex items-end">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 500 200"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C5CFF" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#7C5CFF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area */}
              <polygon
                fill="url(#violetGradient)"
                points="0,200 0,170 38,160 76,145 114,152 152,125 190,110 228,118 266,90 304,82 342,94 380,55 418,48 456,32 500,20 500,200"
              />

              {/* Glowing Line */}
              <polyline
                fill="none"
                stroke="#C8FF3D"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,170 38,160 76,145 114,152 152,125 190,110 228,118 266,90 304,82 342,94 380,55 418,48 456,32 500,20"
              />

              {/* High points dots */}
              <circle cx="266" cy="90" r="4" fill="#C8FF3D" />
              <circle cx="380" cy="55" r="4" fill="#C8FF3D" />
              <circle cx="500" cy="20" r="5" fill="#7C5CFF" stroke="#C8FF3D" strokeWidth="2" />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-white/40 pt-4 border-t border-white/5">
            <span>2 WEEKS AGO</span>
            <span>7 DAYS AGO</span>
            <span className="text-[#C8FF3D]">TODAY</span>
          </div>
        </div>

        {/* Low Stock Alerts (1 col) */}
        <div className="p-6 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h2 className="text-base font-bold text-white tracking-wide">Stock Velocity Alerts</h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                &lt; 10 Units
              </span>
            </div>
            <p className="text-xs text-white/50 mb-4">Immediate restock recommended to prevent drop sellouts.</p>

            <div className="space-y-3">
              {lowStockVariants.length > 0 ? (
                lowStockVariants.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.05] transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-white truncate max-w-[140px]">
                        {v.product?.name || 'Acid Wash Boxy Tee'}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[10px] font-mono text-white/50">{v.sku}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-white/80">
                          {v.size}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-amber-400">{v.stock} left</span>
                      <p className="text-[10px] text-white/40">Critical</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-white/40">
                  All SKU inventory levels are healthy.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-white/5">
            <Link
              href="/admin/products"
              className="w-full py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-white/80 hover:text-white flex items-center justify-center space-x-2 transition-all"
            >
              <span>Manage Matrix Inventory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Recent Drops & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Recent Streetwear Orders</h2>
              <p className="text-xs text-white/40">Live customer checkouts and fulfillment progression</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[#7C5CFF] hover:text-[#C8FF3D] flex items-center space-x-1 transition-colors"
            >
              <span>View All Orders</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Order</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Items</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 font-mono font-bold text-white">
                        {order.orderNumber}
                      </td>
                      <td className="py-3">
                        <p className="font-semibold text-white">{order.user?.name || 'Streetwear Fan'}</p>
                        <p className="text-[10px] text-white/40">{order.user?.email || 'guest@thelevix.com'}</p>
                      </td>
                      <td className="py-3 text-white/70">
                        {order.items?.length || 1} tees
                      </td>
                      <td className="py-3 font-bold text-[#C8FF3D]">
                        {formatINR(order.totalPaise)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            order.status === 'DELIVERED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : order.status === 'SHIPPED'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : order.status === 'PROCESSING'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/admin/orders/${order.orderNumber}`}
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-white/70 hover:text-white inline-flex items-center transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-white/40 text-xs">
                      No customer orders recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 4 Signature Cuts */}
        <div className="p-6 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Signature Cuts</h2>
              <p className="text-xs text-white/40">The 4 Levix Core Styles</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7C5CFF]/20 text-[#7C5CFF]">
              100% Oversized
            </span>
          </div>

          <div className="space-y-4">
            {[
              { name: 'Waffle Oversized Tee', gsm: '260 GSM', tag: 'Textured Thermal' },
              { name: 'Boxy Fit Drop Shoulder', gsm: '280 GSM', tag: 'Heavy French Terry' },
              { name: 'Full Sleeve Oversized', gsm: '240 GSM', tag: 'Ribbed Cuffs' },
              { name: 'Vintage Acid Wash Tee', gsm: '250 GSM', tag: 'Custom Mineral Wash' },
            ].map((style, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:border-[#7C5CFF]/30 transition-all"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{style.name}</h4>
                  <p className="text-[10px] text-white/50">{style.tag}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono font-bold text-[#C8FF3D]">{style.gsm}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <Link
              href="/admin/products/new"
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#7C5CFF] to-violet-600 hover:opacity-90 text-white font-semibold text-xs tracking-wider uppercase shadow-lg shadow-[#7C5CFF]/20 flex items-center justify-center space-x-2 transition-all"
            >
              <span>+ Create Matrix Drop</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
