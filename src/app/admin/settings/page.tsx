import React from 'react';
import {
  Settings,
  Download,
  Save,
  Truck,
  FileSpreadsheet,
  AlertOctagon,
  Percent,
  IndianRupee,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import AdminHeader from '@/components/admin/AdminHeader';

export default async function AdminSettingsPage() {
  let settings: any = null;
  try {
    settings = await prisma.storeSettings.findFirst();
  } catch (err) {
    console.error('Failed to load store settings:', err);
  }

  const freeShippingThreshold = settings?.freeShippingThresholdPaise
    ? settings.freeShippingThresholdPaise / 100
    : 999;
  const standardShippingFee = settings?.standardShippingFeePaise
    ? settings.standardShippingFeePaise / 100
    : 99;
  const gstPercentage = settings?.gstPercentage || 12;
  const codEnabled = settings?.codEnabled ?? false;
  const codFee = settings?.codFeePaise ? settings.codFeePaise / 100 : 50;

  return (
    <div className="space-y-8 animate-fadeIn pb-24">
      <AdminHeader
        title="Store Configuration & Data Exports"
        subtitle="Global logistics thresholds, tax rates, payment rules, and CSV exports"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Settings Form (2 cols) */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl space-y-6">
          <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
            <div className="p-2 rounded-xl bg-[#7C5CFF]/20 text-[#7C5CFF]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Financial & Fulfillment Parameters
              </h3>
              <p className="text-xs text-white/50">
                Authoritative rules enforced in shared totals and checkout engines
              </p>
            </div>
          </div>

          <form action="/api/admin/settings" method="POST" className="space-y-5 text-xs">
            {/* Logistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-white/80">
                  Free Shipping Minimum Cart (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-white/40">₹</span>
                  <input
                    type="number"
                    name="freeShippingThreshold"
                    defaultValue={freeShippingThreshold}
                    className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white font-mono font-bold outline-none"
                  />
                </div>
                <p className="text-[10px] text-white/40">Default: ₹999 across all India pin codes</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-white/80">
                  Standard Shipping Fee (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-white/40">₹</span>
                  <input
                    type="number"
                    name="standardShippingFee"
                    defaultValue={standardShippingFee}
                    className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white font-mono font-bold outline-none"
                  />
                </div>
                <p className="text-[10px] text-white/40">Applied if order is below threshold</p>
              </div>
            </div>

            {/* Indian GST */}
            <div className="space-y-1.5">
              <label className="font-semibold text-white/80">
                Indian GST Rate (%) - Apparel HSN 6109
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="gstPercentage"
                  defaultValue={gstPercentage}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-[#C8FF3D] font-mono font-bold outline-none"
                />
              </div>
              <p className="text-[10px] text-white/40">
                12% GST mandated for readymade oversized knitted t-shirts
              </p>
            </div>

            {/* Cash on Delivery Settings */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">Cash on Delivery (COD)</h4>
                  <p className="text-[10px] text-white/50">Enable or disable COD payments during drops</p>
                </div>
                <input
                  type="checkbox"
                  name="codEnabled"
                  defaultChecked={codEnabled}
                  className="w-4 h-4 rounded accent-[#7C5CFF]"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <label className="font-semibold text-white/80">COD Handling Surcharge (₹)</label>
                <input
                  type="number"
                  name="codFee"
                  defaultValue={codFee}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#7C5CFF] to-violet-600 hover:opacity-90 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-[#7C5CFF]/25 flex items-center space-x-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save System Parameters</span>
            </button>
          </form>
        </div>

        {/* CSV Data Exports (1 col) */}
        <div className="p-6 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl space-y-6">
          <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
            <div className="p-2 rounded-xl bg-[#C8FF3D]/20 text-[#C8FF3D]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Data Exports (CSV)</h3>
              <p className="text-xs text-white/50">One-click operational reports</p>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href="/api/admin/export?type=orders"
              className="w-full p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 flex items-center justify-between text-xs text-white font-semibold transition-all group"
            >
              <div className="flex items-center space-x-3">
                <Download className="w-4 h-4 text-[#7C5CFF] group-hover:translate-y-0.5 transition-transform" />
                <span>Export Orders (Full History)</span>
              </div>
              <span className="text-[10px] font-mono text-white/40">.CSV</span>
            </a>

            <a
              href="/api/admin/export?type=products"
              className="w-full p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 flex items-center justify-between text-xs text-white font-semibold transition-all group"
            >
              <div className="flex items-center space-x-3">
                <Download className="w-4 h-4 text-[#C8FF3D] group-hover:translate-y-0.5 transition-transform" />
                <span>Export Product Matrix & Stock</span>
              </div>
              <span className="text-[10px] font-mono text-white/40">.CSV</span>
            </a>

            <a
              href="/api/admin/export?type=customers"
              className="w-full p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 flex items-center justify-between text-xs text-white font-semibold transition-all group"
            >
              <div className="flex items-center space-x-3">
                <Download className="w-4 h-4 text-[#7C5CFF] group-hover:translate-y-0.5 transition-transform" />
                <span>Export Customers & LTV</span>
              </div>
              <span className="text-[10px] font-mono text-white/40">.CSV</span>
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/80 space-y-1">
            <span className="font-bold block text-amber-300">GST Compliance Notice</span>
            <p className="text-[11px] leading-relaxed">
              Exported CSV reports contain separate columns for CGST, SGST, IGST, and HSN 6109 code for Indian GST filing.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
