import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Auto-recover from chunk loading failures during rolling deployments
window.addEventListener('vite:preloadError', (event) => {
  console.warn('[LEVIX] Detected new version deployment (chunk hash updated). Refreshing to load latest version...')
  event.preventDefault()
  window.location.reload()
})

// Active Service Worker updater: ensures browsers immediately query Hostinger for the latest deployment
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.update().catch(() => {})
  })
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[LEVIX] Service Worker updated to latest version')
  })
}

window.addEventListener('error', (event) => {
  const msg = event?.message || ''
  if (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module')
  ) {
    const key = 'levix_main_chunk_reload'
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, 'true')
      window.location.reload()
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
