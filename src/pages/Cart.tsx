import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, Tag, ShieldCheck } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/utils'
import { SEO } from '../components/common/SEO'

export const Cart: React.FC = () => {
  const {
    items,
    totalItems,
    subtotal,
    shippingFee,
    isFreeShipping,
    amountToFreeShipping,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart()

  const navigate = useNavigate()
  const [promoCode, setPromoCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState<number>(0)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null)

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    setPromoError(null)
    setPromoSuccess(null)

    const code = promoCode.trim().toUpperCase()
    if (!code) return

    if (code === 'LEVIX10' || code === 'WELCOME10') {
      setDiscountPercent(10)
      setPromoSuccess('10% seasonal discount applied!')
    } else if (code === 'LEVIX15') {
      setDiscountPercent(15)
      setPromoSuccess('15% VIP discount applied!')
    } else {
      setPromoError('Invalid promo code. Try "LEVIX10" for 10% off.')
      setDiscountPercent(0)
    }
  }

  const discountAmount = Math.round((subtotal * discountPercent) / 100)
  const finalTotal = subtotal + shippingFee - discountAmount

  if (items.length === 0) {
    return (
      <div className="container-levix py-24 sm:py-32 text-center">
        <SEO title="Shopping Bag" />
        <div className="max-w-md mx-auto">
          <ShoppingBag className="w-16 h-16 text-levix-secondary/40 mx-auto mb-4 stroke-1" />
          <h1 className="text-2xl font-bold uppercase tracking-tight text-levix-charcoal">
            Your Shopping Bag is Empty
          </h1>
          <p className="text-xs text-levix-secondary mt-2 mb-8 leading-relaxed">
            You haven&apos;t added any items to your bag yet. Explore our curated collections of architectural essentials and footwear.
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
      <SEO title="Shopping Bag" />

      <div className="container-levix">
        <div className="border-b border-levix-border pb-6 mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-levix-orange mb-1">
              Review Selection
            </p>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-levix-charcoal">
              Shopping Bag ({totalItems})
            </h1>
          </div>
          <button
            type="button"
            onClick={clearCart}
            className="text-xs text-levix-secondary hover:text-red-600 transition-colors"
          >
            Clear Entire Bag
          </button>
        </div>

        {/* Free Shipping Alert Banner */}
        <div className="mb-8 p-4 bg-levix-soft-orange border border-levix-orange/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-levix-orange shrink-0" />
            <p className="text-xs text-levix-charcoal font-medium">
              {isFreeShipping ? (
                <strong className="text-levix-orange font-bold">You qualify for complimentary domestic express shipping!</strong>
              ) : (
                <span>
                  Add <strong className="text-levix-orange font-bold">{formatPrice(amountToFreeShipping)}</strong> more to your order to unlock Free Express Shipping.
                </span>
              )}
            </p>
          </div>
          {!isFreeShipping && (
            <Link
              to="/shop"
              className="text-xs font-bold uppercase tracking-wider text-levix-orange hover:underline shrink-0"
            >
              Shop More Pieces &rarr;
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Cart Line Items Table (8 cols) */}
          <div className="lg:col-span-8 border border-levix-border divide-y divide-levix-border">
            {/* Table Header (Desktop) */}
            <div className="hidden sm:grid sm:grid-cols-12 p-4 bg-levix-gray text-xs uppercase font-bold text-levix-secondary tracking-wider">
              <div className="col-span-6">Product Details</div>
              <div className="col-span-2 text-center">Unit Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Subtotal</div>
            </div>

            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId || 'base'}`}
                className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center"
              >
                {/* Product info (cols 6) */}
                <div className="sm:col-span-6 flex gap-4">
                  <Link to={`/product/${item.slug}`} className="shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-24 object-cover border border-levix-border bg-levix-gray"
                    />
                  </Link>
                  <div className="flex flex-col justify-between py-1">
                    <div>
                      <Link
                        to={`/product/${item.slug}`}
                        className="text-sm font-semibold text-levix-charcoal hover:text-levix-orange transition-colors"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-levix-secondary mt-0.5">SKU: {item.sku}</p>
                      {item.variantName && (
                        <p className="text-xs font-medium text-levix-charcoal mt-1">
                          Option: {item.variantName}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-xs text-levix-secondary hover:text-red-600 transition-colors inline-flex items-center gap-1 w-fit mt-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                {/* Unit Price (cols 2) */}
                <div className="sm:col-span-2 sm:text-center text-xs sm:text-sm font-medium text-levix-charcoal">
                  <span className="sm:hidden text-levix-secondary font-normal mr-2">Unit Price:</span>
                  {formatPrice(item.price)}
                </div>

                {/* Quantity Controls (cols 2) */}
                <div className="sm:col-span-2 flex sm:justify-center items-center">
                  <span className="sm:hidden text-levix-secondary text-xs mr-2">Qty:</span>
                  <div className="flex items-center border border-levix-border bg-white">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                      className="p-1.5 hover:bg-levix-gray text-levix-charcoal disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-levix-charcoal">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="p-1.5 hover:bg-levix-gray text-levix-charcoal disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Subtotal (cols 2) */}
                <div className="sm:col-span-2 sm:text-right text-sm font-bold text-levix-charcoal">
                  <span className="sm:hidden text-levix-secondary font-normal mr-2">Total:</span>
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-levix-border p-6 bg-levix-gray/30 space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal pb-4 border-b border-levix-border">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-levix-secondary">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-levix-charcoal">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-levix-secondary">
                  <span>Standard Shipping</span>
                  <span className="font-semibold text-levix-charcoal">
                    {isFreeShipping ? (
                      <span className="text-emerald-700">FREE</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount ({discountPercent}%)</span>
                    <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
              </div>

              {/* Promo Code Input */}
              <form onSubmit={handleApplyPromo} className="pt-2 border-t border-levix-border">
                <label className="form-label text-[11px] flex items-center gap-1">
                  <Tag className="w-3 h-3 text-levix-orange" />
                  <span>Promo Code</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="e.g. LEVIX10"
                    className="form-input text-xs py-2 uppercase tracking-wider"
                  />
                  <button
                    type="submit"
                    className="btn-secondary py-2 px-3 text-xs uppercase tracking-wider shrink-0"
                  >
                    Apply
                  </button>
                </div>
                {promoSuccess && (
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">{promoSuccess}</p>
                )}
                {promoError && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{promoError}</p>
                )}
              </form>

              {/* Final Amount */}
              <div className="pt-4 border-t border-levix-border flex justify-between items-baseline">
                <span className="text-xs uppercase font-bold text-levix-charcoal tracking-wider">
                  Total Payable
                </span>
                <span className="text-xl font-black text-levix-charcoal">
                  {formatPrice(finalTotal)}
                </span>
              </div>

              {/* Checkout CTA */}
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full btn-primary py-4 text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/shop"
                className="w-full btn-secondary py-3 text-xs uppercase tracking-wider text-center block"
              >
                Continue Shopping
              </Link>

              <div className="pt-2 text-[11px] text-levix-secondary text-center flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Encrypted 256-bit checkout with Razorpay & COD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
