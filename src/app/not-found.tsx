import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 text-white font-sans relative overflow-hidden">
      {/* Background ambient orbs */}
      <div className="fixed top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-[#7C5CFF]/10 blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full bg-[#C8FF3D]/5 blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-2xl text-center space-y-6">
        
        {/* Visual Badge */}
        <div className="w-16 h-16 rounded-3xl bg-[#7C5CFF]/20 border border-[#7C5CFF]/30 mx-auto flex items-center justify-center text-[#C8FF3D] shadow-lg shadow-[#7C5CFF]/20">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#C8FF3D] px-2.5 py-0.5 rounded-full bg-[#C8FF3D]/10 border border-[#C8FF3D]/20">
            ERROR 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            SILHOUETTE NOT FOUND
          </h1>
          <p className="text-xs text-white/60 leading-relaxed">
            The streetwear cut, drop page, or resource you are looking for has been archived or relocated.
          </p>
        </div>

        {/* Quick Links */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/shop"
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#7C5CFF] hover:bg-violet-600 text-white text-xs font-bold tracking-wider uppercase shadow-lg shadow-[#7C5CFF]/25 transition-all"
          >
            Explore Drops
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white/80 hover:text-white text-xs font-semibold tracking-wider uppercase transition-all"
          >
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
