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

  // Revalidate store data on route navigation so the customer always sees current catalog data
  useEffect(() => {
    refreshStore()
  }, [location.pathname, refreshStore])
  return (
    <div className="min-h-screen flex flex-col text-levix-charcoal font-sans antialiased selection:bg-levix-orange/20 selection:text-levix-orange">
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
