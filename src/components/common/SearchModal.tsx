import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight, Package } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { formatPrice } from '../../lib/utils'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { products, categories } = useStore()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      setQuery('')
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const trimmed = query.trim().toLowerCase()

  const matchingProducts = trimmed
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(trimmed) ||
            p.sku.toLowerCase().includes(trimmed) ||
            p.categoryName.toLowerCase().includes(trimmed) ||
            p.description.toLowerCase().includes(trimmed)
        )
        .slice(0, 6)
    : []

  const matchingCategories = trimmed
    ? categories.filter((c) => c.name.toLowerCase().includes(trimmed))
    : []

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!trimmed) return
    onClose()
    navigate(`/shop?search=${encodeURIComponent(trimmed)}`)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative min-h-screen px-4 py-8 sm:py-16 flex flex-col items-center">
        <div className="relative w-full max-w-2xl bg-white shadow-2xl border border-levix-border">
          {/* Search Header */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b border-levix-border">
            <Search className="w-5 h-5 text-levix-secondary ml-5 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products by name, SKU, or collection..."
              className="w-full py-4.5 pl-3 pr-12 text-sm sm:text-base text-levix-charcoal placeholder-levix-secondary focus:outline-none"
              aria-label="Search products"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-2 text-levix-secondary hover:text-levix-charcoal mr-2"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-4.5 border-l border-levix-border text-xs uppercase font-semibold text-levix-secondary hover:text-levix-charcoal transition-colors"
            >
              Esc
            </button>
          </form>

          {/* Search Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {query.trim().length === 0 ? (
              <div className="py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-levix-secondary mb-3">
                  Popular Collections
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/collection/${cat.slug}`}
                      onClick={onClose}
                      className="px-3 py-1.5 bg-levix-gray hover:bg-neutral-100 hover:text-black text-xs text-levix-charcoal transition-colors border border-transparent hover:border-neutral-300"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>

                <p className="text-xs font-semibold uppercase tracking-wider text-levix-secondary mb-3">
                  Quick Suggestions
                </p>
                <div className="space-y-1">
                  {products.slice(0, 3).map((p) => (
                    <Link
                      key={p.id}
                      to={`/product/${p.slug}`}
                      onClick={onClose}
                      className="flex items-center justify-between p-2 hover:bg-levix-gray transition-colors group"
                    >
                      <span className="text-sm text-levix-charcoal group-hover:text-black">
                        {p.name}
                      </span>
                      <ArrowRight className="w-4 h-4 text-levix-secondary group-hover:text-black group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            ) : matchingProducts.length === 0 && matchingCategories.length === 0 ? (
              <div className="text-center py-10">
                <Package className="w-10 h-10 text-levix-secondary mx-auto mb-3 stroke-1" />
                <p className="text-sm font-medium text-levix-charcoal">No results found for &ldquo;{query}&rdquo;</p>
                <p className="text-xs text-levix-secondary mt-1">
                  Check your spelling or try searching for a collection like Outerwear or Essentials.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {matchingCategories.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-levix-secondary mb-2">
                      Matching Collections
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {matchingCategories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/collection/${cat.slug}`}
                          onClick={onClose}
                          className="px-3 py-1.5 bg-black/5 text-black text-xs font-medium border border-black/10"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {matchingProducts.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-levix-secondary">
                        Products ({matchingProducts.length})
                      </p>
                      <button
                        onClick={handleSearchSubmit}
                        className="text-xs font-semibold text-black hover:underline inline-flex items-center gap-1"
                      >
                        View all results <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="divide-y divide-levix-border">
                      {matchingProducts.map((p) => (
                        <Link
                          key={p.id}
                          to={`/product/${p.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-4 py-3 hover:bg-levix-gray/60 px-2 transition-colors group"
                        >
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-12 h-14 object-cover border border-levix-border bg-levix-gray"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-levix-secondary">{p.categoryName} • SKU: {p.sku}</p>
                            <h4 className="text-sm font-medium text-levix-charcoal group-hover:text-black truncate">
                              {p.name}
                            </h4>
                            <p className="text-xs font-semibold text-levix-charcoal mt-0.5">
                              {formatPrice(p.salePrice || p.price)}
                              {p.salePrice && (
                                <span className="line-through text-levix-secondary font-normal ml-2">
                                  {formatPrice(p.price)}
                                </span>
                              )}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-levix-secondary group-hover:text-black group-hover:translate-x-1 transition-transform" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
