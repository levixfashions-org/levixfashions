import React from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowUpDown,
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

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string }>;
}) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || '';
  const categoryFilter = resolvedParams.category || '';
  const showArchived = resolvedParams.status === 'archived';

  let products: any[] = [];
  try {
    const whereClause: any = {};

    if (showArchived) {
      whereClause.deletedAt = { not: null };
    } else {
      whereClause.deletedAt = null;
    }

    if (q) {
      whereClause.OR = [
        { name: { contains: q } },
        { slug: { contains: q } },
        { variants: { some: { sku: { contains: q } } } },
      ];
    }

    if (categoryFilter) {
      whereClause.categoryId = categoryFilter;
    }

    products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        variants: true,
        images: { take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('Failed to load admin products:', err);
    // Mock dataset for initial setups
    products = [
      {
        id: 'prod-waffle-1',
        name: 'Waffle Oversized Drop Tee',
        slug: 'waffle-oversized-drop-tee',
        fitType: 'OVERSIZED',
        gsm: 260,
        isFeatured: true,
        isNewArrival: true,
        deletedAt: null,
        category: { name: 'Waffle Oversized' },
        variants: [
          { id: 'v1', size: 'M', stock: 24, price: 179900 },
          { id: 'v2', size: 'L', stock: 18, price: 179900 },
          { id: 'v3', size: 'XL', stock: 8, price: 179900 },
        ],
        images: [
          { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800' },
        ],
      },
      {
        id: 'prod-boxy-1',
        name: 'Heavyweight Boxy Fit Tee',
        slug: 'heavyweight-boxy-fit-tee',
        fitType: 'BOXY',
        gsm: 280,
        isFeatured: true,
        isNewArrival: true,
        deletedAt: null,
        category: { name: 'Boxy Fit' },
        variants: [
          { id: 'v4', size: 'S', stock: 12, price: 189900 },
          { id: 'v5', size: 'M', stock: 29, price: 189900 },
        ],
        images: [
          { url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800' },
        ],
      },
      {
        id: 'prod-acid-1',
        name: 'Vintage Mineral Acid Wash Tee',
        slug: 'vintage-mineral-acid-wash-tee',
        fitType: 'OVERSIZED',
        gsm: 250,
        isFeatured: true,
        isNewArrival: false,
        deletedAt: null,
        category: { name: 'Acid Wash' },
        variants: [
          { id: 'v6', size: 'L', stock: 6, price: 199900 },
          { id: 'v7', size: 'XL', stock: 4, price: 199900 },
        ],
        images: [
          { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800' },
        ],
      },
    ];
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <AdminHeader
        title="Products Catalog Matrix"
        subtitle="Manage street drops, size x color matrices, and stock velocity"
      />

      {/* Action Header & Filter Controls */}
      <div className="p-6 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search & Status Tabs */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-1 p-1 rounded-2xl bg-white/[0.04] border border-white/10">
            <Link
              href="/admin/products"
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                !showArchived
                  ? 'bg-[#7C5CFF] text-white shadow-md shadow-[#7C5CFF]/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Active Drops
            </Link>
            <Link
              href="/admin/products?status=archived"
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                showArchived
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Archived / Soft-Deleted
            </Link>
          </div>

          {/* Core Category Dropdown */}
          <div className="flex items-center space-x-2">
            <Link
              href="/admin/products"
              className="text-xs px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 text-white/70 hover:text-white"
            >
              All Styles
            </Link>
            <Link
              href="/admin/products?category=waffle-oversized"
              className="text-xs px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 text-white/70 hover:text-white"
            >
              Waffle
            </Link>
            <Link
              href="/admin/products?category=boxy-fit"
              className="text-xs px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 text-white/70 hover:text-white"
            >
              Boxy
            </Link>
            <Link
              href="/admin/products?category=acid-wash"
              className="text-xs px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 text-white/70 hover:text-white"
            >
              Acid Wash
            </Link>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <Link
            href="/admin/products/new"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#7C5CFF] to-violet-600 hover:opacity-90 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-[#7C5CFF]/25 flex items-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Matrix Drop</span>
          </Link>
        </div>

      </div>

      {/* Main Glass Table */}
      <div className="p-6 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Silhouette Drop</th>
                <th className="pb-3 font-semibold">Category & Cut</th>
                <th className="pb-3 font-semibold">GSM / Specs</th>
                <th className="pb-3 font-semibold">Variants / Stock</th>
                <th className="pb-3 font-semibold">Starting Price</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.length > 0 ? (
                products.map((prod) => {
                  const totalStock = prod.variants?.reduce(
                    (acc: number, v: any) => acc + (v.stock || 0),
                    0
                  );
                  const minPrice = prod.variants?.[0]?.price || 179900;
                  const thumb = prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800';

                  return (
                    <tr key={prod.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Product Thumbnail & Title */}
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={thumb}
                            alt={prod.name}
                            className="w-12 h-14 object-cover rounded-xl border border-white/10 bg-black/40"
                          />
                          <div>
                            <p className="font-bold text-white text-sm tracking-wide">{prod.name}</p>
                            <p className="text-[10px] font-mono text-white/40">/{prod.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category & Cut */}
                      <td className="py-4">
                        <span className="font-semibold text-white/90 block">
                          {prod.category?.name || 'Streetwear'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/20 inline-block mt-1">
                          {prod.fitType}
                        </span>
                      </td>

                      {/* GSM & Attributes */}
                      <td className="py-4 font-mono text-white/70">
                        <span>{prod.gsm || 280} GSM</span>
                        <div className="flex items-center space-x-1.5 mt-1">
                          {prod.isNewArrival && (
                            <span className="text-[9px] font-bold text-[#C8FF3D] uppercase">NEW</span>
                          )}
                          {prod.isFeatured && (
                            <span className="text-[9px] font-bold text-[#7C5CFF] uppercase">FEATURED</span>
                          )}
                        </div>
                      </td>

                      {/* Matrix Variants & Total Stock */}
                      <td className="py-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-white">{prod.variants?.length || 0} SKUs</span>
                          <span className="text-white/30">|</span>
                          <span
                            className={`font-mono font-bold ${
                              totalStock <= 15 ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
                            {totalStock} units
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 mt-1 text-[10px] text-white/40">
                          {prod.variants?.slice(0, 4).map((v: any) => (
                            <span key={v.id} className="px-1 rounded bg-white/5">
                              {v.size}
                            </span>
                          ))}
                          {(prod.variants?.length || 0) > 4 && <span>+more</span>}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 font-bold text-[#C8FF3D] font-mono">
                        {formatINR(minPrice)}
                      </td>

                      {/* Status */}
                      <td className="py-4">
                        {prod.deletedAt ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                            Archived
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Live in Drop
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/product/${prod.slug}`}
                            target="_blank"
                            title="View on Storefront"
                            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-white/60 hover:text-white transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            href={`/admin/products/${prod.id}/edit`}
                            title="Edit Matrix & Stock"
                            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-white/60 hover:text-[#C8FF3D] transition-all"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          {prod.deletedAt ? (
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm(`Restore '${prod.name}' to live store?`)) {
                                  await fetch(`/api/admin/products/${prod.id}?action=restore`, {
                                    method: 'DELETE',
                                  });
                                  window.location.reload();
                                }
                              }}
                              title="Restore to Storefront"
                              className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm(`Archive '${prod.name}'? Product will be hidden from storefront.`)) {
                                  await fetch(`/api/admin/products/${prod.id}`, {
                                    method: 'DELETE',
                                  });
                                  window.location.reload();
                                }
                              }}
                              title="Soft Delete / Archive"
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-white/40 text-xs">
                    No products found matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
