import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Mail, User, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { SEO } from '../components/common/SEO'

const registerSchema = z
  .object({
    displayName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export const Register: React.FC = () => {
  const { register: registerAuth } = useAuth()
  const navigate = useNavigate()
  const [authError, setAuthError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true)
      setAuthError(null)
      await registerAuth(data.email, data.password, data.displayName)
      navigate('/account')
    } catch (err: any) {
      setAuthError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-levix-gray/30 min-h-screen py-16 sm:py-24 flex items-center justify-center">
      <SEO title="Create Account" />

      <div className="w-full max-w-md mx-4">
        <div className="bg-white border border-levix-border p-8 shadow-subtle space-y-6">
          <div className="text-center space-y-1">
            <Link to="/" className="inline-flex items-center gap-1.5 justify-center mb-2">
              <div className="w-6 h-6 bg-levix-orange text-white text-xs font-black flex items-center justify-center">
                LX
              </div>
              <span className="font-black text-xl tracking-[0.2em] text-levix-charcoal uppercase">
                LEVIX
              </span>
            </Link>
            <h1 className="text-xl font-bold uppercase tracking-wider text-levix-charcoal">
              Create Client Account
            </h1>
            <p className="text-xs text-levix-secondary">
              Enjoy express checkouts, address management, and tracked orders.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="form-label">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  {...register('displayName')}
                  placeholder="e.g. Mohan Sharma"
                  className="form-input pl-10"
                />
                <User className="w-4 h-4 text-levix-secondary absolute left-3.5 top-3.5" />
              </div>
              {errors.displayName && (
                <p className="text-[11px] text-red-600 mt-1">{errors.displayName.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  {...register('email')}
                  placeholder="name@example.com"
                  className="form-input pl-10"
                />
                <Mail className="w-4 h-4 text-levix-secondary absolute left-3.5 top-3.5" />
              </div>
              {errors.email && (
                <p className="text-[11px] text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className="form-input pl-10"
                />
                <Lock className="w-4 h-4 text-levix-secondary absolute left-3.5 top-3.5" />
              </div>
              {errors.password && (
                <p className="text-[11px] text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  {...register('confirmPassword')}
                  placeholder="••••••••"
                  className="form-input pl-10"
                />
                <Lock className="w-4 h-4 text-levix-secondary absolute left-3.5 top-3.5" />
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-red-600 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-3.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-levix-secondary">
            Already registered?{' '}
            <Link to="/login" className="text-levix-orange font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
