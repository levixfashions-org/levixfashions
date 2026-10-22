import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  Compass,
  User,
  MapPin,
  Search,
  MessageSquare,
  X,
  Phone,
  Mail,
  Truck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useStore } from '../../context/StoreContext'

export const GlassBottomDock: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { settings } = useStore()

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [isSupportDrawerOpen, setIsSupportDrawerOpen] = useState(false)
  const [pincode, setPincode] = useState(() => localStorage.getItem('levix_delivery_pincode') || '')
  const [pincodeStatus, setPincodeStatus] = useState<null | { valid: boolean; message: string }>(() => {
    const saved = localStorage.getItem('levix_delivery_pincode')
    return saved && /^\d{6}$/.test(saved)
      ? { valid: true, message: 'Express dispatch available to PIN ' + saved }
      : null
  })

  // Hide the dock on checkout, order confirmation, and admin pages to prevent form obstruction
  const isHiddenRoute =
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/order-confirmation')

  // Auto-hide when mobile soft keyboard is opened
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return
    const handleResize = () => {
      if (!window.visualViewport) return
      // If viewport height shrinks by more than 150px, keyboard is likely open
      const diff = window.innerHeight - window.visualViewport.height
      setIsKeyboardOpen(diff > 150)
    }
    window.visualViewport.addEventListener('resize', handleResize)
    return () => window.visualViewport?.removeEventListener('resize', handleResize)
  }, [])

  if (isHiddenRoute || isKeyboardOpen) {
    return null
  }

  // Active state matching current route
  const isHomeActive = location.pathname === '/'
  const isExploreActive =
    location.pathname.startsWith('/shop') || location.pathname.startsWith('/category')
  const isAccountActive =
    location.pathname.startsWith('/account') && !location.pathname.startsWith('/account/addresses') ||
    location.pathname === '/login' ||
    location.pathname === '/register'
  const isLocationActive =
    isLocationModalOpen || location.pathname.startsWith('/account/addresses')

  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent('levix_open_search'))
  }

  const handleLocationClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLocationModalOpen(true)
  }

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanPin = pincode.trim()
    if (/^\d{6}$/.test(cleanPin)) {
      localStorage.setItem('levix_delivery_pincode', cleanPin)
      setPincodeStatus({
        valid: true,
        message: `Express Dispatch (24h) Available for PIN ${cleanPin}`,
      })
    } else {
      setPincodeStatus({
        valid: false,
        message: 'Please enter a valid 6-digit Indian PIN code',
      })
    }
  }

  const handleOpenWhatsApp = () => {
    const rawPhone = settings.supportPhone || '+918000123456'
    const cleanPhone = rawPhone.replace(/\D/g, '')
    const message = encodeURIComponent(
      'Hi LEVIX Support, I would like to inquire about an order or product styling.'
    )
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      {/* 
        Bottom Floating Container (Mobile-first, hidden on desktop to preserve existing desktop nav)
      */}
      <div
        className="fixed left-0 right-0 z-40 pointer-events-none md:hidden flex items-center justify-center px-4"
        style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="w-full max-w-sm flex items-center justify-between gap-3 pointer-events-auto">
          {/* Glassy Floating Pill Navigation Bar (Inspired by Bluorng) */}
          <nav
            aria-label="Mobile Bottom Navigation"
            className="glass-dock-pill flex-1 py-1.5 px-2 flex items-center justify-between"
          >
            {/* 1. Home / Store */}
            <Link
              to="/"
              aria-label="Home / Store"
              aria-current={isHomeActive ? 'page' : undefined}
              className="relative w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-levix-orange select-none"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-250 ${
                  isHomeActive
                    ? 'bg-levix-orange text-white shadow-md shadow-orange-500/30 ring-2 ring-levix-orange/30 ring-offset-1 ring-offset-white/80 scale-100'
                    : 'text-levix-charcoal hover:text-levix-orange active:scale-90'
                }`}
              >
                <Home className="w-4.5 h-4.5" strokeWidth={isHomeActive ? 2.4 : 1.8} />
              </div>
            </Link>

            {/* 2. Explore / Discovery */}
            <Link
              to="/shop"
              aria-label="Explore Collections"
              aria-current={isExploreActive ? 'page' : undefined}
              className="relative w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-levix-orange select-none"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-250 ${
                  isExploreActive
                    ? 'bg-levix-orange text-white shadow-md shadow-orange-500/30 ring-2 ring-levix-orange/30 ring-offset-1 ring-offset-white/80 scale-100'
                    : 'text-levix-charcoal hover:text-levix-orange active:scale-90'
                }`}
              >
                <Compass className="w-4.5 h-4.5" strokeWidth={isExploreActive ? 2.4 : 1.8} />
              </div>
            </Link>

            {/* 3. Account */}
            <Link
              to={currentUser ? '/account' : '/login'}
              aria-label={currentUser ? 'Customer Account' : 'Sign In'}
              aria-current={isAccountActive ? 'page' : undefined}
              className="relative w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-levix-orange select-none"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-250 ${
                  isAccountActive
                    ? 'bg-levix-orange text-white shadow-md shadow-orange-500/30 ring-2 ring-levix-orange/30 ring-offset-1 ring-offset-white/80 scale-100'
                    : 'text-levix-charcoal hover:text-levix-orange active:scale-90'
                }`}
              >
                <User className="w-4.5 h-4.5" strokeWidth={isAccountActive ? 2.4 : 1.8} />
              </div>
            </Link>

            {/* 4. Location / Delivery */}
            <button
              type="button"
              onClick={handleLocationClick}
              aria-label="Delivery Location & Serviceability"
              aria-haspopup="dialog"
              className="relative w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-levix-orange select-none"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-250 ${
                  isLocationActive
                    ? 'bg-levix-orange text-white shadow-md shadow-orange-500/30 ring-2 ring-levix-orange/30 ring-offset-1 ring-offset-white/80 scale-100'
                    : 'text-levix-charcoal hover:text-levix-orange active:scale-90'
                }`}
              >
                <MapPin className="w-4.5 h-4.5" strokeWidth={isLocationActive ? 2.4 : 1.8} />
              </div>
            </button>

            {/* 5. Search */}
            <button
              type="button"
              onClick={handleOpenSearch}
              aria-label="Open Product Search"
              className="relative w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-levix-orange select-none text-levix-charcoal hover:text-levix-orange active:scale-90"
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center">
                <Search className="w-4.5 h-4.5" strokeWidth={1.8} />
              </div>
            </button>
          </nav>

          {/* 
            Separate Floating Chat Launcher (Inspired by Bluorng)
            Positioned to the right of the glass navigation bar
          */}
          <button
            type="button"
            onClick={() => setIsSupportDrawerOpen(true)}
            aria-label="Customer Care & Live Support"
            className="w-12 h-12 rounded-full bg-[#1A1A1A] hover:bg-black text-white shadow-lg shadow-black/20 border border-white/20 flex items-center justify-center transition-all duration-200 ease-out hover:scale-105 active:scale-90 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-levix-orange"
          >
            <MessageSquare className="w-5 h-5 fill-white/10" strokeWidth={1.9} />
          </button>
        </div>
      </div>

      {/* Delivery Location & PIN Code Modal */}
      {isLocationModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="location-modal-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl border border-levix-border space-y-5 animate-in slide-in-from-bottom duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-levix-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-levix-soft-orange flex items-center justify-center text-levix-orange">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="location-modal-title" className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
                    Delivery Location
                  </h3>
                  <p className="text-[11px] text-levix-secondary">
                    All-India Express Dispatch & Free Shipping
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                aria-label="Close delivery modal"
                className="p-1.5 rounded-full text-levix-secondary hover:text-levix-charcoal hover:bg-levix-gray transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePincodeCheck} className="space-y-3">
              <label htmlFor="pincode-input" className="block text-xs font-semibold text-levix-charcoal uppercase tracking-wider">
                Check Delivery PIN Code
              </label>
              <div className="flex gap-2">
                <input
                  id="pincode-input"
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit PIN (e.g. 110001)"
                  className="form-input text-xs py-2.5 flex-1 tracking-wider"
                />
                <button
                  type="submit"
                  className="btn-primary text-xs px-5 py-2.5 uppercase tracking-wider whitespace-nowrap"
                >
                  Verify
                </button>
              </div>
            </form>

            {pincodeStatus && (
              <div
                className={`p-3 text-xs flex items-center gap-2 border ${
                  pincodeStatus.valid
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {pincodeStatus.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{pincodeStatus.message}</span>
              </div>
            )}

            <div className="bg-levix-gray/70 p-4 space-y-2 border border-levix-border text-xs text-levix-secondary">
              <div className="flex items-center gap-2 text-levix-charcoal font-semibold">
                <Truck className="w-4 h-4 text-levix-orange" />
                <span>Complimentary Shipping over ₹1,999</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Orders placed before 2:00 PM IST undergo same-day quality inspection and dispatch via Blue Dart / Delhivery Express.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-levix-border text-xs">
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsLocationModalOpen(false)
                    navigate('/account/addresses')
                  }}
                  className="text-levix-orange font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>Manage Saved Addresses</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsLocationModalOpen(false)}
                  className="text-levix-orange font-semibold hover:underline"
                >
                  Sign In to View Saved Addresses →
                </Link>
              )}
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="text-levix-secondary hover:text-levix-charcoal font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Support & Concierge Drawer */}
      {isSupportDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-drawer-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl border border-levix-border space-y-5 animate-in slide-in-from-bottom duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-levix-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="support-drawer-title" className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
                    Client Concierge
                  </h3>
                  <p className="text-[11px] text-levix-secondary">
                    Mon–Sat, 10:00 AM – 7:00 PM IST
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSupportDrawerOpen(false)}
                aria-label="Close support drawer"
                className="p-1.5 rounded-full text-levix-secondary hover:text-levix-charcoal hover:bg-levix-gray transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* WhatsApp Live Support Button */}
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-between shadow-md transition-all duration-200 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 text-left">
                  <MessageSquare className="w-5 h-5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      Chat on WhatsApp
                    </h4>
                    <p className="text-[11px] text-emerald-100">
                      Average response under 5 minutes
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 opacity-75" />
              </button>

              {/* Telephone Support */}
              <a
                href={`tel:${settings.supportPhone || '+918000123456'}`}
                className="w-full p-3.5 bg-levix-gray hover:bg-neutral-200 border border-levix-border rounded-xl flex items-center justify-between text-levix-charcoal transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-levix-orange" />
                  <div className="text-left">
                    <span className="text-xs font-bold uppercase tracking-wider block">
                      Direct Support Line
                    </span>
                    <span className="text-[11px] text-levix-secondary">
                      {settings.supportPhone || '+91 8000 123 456'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-levix-orange uppercase tracking-wider">
                  Call Now
                </span>
              </a>

              {/* Email Support */}
              <a
                href={`mailto:${settings.supportEmail || 'care@levix.in'}?subject=LEVIX%20Order%20Inquiry`}
                className="w-full p-3.5 bg-levix-gray hover:bg-neutral-200 border border-levix-border rounded-xl flex items-center justify-between text-levix-charcoal transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-levix-orange" />
                  <div className="text-left">
                    <span className="text-xs font-bold uppercase tracking-wider block">
                      Official Email Inquiries
                    </span>
                    <span className="text-[11px] text-levix-secondary">
                      {settings.supportEmail || 'care@levix.in'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-levix-orange uppercase tracking-wider">
                  Email Us
                </span>
              </a>
            </div>

            <div className="pt-2 text-center border-t border-levix-border">
              <Link
                to="/account/orders"
                onClick={() => setIsSupportDrawerOpen(false)}
                className="text-xs text-levix-secondary hover:text-levix-orange transition-colors font-medium"
              >
                Looking for an existing purchase? Track Order →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
