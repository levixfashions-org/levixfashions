import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Plus, Camera, ShieldCheck } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { useAuth } from '../context/AuthContext'
import { HeroBanner } from '../components/storefront/HeroBanner'
import { CategoryGrid } from '../components/storefront/CategoryGrid'
import { ProductCard } from '../components/storefront/ProductCard'
import { SEO } from '../components/common/SEO'

export const Home: React.FC = () => {
  const { products, loading } = useStore()
  const { isAdmin } = useAuth()

  const publishedProducts = products.filter((p) => p.isPublished)
  const explicitlyFeatured = publishedProducts.filter((p) => p.isFeatured)
  const featuredProducts = explicitlyFeatured.length > 0 ? explicitlyFeatured.slice(0, 8) : publishedProducts.slice(0, 8)

  const explicitlyNew = publishedProducts.filter((p) => p.isNewArrival)
  const newArrivals = explicitlyNew.length > 0 ? explicitlyNew.slice(0, 8) : publishedProducts.slice(0, 8)

  return (
    <div className="flex flex-col min-h-screen">
      <SEO
        title="Contemporary Lifestyle & Apparel"
        description="Discover LEVIX — Minimal, premium, contemporary apparel and lifestyle essentials. Heavyweight natural textiles tailored with architectural precision."
      />

      {/* Admin Quick Control Banner for Owner */}
      {isAdmin && (
        <div className="bg-levix-charcoal text-white border-b-2 border-levix-orange py-2.5 px-4 shadow-sm">
          <div className="container-levix flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold uppercase tracking-wider text-levix-orange flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Store Owner Controls</span>
              </span>
              <span className="text-neutral-400 hidden sm:inline">• levixfashions@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/admin/products"
                className="btn-primary py-1 px-3 text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add / Manage Products</span>
              </Link>
              <Link
                to="/admin"
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider transition-colors border border-white/20"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}

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
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : isAdmin ? (
            <div className="py-14 text-center border-2 border-dashed border-levix-orange/60 bg-levix-soft-orange/20 p-8 max-w-xl mx-auto space-y-4 shadow-sm">
              <div className="w-12 h-12 bg-levix-orange text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-levix-orange mb-1">
                  Administrator Quick Action
                </p>
                <h3 className="text-base sm:text-lg font-bold text-levix-charcoal uppercase tracking-wider">
                  Ready to add your first product?
                </h3>
                <p className="text-xs text-levix-secondary mt-1 max-w-sm mx-auto">
                  Take photos with your phone camera or upload from gallery. Add sizes, colors, and prices to go live.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/admin/products"
                  className="btn-primary inline-flex items-center gap-2 text-xs uppercase tracking-wider px-6 py-3 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create Product Now (Camera / Gallery)</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-14 text-center border border-dashed border-levix-border bg-white p-6 max-w-xl mx-auto">
              <p className="text-xs uppercase tracking-widest font-bold text-levix-orange mb-1">
                Studio Archive
              </p>
              <h3 className="text-base font-bold text-levix-charcoal uppercase tracking-wider">
                New Seasonal Run Curating Soon
              </h3>
              <p className="text-xs text-levix-secondary mt-1 max-w-sm mx-auto">
                Explore our silhouette collections above while new garments and accessories are being prepared.
              </p>
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
    </div>
  )
}

export default Home
