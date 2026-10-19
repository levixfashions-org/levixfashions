import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useStore } from '../../context/StoreContext'

export const HeroBanner: React.FC = () => {
  const { settings } = useStore()
  const { hero } = settings

  return (
    <section className="relative bg-levix-charcoal text-white overflow-hidden">
      {/* Background Editorial Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={hero.imageUrl}
          alt="LEVIX Autumn/Winter Collection"
          className="w-full h-full object-cover object-center brightness-75 scale-100 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
      </div>

      <div className="relative z-10 container-levix py-24 sm:py-32 md:py-40 flex flex-col justify-center min-h-[520px] sm:min-h-[600px]">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-xs border border-white/20 text-xs font-semibold tracking-widest uppercase text-levix-orange">
            <span>Autumn / Winter Lookbook 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight uppercase">
            {hero.headline}
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-gray-200 max-w-xl font-normal leading-relaxed">
            {hero.subheadline}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              to={hero.primaryButtonLink}
              className="btn-primary text-xs uppercase tracking-wider py-4 px-8 inline-flex items-center justify-center gap-2 shadow-lg"
            >
              <span>{hero.primaryButtonText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {hero.secondaryButtonText && (
              <Link
                to={hero.secondaryButtonLink || '/shop'}
                className="btn-secondary bg-white/90 hover:bg-white text-levix-charcoal text-xs uppercase tracking-wider py-4 px-8 inline-flex items-center justify-center border-none shadow-md"
              >
                {hero.secondaryButtonText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
