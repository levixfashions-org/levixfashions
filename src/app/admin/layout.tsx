import React from 'react';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export const metadata = {
  title: 'Admin Suite | LEVIX Oversized Streetwear',
  description: 'Enterprise operations, variant matrix inventory, and order fulfillment.',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side guard: redirects to login if unauthenticated or blocks non-admins
  try {
    await requireAdmin();
  } catch (err: any) {
    if (err?.status === 401) {
      redirect('/login?returnTo=/admin');
    }
    // Non-admin customer attempting to access admin route
    return (
      <div className="min-h-screen bg-[#07070B] flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl bg-red-950/20 border border-red-500/30 backdrop-blur-2xl text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 mx-auto flex items-center justify-center border border-red-500/30">
            <span className="text-xl font-black">403</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Access Restricted</h2>
          <p className="text-xs text-white/60 leading-relaxed">
            Your current account credentials lack administrative privileges to enter the LEVIX Operations Suite.
          </p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold tracking-wider uppercase transition-all"
          >
            Return to Storefront
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070B] text-white selection:bg-[#C8FF3D] selection:text-black font-sans relative overflow-x-hidden">
      {/* Background ambient glowing orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#7C5CFF]/10 blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#C8FF3D]/5 blur-[160px] pointer-events-none -z-10" />

      {/* Main Responsive Grid */}
      <div className="flex min-h-screen p-4 sm:p-6 lg:p-8 space-x-0 md:space-x-8 max-w-[1720px] mx-auto">
        <AdminSidebar />
        <main className="flex-1 min-w-0 flex flex-col pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
