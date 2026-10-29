import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, checkIsAdminEmail } from '../../context/AuthContext'

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, loading, currentUser, userProfile } = useAuth()
  const location = useLocation()

  const isLocallyAuthorized =
    isAdmin ||
    checkIsAdminEmail(currentUser?.email) ||
    checkIsAdminEmail(userProfile?.email)

  if (loading && !isLocallyAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-levix-charcoal text-white">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest font-bold">Verifying Administrator Access...</p>
        </div>
      </div>
    )
  }

  if (!isLocallyAuthorized) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
