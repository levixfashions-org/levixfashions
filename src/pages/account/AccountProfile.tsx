import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Check, AlertCircle } from 'lucide-react'

export const AccountProfile: React.FC = () => {
  const { userProfile, updateProfileData } = useAuth()

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '')
  const [phone, setPhone] = useState(userProfile?.phone || '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim()) {
      setError('Name is required.')
      return
    }

    try {
      setSaving(true)
      setError(null)
      await updateProfileData({ displayName, phone })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-levix-border">
        <h2 className="text-base font-bold uppercase tracking-wider text-levix-charcoal">
          Personal Information
        </h2>
        <p className="text-xs text-levix-secondary mt-0.5">
          Manage your contact credentials and display details.
        </p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved successfully.</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 max-w-lg">
        <div>
          <label className="form-label">Email Address (Registered)</label>
          <input
            type="email"
            value={userProfile?.email || ''}
            disabled
            className="form-input bg-levix-gray text-levix-secondary cursor-not-allowed"
          />
          <p className="text-[11px] text-levix-secondary mt-1">
            Registered account identifier cannot be altered directly.
          </p>
        </div>

        <div>
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Contact Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="form-input"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary py-3 px-6 text-xs uppercase tracking-wider"
        >
          {saving ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  )
}
