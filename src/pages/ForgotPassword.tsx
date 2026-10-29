import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Check, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { SEO } from '../components/common/SEO'

export const ForgotPassword: React.FC = () => {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    try {
      setLoading(true)
      setError(null)
      await resetPassword(email)
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link. Please check your email address.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-levix-gray/30 min-h-screen py-16 sm:py-24 flex items-center justify-center">
      <SEO title="Reset Password" />

      <div className="w-full max-w-md mx-4">
        <div className="bg-white border border-levix-border p-8 shadow-subtle space-y-6">
          <div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-levix-secondary hover:text-black transition-colors mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
            <h1 className="text-xl font-bold uppercase tracking-wider text-levix-charcoal">
              Reset Password
            </h1>
            <p className="text-xs text-levix-secondary mt-1">
              Enter your account email and we will send you a password recovery link.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-3">
              <div className="flex items-center gap-2 font-bold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Password Reset Email Sent</span>
              </div>
              <p>
                If an account exists for <strong className="font-semibold">{email}</strong>, you will receive instructions on how to reset your password shortly.
              </p>
              <Link to="/login" className="btn-secondary w-full py-2.5 text-xs uppercase text-center block mt-2">
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="form-input pl-10"
                  />
                  <Mail className="w-4 h-4 text-levix-secondary absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 text-xs uppercase tracking-wider"
              >
                {loading ? 'Sending Request...' : 'Send Recovery Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
