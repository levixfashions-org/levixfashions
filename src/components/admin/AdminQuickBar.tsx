import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Plus, Package, ChevronUp, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const AdminQuickBar: React.FC = () => {
  const { isAdmin, currentUser, userProfile } = useAuth()
  const [isMinimized, setIsMinimized] = useState(false)

  if (!isAdmin) return null

  const adminEmail = userProfile?.email || currentUser?.email || 'levixfashions@gmail.com'

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-bounce">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="bg-black/90 backdrop-blur-md text-white border border-white/20 px-3 py-2 text-xs font-bold uppercase tracking-wider shadow-2xl flex items-center gap-1.5 cursor-pointer rounded-xs"
          title="Open Admin Quick Tools"
        >
          <ShieldCheck className="w-4 h-4 text-white" />
          <span>Admin Bar</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <aside
      aria-label="Admin Control Bar"
      className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-white/20 text-white px-4 py-2.5 shadow-2xl transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Status Badge */}
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-white">
                👑 Admin Control Mode
              </span>
              <span className="text-[10px] bg-black/60 px-1.5 py-0.5 rounded-xs font-mono text-neutral-300">
                {adminEmail}
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 hidden md:block">
              Only you see this bar. Regular visitors cannot see it.
            </p>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-200 text-black text-xs font-bold uppercase tracking-wider transition-colors shadow-sm rounded-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add / Manage Products</span>
          </Link>

          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-colors border border-white/20 rounded-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>Admin Dashboard</span>
          </Link>

          <Link
            to="/admin/orders"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-colors border border-white/20 rounded-xs"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Orders</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Minimize Admin Bar"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
