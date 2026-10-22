import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  X,
  ChevronDown,
  ShieldCheck,
  LogOut,
  Smartphone,
} from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useAuth } from '../../context/AuthContext'
import { useStore } from '../../context/StoreContext'
import { SearchModal } from './SearchModal'
import { CartDrawer } from '../storefront/CartDrawer'

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCategoryHovered, setIsCategoryHovered] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const { totalItems, setIsCartDrawerOpen } = useCart()
  const { wishlistCount } = useWishlist()
  const { currentUser, userProfile, isAdmin, logout } = useAuth()
  const { categories } = useStore()
  const location = useLocation()

  // Listen for mobile bottom dock triggers
  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true)
    const handleToggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev)
    const handleCloseMobileMenu = () => setIsMobileMenuOpen(false)

    window.addEventListener('levix_open_search', handleOpenSearch)
    window.addEventListener('levix_open_mobile_menu', handleToggleMobileMenu)
    window.addEventListener('levix_close_mobile_menu', handleCloseMobileMenu)

    return () => {
      window.removeEventListener('levix_open_search', handleOpenSearch)
      window.removeEventListener('levix_open_mobile_menu', handleToggleMobileMenu)
      window.removeEventListener('levix_close_mobile_menu', handleCloseMobileMenu)
    }
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-levix-border transition-all">
        <div className="container-levix">
          {/* 
            MOBILE TOP BAR: Clean, minimal, centered logo.
            All navigation actions (Menu, Search, Wishlist, Account, Bag) 
            are brought to the floating bottom glass dock!
          */}
          <div className="flex items-center justify-between lg:hidden h-14 sm:h-16">
            <div className="w-8">
              {isMobileMenuOpen && (
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 -ml-1 text-levix-charcoal hover:text-levix-orange transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 bg-black flex items-center justify-center text-white font-black text-xs tracking-tighter shadow-xs">
                LX
              </div>
              <span className="text-xl font-black tracking-[0.2em] text-levix-charcoal uppercase">
                LEVIX
              </span>
            </Link>

            <div className="w-8" />
          </div>

          {/* DESKTOP HEADER */}
          <div className="hidden lg:flex items-center justify-between h-20">
            {/* LEVIX Brand Wordmark */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-levix-orange flex items-center justify-center text-white font-black text-sm tracking-tighter">
                  LX
                </div>
                <span className="text-2xl font-black tracking-[0.2em] text-levix-charcoal uppercase">
                  LEVIX
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                to="/shop"
                className={`text-xs uppercase font-semibold tracking-wider transition-colors py-1 relative ${
                  isActive('/shop')
                    ? 'text-levix-orange after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-levix-orange'
                    : 'text-levix-charcoal hover:text-levix-orange'
                }`}
              >
                Shop All
              </Link>

              {/* Collections Dropdown */}
              <div
                className="relative py-4"
                onMouseEnter={() => setIsCategoryHovered(true)}
                onMouseLeave={() => setIsCategoryHovered(false)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs uppercase font-semibold tracking-wider text-levix-charcoal hover:text-levix-orange transition-colors"
                >
                  <span>Collections</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isCategoryHovered ? 'rotate-180 text-levix-orange' : ''
                    }`}
                  />
                </button>

                {isCategoryHovered && (
                  <div className="absolute top-full -left-4 w-72 bg-white border border-levix-border shadow-xl py-3 px-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="space-y-1">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/collection/${cat.slug}`}
                          onClick={() => setIsCategoryHovered(false)}
                          className="flex items-center gap-3 p-2 hover:bg-levix-gray transition-colors group"
                        >
                          <img
                            src={cat.imageUrl}
                            alt={cat.name}
                            className="w-10 h-10 object-cover border border-levix-border bg-levix-gray"
                          />
                          <div>
                            <p className="text-xs font-semibold text-levix-charcoal group-hover:text-levix-orange transition-colors">
                              {cat.name}
                            </p>
                            <p className="text-[11px] text-levix-secondary line-clamp-1">
                              {cat.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/shop?sort=newest"
                className="text-xs uppercase font-semibold tracking-wider text-levix-charcoal hover:text-levix-orange transition-colors"
              >
                New Arrivals
              </Link>

              <Link
                to="/shop?sort=bestsellers"
                className="text-xs uppercase font-semibold tracking-wider text-levix-charcoal hover:text-levix-orange transition-colors"
              >
                Bestsellers
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-levix-orange hover:bg-levix-orange-hover text-white text-[10px] font-black uppercase tracking-widest rounded-xs shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </nav>

            {/* Right Action Icons (Desktop only - mobile actions are brought to bottom dock) */}
            <div className="hidden lg:flex items-center space-x-5">
              {/* Desktop Search Button */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-levix-gray hover:bg-levix-soft-orange text-levix-secondary hover:text-levix-orange text-xs transition-colors border border-transparent hover:border-levix-orange/30"
                aria-label="Open search dialog"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="font-medium">Search</span>
                <kbd className="text-[10px] bg-white px-1.5 py-0.5 border border-levix-border text-levix-secondary">
                  ⌘K
                </kbd>
              </button>

              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                className="relative p-1.5 text-levix-charcoal hover:text-levix-orange transition-colors"
                aria-label={`Wishlist, ${wishlistCount} items`}
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-levix-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <Link
                  to={isAdmin ? '/admin' : (currentUser || userProfile ? '/account' : '/login')}
                  className={`p-1.5 transition-colors block ${
                    isAdmin ? 'text-levix-orange bg-levix-soft-orange rounded-full' : 'text-levix-charcoal hover:text-levix-orange'
                  }`}
                  aria-label="Account"
                  title={isAdmin ? 'Admin Dashboard' : 'Account'}
                >
                  {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </Link>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full w-56 bg-white border border-levix-border shadow-xl py-2 z-50 animate-in fade-in duration-100">
                    {currentUser || userProfile ? (
                      <div className="divide-y divide-levix-border">
                        <div className="px-4 py-2.5">
                          <p className="text-[11px] text-levix-secondary">Signed in as</p>
                          <p className="text-xs font-semibold text-levix-charcoal truncate">
                            {userProfile?.displayName || userProfile?.email || currentUser?.email}
                          </p>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/account"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="block px-4 py-2 text-xs text-levix-charcoal hover:bg-levix-gray hover:text-levix-orange"
                          >
                            My Profile & Addresses
                          </Link>
                          <Link
                            to="/account/orders"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="block px-4 py-2 text-xs text-levix-charcoal hover:bg-levix-gray hover:text-levix-orange"
                          >
                            Order History & Tracking
                          </Link>
                          {isAdmin && (
                            <Link
                              to="/admin"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-levix-orange bg-levix-soft-orange/60 hover:bg-levix-soft-orange"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Admin Dashboard</span>
                            </Link>
                          )}
                        </div>
                        <div className="py-1">
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false)
                              logout()
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-levix-gray flex items-center gap-2"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 space-y-2">
                        <Link
                          to="/login"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full btn-primary py-2 text-xs text-center block"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full btn-secondary py-2 text-xs text-center block"
                        >
                          Create Account
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Shopping Bag Button with Live Count */}
              <button
                type="button"
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative p-1.5 text-levix-charcoal hover:text-levix-orange transition-colors"
                aria-label={`Shopping bag with ${totalItems} items`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-levix-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-16 sm:top-20 bottom-0 bg-white z-40 border-t border-levix-border overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="px-6 py-6 space-y-6">
              <nav className="space-y-3">
                <Link
                  to="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-base font-semibold text-levix-charcoal hover:text-levix-orange uppercase tracking-wider"
                >
                  Shop All
                </Link>
                <Link
                  to="/shop?sort=newest"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-base font-semibold text-levix-charcoal hover:text-levix-orange uppercase tracking-wider"
                >
                  New Arrivals
                </Link>
                <Link
                  to="/shop?sort=bestsellers"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-base font-semibold text-levix-charcoal hover:text-levix-orange uppercase tracking-wider"
                >
                  Bestsellers
                </Link>
              </nav>

              <div className="pt-4 border-t border-levix-border">
                <p className="text-xs uppercase font-semibold text-levix-secondary tracking-widest mb-3">
                  Collections
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/collection/${cat.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="group flex flex-col"
                    >
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="w-full h-24 object-cover border border-levix-border bg-levix-gray"
                      />
                      <span className="mt-1 text-xs font-medium text-levix-charcoal group-hover:text-levix-orange">
                        {cat.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-levix-border space-y-3">
                {currentUser || userProfile ? (
                  <>
                    <Link
                      to="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-sm font-medium text-levix-charcoal"
                    >
                      Customer Dashboard
                    </Link>
                    <Link
                      to="/account/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-sm font-medium text-levix-charcoal"
                    >
                      My Orders & Tracking
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-sm font-semibold text-levix-orange"
                      >
                        Admin Control Panel
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        logout()
                      }}
                      className="text-sm text-red-600 block text-left"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full btn-primary py-3 text-center block text-xs uppercase tracking-wider"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full btn-secondary py-3 text-center block text-xs uppercase tracking-wider"
                    >
                      Register
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        window.dispatchEvent(new CustomEvent('open-pwa-install'))
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-levix-charcoal text-xs font-semibold uppercase tracking-wider transition-colors border border-levix-border mt-3"
                    >
                      <Smartphone className="w-4 h-4 text-levix-orange" />
                      <span>Install App</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Global Slide-out Cart Drawer */}
      <CartDrawer />
    </>
  )
}
