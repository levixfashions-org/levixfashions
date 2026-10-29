import React, { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { AnnouncementBar } from './AnnouncementBar'
import { Header } from './Header'
import { Footer } from './Footer'
import { GlassBottomDock } from './GlassBottomDock'
import { PWAInstallPrompt } from './PWAInstallPrompt'
import { AdminQuickBar } from '../admin/AdminQuickBar'
import { useStore } from '../../context/StoreContext'

export const RootLayout: React.FC = () => {
  const location = useLocation()
  const { refreshStore } = useStore()

  // Ensure document body & documentElement background colors are reset to pure white
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = ''
      document.documentElement.style.backgroundColor = ''
    }
  }, [])

  // Revalidate store data on route navigation so the customer always sees current catalog data
  useEffect(() => {
    refreshStore()
  }, [location.pathname, refreshStore])
  return (
    <div className="min-h-screen flex flex-col bg-white text-levix-charcoal font-sans antialiased selection:bg-black selection:text-white">
      <ScrollRestoration />
      <AnnouncementBar />
      <Header />
      <main className="flex-1 pb-24 sm:pb-28">
        <Outlet />
      </main>
      <Footer />
      <GlassBottomDock />
      <PWAInstallPrompt />
      <AdminQuickBar />
    </div>
  )
}
