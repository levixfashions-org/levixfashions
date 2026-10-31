'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Sparkles,
  UploadCloud,
  Check,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  Save,
  Layers,
  Palette,
  Ruler,
} from 'lucide-react';

export interface ProductMatrixFormProps {
  initialData?: any;
  isEditMode?: boolean;
}

const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;

const LEVIX_CORE_CATEGORIES = [
  { id: 'waffle-oversized', name: 'Waffle Oversized Tees', fit: 'OVERSIZED' },
  { id: 'boxy-fit', name: 'Boxy Fit Tees', fit: 'BOXY' },
  { id: 'full-sleeve-oversized', name: 'Full Sleeve Oversized Tees', fit: 'FULL_SLEEVE' },
  { id: 'acid-wash', name: 'Acid Wash Tees', fit: 'OVERSIZED' },
];

export function ProductMatrixForm({ initialData, isEditMode = false }: ProductMatrixFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form Base Fields
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(
    initialData?.description ||
      'Heavyweight oversized silhouette engineered for structured drape. Pre-shrunk French Terry cotton with dropped shoulders and ribbed crew collar.'
  );
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || 'boxy-fit');
  const [fitType, setFitType] = useState(initialData?.fitType || 'BOXY');
  const [fabric, setFabric] = useState(initialData?.fabric || '100% Combed Ringspun French Terry');
  const [gsm, setGsm] = useState<number>(initialData?.gsm || 280);
  const [careInstructions, setCareInstructions] = useState(
    initialData?.careInstructions || 'Cold machine wash inside out. Do not tumble dry. Iron on reverse.'
  );
  const [modelInfo, setModelInfo] = useState(
    initialData?.modelInfo || 'Model is 6’1” (185 cm) wearing size L for a slouchy streetwear fit.'
  );
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? true);
  const [isNewArrival, setIsNewArrival] = useState(initialData?.isNewArrival ?? true);

  // Colors Matrix State
  const [colors, setColors] = useState<Array<{ id: string; name: string; hex: string }>>(
    initialData?.colors || [
      { id: 'c1', name: 'Mineral Washed Charcoal', hex: '#2A2A2E' },
      { id: 'c2', name: 'Vintage Chalk White', hex: '#EAE6DF' },
    ]
  );

  // Matrix Cell Data: Key is `${colorId}-${size}`
  // Stores { stock: number, sku: string, priceRupees: number, comparePriceRupees: number }
  const [matrixData, setMatrixData] = useState<Record<string, any>>(() => {
    const initialCells: Record<string, any> = {};
    const defaultPrice = 1799;
    const defaultCompare = 2499;

    (initialData?.colors || [
      { id: 'c1', name: 'Mineral Washed Charcoal' },
      { id: 'c2', name: 'Vintage Chalk White' },
    ]).forEach((c: any) => {
      STANDARD_SIZES.forEach((size) => {
        const key = `${c.id}-${size}`;
        initialCells[key] = {
          stock: 25,
          sku: `LVX-${size}-${c.name.substring(0, 3).toUpperCase()}`,
          priceRupees: defaultPrice,
          comparePriceRupees: defaultCompare,
        };
      });
    });
    return initialCells;
  });

  // Bulk Matrix Inputs
  const [bulkPrice, setBulkPrice] = useState(1799);
  const [bulkStock, setBulkStock] = useState(30);

  // Images state
  const [images, setImages] = useState<Array<{ url: string; colorName: string; isPrimary: boolean }>>(
    initialData?.images || [
      {
        url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        colorName: 'Mineral Washed Charcoal',
        isPrimary: true,
      },
    ]
  );
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageColor, setNewImageColor] = useState('Mineral Washed Charcoal');

  // Slug auto-generation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isEditMode) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  // Color management
  const addColor = () => {
    const newId = `c_${Date.now()}`;
    const newColor = { id: newId, name: 'Acid Washed Violet', hex: '#7C5CFF' };
    setColors([...colors, newColor]);

    // Populate matrix cells for this new color
    setMatrixData((prev) => {
      const next = { ...prev };
      STANDARD_SIZES.forEach((size) => {
        const key = `${newId}-${size}`;
        next[key] = {
          stock: bulkStock,
          sku: `LVX-${slug ? slug.substring(0, 4).toUpperCase() : 'TEE'}-VIO-${size}`,
          priceRupees: bulkPrice,
          comparePriceRupees: Math.round(bulkPrice * 1.3),
        };
      });
      return next;
    });
  };

  const removeColor = (id: string) => {
    if (colors.length <= 1) {
      alert('A product drop must have at least one colorway.');
      return;
    }
    setColors(colors.filter((c) => c.id !== id));
  };

  // Bulk Apply Matrix Helpers
  const applyBulkPrice = () => {
    setMatrixData((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        next[key] = {
          ...next[key],
          priceRupees: bulkPrice,
          comparePriceRupees: Math.round(bulkPrice * 1.35),
        };
      });
      return next;
    });
  };

  const applyBulkStock = () => {
    setMatrixData((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        next[key] = {
          ...next[key],
          stock: bulkStock,
        };
      });
      return next;
    });
  };

  // Add Image
  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    setImages([
      ...images,
      {
        url: newImageUrl.trim(),
        colorName: newImageColor,
        isPrimary: images.length === 0,
      },
    ]);
    setNewImageUrl('');
  };

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Transform matrix into database ProductVariant payload
    const variantsPayload: any[] = [];
    colors.forEach((color) => {
      STANDARD_SIZES.forEach((size) => {
        const cell = matrixData[`${color.id}-${size}`] || {
          stock: 20,
          sku: `LVX-${size}-${color.name.substring(0, 3)}`,
          priceRupees: bulkPrice,
          comparePriceRupees: Math.round(bulkPrice * 1.3),
        };

        variantsPayload.push({
          size,
          colorName: color.name,
          colorHex: color.hex,
          sku: cell.sku,
          price: Math.round(Number(cell.priceRupees) * 100), // Converted to integer paise
          compareAtPrice: Math.round(Number(cell.comparePriceRupees) * 100),
          stock: parseInt(cell.stock, 10),
        });
      });
    });

    const payload = {
      name,
      slug,
      description,
      categoryId,
      fitType,
      fabric,
      gsm: Number(gsm),
      careInstructions,
      modelInfo,
      isFeatured,
      isNewArrival,
      variants: variantsPayload,
      images,
    };

    try {
      const url = isEditMode
        ? `/api/admin/products/${initialData.id}`
        : '/api/admin/products';
      const method = isEditMode ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to save product drop');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/products');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn pb-24">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-xs font-semibold text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#7C5CFF] to-violet-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-[#7C5CFF]/20 flex items-center space-x-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Committing...' : isEditMode ? 'Update Drop' : 'Publish Matrix Drop'}</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center space-x-3">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center space-x-3">
          <Check className="w-4 h-4 text-[#C8FF3D] flex-shrink-0" />
          <span>Drop committed successfully! Syncing cache and storefront ISR...</span>
        </div>
      )}

      {/* Section 1: Core Garment Specifications */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl space-y-6">
        <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
          <div className="p-2 rounded-xl bg-[#7C5CFF]/20 text-[#7C5CFF]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">Garment Specifications</h2>
            <p className="text-xs text-white/50">Core streetwear silhouette identity and fabric specs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/80">Garment Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Acid Washed Boxy Heavyweight Tee"
              className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-[#7C5CFF] text-xs text-white placeholder-white/30 outline-none"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/80">URL Slug *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. acid-washed-boxy-heavyweight-tee"
              className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-[#7C5CFF] text-xs text-white placeholder-white/30 font-mono outline-none"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/80">Levix Core Category *</label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                const found = LEVIX_CORE_CATEGORIES.find((c) => c.id === e.target.value);
                if (found) setFitType(found.fit);
              }}
              className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-[#7C5CFF] text-xs text-white outline-none"
            >
              {LEVIX_CORE_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[#07070B] text-white">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Fit Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/80">Fit Type *</label>
            <select
              value={fitType}
              onChange={(e) => setFitType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-[#7C5CFF] text-xs text-white outline-none"
            >
              <option value="BOXY" className="bg-[#07070B] text-white">BOXY (Wide Chest, Cropped Length)</option>
              <option value="OVERSIZED" className="bg-[#07070B] text-white">OVERSIZED (Dropped Shoulder, Extended Length)</option>
              <option value="FULL_SLEEVE" className="bg-[#07070B] text-white">FULL SLEEVE OVERSIZED (Ribbed Cuffs)</option>
            </select>
          </div>

          {/* Fabric Composition */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/80">Fabric Composition</label>
            <input
              type="text"
              value={fabric}
              onChange={(e) => setFabric(e.target.value)}
              placeholder="e.g. 100% Combed Ringspun French Terry"
              className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-[#7C5CFF] text-xs text-white placeholder-white/30 outline-none"
            />
          </div>

          {/* Fabric Weight GSM */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/80">Fabric Weight (GSM) *</label>
            <input
              type="number"
              value={gsm}
              onChange={(e) => setGsm(Number(e.target.value))}
              placeholder="260"
              className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-[#7C5CFF] text-xs text-white placeholder-white/30 outline-none"
            />
          </div>
        </div>

        {/* Garment Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/80">Editorial Storytelling & Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-[#7C5CFF] text-xs text-white placeholder-white/30 outline-none"
          />
        </div>

        {/* Model Specs & Care instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/80">Model Measurements & Drape Guide</label>
            <input
              type="text"
              value={modelInfo}
              onChange={(e) => setModelInfo(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-[#7C5CFF] text-xs text-white outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/80">Care Instructions</label>
            <input
              type="text"
              value={careInstructions}
              onChange={(e) => setCareInstructions(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-[#7C5CFF] text-xs text-white outline-none"
            />
          </div>
        </div>

        {/* Visibility Toggles */}
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <label className="flex items-center space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded accent-[#7C5CFF]"
            />
            <span className="text-xs font-semibold text-white/90">Feature on Home Campaign Hero</span>
          </label>
          <label className="flex items-center space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isNewArrival}
              onChange={(e) => setIsNewArrival(e.target.checked)}
              className="w-4 h-4 rounded accent-[#C8FF3D]"
            />
            <span className="text-xs font-semibold text-white/90">Display in New Streetwear Drop</span>
          </label>
        </div>
      </div>

      {/* Section 2: Colorways & Swatches */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#C8FF3D]/20 text-[#C8FF3D]">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Colorway Palette</h2>
              <p className="text-xs text-white/50">Define wash variants for this silhouette drop</p>
            </div>
          </div>
          <button
            type="button"
            onClick={addColor}
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-white flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-[#C8FF3D]" />
            <span>Add Colorway</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {colors.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between space-x-3"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <input
                  type="color"
                  value={c.hex}
                  onChange={(e) => {
                    const newHex = e.target.value;
                    setColors(colors.map((item) => (item.id === c.id ? { ...item, hex: newHex } : item)));
                  }}
                  className="w-8 h-8 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={c.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setColors(colors.map((item) => (item.id === c.id ? { ...item, name: newName } : item)));
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs font-semibold text-white outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => removeColor(c.id)}
                className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: THE MATRIX GRID (Color x Size) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#7C5CFF]/20 text-[#7C5CFF]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Variant Matrix (Color × Size)</h2>
              <p className="text-xs text-white/50">Manage pricing, stock, and SKUs across all cells in one synchronized view</p>
            </div>
          </div>

          {/* Quick Bulk Population Toolbar */}
          <div className="flex flex-wrap items-center gap-3 bg-white/[0.02] p-2 rounded-2xl border border-white/5">
            <div className="flex items-center space-x-1.5 text-xs text-white/70">
              <span>Bulk ₹:</span>
              <input
                type="number"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(Number(e.target.value))}
                className="w-20 px-2 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-[#C8FF3D] font-bold outline-none"
              />
              <button
                type="button"
                onClick={applyBulkPrice}
                className="px-2 py-1 rounded-lg bg-[#7C5CFF]/30 hover:bg-[#7C5CFF]/50 text-[10px] font-bold text-white transition-all"
              >
                Apply
              </button>
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-white/70">
              <span>Bulk Stock:</span>
              <input
                type="number"
                value={bulkStock}
                onChange={(e) => setBulkStock(Number(e.target.value))}
                className="w-16 px-2 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-white font-bold outline-none"
              />
              <button
                type="button"
                onClick={applyBulkStock}
                className="px-2 py-1 rounded-lg bg-[#7C5CFF]/30 hover:bg-[#7C5CFF]/50 text-[10px] font-bold text-white transition-all"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-white/50">
                <th className="py-3 px-3 font-semibold uppercase tracking-wider">Colorway</th>
                {STANDARD_SIZES.map((size) => (
                  <th key={size} className="py-3 px-3 font-semibold uppercase tracking-wider text-center">
                    Size {size}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {colors.map((color) => (
                <tr key={color.id} className="hover:bg-white/[0.01]">
                  <td className="py-4 px-3 align-top min-w-[180px]">
                    <div className="flex items-center space-x-2.5">
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="font-bold text-white">{color.name}</span>
                    </div>
                  </td>

                  {STANDARD_SIZES.map((size) => {
                    const key = `${color.id}-${size}`;
                    const cell = matrixData[key] || {
                      stock: 25,
                      sku: `LVX-${size}-${color.name.substring(0, 3)}`,
                      priceRupees: bulkPrice,
                      comparePriceRupees: Math.round(bulkPrice * 1.3),
                    };

                    return (
                      <td key={size} className="py-4 px-2 min-w-[130px]">
                        <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                          <div>
                            <div className="flex justify-between text-[10px] text-white/50 mb-0.5">
                              <span>Stock</span>
                              <span className="font-mono text-white/40">{size}</span>
                            </div>
                            <input
                              type="number"
                              value={cell.stock}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMatrixData((prev) => ({
                                  ...prev,
                                  [key]: { ...cell, stock: val },
                                }));
                              }}
                              className="w-full px-2 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-xs font-bold text-white text-center outline-none"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] text-white/50 mb-0.5">
                              <span>Price ₹</span>
                            </div>
                            <input
                              type="number"
                              value={cell.priceRupees}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setMatrixData((prev) => ({
                                  ...prev,
                                  [key]: { ...cell, priceRupees: val },
                                }));
                              }}
                              className="w-full px-2 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-xs font-bold text-[#C8FF3D] text-center outline-none"
                            />
                          </div>

                          <div>
                            <span className="text-[9px] text-white/30 block mb-0.5">SKU</span>
                            <input
                              type="text"
                              value={cell.sku}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMatrixData((prev) => ({
                                  ...prev,
                                  [key]: { ...cell, sku: val },
                                }));
                              }}
                              className="w-full px-1.5 py-0.5 rounded bg-white/[0.02] border border-white/5 text-[10px] font-mono text-white/60 outline-none"
                            />
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: Per-Color Image Gallery */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl space-y-6">
        <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
          <div className="p-2 rounded-xl bg-[#7C5CFF]/20 text-[#7C5CFF]">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">Lookbook & Per-Color Images</h2>
            <p className="text-xs text-white/50">Associate photography to exact colorways for dynamic swatch switching</p>
          </div>
        </div>

        {/* Add photo bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Paste high-res image URL (e.g. Hostinger storage, Cloudinary, Unsplash)..."
            className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-[#7C5CFF] text-xs text-white placeholder-white/30 outline-none"
          />
          <select
            value={newImageColor}
            onChange={(e) => setNewImageColor(e.target.value)}
            className="w-full sm:w-64 px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-white outline-none"
          >
            {colors.map((c) => (
              <option key={c.id} value={c.name} className="bg-[#07070B] text-white">
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddImage}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-xs font-semibold text-white transition-all whitespace-nowrap"
          >
            Attach Photo
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-black/40"
            >
              <img src={img.url} alt="Drop lookbook" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 p-3 flex flex-col justify-between">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="p-1 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md">
                    {img.colorName}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}

export default ProductMatrixForm;
