'use client';

import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  ShieldCheck,
  Menu,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AdminHeader({
  title = 'Overview Dashboard',
  subtitle = 'Real-time telemetry and catalog operations',
}: {
  title?: string;
  subtitle?: string;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (searchQuery.toUpperCase().startsWith('LVX-') || searchQuery.startsWith('#')) {
      router.push(`/admin/orders?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push(`/admin/products?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-6 z-20 mb-8 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl p-4 sm:px-6 flex items-center justify-between">
      
      {/* Title & Context */}
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{title}</h1>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7C5CFF]/20 text-[#7C5CFF] border border-[#7C5CFF]/30">
            ROOT OPS
          </span>
        </div>
        <p className="text-xs text-white/50 hidden sm:block mt-0.5">{subtitle}</p>
      </div>

      {/* Center Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="hidden lg:flex items-center relative w-80 xl:w-96"
      >
        <Search className="w-4 h-4 text-white/40 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Order #, SKU, or Product..."
          className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-[#7C5CFF] focus:bg-white/[0.07] text-xs text-white placeholder-white/40 outline-none transition-all duration-200"
        />
        <kbd className="absolute right-3 text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/40 font-mono">
          ↵
        </kbd>
      </form>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white transition-all"
        >
          {isDark ? <Sun className="w-4 h-4 text-[#C8FF3D]" /> : <Moon className="w-4 h-4 text-[#7C5CFF]" />}
        </button>

        {/* Alerts / Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white transition-all"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C8FF3D] ring-2 ring-[#07070B]" />
        </button>

        {/* Admin Identity Pill */}
        <div className="flex items-center space-x-3 pl-2 sm:pl-3 border-l border-white/10">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#7C5CFF] to-violet-900 border border-white/20 flex items-center justify-center shadow-md shadow-[#7C5CFF]/20">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-white tracking-wide">Levix Principal</p>
            <p className="text-[10px] text-[#C8FF3D] font-mono">admin@thelevix.com</p>
          </div>

          {/* Logout Action */}
          <button
            type="button"
            onClick={async () => {
              try {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login';
              } catch {
                window.location.href = '/login';
              }
            }}
            title="Sign out from Admin Suite"
            className="p-2 rounded-xl bg-white/[0.02] hover:bg-red-500/10 hover:text-red-400 text-white/40 border border-transparent hover:border-red-500/20 transition-all ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

    </header>
  );
}

export default AdminHeader;
