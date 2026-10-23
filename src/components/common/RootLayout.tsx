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
  const { refreshStore, settings } = useStore()
  const pageBg = settings?.productCardBgColor || '#f0f0f0'

  // Apply dynamic background color to html and body elements across the entire website
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = pageBg
      document.documentElement.style.backgroundColor = pageBg
    }
  }, [pageBg])

  // Revalidate store data on route navigation so the customer always sees current catalog data
  useEffect(() => {
    refreshStore()
  }, [location.pathname, refreshStore])
  return (
    <div
      style={{ backgroundColor: pageBg }}
      className="min-h-screen flex flex-col text-levix-charcoal font-sans antialiased selection:bg-levix-orange/20 selection:text-levix-orange transition-colors duration-300"
    >
      <ScrollRestoration />
      <AnnouncementBar />
      <Header />
      <main
        style={{ backgroundColor: pageBg }}
        className="flex-1 pb-24 sm:pb-28 transition-colors duration-300"
      >
        <Outlet />
      </main>
      <Footer />
      <GlassBottomDock />
      <PWAInstallPrompt />
      <AdminQuickBar />
    </div>
  )
}
