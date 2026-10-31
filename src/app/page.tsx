import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Sparkles, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen p-6 sm:p-12 max-w-7xl mx-auto flex flex-col justify-between space-y-12 animate-fadeIn">
      {/* Top Navigation */}
      <header className="flex items-center justify-between p-4 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7C5CFF] to-[#C8FF3D] p-[1px]">
            <div className="w-full h-full bg-[#07070B] rounded-[15px] flex items-center justify-center">
              <span className="font-black text-sm tracking-tighter text-white">LX</span>
            </div>
          </div>
          <span className="font-extrabold tracking-widest text-lg text-white">LEVIX</span>
        </div>

        <nav className="flex items-center space-x-4 text-xs font-semibold">
          <Link href="/shop" className="text-white/70 hover:text-white transition-colors">
            Catalog
          </Link>
          <Link href="/shipping-returns" className="text-white/70 hover:text-white transition-colors">
            7-Day Exchange
          </Link>
          <Link
            href="/admin"
            className="px-4 py-2 rounded-2xl bg-[#7C5CFF]/20 text-[#C8FF3D] border border-[#7C5CFF]/30 hover:bg-[#7C5CFF]/30 transition-all"
          >
            Admin Suite
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="text-center py-16 space-y-6">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs text-[#C8FF3D] font-mono">
          <Sparkles className="w-3.5 h-3.5 text-[#C8FF3D]" />
          <span>DROP 01 // 240-280 GSM FRENCH TERRY</span>
        </div>

        <h1 className="text-4xl sm:text-7xl font-black tracking-tight text-white uppercase max-w-4xl mx-auto leading-none">
          OVERSIZED. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C5CFF] to-[#C8FF3D]">
            ELEVATED.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-white/60 max-w-xl mx-auto leading-relaxed">
          Premium heavyweight streetwear exclusively engineered in 4 signature silhouettes.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/shop"
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#7C5CFF] to-violet-600 hover:opacity-90 text-white font-bold text-xs tracking-wider uppercase shadow-xl shadow-[#7C5CFF]/25 flex items-center space-x-2 transition-all"
          >
            <span>Explore Drops</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>

          <Link
            href="/admin"
            className="px-8 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-semibold text-xs tracking-wider uppercase transition-all"
          >
            Enter Operations Suite
          </Link>
        </div>
      </section>

      {/* 4 Core Silhouettes Preview */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'Waffle Oversized Tee', gsm: '260 GSM', tag: 'Textured Thermal' },
          { name: 'Boxy Fit Drop Shoulder', gsm: '280 GSM', tag: 'French Terry' },
          { name: 'Full Sleeve Oversized', gsm: '240 GSM', tag: 'Ribbed Cuffs' },
          { name: 'Vintage Acid Wash Tee', gsm: '250 GSM', tag: 'Mineral Wash' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 shadow-xl space-y-2"
          >
            <span className="text-[10px] font-mono text-[#C8FF3D] font-bold uppercase">{item.gsm}</span>
            <h3 className="font-bold text-white text-base">{item.name}</h3>
            <p className="text-xs text-white/50">{item.tag}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-white/40 pt-8 border-t border-white/5 flex items-center justify-between">
        <span>© 2026 LEVIX. All rights reserved.</span>
        <span className="flex items-center space-x-1.5 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>7-Day Hassle-Free Size Exchange Active</span>
        </span>
      </footer>
    </main>
  );
}
