import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, ShieldCheck, Truck, RefreshCw, Lock } from 'lucide-react'
import { useStore } from '../../context/StoreContext'

export const Footer: React.FC = () => {
  const { categories, settings } = useStore()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    setSubscribed(true)
    setEmail('')
  }

  return (
    <footer className="bg-white border-t border-levix-border mt-auto">
      {/* Brand Value Propositions Bar */}
      <div className="border-b border-levix-border bg-levix-gray/60 py-8">
        <div className="container-levix">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 bg-white border border-levix-border flex items-center justify-center text-black shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-levix-charcoal">
                  Express Dispatch
                </h4>
                <p className="text-[11px] text-levix-secondary mt-0.5">
                  Orders dispatched within 24 hours
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 bg-white border border-levix-border flex items-center justify-center text-black shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-levix-charcoal">
                  Authentic Quality
                </h4>
                <p className="text-[11px] text-levix-secondary mt-0.5">
                  100% natural, premium grade textiles
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 bg-white border border-levix-border flex items-center justify-center text-black shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-levix-charcoal">
                  Hassle-Free Returns
                </h4>
                <p className="text-[11px] text-levix-secondary mt-0.5">
                  7-day seamless return & exchange
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 bg-white border border-levix-border flex items-center justify-center text-black shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-levix-charcoal">
                  Secure Checkout
                </h4>
                <p className="text-[11px] text-levix-secondary mt-0.5">
                  Razorpay encrypted & COD available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="container-levix py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-black flex items-center justify-center text-white font-black text-xs tracking-tighter">
                LX
              </div>
              <span className="text-xl font-black tracking-[0.2em] text-levix-charcoal uppercase">
                LEVIX
              </span>
            </Link>
            <p className="text-xs text-levix-secondary max-w-sm leading-relaxed">
              Engineered contemporary apparel and lifestyle essentials. Architectural drapes, custom heavyweight textiles, and uncompromising attention to detail.
            </p>
            <div className="pt-2 text-xs text-levix-charcoal font-medium">
              <p>Customer Support: <span className="text-levix-secondary">{settings.supportEmail}</span></p>
              <p className="mt-1">Toll-Free: <span className="text-levix-secondary">{settings.supportPhone}</span></p>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-widest text-levix-charcoal mb-4">
              Collections
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/collection/${cat.slug}`}
                    className="text-levix-secondary hover:text-black transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/shop"
                  className="text-levix-secondary hover:text-black transition-colors font-medium"
                >
                  View All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-widest text-levix-charcoal mb-4">
              Client Service
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/account/orders"
                  className="text-levix-secondary hover:text-black transition-colors"
                >
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/shipping"
                  className="text-levix-secondary hover:text-black transition-colors"
                >
                  Shipping & Dispatch
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/shipping"
                  className="text-levix-secondary hover:text-black transition-colors"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/privacy"
                  className="text-levix-secondary hover:text-black transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/terms"
                  className="text-levix-secondary hover:text-black transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-pwa-install'))}
                  className="text-black hover:underline transition-colors font-medium text-left"
                >
                  Install Mobile App (iOS / Android)
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-widest text-levix-charcoal mb-4">
              The LEVIX Journal
            </h4>
            <p className="text-xs text-levix-secondary mb-3 leading-relaxed">
              Receive private editorial lookbooks and priority access to limited seasonal runs.
            </p>

            {subscribed ? (
              <div className="p-3 bg-neutral-100 border border-neutral-300 text-xs text-black font-medium flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Thank you. You are on the priority list.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="form-input text-xs py-2.5 pr-10"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 bottom-0 px-3 text-levix-secondary hover:text-black transition-colors"
                    aria-label="Subscribe to newsletter"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-levix-secondary">
                  No promotional spam. Unsubscribe at any time.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment icons */}
        <div className="mt-12 pt-8 border-t border-levix-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-levix-secondary text-center sm:text-left">
            © 2026 LEVIX Lifestyle Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-levix-secondary tracking-wider">
            <span className="px-2 py-1 bg-levix-gray border border-levix-border">UPI</span>
            <span className="px-2 py-1 bg-levix-gray border border-levix-border">RAZORPAY</span>
            <span className="px-2 py-1 bg-levix-gray border border-levix-border">VISA / MC</span>
            <span className="px-2 py-1 bg-levix-gray border border-levix-border">COD</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
