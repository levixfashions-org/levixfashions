import React, { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { SEO } from '../../components/common/SEO'

export const AdminLayout: React.FC = () => {
  const { userProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navLinks = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Orders & Dispatch', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Product Inventory', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Store Settings', path: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-levix-gray/40 flex flex-col">
      <SEO title="Administrator Portal" />

      {/* Top Admin Bar */}
      <header className="bg-levix-charcoal text-white h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-gray-300 hover:text-white md:hidden"
            aria-label="Toggle admin menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-levix-orange text-white flex items-center justify-center font-black text-xs tracking-tighter">
              LX
            </div>
            <span className="font-black text-sm tracking-[0.2em] text-white uppercase">
              LEVIX ADMIN
            </span>
          </Link>
          <span className="hidden sm:inline-block px-2 py-0.5 bg-white/10 text-levix-orange text-[10px] font-mono uppercase tracking-wider">
            Production Control
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            target="_blank"
            className="text-xs text-gray-300 hover:text-levix-orange transition-colors flex items-center gap-1"
          >
            <span className="hidden sm:inline">Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="h-4 w-px bg-white/20 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-200 hidden sm:inline truncate max-w-[150px]">
              {userProfile?.displayName || userProfile?.email || 'Admin'}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-gray-300 hover:text-red-400 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Layout Body: Sidebar + Main Content */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-white border-r border-levix-border hidden md:flex flex-col justify-between p-4 sticky top-16 h-[calc(100vh-64px)]">
          <nav className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-widest text-levix-secondary px-3 py-2">
              Management
            </p>
            {navLinks.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      isActive
                        ? 'bg-levix-soft-orange text-levix-orange border-l-2 border-levix-orange font-bold'
                        : 'text-levix-charcoal hover:bg-levix-gray hover:text-levix-orange'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          <div className="p-3 bg-levix-gray border border-levix-border text-[11px] text-levix-secondary space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Security Enforced</span>
            </div>
            <p>Admin privilege verified by Firebase custom claim / auth rules.</p>
          </div>
        </aside>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-30 md:hidden">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-levix-border p-4 flex flex-col justify-between pt-20">
              <nav className="space-y-1">
                {navLinks.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                          isActive
                            ? 'bg-levix-soft-orange text-levix-orange border-l-2 border-levix-orange font-bold'
                            : 'text-levix-charcoal hover:bg-levix-gray'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  )
                })}
              </nav>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 p-3 text-xs text-red-600 border border-red-200 bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Outlet */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
