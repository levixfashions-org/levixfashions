import React, { useEffect, useState } from 'react'
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'
import { RefreshCw, AlertTriangle, Home, LayoutDashboard } from 'lucide-react'

export const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError() as any
  const [reloading, setReloading] = useState(false)

  const errorMessage = error?.message || (isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : 'An unexpected error occurred')
  const isChunkError =
    errorMessage.includes('Failed to fetch dynamically imported module') ||
    errorMessage.includes('Importing a module script failed') ||
    errorMessage.includes('error loading dynamically imported module') ||
    errorMessage.includes('dynamically imported module')

  useEffect(() => {
    // If a new version was deployed, reload automatically once to fetch the latest bundles
    if (isChunkError) {
      const key = 'levix_auto_reloaded_for_chunk'
      const alreadyTried = sessionStorage.getItem(key)
      if (!alreadyTried) {
        sessionStorage.setItem(key, 'true')
        console.warn('[LEVIX] Application update detected. Refreshing to latest code bundle...')
        window.location.reload()
      }
    }
  }, [isChunkError])

  const handleManualReload = async () => {
    setReloading(true)
    sessionStorage.removeItem('levix_auto_reloaded_for_chunk')
    // Clear any stale caches if Service Worker is active
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((name) => caches.delete(name)))
      } catch (e) {
        console.warn('Cache clear note:', e)
      }
    }
    window.location.reload()
  }

  const isAdminPath = window.location.pathname.startsWith('/admin')

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-levix-gray/30">
      <div className="max-w-md w-full bg-white border border-levix-border shadow-xl p-8 text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-levix-soft-orange/60 border border-levix-orange/30 flex items-center justify-center mx-auto text-levix-orange">
          {isChunkError ? (
            <RefreshCw className="w-7 h-7 text-levix-orange animate-spin" />
          ) : (
            <AlertTriangle className="w-7 h-7 text-levix-orange" />
          )}
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-levix-orange">
            {isChunkError ? 'New Update Available' : 'Application Notice'}
          </span>
          <h2 className="text-xl font-black uppercase tracking-tight text-levix-charcoal">
            {isChunkError ? 'A New App Version Was Deployed' : 'Something went wrong'}
          </h2>
          <p className="text-xs text-levix-secondary leading-relaxed">
            {isChunkError
              ? 'We just updated the store with the latest features and optimizations. Refresh your window to load the latest version.'
              : errorMessage}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleManualReload}
            disabled={reloading}
            className="w-full btn-primary py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${reloading ? 'animate-spin' : ''}`} />
            <span>{reloading ? 'Reloading...' : 'Reload & Update Now'}</span>
          </button>

          {isAdminPath ? (
            <Link
              to="/admin"
              onClick={() => sessionStorage.removeItem('levix_auto_reloaded_for_chunk')}
              className="w-full btn-secondary py-2.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer block text-center"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Back to Admin Overview</span>
            </Link>
          ) : (
            <Link
              to="/"
              onClick={() => sessionStorage.removeItem('levix_auto_reloaded_for_chunk')}
              className="w-full btn-secondary py-2.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer block text-center"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Storefront</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
