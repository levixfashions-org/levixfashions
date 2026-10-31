'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception to console / Sentry
    console.error('[UNHANDLED_APPLICATION_ERROR]', error);

    // Forward to Sentry if initialized
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error);
    }
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 text-white font-sans relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="fixed top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-red-600/10 blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full bg-[#7C5CFF]/10 blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-red-500/20 shadow-2xl text-center space-y-6">
        
        {/* Visual Badge */}
        <div className="w-16 h-16 rounded-3xl bg-red-500/15 border border-red-500/30 mx-auto flex items-center justify-center text-red-400 shadow-lg shadow-red-500/20">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Heading & Context */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-red-400 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
            SYSTEM INTERRUPT
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            SOMETHING WENT WRONG
          </h1>
          <p className="text-xs text-white/60 leading-relaxed">
            An unexpected error occurred while rendering this view. Our engineering monitors have been alerted.
          </p>
        </div>

        {/* Digest Reference */}
        {error.digest && (
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-[10px] font-mono text-white/40">
            <span>Incident ID: </span>
            <span className="text-white/70">{error.digest}</span>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#7C5CFF] hover:bg-violet-600 text-white text-xs font-bold tracking-wider uppercase shadow-lg shadow-[#7C5CFF]/25 flex items-center justify-center space-x-2 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white/80 hover:text-white text-xs font-semibold tracking-wider uppercase flex items-center justify-center space-x-2 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
