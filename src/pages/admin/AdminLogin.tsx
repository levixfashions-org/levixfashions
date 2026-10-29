import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react'
import { useAuth, checkIsAdminEmail } from '../../context/AuthContext'
import { SEO } from '../../components/common/SEO'

export const AdminLogin: React.FC = () => {
  const { login, loginWithGoogle, isAdmin, currentUser } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Auto-redirect if already authenticated as administrator
  useEffect(() => {
    if (isAdmin || checkIsAdminEmail(currentUser?.email)) {
      navigate('/admin/products', { replace: true })
    }
  }, [isAdmin, currentUser, navigate])

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      const isUserAdmin = await login(email, password)
      if (isUserAdmin) {
        navigate('/admin/products')
      } else {
        setError('This account is not authorized as an administrator.')
      }
    } catch (err: any) {
      console.error('Admin password login error:', err)
      const code = err?.code || ''
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Incorrect password. If you do not have a password set, please use "Sign In with Google" below.')
      } else if (code === 'auth/user-not-found') {
        setError('No account found with this email. Please use "Sign In with Google" below.')
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please wait a moment or sign in with Google.')
      } else if (code === 'auth/internal-error') {
        setError('Authentication service error. Please use "Sign In with Google" below.')
      } else {
        setError(err.message || 'Invalid administrator credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAdminLogin = async () => {
    try {
      setLoading(true)
      setError(null)
      const isUserAdmin = await loginWithGoogle()
      if (isUserAdmin) {
        navigate('/admin/products', { replace: true })
      } else {
        setError('Only levixfashions@gmail.com is authorized as an administrator.')
      }
    } catch (err: any) {
      console.error('Google Admin Sign-in error:', err)
      if (err.code === 'auth/popup-closed-by-user') return
      if (err.code === 'auth/popup-blocked') {
        setError('Browser pop-up was blocked. Please allow pop-ups for thelevix.shop to complete Google Sign-In.')
        return
      }
      if (err.code === 'auth/unauthorized-domain') {
        setError(
          `Domain not authorized in Firebase Console! Please add: "${window.location.hostname}" to Firebase Console > Authentication > Settings > Authorized Domains.`
        )
        return
      }
      if (err.code === 'auth/internal-error') {
        setError('Firebase communication error. Please ensure pop-ups are allowed and try clicking "Sign In with Google" again.')
        return
      }
      setError(err.message || 'Google Authentication failed. Please try again.')
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
              className="inline-flex items-center gap-1.5 text-xs text-levix-secondary hover:text-black transition-colors mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </Link>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-black text-white flex items-center justify-center font-black text-xs">
                LX
              </div>
              <h1 className="text-xl font-bold uppercase tracking-wider text-levix-charcoal">
                Administrator Portal
              </h1>
            </div>
            <p className="text-xs text-levix-secondary">
              Authorized personnel only. Access requires verified administrator role (levixfashions@gmail.com).
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-in for Admin */}
          <button
            type="button"
            onClick={handleGoogleAdminLogin}
            disabled={loading}
            className="w-full btn-secondary py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-levix-border hover:border-levix-charcoal transition-all shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="font-bold">Sign In With Google (levixfashions@gmail.com)</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-levix-border"></div>
            <span className="flex-shrink mx-4 text-[10px] text-levix-secondary uppercase tracking-widest">
              Or with Password
            </span>
            <div className="flex-grow border-t border-levix-border"></div>
          </div>

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="form-label">Admin Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="levixfashions@gmail.com"
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
        </div>
      </div>
    </div>
  )
}
