import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, Sparkles } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { HeroBanner } from '../components/storefront/HeroBanner'
import { CategoryGrid } from '../components/storefront/CategoryGrid'
import { ProductCard } from '../components/storefront/ProductCard'
import { SEO } from '../components/common/SEO'

export const Home: React.FC = () => {
  const { products, loading } = useStore()

  const featuredProducts = products.filter((p) => p.isPublished && p.isFeatured).slice(0, 4)
  const newArrivals = products.filter((p) => p.isPublished && p.isNewArrival).slice(0, 4)

  return (
    <div className="flex flex-col min-h-screen">
      <SEO
        title="Contemporary Lifestyle & Apparel"
        description="Discover LEVIX — Minimal, premium, contemporary apparel and lifestyle essentials. Heavyweight natural textiles tailored with architectural precision."
      />

      {/* Hero Section */}
      <HeroBanner />

      {/* Categories Grid */}
      <CategoryGrid />

      {/* Featured Products Section */}
      <section className="py-16 sm:py-20 bg-levix-gray/40 border-y border-levix-border">
        <div className="container-levix">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-levix-border">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-levix-orange mb-1">
                Seasonal Highlights
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-levix-charcoal uppercase">
                Featured Pieces
              </h2>
            </div>
            <Link
              to="/shop?sort=featured"
              className="group hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-levix-charcoal hover:text-levix-orange transition-colors"
            >
              <span>View All Featured</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="aspect-[3/4] bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              to="/shop?sort=featured"
              className="btn-secondary w-full py-3 text-xs uppercase tracking-wider"
            >
              View All Featured Pieces
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial Brand Story Section */}
      <section className="py-20 sm:py-28 bg-white overflow-hidden">
        <div className="container-levix">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 relative">
              <div className="aspect-[4/5] bg-levix-gray border border-levix-border overflow-hidden shadow-subtle">
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"
                  alt="LEVIX Studio Tailoring Process"
                  loading="lazy"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 hidden sm:flex bg-levix-charcoal text-white p-6 max-w-xs shadow-xl border border-white/10 flex-col">
                <Sparkles className="w-5 h-5 text-levix-orange mb-2" />
                <span className="text-xs uppercase tracking-widest font-semibold text-levix-orange">
                  Zero Compromise
                </span>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  Every cut is tested over 100+ wear cycles for drape and fiber longevity.
                </p>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-levix-soft-orange text-levix-orange text-xs font-bold tracking-widest uppercase">
                <span>The LEVIX Ethos</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-levix-charcoal uppercase leading-tight">
                Architectural Form.<br />Uncompromising Materiality.
              </h2>
              <p className="text-sm sm:text-base text-levix-secondary leading-relaxed">
                Founded on the premise that everyday apparel should embody the restraint and permanence of modern architecture. We bypass seasonal trend cycles to focus exclusively on heavyweight natural fibers, sanforized weaves, and precision-engineered silhouettes.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-levix-border">
                <div>
                  <h4 className="text-2xl font-black text-levix-charcoal">380+</h4>
                  <p className="text-xs text-levix-secondary uppercase tracking-wider mt-0.5">
                    GSM Custom Textiles
                  </p>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-levix-charcoal">100%</h4>
                  <p className="text-xs text-levix-secondary uppercase tracking-wider mt-0.5">
                    Sanforized Pure Cotton
                  </p>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  to="/shop"
                  className="btn-primary text-xs uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <span>Explore The Studio Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section className="py-16 sm:py-20 bg-levix-gray/30 border-t border-levix-border">
          <div className="container-levix">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-levix-border">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-levix-orange mb-1">
                  Just In
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-levix-charcoal uppercase">
                  New Arrivals
                </h2>
              </div>
              <Link
                to="/shop?sort=newest"
                className="group hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-levix-charcoal hover:text-levix-orange transition-colors"
              >
                <span>View All New Releases</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Genuine Client Reviews */}
      <section className="py-16 sm:py-20 bg-white border-t border-levix-border">
        <div className="container-levix">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-levix-orange mb-1">
              Verified Client Feedback
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-levix-charcoal uppercase">
              The Standard of Fit
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-levix-gray/50 border border-levix-border flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-levix-orange mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-levix-orange text-levix-orange" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-levix-charcoal leading-relaxed font-normal">
                  &ldquo;The 480 GSM French Terry Hoodie has the most substantial structure of any garment in my rotation. Zero shrinkage after three cold washes. Exactly what luxury loungewear should be.&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-levix-border flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-levix-charcoal">Arjun K.</h4>
                  <p className="text-[10px] text-levix-secondary">Verified Buyer • Mumbai</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-white border border-levix-border text-emerald-700 font-semibold">
                  Verified Purchase
                </span>
              </div>
            </div>

            <div className="p-6 bg-levix-gray/50 border border-levix-border flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-levix-orange mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-levix-orange text-levix-orange" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-levix-charcoal leading-relaxed font-normal">
                  &ldquo;The Arc Trench Coat drape is exceptional. Crisp Japanese cotton that repels sudden downpours effortlessly. Fast 48-hour delivery to Bangalore. Impeccable packaging.&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-levix-border flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-levix-charcoal">Sneha V.</h4>
                  <p className="text-[10px] text-levix-secondary">Verified Buyer • Bengaluru</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-white border border-levix-border text-emerald-700 font-semibold">
                  Verified Purchase
                </span>
              </div>
            </div>

            <div className="p-6 bg-levix-gray/50 border border-levix-border flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-levix-orange mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-levix-orange text-levix-orange" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-levix-charcoal leading-relaxed font-normal">
                  &ldquo;The Italian calfskin court trainers feel broken-in immediately. Clean lines with zero loud logos. Razorpay checkout took 10 seconds. LEVIX sets a high bar.&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-levix-border flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-levix-charcoal">Rohan M.</h4>
                  <p className="text-[10px] text-levix-secondary">Verified Buyer • New Delhi</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-white border border-levix-border text-emerald-700 font-semibold">
                  Verified Purchase
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
