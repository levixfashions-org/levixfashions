import React from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { AnnouncementBar } from './AnnouncementBar'
import { Header } from './Header'
import { Footer } from './Footer'
import { PWAInstallPrompt } from './PWAInstallPrompt'
import { AdminQuickBar } from '../admin/AdminQuickBar'

export const RootLayout: React.FC = () => {
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
