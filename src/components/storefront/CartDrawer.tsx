import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { formatPrice } from '../../lib/utils'

export const CartDrawer: React.FC = () => {
  const {
    items,
    totalItems,
    subtotal,
    isFreeShipping,
    amountToFreeShipping,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeItem,
    updateQuantity,
  } = useCart()

  const navigate = useNavigate()

  useEffect(() => {
    if (isCartDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isCartDrawerOpen])

  if (!isCartDrawerOpen) return null

  const handleCheckoutClick = () => {
    setIsCartDrawerOpen(false)
    navigate('/checkout')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-levix-border flex flex-col shadow-2xl">
          {/* Header */}
          <div className="px-6 py-5 border-b border-levix-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-levix-charcoal" />
              <h2 className="text-sm font-semibold tracking-wider uppercase text-levix-charcoal">
                Shopping Bag ({totalItems})
              </h2>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 text-levix-secondary hover:text-levix-charcoal transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-6 py-3.5 bg-levix-soft-orange/80 border-b border-levix-orange/20">
            <div className="flex items-center gap-2 text-xs font-medium text-levix-charcoal mb-1.5">
              <Truck className="w-4 h-4 text-levix-orange" />
              {isFreeShipping ? (
                <span className="text-levix-orange font-semibold">You unlocked Free Standard Shipping!</span>
              ) : (
                <span>
                  Add <span className="font-semibold text-levix-orange">{formatPrice(amountToFreeShipping)}</span> more for Free Shipping
                </span>
              )}
            </div>
            <div className="w-full bg-white h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-levix-orange h-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.round(((subtotal) / (subtotal + amountToFreeShipping || 1)) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-levix-border">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag className="w-12 h-12 text-levix-secondary/50 mb-4 stroke-1" />
                <p className="text-base font-semibold text-levix-charcoal">Your bag is empty</p>
                <p className="text-xs text-levix-secondary mt-1 mb-6 max-w-xs">
                  Explore our curated seasonal collection of minimalist essentials and outerwear.
                </p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false)
                    navigate('/shop')
                  }}
                  className="btn-primary"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item.productId}-${item.variantId || 'base'}`} className="py-4 flex gap-4">
                  <Link
                    to={`/product/${item.slug}`}
                    onClick={() => setIsCartDrawerOpen(false)}
                    className="shrink-0"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-20 object-cover border border-levix-border bg-levix-gray"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          to={`/product/${item.slug}`}
                          onClick={() => setIsCartDrawerOpen(false)}
                          className="text-xs sm:text-sm font-medium text-levix-charcoal hover:text-levix-orange transition-colors truncate block"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-levix-secondary hover:text-red-600 transition-colors p-0.5"
                          aria-label={`Remove ${item.name} from bag`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.variantName && (
                        <p className="text-[11px] text-levix-secondary mt-0.5">
                          Variant: {item.variantName}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-levix-border bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                          className="p-1 hover:bg-levix-gray text-levix-charcoal disabled:opacity-40 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-semibold text-levix-charcoal">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-1 hover:bg-levix-gray text-levix-charcoal disabled:opacity-40 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm font-semibold text-levix-charcoal">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-levix-border bg-levix-gray/40 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-levix-secondary">
                  <span>Subtotal</span>
                  <span className="font-medium text-levix-charcoal">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-levix-secondary">
                  <span>Shipping</span>
                  <span>{isFreeShipping ? 'FREE' : 'Calculated at checkout'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-levix-border flex justify-between items-baseline">
                <span className="text-xs uppercase font-semibold text-levix-charcoal tracking-wider">
                  Estimated Total
                </span>
                <span className="text-base font-bold text-levix-charcoal">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleCheckoutClick}
                  className="w-full btn-primary py-3.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  to="/cart"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-full btn-secondary py-3 text-xs uppercase tracking-wider text-center block"
                >
                  View Full Cart
                </Link>
              </div>

              <p className="text-[10px] text-center text-levix-secondary">
                Taxes included • Free returns within 7 days • 100% Genuine
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
