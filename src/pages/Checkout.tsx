import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CreditCard,
  Banknote,
  Lock,
  ArrowRight,
  AlertCircle,
  MapPin,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../context/StoreContext'
import { processCheckoutOrder } from '../lib/orderService'
import { formatPrice } from '../lib/utils'
import { SEO } from '../components/common/SEO'
import type { PaymentMethod, ShippingAddress } from '../types/order'

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required (min 2 characters)'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid 10-digit mobile number'),
  street: z.string().min(5, 'Street address is required'),
  apartment: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code'),
  country: z.string(),
})

type AddressFormData = z.infer<typeof addressSchema>

export const Checkout: React.FC = () => {
  const { items, subtotal, shippingFee, total, isFreeShipping, clearCart } = useCart()
  const { currentUser, userProfile } = useAuth()
  const { settings } = useStore()
  const navigate = useNavigate()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [paymentStep, setPaymentStep] = useState<string | null>(null)

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart')
    }
  }, [items, navigate])

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: userProfile?.displayName || '',
      email: currentUser?.email || userProfile?.email || '',
      phone: userProfile?.phone || '',
      country: 'India',
    },
  })

  // Prefill default saved address if available
  useEffect(() => {
    if (userProfile?.addresses && userProfile.addresses.length > 0) {
      const defaultAddr = userProfile.addresses.find((a) => a.isDefault) || userProfile.addresses[0]
      setValue('fullName', defaultAddr.fullName)
      setValue('email', defaultAddr.email)
      setValue('phone', defaultAddr.phone)
      setValue('street', defaultAddr.street)
      setValue('apartment', defaultAddr.apartment || '')
      setValue('city', defaultAddr.city)
      setValue('state', defaultAddr.state)
      setValue('postalCode', defaultAddr.postalCode)
      setValue('country', defaultAddr.country)
    }
  }, [userProfile, setValue])

  const onSubmit = async (data: AddressFormData) => {
    try {
      setIsSubmitting(true)
      setCheckoutError(null)
      setPaymentStep('initiating')

      const shippingAddress: ShippingAddress = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        street: data.street,
        apartment: data.apartment || '',
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country || 'India',
      }

      const result = await processCheckoutOrder(
        {
          customerUid: currentUser?.uid || userProfile?.uid || 'guest',
          customerEmail: data.email,
          customerName: data.fullName,
          items,
          shippingAddress,
          paymentMethod,
          settings,
        },
        (step) => {
          if (step === 'awaiting_payment') setPaymentStep('Waiting for payment confirmation...')
          if (step === 'verifying') setPaymentStep('Verifying payment signature...')
        }
      )

      if (result.success && result.order) {
        clearCart()
        navigate(`/order-confirmation/${result.order.id}`)
      } else {
        setCheckoutError(result.error || 'Failed to complete order. Please try again.')
      }
    } catch (err: any) {
      setCheckoutError(err.message || 'An unexpected error occurred during checkout.')
    } finally {
      setIsSubmitting(false)
      setPaymentStep(null)
    }
  }

  const handleSelectSavedAddress = (addr: any) => {
    setValue('fullName', addr.fullName)
    setValue('email', addr.email)
    setValue('phone', addr.phone)
    setValue('street', addr.street)
    setValue('apartment', addr.apartment || '')
    setValue('city', addr.city)
    setValue('state', addr.state)
    setValue('postalCode', addr.postalCode)
    setValue('country', addr.country)
  }

  return (
    <div className="bg-levix-gray/30 min-h-screen py-10 sm:py-14">
      <SEO title="Secure Checkout" />

      <div className="container-levix">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 pb-4 border-b border-levix-border flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-levix-orange mb-1">
                Final Step
              </p>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-levix-charcoal">
                Secure Checkout
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-levix-secondary">
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>256-Bit SSL Encrypted</span>
            </div>
          </div>

          {checkoutError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{checkoutError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column: Addresses & Payment Methods (7 cols) */}
              <div className="lg:col-span-7 space-y-8">
                {/* Saved Address Quick Selector (if customer logged in) */}
                {userProfile?.addresses && userProfile.addresses.length > 0 && (
                  <div className="bg-white border border-levix-border p-6 shadow-subtle">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-levix-orange" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-levix-charcoal">
                        Use Saved Address
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {userProfile.addresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => handleSelectSavedAddress(addr)}
                          className="p-3 text-left border border-levix-border hover:border-levix-orange transition-colors bg-levix-gray/30 text-xs space-y-0.5"
                        >
                          <p className="font-bold text-levix-charcoal">{addr.fullName}</p>
                          <p className="text-levix-secondary truncate">{addr.street}</p>
                          <p className="text-levix-secondary">{addr.city}, {addr.state} - {addr.postalCode}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shipping Address Section */}
                <div className="bg-white border border-levix-border p-6 sm:p-8 shadow-subtle space-y-5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal pb-3 border-b border-levix-border">
                    1. Shipping & Contact Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        {...register('fullName')}
                        placeholder="e.g. Mohan Sharma"
                        className="form-input"
                      />
                      {errors.fullName && (
                        <p className="text-[11px] text-red-600 mt-1">{errors.fullName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="form-label">Email Address *</label>
                      <input
                        type="email"
                        {...register('email')}
                        placeholder="you@domain.com"
                        className="form-input"
                      />
                      {errors.email && (
                        <p className="text-[11px] text-red-600 mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Mobile Phone (for courier updates) *</label>
                    <input
                      type="tel"
                      {...register('phone')}
                      placeholder="e.g. 9876543210"
                      className="form-input"
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-red-600 mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Street Address *</label>
                    <input
                      type="text"
                      {...register('street')}
                      placeholder="House/Flat No, Building, Street, Landmark"
                      className="form-input"
                    />
                    {errors.street && (
                      <p className="text-[11px] text-red-600 mt-1">{errors.street.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Apartment / Suite / Floor (Optional)</label>
                    <input
                      type="text"
                      {...register('apartment')}
                      placeholder="Apartment 4B"
                      className="form-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="form-label">City *</label>
                      <input
                        type="text"
                        {...register('city')}
                        placeholder="City"
                        className="form-input"
                      />
                      {errors.city && (
                        <p className="text-[11px] text-red-600 mt-1">{errors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="form-label">State *</label>
                      <input
                        type="text"
                        {...register('state')}
                        placeholder="State"
                        className="form-input"
                      />
                      {errors.state && (
                        <p className="text-[11px] text-red-600 mt-1">{errors.state.message}</p>
                      )}
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="form-label">PIN Code *</label>
                      <input
                        type="text"
                        maxLength={6}
                        {...register('postalCode')}
                        placeholder="6-digit PIN"
                        className="form-input"
                      />
                      {errors.postalCode && (
                        <p className="text-[11px] text-red-600 mt-1">{errors.postalCode.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Method Section */}
                <div className="bg-white border border-levix-border p-6 sm:p-8 shadow-subtle space-y-5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal pb-3 border-b border-levix-border">
                    2. Select Payment Method
                  </h3>

                  <div className="space-y-3">
                    {/* Razorpay Online Payment */}
                    <label
                      className={`flex items-start gap-4 p-4 border cursor-pointer transition-all ${
                        paymentMethod === 'razorpay'
                          ? 'border-levix-orange bg-levix-soft-orange/60 ring-1 ring-levix-orange'
                          : 'border-levix-border hover:bg-levix-gray/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        className="mt-1 text-levix-orange focus:ring-levix-orange accent-levix-orange"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-levix-charcoal flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-levix-orange" />
                            <span>Online Payment (Razorpay)</span>
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                            Recommended
                          </span>
                        </div>
                        <p className="text-xs text-levix-secondary mt-1">
                          Cards, UPI (Google Pay, PhonePe, Paytm), NetBanking & Wallets. Instant verification.
                        </p>
                      </div>
                    </label>

                    {/* Cash on Delivery */}
                    {settings.codEnabled && (
                      <label
                        className={`flex items-start gap-4 p-4 border cursor-pointer transition-all ${
                          paymentMethod === 'cod'
                            ? 'border-levix-orange bg-levix-soft-orange/60 ring-1 ring-levix-orange'
                            : 'border-levix-border hover:bg-levix-gray/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="mt-1 text-levix-orange focus:ring-levix-orange accent-levix-orange"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-levix-charcoal flex items-center gap-1.5">
                              <Banknote className="w-4 h-4 text-levix-orange" />
                              <span>Cash on Delivery (COD)</span>
                            </span>
                            <span className="text-[10px] text-levix-secondary">
                              Pay in cash upon arrival
                            </span>
                          </div>
                          <p className="text-xs text-levix-secondary mt-1">
                            Available for orders up to {formatPrice(settings.maxCodAmount)}.
                          </p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary & Placement (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white border border-levix-border p-6 shadow-subtle space-y-6 sticky top-28">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal pb-3 border-b border-levix-border">
                    Order Summary ({items.length} items)
                  </h3>

                  {/* Line items preview */}
                  <div className="divide-y divide-levix-border max-h-60 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div
                        key={`${item.productId}-${item.variantId || 'base'}`}
                        className="py-3 flex items-center gap-3 text-xs"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-14 object-cover border border-levix-border bg-levix-gray shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-levix-charcoal truncate">{item.name}</h4>
                          <p className="text-[11px] text-levix-secondary">
                            Qty: {item.quantity} {item.variantName ? `• ${item.variantName}` : ''}
                          </p>
                        </div>
                        <span className="font-bold text-levix-charcoal">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div className="pt-4 border-t border-levix-border space-y-2 text-xs">
                    <div className="flex justify-between text-levix-secondary">
                      <span>Bag Subtotal</span>
                      <span className="font-semibold text-levix-charcoal">{formatPrice(subtotal)}</span>
                    </div>

                    <div className="flex justify-between text-levix-secondary">
                      <span>Express Shipping</span>
                      <span className="font-semibold text-levix-charcoal">
                        {isFreeShipping ? (
                          <span className="text-emerald-700">FREE</span>
                        ) : (
                          formatPrice(shippingFee)
                        )}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-levix-border flex justify-between items-baseline">
                      <span className="text-xs uppercase font-bold text-levix-charcoal tracking-wider">
                        Total Payable
                      </span>
                      <span className="text-2xl font-black text-levix-charcoal">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>

                  {/* Submit Order Button */}
                  <div className="space-y-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-primary py-4 text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{paymentStep || 'Processing Order...'}</span>
                        </>
                      ) : (
                        <>
                          <span>
                            {paymentMethod === 'razorpay'
                              ? `Pay ${formatPrice(total)} Online`
                              : `Confirm Cash on Delivery (${formatPrice(total)})`}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-center text-levix-secondary leading-normal">
                      By placing this order you agree to the LEVIX{' '}
                      <Link to="/legal/terms" className="underline hover:text-levix-charcoal">Terms of Service</Link>{' '}
                      and{' '}
                      <Link to="/legal/privacy" className="underline hover:text-levix-charcoal">Privacy Policy</Link>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
