import React, { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, PackageOpen, Plus } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { useAuth } from '../context/AuthContext'
import { ProductCard } from '../components/storefront/ProductCard'
import { SEO } from '../components/common/SEO'

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const { categories, products } = useStore()
  const { isAdmin } = useAuth()

  const currentCategory = categories.find((c) => c.slug === slug)

  const categoryProducts = useMemo(() => {
    if (!currentCategory) return []
    return products.filter((p) => p.categoryId === currentCategory.id && p.isPublished)
  }, [currentCategory, products])

  if (!currentCategory) {
    return (
      <div className="container-levix py-24 text-center">
        <h2 className="text-2xl font-bold text-levix-charcoal uppercase">Category Not Found</h2>
        <p className="text-xs text-levix-secondary mt-2 mb-6">
          The requested collection does not exist or has been relocated.
        </p>
        <Link to="/shop" className="btn-primary text-xs uppercase tracking-wider">
          Explore All Products
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen py-10 sm:py-14">
      <SEO
        title={currentCategory.name}
        description={currentCategory.description}
        image={currentCategory.imageUrl}
      />

      <div className="container-levix">
        {/* Back Link */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs text-levix-secondary hover:text-levix-orange transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Products</span>
        </Link>

        {/* Category Header Banner */}
        <div className="relative mb-12 border border-levix-border overflow-hidden bg-levix-charcoal text-white">
          <div className="absolute inset-0">
            <img
              src={currentCategory.imageUrl}
              alt={currentCategory.name}
              className="w-full h-full object-cover brightness-50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          </div>

          <div className="relative z-10 p-8 sm:p-14 max-w-xl">
            <p className="text-xs font-bold uppercase tracking-widest text-levix-orange mb-2">
              Collection Overview
            </p>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              {currentCategory.name}
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 mt-3 leading-relaxed">
              {currentCategory.description}
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {categoryProducts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-levix-border p-8 bg-white space-y-4">
            <PackageOpen className="w-12 h-12 text-levix-secondary mx-auto mb-2 stroke-1" />
            <div>
              <h3 className="text-base font-bold text-levix-charcoal uppercase tracking-wider">
                No products found in this category
              </h3>
              <p className="text-xs text-levix-secondary mt-1 max-w-sm mx-auto">
                {isAdmin
                  ? `You are logged in as admin. You can add the first product to ${currentCategory.name} right now.`
                  : 'Check back soon for new seasonal additions.'}
              </p>
            </div>
            {isAdmin ? (
              <div className="pt-2">
                <Link
                  to="/admin/products"
                  className="btn-primary text-xs uppercase tracking-wider inline-flex items-center gap-2 px-5 py-3 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Product to {currentCategory.name}</span>
                </Link>
              </div>
            ) : (
              <Link to="/shop" className="btn-primary text-xs uppercase tracking-wider">
                Browse All Products
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
