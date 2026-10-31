'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Shirt,
  Layers,
  ShoppingBag,
  RefreshCw,
  Users,
  TicketPercent,
  Star,
  Bell,
  ScrollText,
  Settings,
  ArrowUpRight,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products Matrix', href: '/admin/products', icon: Shirt },
  { name: 'Categories', href: '/admin/categories', icon: Layers },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag, badge: 'Live' },
  { name: 'Size Exchanges', href: '/admin/exchanges', icon: RefreshCw, badge: '7-Day' },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Coupons', href: '/admin/coupons', icon: TicketPercent },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Stock Alerts', href: '/admin/stock-alerts', icon: Bell },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: ScrollText },
  { name: 'Store Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 hidden md:flex flex-col z-30">
      <div className="sticky top-6 flex flex-col h-[calc(100vh-3rem)] rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-2xl p-5 overflow-hidden transition-all duration-300">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10 dark:border-white/5">
          <Link href="/admin" className="group flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7C5CFF] to-[#C8FF3D] p-[1px] shadow-lg shadow-[#7C5CFF]/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#07070B] rounded-[15px] flex items-center justify-center">
                <span className="font-black text-sm tracking-tighter text-white">LX</span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold tracking-widest text-base text-white">LEVIX</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#7C5CFF]/20 text-[#C8FF3D] border border-[#7C5CFF]/30">
                  OPS
                </span>
              </div>
              <p className="text-[11px] text-white/50 tracking-wider font-mono">STREETWEAR SUITE</p>
            </div>
          </Link>
        </div>

        {/* Quick Link to Public Store */}
        <div className="my-4">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-xs text-white/70 hover:text-white transition-all group"
          >
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#C8FF3D] animate-pulse" />
              <span>Live Storefront</span>
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#7C5CFF]/25 to-[#7C5CFF]/10 text-white border border-[#7C5CFF]/40 shadow-lg shadow-[#7C5CFF]/10 font-semibold'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#C8FF3D]' : 'text-white/40 group-hover:text-white/80'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge ? (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badge === 'Live'
                        ? 'bg-[#C8FF3D]/20 text-[#C8FF3D] border border-[#C8FF3D]/30'
                        : 'bg-[#7C5CFF]/20 text-white/90 border border-[#7C5CFF]/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight className="w-3 h-3 text-[#7C5CFF]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* System Health / Footer status */}
        <div className="pt-4 mt-2 border-t border-white/10 dark:border-white/5">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center space-x-2.5">
              <ShieldAlert className="w-4 h-4 text-[#C8FF3D]" />
              <div>
                <p className="text-[11px] font-semibold text-white/90">MySQL + Hostinger</p>
                <p className="text-[10px] text-white/40">Atomic Deductions Active</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
        </div>

      </div>
    </aside>
  );
}

export default AdminSidebar;
