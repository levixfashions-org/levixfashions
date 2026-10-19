import React, { useState, useEffect } from 'react'
import { Download, X, Share, PlusSquare } from 'lucide-react'

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isIOS, setIsIOS] = useState<boolean>(false)
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false)

  useEffect(() => {
    // Check if already running as standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    if (isStandalone) {
      return
    }

    // Check if user dismissed prompt recently
    const dismissedTime = localStorage.getItem('levix_pwa_dismissed')
    if (dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 1000 * 60 * 60 * 24 * 7) {
      return // Don't prompt for 7 days if dismissed
    }

    // Check iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent)

    if (isIosDevice && isSafari) {
      setIsIOS(true)
      setIsVisible(true)
      return
    }

    // Listen for beforeinstallprompt event on Chromium browsers
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true)
      return
    }

    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsVisible(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setShowIOSGuide(false)
    localStorage.setItem('levix_pwa_dismissed', Date.now().toString())
  }

  if (!isVisible) return null

  return (
    <>
      {/* Subtle Bottom Floating Install Banner */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 bg-white border border-levix-border shadow-2xl p-4 animate-in slide-in-from-bottom-5 duration-300">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-levix-orange text-white font-black flex items-center justify-center shrink-0">
            LX
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-levix-charcoal uppercase tracking-wider">
              Install LEVIX App
            </h4>
            <p className="text-[11px] text-levix-secondary mt-0.5">
              Instant mobile shopping, push updates & offline browsing.
            </p>
            <div className="flex items-center gap-2 mt-2.5">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3.5 py-1.5 bg-levix-orange hover:bg-levix-orange-hover text-white text-xs font-semibold tracking-wider uppercase transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isIOS ? 'Instructions' : 'Install'}</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-1.5 text-xs text-levix-secondary hover:text-levix-charcoal transition-colors"
              >
                Not Now
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-levix-secondary hover:text-levix-charcoal p-1 -mr-1 -mt-1"
            aria-label="Dismiss install banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-sm w-full p-6 border border-levix-border shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-levix-border mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
                Install LEVIX on iPhone / iPad
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-levix-secondary hover:text-levix-charcoal"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ol className="space-y-4 text-xs text-levix-charcoal">
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 bg-levix-gray border border-levix-border flex items-center justify-center font-bold text-levix-orange shrink-0">
                  1
                </span>
                <span>
                  Tap the Safari <strong className="font-semibold">Share</strong> button{' '}
                  <Share className="w-4 h-4 inline-block text-levix-orange mx-0.5" /> in the bottom toolbar.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 bg-levix-gray border border-levix-border flex items-center justify-center font-bold text-levix-orange shrink-0">
                  2
                </span>
                <span>
                  Scroll down the share sheet and tap{' '}
                  <strong className="font-semibold">Add to Home Screen</strong>{' '}
                  <PlusSquare className="w-4 h-4 inline-block text-levix-orange mx-0.5" />.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 bg-levix-gray border border-levix-border flex items-center justify-center font-bold text-levix-orange shrink-0">
                  3
                </span>
                <span>
                  Tap <strong className="font-semibold">Add</strong> in the top right to complete installation.
                </span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full btn-primary mt-6 py-2.5 text-xs uppercase tracking-wider"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  )
}
