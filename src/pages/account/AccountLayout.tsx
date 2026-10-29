import React from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { SEO } from '../../components/common/SEO'

export const AccountLayout: React.FC = () => {
  const { userProfile, currentUser, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navItems = [
    { label: 'Profile Details', path: '/account', icon: User, end: true },
    { label: 'Order History & Tracking', path: '/account/orders', icon: Package },
    { label: 'Saved Addresses', path: '/account/addresses', icon: MapPin },
    { label: 'My Wishlist', path: '/wishlist', icon: Heart },
  ]

  return (
    <div className="bg-levix-gray/30 min-h-screen py-10 sm:py-14">
      <SEO title="Customer Portal" />

      <div className="container-levix">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 pb-4 border-b border-levix-border flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-black mb-1">
                Client Portal
              </p>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-levix-charcoal">
                Welcome, {userProfile?.displayName || userProfile?.email?.split('@')[0] || 'Client'}
              </h1>
            </div>
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-bold uppercase tracking-wider shadow-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Open Admin Dashboard</span>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Navigation (4 cols) */}
            <aside className="lg:col-span-4 bg-white border border-levix-border p-4 shadow-subtle space-y-1">
              <div className="p-3 border-b border-levix-border mb-2">
                <p className="text-xs font-bold text-levix-charcoal truncate">
                  {userProfile?.displayName || 'Client'}
                </p>
                <p className="text-[11px] text-levix-secondary truncate">
                  {userProfile?.email || currentUser?.email}
                </p>
              </div>

              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                        isActive
                          ? 'bg-black/5 text-black border-l-2 border-black font-bold'
                          : 'text-levix-charcoal hover:bg-levix-gray hover:text-black'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}

              <div className="pt-2 border-t border-levix-border mt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </aside>

            {/* Main Area (8 cols) */}
            <main className="lg:col-span-8 bg-white border border-levix-border p-6 sm:p-8 shadow-subtle">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
