import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2, ShoppingBag } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'
import { useStore } from '../context/StoreContext'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/utils'
import { SEO } from '../components/common/SEO'

export const Wishlist: React.FC = () => {
  const { wishlistIds, removeFromWishlist, clearWishlist } = useWishlist()
  const { products } = useStore()
  const { addItem } = useCart()

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id))

  const handleMoveToBag = (product: any) => {
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
    removeFromWishlist(product.id)
  }

  if (wishlistedProducts.length === 0) {
    return (
      <div className="container-levix py-24 sm:py-32 text-center">
        <SEO title="My Wishlist" />
        <div className="max-w-md mx-auto">
          <Heart className="w-16 h-16 text-levix-secondary/40 mx-auto mb-4 stroke-1" />
          <h1 className="text-2xl font-bold uppercase tracking-tight text-levix-charcoal">
            Your Wishlist is Empty
          </h1>
          <p className="text-xs text-levix-secondary mt-2 mb-8 leading-relaxed">
            Save items you desire to your private wishlist and track seasonal restocks and special releases.
          </p>
          <Link to="/shop" className="btn-primary text-xs uppercase tracking-wider py-4 px-8">
            Explore All Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen py-10 sm:py-14">
      <SEO title="My Wishlist" />

      <div className="container-levix">
        <div className="border-b border-levix-border pb-6 mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-levix-orange mb-1">
              Curated Favorites
            </p>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-levix-charcoal">
              Saved Pieces ({wishlistedProducts.length})
            </h1>
          </div>
          <button
            type="button"
            onClick={clearWishlist}
            className="text-xs text-levix-secondary hover:text-red-600 transition-colors"
          >
            Clear Wishlist
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlistedProducts.map((product) => {
            const isOutOfStock = product.stock <= 0
            return (
              <div
                key={product.id}
                className="group relative flex flex-col bg-white border border-levix-border hover:border-levix-orange/40 transition-colors"
              >
                <Link to={`/product/${product.slug}`} className="relative aspect-[3/4] bg-levix-gray overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      removeFromWishlist(product.id)
                    }}
                    className="absolute top-2.5 right-2.5 p-2 bg-white/90 hover:bg-white text-levix-secondary hover:text-red-600 border border-levix-border transition-colors z-10"
                    aria-label="Remove item from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </Link>

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
                    <p className="text-sm font-bold text-levix-charcoal mt-2">
                      {formatPrice(product.salePrice || product.price)}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-levix-border">
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => handleMoveToBag(product)}
                      className="w-full btn-primary py-2.5 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isOutOfStock ? 'Sold Out' : 'Move to Bag'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
