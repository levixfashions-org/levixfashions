import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  AlertCircle,
  Plus,
  Minus,
  Share2,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { ProductCard } from '../components/storefront/ProductCard'
import { SEO } from '../components/common/SEO'
import { formatPrice, normalizeColorImages } from '../lib/utils'
import type { ProductVariant } from '../types/product'

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { products } = useStore()
  const { addItem } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  const product = products.find((p) => p.slug === slug)

  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [copiedLink, setCopiedLink] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'shipping' | 'returns'>('details')
  const [showFloatingBar, setShowFloatingBar] = useState(false)
  const mainBuySectionRef = useRef<HTMLDivElement>(null)

  // Scroll listener to toggle the floating sticky bottom bar when user scrolls past the main buy section
  useEffect(() => {
    const handleScroll = () => {
      if (!mainBuySectionRef.current) return
      const rect = mainBuySectionRef.current.getBoundingClientRect()
      // When the bottom of the main add to bag section passes above the screen
      setShowFloatingBar(rect.bottom < 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Extract unique colors & sizes for clean multi-color selection
  const uniqueColors = useMemo(() => {
    if (!product?.variants) return []
    const colors = product.variants.map((v) => v.color?.trim()).filter(Boolean) as string[]
    return Array.from(new Set(colors))
  }, [product?.variants])

  const uniqueSizes = useMemo(() => {
    if (!product?.variants) return []
    const sizes = product.variants.map((v) => v.size?.trim()).filter(Boolean) as string[]
    return Array.from(new Set(sizes))
  }, [product?.variants])

  // Active color's Front and Back image URLs
  const activeColorImages = useMemo(() => {
    if (!selectedVariant?.color || !product?.colorImages) return null
    const raw = product.colorImages[selectedVariant.color]
    return raw ? normalizeColorImages(raw) : null
  }, [selectedVariant?.color, product?.colorImages])

  // Parse editorial description into clean luxury bullet points (7 to 8 separate lines)
  const descriptionBullets = useMemo(() => {
    if (!product?.description) return []
    const raw = product.description.trim()

    // 1. If bullet symbol (•) is present anywhere in the text
    if (raw.includes('•')) {
      const parts = raw
        .split(/[•\r?\n]+/)
        .map((p) => p.replace(/^[•\-*–—\d.)\]]+\s*/, '').trim())
        .filter((p) => p.length > 2)
      if (parts.length > 1) return parts
    }

    // 2. If line breaks exist (one bullet per line)
    const lines = raw
      .split(/\r?\n+/)
      .map((line) => line.replace(/^[•\-*–—\d.)\]]+\s*/, '').trim())
      .filter((line) => line.length > 2)

    if (lines.length > 1) {
      return lines
    }

    // 3. If hyphen or asterisk is used as bullet separator
    if (raw.includes('\n-') || raw.includes(' - ') || raw.includes('\n*')) {
      const parts = raw
        .split(/(?:\r?\n\s*[-*]|\s+-\s+)/)
        .map((p) => p.replace(/^[•\-*–—\d.)\]]+\s*/, '').trim())
        .filter((p) => p.length > 2)
      if (parts.length > 1) return parts
    }

    // 4. If long continuous paragraph, split by full sentences to create clean separate lines
    const sentences = raw
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 8)

    if (sentences.length >= 2) {
      return sentences
    }

    return [raw]
  }, [product?.description])

  // Extract all images including color-assigned images (both Front and Back)
  const allDisplayImages = useMemo(() => {
    if (!product) return []
    const list = [...product.images]
    if (product.colorImages) {
      Object.values(product.colorImages).forEach((raw) => {
        const { front, back } = normalizeColorImages(raw)
        if (front && !list.includes(front)) list.push(front)
        if (back && !list.includes(back)) list.push(back)
      })
    }
    if (product.variants) {
      product.variants.forEach((v) => {
        if (v.imageUrl && !list.includes(v.imageUrl)) list.push(v.imageUrl)
      })
    }
    return list.length > 0 ? list : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80']
  }, [product])

  // Initialize default variant
  useEffect(() => {
    if (product) {
      setActiveImageIndex(0)
      setQuantity(1)
      if (product.hasVariants && product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0])
      } else {
        setSelectedVariant(null)
      }
    }
  }, [product])

  // When selectedVariant changes, auto-switch image to the matching color front image
  useEffect(() => {
    const targetUrl =
      (selectedVariant?.color && product?.colorImages?.[selectedVariant.color]
        ? normalizeColorImages(product.colorImages[selectedVariant.color]).front
        : null) ||
      selectedVariant?.imageUrl
    if (targetUrl) {
      const idx = allDisplayImages.indexOf(targetUrl)
      if (idx !== -1) {
        setActiveImageIndex(idx)
      }
    }
  }, [selectedVariant, allDisplayImages, product?.colorImages])

  if (!product) {
    return (
      <div className="container-levix py-24 text-center">
        <h2 className="text-2xl font-bold text-levix-charcoal uppercase">Product Not Found</h2>
        <p className="text-xs text-levix-secondary mt-2 mb-6">
          The requested garment or accessory could not be found.
        </p>
        <Link to="/shop" className="btn-primary text-xs uppercase tracking-wider">
          Return to Shop
        </Link>
      </div>
    )
  }

  const wishlisted = isInWishlist(product.id)
  const currentPrice = selectedVariant?.price || product.salePrice || product.price
  const hasDiscount = product.salePrice && product.salePrice < product.price
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock
  const isOutOfStock = currentStock <= 0

  const chosenImage =
    activeColorImages?.front ||
    selectedVariant?.imageUrl ||
    allDisplayImages[activeImageIndex] ||
    product.images[0]

  const handleAddToCart = () => {
    if (isOutOfStock) return

    addItem(
      {
        productId: product.id,
        variantId: selectedVariant?.id,
        name: product.name,
        slug: product.slug,
        imageUrl: chosenImage,
        sku: selectedVariant?.sku || product.sku,
        variantName: selectedVariant?.name,
        price: currentPrice,
        maxStock: currentStock,
      },
      quantity
    )
  }

  const handleBuyNow = () => {
    if (isOutOfStock) return

    addItem(
      {
        productId: product.id,
        variantId: selectedVariant?.id,
        name: product.name,
        slug: product.slug,
        imageUrl: chosenImage,
        sku: selectedVariant?.sku || product.sku,
        variantName: selectedVariant?.name,
        price: currentPrice,
        maxStock: currentStock,
      },
      quantity
    )
    navigate('/checkout')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.shortDescription,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  // Related products from same category
  const relatedProducts = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id && p.isPublished)
    .slice(0, 4)

  return (
    <div className="bg-white min-h-screen py-8 sm:py-14">
      <SEO
        title={product.seoTitle || product.name}
        description={product.seoDescription || product.shortDescription}
        image={product.images[0]}
        product={product}
        type="product"
      />

      <div className="container-levix">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-levix-secondary mb-8">
          <Link to="/" className="hover:text-levix-orange transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-levix-orange transition-colors">Shop</Link>
          <span>/</span>
          <Link to={`/category/${product.categoryId.replace('cat-', '')}`} className="hover:text-levix-orange transition-colors">
            {product.categoryName}
          </Link>
          <span>/</span>
          <span className="text-levix-charcoal font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Product Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          {/* Image Gallery Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnail Strip */}
            {allDisplayImages.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[620px] scrollbar-none shrink-0">
                {allDisplayImages.map((img, idx) => {
                  const isFront = activeColorImages?.front === img
                  const isBack = activeColorImages?.back === img

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveImageIndex(idx)
                        if (product.colorImages) {
                          const matchColor = Object.entries(product.colorImages).find(([_, u]) => {
                            const { front, back } = normalizeColorImages(u)
                            return front === img || back === img
                          })?.[0]
                          if (matchColor) {
                            const matchingVar = product.variants?.find((v) => v.color === matchColor)
                            if (matchingVar) setSelectedVariant(matchingVar)
                          }
                        }
                      }}
                      className={`relative w-16 h-20 sm:w-20 sm:h-24 bg-levix-gray border overflow-hidden shrink-0 transition-all ${
                        activeImageIndex === idx
                          ? 'border-levix-orange ring-1 ring-levix-orange'
                          : 'border-levix-border hover:border-levix-charcoal'
                      }`}
                    >
                      <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      {(isFront || isBack) && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-black/85 text-white text-[8px] font-mono uppercase tracking-wider font-bold whitespace-nowrap">
                          {isFront ? 'Front' : 'Back'}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Main Stage Image */}
            <div className="relative flex-1 aspect-[3/4] bg-levix-gray border border-levix-border overflow-hidden">
              <img
                src={allDisplayImages[activeImageIndex] || allDisplayImages[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />

              {/* Front / Back View Switcher Toggle for Active Color */}
              {activeColorImages?.front && activeColorImages?.back && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center bg-white/95 backdrop-blur-xs border border-levix-border shadow-md p-1 gap-1 z-10">
                  <button
                    type="button"
                    onClick={() => {
                      const idx = allDisplayImages.indexOf(activeColorImages.front)
                      if (idx !== -1) setActiveImageIndex(idx)
                    }}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      allDisplayImages[activeImageIndex] === activeColorImages.front
                        ? 'bg-levix-charcoal text-white'
                        : 'text-levix-charcoal hover:bg-levix-gray'
                    }`}
                  >
                    Front View
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const idx = allDisplayImages.indexOf(activeColorImages.back)
                      if (idx !== -1) setActiveImageIndex(idx)
                    }}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      allDisplayImages[activeImageIndex] === activeColorImages.back
                        ? 'bg-levix-charcoal text-white'
                        : 'text-levix-charcoal hover:bg-levix-gray'
                    }`}
                  >
                    Back View
                  </button>
                </div>
              )}

              {/* Status Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {hasDiscount && (
                  <span className="px-2.5 py-1 bg-levix-orange text-white text-xs font-bold uppercase tracking-wider">
                    Sale
                  </span>
                )}
                {product.isNewArrival && (
                  <span className="px-2.5 py-1 bg-levix-charcoal text-white text-xs font-bold uppercase tracking-wider">
                    New Release
                  </span>
                )}
              </div>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                className="absolute top-4 right-4 p-2.5 bg-white/90 hover:bg-white text-levix-charcoal border border-levix-border shadow-xs transition-colors"
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {copiedLink && (
                <div className="absolute top-16 right-4 px-3 py-1 bg-levix-charcoal text-white text-[10px] font-semibold">
                  Link copied!
                </div>
              )}
            </div>
          </div>

          {/* Product Purchasing Info Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-levix-orange">
                {product.categoryName} • SKU: {selectedVariant?.sku || product.sku}
              </p>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-levix-charcoal mt-1.5">
                {product.name}
              </h1>

              {/* Pricing */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-levix-charcoal">
                  {formatPrice(currentPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-base text-levix-secondary line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
                {hasDiscount && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                    Save {Math.round(((product.price - (product.salePrice || 0)) / product.price) * 100)}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-levix-secondary mt-1">
                Taxes included. Free shipping on orders over ₹1,999.
              </p>
            </div>

            {/* Editorial Description / Specifications (Individual Separate Lines) */}
            <div className="py-3 border-y border-levix-border/60 my-2 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-levix-orange font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-levix-orange" />
                  Product Specifications & Fit
                </span>
                {descriptionBullets.length > 1 && (
                  <span className="text-[10px] text-levix-secondary font-mono">
                    {descriptionBullets.length} Points
                  </span>
                )}
              </div>

              {descriptionBullets.length > 1 ? (
                <ul className="space-y-1 pt-0.5">
                  {descriptionBullets.map((bullet, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 py-1.5 border-b border-levix-border/25 last:border-b-0 text-xs sm:text-sm text-levix-charcoal/90 leading-relaxed"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-levix-orange mt-1.5 shrink-0" />
                      <span className="flex-1 block font-normal">{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs sm:text-sm text-levix-charcoal/85 leading-relaxed whitespace-pre-line py-1">
                  {product?.description}
                </p>
              )}
            </div>

            {/* Variant Selectors (Size / Color) */}
            {product.hasVariants && product.variants && product.variants.length > 0 && (
              <div className="space-y-4 pt-2 border-t border-levix-border">
                {uniqueColors.length > 1 ? (
                  <>
                    {/* Color Selector */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs uppercase font-bold tracking-wider text-levix-charcoal">
                          Color: <span className="font-semibold text-levix-orange">{selectedVariant?.color || 'Choose Color'}</span>
                        </span>
                        <span className="text-[11px] text-levix-secondary">
                          {uniqueColors.length} Colors Available
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {uniqueColors.map((color) => {
                          const isColorSelected = selectedVariant?.color === color
                          const colorObj = product.colorImages?.[color] ? normalizeColorImages(product.colorImages[color]) : null
                          const colorPhoto =
                            colorObj?.front ||
                            product.variants?.find((v) => v.color === color && v.imageUrl)?.imageUrl

                          return (
                            <button
                              key={color}
                              type="button"
                              onClick={() => {
                                const currentSize = selectedVariant?.size
                                const matching =
                                  product.variants?.find((v) => v.color === color && v.size === currentSize) ||
                                  product.variants?.find((v) => v.color === color)
                                if (matching) {
                                  setSelectedVariant(matching)
                                  const targetImg = colorObj?.front || matching.imageUrl || colorPhoto
                                  if (targetImg) {
                                    const idx = allDisplayImages.indexOf(targetImg)
                                    if (idx !== -1) setActiveImageIndex(idx)
                                  }
                                }
                              }}
                              className={`py-2 px-3 text-xs font-semibold uppercase tracking-wider border transition-all flex items-center gap-2 ${
                                isColorSelected
                                  ? 'border-levix-orange bg-levix-soft-orange text-levix-orange ring-1 ring-levix-orange'
                                  : 'border-levix-border hover:border-levix-charcoal text-levix-charcoal bg-white'
                              }`}
                            >
                              {colorPhoto && (
                                <img
                                  src={colorPhoto}
                                  alt={color}
                                  className="w-4 h-4 rounded-full object-cover border border-levix-border shrink-0"
                                />
                              )}
                              <span>{color}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Size Selector */}
                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs uppercase font-bold tracking-wider text-levix-charcoal">
                          Size: <span className="font-semibold text-levix-charcoal">{selectedVariant?.size || 'Choose Size'}</span>
                        </span>
                        {selectedVariant && selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
                          <span className="text-[11px] text-amber-600 font-semibold">
                            Only {selectedVariant.stock} left in stock!
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {uniqueSizes.map((size) => {
                          const matchingForSize = product.variants?.find(
                            (v) => v.color === selectedVariant?.color && v.size === size
                          )
                          const isSizeSelected = selectedVariant?.size === size
                          const isUnavailable = !matchingForSize || matchingForSize.stock <= 0
                          return (
                            <button
                              key={size}
                              type="button"
                              disabled={isUnavailable}
                              onClick={() => {
                                if (matchingForSize) setSelectedVariant(matchingForSize)
                              }}
                              className={`min-w-[48px] py-2 px-3 text-xs font-semibold uppercase tracking-wider border transition-all text-center ${
                                isSizeSelected
                                  ? 'border-levix-orange bg-levix-soft-orange text-levix-orange ring-1 ring-levix-orange'
                                  : isUnavailable
                                  ? 'border-levix-border bg-levix-gray text-levix-secondary/40 line-through cursor-not-allowed'
                                  : 'border-levix-border hover:border-levix-charcoal text-levix-charcoal bg-white'
                              }`}
                            >
                              {size}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs uppercase font-bold tracking-wider text-levix-charcoal">
                        Select Variant: <span className="font-normal text-levix-secondary">{selectedVariant?.name}</span>
                      </span>
                      {selectedVariant && selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
                        <span className="text-[11px] text-amber-600 font-semibold">
                          Only {selectedVariant.stock} left in stock!
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {product.variants.map((v) => {
                        const isSelected = selectedVariant?.id === v.id
                        const isUnavailable = v.stock <= 0
                        return (
                          <button
                            key={v.id}
                            type="button"
                            disabled={isUnavailable}
                            onClick={() => setSelectedVariant(v)}
                            className={`py-2.5 px-3 text-xs font-semibold uppercase tracking-wider border transition-all text-center ${
                              isSelected
                                ? 'border-levix-orange bg-levix-soft-orange text-levix-orange ring-1 ring-levix-orange'
                                : isUnavailable
                                ? 'border-levix-border bg-levix-gray text-levix-secondary/50 line-through cursor-not-allowed'
                                : 'border-levix-border hover:border-levix-charcoal text-levix-charcoal'
                            }`}
                          >
                            {v.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity Selector & Stock Indicator */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase font-bold tracking-wider text-levix-charcoal">
                  Quantity:
                </span>
                <div className="flex items-center border border-levix-border bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-2 hover:bg-levix-gray text-levix-charcoal disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-levix-charcoal">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    disabled={quantity >= currentStock || isOutOfStock}
                    className="p-2 hover:bg-levix-gray text-levix-charcoal disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs">
                  {isOutOfStock ? (
                    <span className="text-red-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
                    </span>
                  ) : currentStock <= 5 ? (
                    <span className="text-amber-600 font-semibold">
                      Low Stock ({currentStock} available)
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> In Stock & Ready to Ship
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons: Add to Bag, Buy Now, Wishlist */}
            <div className="space-y-2.5 pt-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className="flex-1 btn-primary py-4 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Currently Unavailable' : 'Add to Bag'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                  className="px-4 py-4 border border-levix-border hover:border-levix-orange text-levix-charcoal flex items-center justify-center transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      wishlisted ? 'fill-levix-orange text-levix-orange' : 'text-levix-charcoal'
                    }`}
                  />
                </button>
              </div>

              {!isOutOfStock && (
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full btn-secondary py-3.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-levix-charcoal hover:bg-levix-charcoal hover:text-white"
                >
                  <Zap className="w-4 h-4 text-levix-orange" />
                  <span>Instant Buy Now</span>
                </button>
              )}
            </div>

            {/* Trust Features Bar */}
            <div className="grid grid-cols-3 gap-2 py-4 border-y border-levix-border text-[11px] text-levix-charcoal text-center">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-levix-orange" />
                <span>24h Dispatch</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-levix-orange" />
                <span>7-Day Exchange</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-levix-orange" />
                <span>100% Genuine</span>
              </div>
            </div>

            {/* Specification Tabs */}
            <div className="space-y-3">
              <div className="flex border-b border-levix-border">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`py-2 px-3 text-xs uppercase font-bold tracking-wider transition-colors border-b-2 ${
                    activeTab === 'details'
                      ? 'border-levix-orange text-levix-orange'
                      : 'border-transparent text-levix-secondary hover:text-levix-charcoal'
                  }`}
                >
                  Details & Fit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('shipping')}
                  className={`py-2 px-3 text-xs uppercase font-bold tracking-wider transition-colors border-b-2 ${
                    activeTab === 'shipping'
                      ? 'border-levix-orange text-levix-orange'
                      : 'border-transparent text-levix-secondary hover:text-levix-charcoal'
                  }`}
                >
                  Shipping
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('returns')}
                  className={`py-2 px-3 text-xs uppercase font-bold tracking-wider transition-colors border-b-2 ${
                    activeTab === 'returns'
                      ? 'border-levix-orange text-levix-orange'
                      : 'border-transparent text-levix-secondary hover:text-levix-charcoal'
                  }`}
                >
                  Returns
                </button>
              </div>

              <div className="text-xs text-levix-secondary leading-relaxed pt-2">
                {activeTab === 'details' && (
                  <div className="space-y-2">
                    {product.details ? (
                      Object.entries(product.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-1 border-b border-levix-border/50">
                          <span className="font-semibold text-levix-charcoal">{key}</span>
                          <span>{value}</span>
                        </div>
                      ))
                    ) : (
                      <p>Full textile and garment specifications included on tag.</p>
                    )}
                  </div>
                )}
                {activeTab === 'shipping' && (
                  <p>
                    Dispatches from our Bengaluru fulfillment hub within 24 business hours. Complimentary standard delivery on all domestic orders over ₹1,999. Express transit time is 2-4 business days across metro cities.
                  </p>
                )}
                {activeTab === 'returns' && (
                  <p>
                    We provide a 7-day hassle-free return and exchange window for unworn items with original tags intact. Easy reverse pickup coordinated through our automated client portal.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-levix-border">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-levix-orange mb-1">
                  Complete the Wardrobe
                </p>
                <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-levix-charcoal">
                  Related Pieces
                </h3>
              </div>
              <Link
                to={`/category/${product.categoryId.replace('cat-', '')}`}
                className="text-xs font-semibold uppercase tracking-wider text-levix-orange hover:underline"
              >
                View Category
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
