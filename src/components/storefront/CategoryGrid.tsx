import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useStore } from '../../context/StoreContext'

export const CategoryGrid: React.FC = () => {
  const { categories, products, settings } = useStore()
  const pageBg = settings?.productCardBgColor || '#f0f0f0'
  const publishedCategories = categories.filter((c) => c.isPublished)

  const getProductCount = (category: typeof categories[0]) => {
    return products.filter((p) => {
      if (!p.isPublished) return false
      if (p.categoryId === category.id || p.categoryId === category.slug) return true
      if (p.categoryName?.trim().toLowerCase() === category.name.trim().toLowerCase()) return true
      if (category.slug === 't-shirts') {
        const cat = (p.categoryId || '').toLowerCase()
        const name = (p.name || '').toLowerCase()
        if (
          cat.includes('t-shirt') ||
          cat.includes('tee') ||
          name.includes('t-shirt') ||
          name.includes('tee') ||
          name.includes('tshirt')
        ) {
          return true
        }
      }
      return false
    }).length
  }

  return (
    <section style={{ backgroundColor: pageBg }} className="py-16 sm:py-20 transition-colors duration-300">
      <div className="container-levix">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-levix-border">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-levix-orange mb-1">
              Curated Collections
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-levix-charcoal uppercase">
              Shop by Collection
            </h2>
          </div>
          <Link
            to="/shop"
            className="group hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-levix-charcoal hover:text-levix-orange transition-colors"
          >
            <span>View All Collections</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {publishedCategories.map((category) => (
            <Link
              key={category.id}
              to={`/collection/${category.slug}`}
              className="group relative flex flex-col bg-levix-gray border border-levix-border overflow-hidden"
            >
              <div className="aspect-[4/5] overflow-hidden bg-levix-gray">
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              </div>

              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="text-[10px] uppercase tracking-widest text-levix-orange font-semibold">
                  {getProductCount(category)} Products
                </p>
                <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white mt-0.5 group-hover:text-levix-soft-orange transition-colors">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/shop"
            className="btn-secondary w-full py-3 text-xs uppercase tracking-wider"
          >
            Explore All Collections
          </Link>
        </div>
      </div>
    </section>
  )
}
