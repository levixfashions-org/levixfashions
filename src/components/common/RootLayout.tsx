import React, { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { AnnouncementBar } from './AnnouncementBar'
import { Header } from './Header'
import { Footer } from './Footer'
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
    <div className="min-h-screen flex flex-col bg-white text-levix-charcoal font-sans antialiased">
      <ScrollRestoration />
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <PWAInstallPrompt />
      <AdminQuickBar />
    </div>
  )
}
