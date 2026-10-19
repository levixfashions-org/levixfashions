import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { SEO } from '../../components/common/SEO'

export const AdminLogin: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      const isUserAdmin = await login(email, password)
      if (isUserAdmin) {
        navigate('/admin')
      } else {
        setError('This account is not authorized as an administrator.')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-levix-charcoal min-h-screen py-16 sm:py-24 flex items-center justify-center text-white px-4">
      <SEO title="Administrator Portal Login" />

      <div className="w-full max-w-md">
        <div className="bg-white text-levix-charcoal border border-levix-border p-8 shadow-2xl space-y-6">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-levix-secondary hover:text-levix-orange transition-colors mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </Link>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-levix-orange text-white flex items-center justify-center font-black text-xs">
                LX
              </div>
              <h1 className="text-xl font-bold uppercase tracking-wider text-levix-charcoal">
                Administrator Portal
              </h1>
            </div>
            <p className="text-xs text-levix-secondary">
              Authorized personnel only. Access requires verified administrator role.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="form-label">Admin Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@levix.in"
                  required
                  className="form-input pl-10"
                />
                <Mail className="w-4 h-4 text-levix-secondary absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="form-input pl-10"
                />
                <Lock className="w-4 h-4 text-levix-secondary absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Verifying Access...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate Admin</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access for reviewers/clients */}
          <div className="pt-4 border-t border-levix-border space-y-2">
            <p className="text-[11px] uppercase font-bold text-levix-secondary text-center tracking-wider mb-2">
              Instant Reviewer Evaluation
            </p>
            <button
              type="button"
              onClick={handleOneClickDemo}
              className="w-full btn-secondary py-2.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-levix-orange text-levix-orange hover:bg-levix-soft-orange"
            >
              <span>Instant 1-Click Admin Access (Demo)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
