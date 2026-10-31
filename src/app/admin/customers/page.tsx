import React from 'react';
import {
  Users,
  Search,
  ShieldBan,
  ShieldCheck,
  ShoppingBag,
  IndianRupee,
  Clock,
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

export default async function AdminCustomersPage() {
  let customers: any[] = [];
  try {
    customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      include: {
        orders: {
          select: { totalPaise: true, createdAt: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('Failed to query customers:', err);
    // Mock customer directory
    customers = [
      {
        id: 'cust-1',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@gmail.com',
        phone: '+91 98765 43210',
        status: 'ACTIVE',
        createdAt: new Date(Date.now() - 3600000 * 24 * 30),
        orders: [
          { totalPaise: 359800, createdAt: new Date() },
          { totalPaise: 179900, createdAt: new Date(Date.now() - 3600000 * 24 * 15) },
        ],
      },
      {
        id: 'cust-2',
        name: 'Rohan Verma',
        email: 'rohan.v@gmail.com',
        phone: '+91 91234 56789',
        status: 'ACTIVE',
        createdAt: new Date(Date.now() - 3600000 * 24 * 60),
        orders: [{ totalPaise: 189900, createdAt: new Date() }],
      },
      {
        id: 'cust-3',
        name: 'Suspicious Account',
        email: 'bot_spammer@tempmail.com',
        phone: '+91 90000 00000',
        status: 'BLOCKED',
        createdAt: new Date(Date.now() - 3600000 * 24 * 10),
        orders: [],
      },
    ];
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-24">
      <AdminHeader
        title="Streetwear Customers Directory"
        subtitle="Manage user profiles, lifetime order values (LTV), and fraud defense"
      />

      {/* Main Customers Table */}
      <div className="p-6 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Streetwear Fan</th>
                <th className="pb-3 font-semibold">Contact</th>
                <th className="pb-3 font-semibold text-center">Total Drops</th>
                <th className="pb-3 font-semibold">Lifetime Value (LTV)</th>
                <th className="pb-3 font-semibold">Joined Date</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customers.map((c) => {
                const totalLTV = c.orders.reduce((sum: number, o: any) => sum + (o.totalPaise || 0), 0);

                return (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Name & ID */}
                    <td className="py-4">
                      <p className="font-bold text-white text-sm">{c.name || 'Anonymous User'}</p>
                      <p className="text-[10px] font-mono text-white/40">{c.id}</p>
                    </td>

                    {/* Email & Phone */}
                    <td className="py-4">
                      <p className="text-white/80">{c.email}</p>
                      <p className="text-[10px] font-mono text-white/40">{c.phone || 'No phone attached'}</p>
                    </td>

                    {/* Total Orders */}
                    <td className="py-4 text-center font-mono font-bold text-white">
                      {c.orders.length}
                    </td>

                    {/* LTV */}
                    <td className="py-4 font-mono font-bold text-[#C8FF3D] text-sm">
                      {formatINR(totalLTV)}
                    </td>

                    {/* Joined */}
                    <td className="py-4 text-white/50 font-mono text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Status */}
                    <td className="py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    {/* Block / Unblock Action */}
                    <td className="py-4 text-right">
                      <form action={`/api/admin/customers/${c.id}/block`} method="POST">
                        <button
                          type="submit"
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            c.status === 'ACTIVE'
                              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {c.status === 'ACTIVE' ? 'Block Customer' : 'Unblock Access'}
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
