import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Plus, Check } from 'lucide-react'
import type { Product } from '../../types/product'
import { formatPrice, normalizeColorImages } from '../../lib/utils'
import { useWishlist } from '../../context/WishlistContext'
import { useCart } from '../../context/CartContext'
import { useStore } from '../../context/StoreContext'

interface ProductCardProps {
  product: Product
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { settings } = useStore()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { addItem, items } = useCart()

  const wishlisted = isInWishlist(product.id)
  const isOutOfStock = product.stock <= 0
  const isLowStock = product.stock > 0 && product.stock <= 5
  const hasDiscount = product.salePrice && product.salePrice < product.price

  const inCart = items.some((i) => i.productId === product.id)
  const cardBg = settings?.productCardBgColor || '#f0f0f0'

  // Determine secondary image for hover (back of t-shirt or second gallery image)
  const secondaryImage = useMemo(() => {
    if (product.images[1]) return product.images[1]
    if (product.colorImages) {
      const firstColorVal = Object.values(product.colorImages)[0]
      const { back } = normalizeColorImages(firstColorVal)
      if (back) return back
    }
    return null
  }, [product])

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return

    // If product has variants, selecting default first variant or base
    const variant = product.hasVariants && product.variants?.length ? product.variants[0] : undefined

    addItem({
      productId: product.id,
      variantId: variant?.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.images[0],
      sku: variant?.sku || product.sku,
      variantName: variant?.name,
      price: product.salePrice || product.price,
      maxStock: variant?.stock ?? product.stock,
    })
  }

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product.id)
  }

  return (
    <div
      style={{ backgroundColor: cardBg }}
      className="group relative flex flex-col border border-levix-border hover:border-black/30 transition-all duration-300 shadow-xs"
    >
      {/* Product Image Container */}
      <Link
        to={`/product/${product.slug}`}
        style={{ backgroundColor: cardBg }}
        className="relative aspect-[3/4] overflow-hidden"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Secondary Image on Hover if available (e.g. Back view of t-shirt) */}
        {secondaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
          />
        )}

        {/* Status Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="px-2 py-0.5 bg-levix-orange text-white text-[10px] font-bold uppercase tracking-wider">
              Sale
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-2 py-0.5 bg-levix-charcoal text-white text-[10px] font-bold uppercase tracking-wider">
              New
            </span>
          )}
          {isOutOfStock ? (
            <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider">
              Only {product.stock} left
            </span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 hover:bg-white text-levix-charcoal border border-levix-border flex items-center justify-center transition-colors shadow-xs z-10"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              wishlisted ? 'fill-levix-orange text-levix-orange' : 'text-levix-charcoal'
            }`}
          />
        </button>

        {/* Quick Add Overlay on Desktop */}
        {!isOutOfStock && (
          <div className="absolute inset-x-2 bottom-2 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <button
              type="button"
              onClick={handleQuickAdd}
              className="w-full py-2.5 bg-white/95 hover:bg-levix-orange hover:text-white text-levix-charcoal text-xs font-semibold uppercase tracking-wider border border-levix-border transition-colors flex items-center justify-center gap-1.5 shadow-md"
            >
              {inCart ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>{product.hasVariants ? 'Quick Add' : 'Add to Bag'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </Link>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[11px] font-medium text-levix-secondary uppercase tracking-wider">
            {product.categoryName}
          </p>
          <Link
            to={`/product/${product.slug}`}
            className="mt-1 text-sm font-semibold text-levix-charcoal hover:text-levix-orange transition-colors line-clamp-1 block"
          >
            {product.name}
          </Link>
        </div>

        <div className="mt-3 pt-2.5 border-t border-levix-border/70 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-levix-charcoal">
              {formatPrice(product.salePrice || product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-levix-secondary line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Mobile Quick Add */}
          <div className="sm:hidden">
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className="p-1.5 text-levix-charcoal hover:text-levix-orange disabled:opacity-40"
              aria-label="Add to bag"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
