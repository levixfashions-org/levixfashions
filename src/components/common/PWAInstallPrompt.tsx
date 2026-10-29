import React, { useState, useEffect, useCallback } from 'react'
import { Download, X, Share, PlusSquare, ArrowDown } from 'lucide-react'

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isIOS, setIsIOS] = useState<boolean>(false)
  const [isIOSSafari, setIsIOSSafari] = useState<boolean>(false)
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false)

  const checkPlatformAndPrompt = useCallback(() => {
    if (typeof window === 'undefined') return

    // Check if already launched in standalone mode (already installed!)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')

    if (isStandalone) {
      return
    }

    const ua = window.navigator.userAgent.toLowerCase()
    const isIosDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)

    if (isIosDevice) {
      setIsIOS(true)
      const isSafari = /safari/.test(ua) && !/chrome|crios|fxios|optios|edgios/.test(ua)
      setIsIOSSafari(isSafari)
      
      // Check session dismissal (resets on tab close so user isn't permanently locked out)
      const dismissed = sessionStorage.getItem('levix_pwa_dismissed')
      if (!dismissed) {
        setIsVisible(true)
      }
      return
    }

    // Non-iOS: check session dismissal
    const dismissed = sessionStorage.getItem('levix_pwa_dismissed')
    if (dismissed) return

    // Handled by beforeinstallprompt for Android/Desktop
  }, [])

  useEffect(() => {
    checkPlatformAndPrompt()

    // Listen for beforeinstallprompt event on Chromium/Android
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      const dismissed = sessionStorage.getItem('levix_pwa_dismissed')
      if (!dismissed) {
        setIsVisible(true)
      }
    }

    // Global custom event listener to manually open prompt anytime from menu/footer
    const handleManualOpen = () => {
      setIsVisible(true)
      setShowGuideModal(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('open-pwa-install', handleManualOpen)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('open-pwa-install', handleManualOpen)
    }
  }, [checkPlatformAndPrompt])

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowGuideModal(true)
      return
    }

    if (!deferredPrompt) {
      setShowGuideModal(true)
      return
    }

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsVisible(false)
      }
      setDeferredPrompt(null)
    } catch (_) {
      setShowGuideModal(true)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setShowGuideModal(false)
    try {
      sessionStorage.setItem('levix_pwa_dismissed', 'true')
    } catch (_) {}
  }

  return (
    <>
      {/* Floating Bottom Prompt Banner (Visible on mobile/desktop until dismissed) */}
      {isVisible && (
        <aside
          role="region"
          aria-label="Install LEVIX App"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[380px] z-50 bg-[#0C0C0E]/90 backdrop-blur-xl text-white border border-white/15 shadow-2xl p-4 animate-in slide-in-from-bottom-5 duration-300 rounded-none"
        >
          <div className="flex items-start gap-3.5">
            {/* App Icon */}
            <img
              src="/apple-touch-icon.png"
              alt="LEVIX App Icon"
              className="w-12 h-12 rounded-xl object-cover border border-neutral-700 shrink-0 shadow-md"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Install LEVIX App
                </h4>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-neutral-400 hover:text-white p-1 -mr-1 -mt-1 transition-colors"
                  aria-label="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-neutral-300 mt-1 leading-snug">
                {isIOS
                  ? 'Add to your iPhone Home Screen for instant mobile shopping & fast checkout.'
                  : 'Fast checkout, push drop alerts & seamless offline browsing.'}
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="px-3.5 py-1.5 bg-white hover:bg-neutral-200 text-black text-[11px] font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {isIOS ? (
                    <>
                      <Share className="w-3.5 h-3.5" />
                      <span>How to Install</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Install App</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-2.5 py-1.5 text-[11px] text-neutral-400 hover:text-white transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
          </div>

          {/* Quick iOS Safari bottom hint */}
          {isIOS && isIOSSafari && (
            <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between text-[11px] text-white">
              <span className="flex items-center gap-1.5">
                <span>Tap</span>
                <Share className="w-3.5 h-3.5" />
                <span>then &ldquo;Add to Home Screen&rdquo;</span>
              </span>
              <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            </div>
          )}
        </aside>
      )}

      {/* Comprehensive Guide Modal (Detailed step-by-step for iPhone & other browsers) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0C0C0E] text-white border border-neutral-800 w-full sm:max-w-md p-6 shadow-2xl rounded-t-2xl sm:rounded-none">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-5">
              <div className="flex items-center gap-3">
                <img
                  src="/apple-touch-icon.png"
                  alt="LEVIX App"
                  className="w-10 h-10 rounded-lg object-cover border border-neutral-700"
                />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Install LEVIX on iPhone
                  </h3>
                  <p className="text-[11px] text-neutral-400">Official Mobile Web App</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-neutral-400 hover:text-white p-1 transition-colors"
                aria-label="Close installation instructions"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS && !isIOSSafari ? (
              /* Non-Safari on iOS (Chrome, Instagram in-app browser, etc.) */
              <div className="space-y-4 text-xs text-neutral-300">
                <div className="p-3 bg-neutral-900 border border-neutral-800 text-white text-xs font-medium">
                  Apple only allows PWA installation via the Safari browser.
                </div>
                <p>
                  1. Tap the menu icon in your current browser and select{' '}
                  <strong className="text-white">Open in Safari</strong>.
                </p>
                <p>
                  2. Once in Safari, tap the <strong className="text-white">Share</strong> button{' '}
                  <Share className="w-4 h-4 inline-block text-white mx-1" />.
                </p>
                <p>
                  3. Tap <strong className="text-white">Add to Home Screen</strong>{' '}
                  <PlusSquare className="w-4 h-4 inline-block text-white mx-1" />.
                </p>
              </div>
            ) : (
              /* Safari on iOS or General Guide */
              <ol className="space-y-4 text-xs text-neutral-300">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-white">
                      Tap the Share button in Safari
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Look for the square icon with an arrow pointing up{' '}
                      <Share className="w-3.5 h-3.5 inline-block text-white mx-0.5" /> in the bottom toolbar.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-white">
                      Select &ldquo;Add to Home Screen&rdquo;
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Scroll down the share sheet and tap{' '}
                      <PlusSquare className="w-3.5 h-3.5 inline-block text-white mx-0.5" />{' '}
                      <strong className="text-white">Add to Home Screen</strong>.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-white">
                      Tap &ldquo;Add&rdquo; in the top-right corner
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      LEVIX will be installed onto your iPhone Home Screen just like a native App!
                    </p>
                  </div>
                </li>
              </ol>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full mt-6 py-3 bg-white hover:bg-neutral-200 text-black text-xs font-bold tracking-wider uppercase transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default PWAInstallPrompt
