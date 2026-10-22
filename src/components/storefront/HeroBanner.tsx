import React from 'react'
import { Link } from 'react-router-dom'
import { Edit3 } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { useAuth } from '../../context/AuthContext'

export const HeroBanner: React.FC = () => {
  const { settings } = useStore()
  const { isAdmin } = useAuth()
  const { hero } = settings

  const bannerImage =
    hero?.imageUrl ||
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85'

  const smallSentence = hero?.subtitle || ''
  const destinationLink = hero?.primaryButtonLink || '/shop'
  const shopNowText = hero?.primaryButtonText || 'Shop now'

  return (
    <section className="relative w-full h-[calc(100svh-3.5rem)] sm:h-[90vh] min-h-[560px] bg-neutral-900 overflow-hidden flex flex-col justify-end">
      {/* Full-Screen Cover Background Photo */}
      <div className="absolute inset-0 z-0">
        <img
          src={bannerImage}
          alt="LEVIX Collection Hero"
          loading="eager"
          className="w-full h-full object-cover object-center scale-100 transition-transform duration-1000 ease-out"
        />
        {/* Subtle, soft bottom vignette for high-contrast legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
      </div>

      {/* Admin Quick Banner Edit Shortcut */}
      {isAdmin && (
        <div className="absolute top-4 right-4 z-20">
          <Link
            to="/admin/settings#hero-banner"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-semibold border border-white/30 shadow-md transition-all hover:scale-105"
            title="Edit Homepage Hero Banner"
          >
            <Edit3 className="w-3.5 h-3.5 text-white" />
            <span>Change Photo & Collection</span>
          </Link>
        </div>
      )}

      {/* Minimal Underlined "Shop now" & Small Sentence (Inspired by Bluorng Reference) */}
      <div className="relative z-10 w-full pb-28 sm:pb-32 flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-500">
        {/* Small sentence above shop now */}
        {smallSentence.trim() && (
          <p className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-white/90 drop-shadow-md mb-2 select-none">
            {smallSentence}
          </p>
        )}

        {/* Underlined "Shop now" design (No button structures) */}
        <Link
          to={destinationLink}
          className="inline-block text-sm sm:text-base font-semibold tracking-wide text-white underline underline-offset-8 decoration-1 sm:decoration-2 decoration-white/95 hover:text-white/80 transition-all drop-shadow-md select-none"
        >
          {shopNowText}
        </Link>
      </div>
    </section>
  )
}
