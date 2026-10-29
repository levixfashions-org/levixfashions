import React, { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Filter, X, SlidersHorizontal, ArrowUpDown, PackageOpen, Plus, ShieldCheck } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { useAuth } from '../context/AuthContext'
import { ProductCard } from '../components/storefront/ProductCard'
import { SEO } from '../components/common/SEO'
import type { SortOption } from '../types/product'
import { formatPrice } from '../lib/utils'

export const Shop: React.FC = () => {
  const { products, categories, loading } = useStore()
  const { isAdmin } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  // Read URL query params
  const categoryParam = searchParams.get('collection') || searchParams.get('category') || 'all'
  const sortParam = (searchParams.get('sort') as SortOption) || 'featured'
  const searchParam = searchParams.get('search') || ''

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam)
  const [sortBy, setSortBy] = useState<SortOption>(sortParam)
  const [inStockOnly, setInStockOnly] = useState<boolean>(false)
  const [priceRange, setPriceRange] = useState<number>(1000000) // max ₹10,000 in paise
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false)

  // Sync category changes with URL
  const handleCategoryChange = (catSlug: string) => {
    setSelectedCategory(catSlug)
    if (catSlug === 'all') {
      searchParams.delete('category')
      searchParams.delete('collection')
    } else {
      searchParams.set('collection', catSlug)
      searchParams.set('category', catSlug)
    }
    setSearchParams(searchParams)
  }

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort)
    searchParams.set('sort', sort)
    setSearchParams(searchParams)
  }

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.isPublished)

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      const matchedCat = categories.find((c) => c.slug === selectedCategory)
      if (matchedCat) {
        result = result.filter((p) => {
          if (p.categoryId === matchedCat.id || p.categoryId === matchedCat.slug) return true
          if (p.categoryName?.trim().toLowerCase() === matchedCat.name.trim().toLowerCase()) return true
          if (matchedCat.slug === 't-shirts') {
            const cat = (p.categoryId || '').toLowerCase()
            const name = (p.name || '').toLowerCase()
            if (
              cat.includes('t-shirt') ||
              cat.includes('tee') ||
              name.includes('t-shirt') ||
              name.includes('tee') ||
              name.includes('tshirt')
            ) {
              return true
            }
          }
          return false
        })
      }
    }

    // Search query filter
    if (searchParam.trim()) {
      const q = searchParam.trim().toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
    }

    // In stock only filter
    if (inStockOnly) {
      result = result.filter((p) => p.stock > 0)
    }

    // Max price filter
    result = result.filter((p) => (p.salePrice || p.price) <= priceRange)

    // Sorting
    return [...result].sort((a, b) => {
      const priceA = a.salePrice || a.price
      const priceB = b.salePrice || b.price

      switch (sortBy) {
        case 'price-asc':
          return priceA - priceB
        case 'price-desc':
          return priceB - priceA
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        case 'bestsellers':
          return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0)
        case 'featured':
        default:
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
      }
    })
  }, [products, categories, selectedCategory, searchParam, inStockOnly, priceRange, sortBy])

  const clearAllFilters = () => {
    setSelectedCategory('all')
    setSortBy('featured')
    setInStockOnly(false)
    setPriceRange(1000000)
    setSearchParams({})
  }

  return (
    <div className="bg-white min-h-screen py-10 sm:py-14">
      <SEO
        title={searchParam ? `Search: "${searchParam}"` : 'Shop Collection'}
        description="Browse the complete LEVIX catalogue: heavyweight outerwear, minimal everyday essentials, footwear, and leather goods."
      />

      <div className="container-levix">
        {/* Header Bar */}
        {isAdmin && (
          <div className="mb-6 p-3 bg-levix-charcoal text-white border-l-4 border-white/40 flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-white shrink-0" />
              <span className="font-bold uppercase tracking-wider">Admin Catalog Controls</span>
              <span className="text-[11px] text-neutral-400 hidden sm:inline">• You can add products directly from here</span>
            </div>
            <Link
              to="/admin/products"
              className="btn-primary py-1.5 px-3 text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create Product</span>
            </Link>
          </div>
        )}

        <div className="border-b border-levix-border pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-black/60 mb-1">
              Catalogue
            </p>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-levix-charcoal">
              {searchParam
                ? `Results for "${searchParam}"`
                : selectedCategory !== 'all'
                ? categories.find((c) => c.slug === selectedCategory)?.name || 'Collection'
                : 'All Products'}
            </h1>
            <p className="text-xs text-levix-secondary mt-1">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden btn-secondary text-xs py-2.5 px-4 flex items-center gap-2"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            {/* Sort Select */}
            <div className="flex items-center gap-2 bg-levix-gray px-3 py-2 border border-levix-border">
              <ArrowUpDown className="w-3.5 h-3.5 text-levix-secondary" />
              <label htmlFor="sort-select" className="text-xs font-semibold uppercase text-levix-secondary hidden sm:inline">
                Sort By:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="bg-transparent text-xs font-semibold text-levix-charcoal focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest Releases</option>
                <option value="bestsellers">Bestsellers</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-8 sticky top-28 border border-levix-border p-6 bg-white">
            <div className="flex items-center justify-between pb-4 border-b border-levix-border">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-levix-charcoal" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-levix-charcoal">
                  Filter Products
                </h3>
              </div>
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[11px] font-semibold text-black hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Category Selector */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-levix-charcoal mb-3">
                Collections
              </h4>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleCategoryChange('all')}
                  className={`w-full text-left text-xs py-1.5 px-2 flex justify-between items-center transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-black/5 text-black font-bold border-l-2 border-black'
                      : 'text-levix-secondary hover:text-levix-charcoal hover:bg-levix-gray'
                  }`}
                >
                  <span>All Collections</span>
                  <span>{products.filter((p) => p.isPublished).length}</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`w-full text-left text-xs py-1.5 px-2 flex justify-between items-center transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-black/5 text-black font-bold border-l-2 border-black'
                        : 'text-levix-secondary hover:text-levix-charcoal hover:bg-levix-gray'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span>
                      {products.filter((p) => p.categoryId === cat.id && p.isPublished).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-levix-charcoal">
                  Max Price
                </h4>
                <span className="text-xs font-semibold text-black">
                  {formatPrice(priceRange)}
                </span>
              </div>
              <input
                type="range"
                min="100000"
                max="1000000"
                step="50000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-levix-secondary mt-1">
                <span>₹1,000</span>
                <span>₹10,000</span>
              </div>
            </div>

            {/* In Stock Only Checkbox */}
            <div className="pt-2 border-t border-levix-border">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 text-black rounded-none border-levix-border focus:ring-black accent-black"
                />
                <span className="text-xs font-medium text-levix-charcoal">In Stock Only</span>
              </label>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-levix-gray animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-levix-border p-8 bg-white space-y-4">
                <PackageOpen className="w-12 h-12 text-levix-secondary mx-auto mb-2 stroke-1" />
                <div>
                  <h3 className="text-base font-bold text-levix-charcoal uppercase tracking-wider">
                    Catalogue Being Curated
                  </h3>
                  <p className="text-xs text-levix-secondary mt-1 max-w-sm mx-auto">
                    {isAdmin
                      ? 'You are logged in as the Administrator. Click below to take photos and create your first product.'
                      : 'New garments are currently being prepared for this seasonal run. Check back shortly.'}
                  </p>
                </div>
                {isAdmin ? (
                  <div className="pt-2">
                    <Link
                      to="/admin/products"
                      className="btn-primary text-xs uppercase tracking-wider inline-flex items-center gap-2 px-5 py-3 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create First Product (Camera / Gallery)</span>
                    </Link>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="btn-primary text-xs uppercase tracking-wider"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-levix-border mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
                  Filter Catalogue
                </h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-levix-secondary hover:text-levix-charcoal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-levix-charcoal mb-3">
                  Collections
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      handleCategoryChange('all')
                      setIsMobileFilterOpen(false)
                    }}
                    className={`w-full text-left text-xs py-2 px-2 ${
                      selectedCategory === 'all'
                        ? 'bg-black/5 text-black font-bold'
                        : 'text-levix-charcoal'
                    }`}
                  >
                    All Collections
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        handleCategoryChange(c.slug)
                        setIsMobileFilterOpen(false)
                      }}
                      className={`w-full text-left text-xs py-2 px-2 ${
                        selectedCategory === c.slug
                          ? 'bg-black/5 text-black font-bold'
                          : 'text-levix-charcoal'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-levix-charcoal">
                    Max Price
                  </h4>
                  <span className="text-xs font-semibold text-black">
                    {formatPrice(priceRange)}
                  </span>
                </div>
                <input
                  type="range"
                  min="100000"
                  max="1000000"
                  step="50000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-black"
                />
              </div>

              {/* In stock */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 text-black accent-black"
                />
                <span className="text-xs font-medium text-levix-charcoal">In Stock Only</span>
              </label>
            </div>

            <div className="pt-6 border-t border-levix-border space-y-2">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full btn-primary py-3 text-xs uppercase tracking-wider"
              >
                Apply Filters ({filteredProducts.length})
              </button>
              <button
                type="button"
                onClick={clearAllFilters}
                className="w-full btn-secondary py-2.5 text-xs uppercase tracking-wider"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
