import React, { useState } from 'react'
import { Plus, Edit2, X } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import type { Category } from '../../types/product'

export const AdminCategories: React.FC = () => {
  const { categories, products, addCategoryOrUpdate } = useStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [displayOrder, setDisplayOrder] = useState<number>(1)
  const [isPublished, setIsPublished] = useState(true)
  const [isFeatured, setIsFeatured] = useState(true)

  const handleOpenAdd = () => {
    setEditingCat(null)
    setName('')
    setSlug('')
    setDescription('')
    setImageUrl('https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80')
    setDisplayOrder(categories.length + 1)
    setIsPublished(true)
    setIsFeatured(true)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (c: Category) => {
    setEditingCat(c)
    setName(c.name)
    setSlug(c.slug)
    setDescription(c.description)
    setImageUrl(c.imageUrl)
    setDisplayOrder(c.displayOrder)
    setIsPublished(c.isPublished)
    setIsFeatured(c.isFeatured)
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const categoryObj: Category = {
      id: editingCat?.id || `cat-${Date.now()}`,
      name: name.trim(),
      slug: slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      displayOrder: Number(displayOrder) || 1,
      isPublished,
      isFeatured,
    }

    await addCategoryOrUpdate(categoryObj)
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-levix-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-levix-orange mb-1">
            Collections Architecture
          </p>
          <h1 className="text-2xl font-black uppercase tracking-tight text-levix-charcoal">
            Collection Management
          </h1>
          <p className="text-xs text-levix-secondary mt-0.5">
            Organize departments, banners, and homepage feature order.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn-primary py-2.5 px-4 text-xs uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const productCount = products.filter((p) => p.categoryId === cat.id).length
          return (
            <div
              key={cat.id}
              className="bg-white border border-levix-border p-5 flex flex-col justify-between shadow-subtle space-y-4"
            >
              <div>
                <div className="relative aspect-[16/9] bg-levix-gray overflow-hidden mb-3 border border-levix-border">
                  <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-mono">
                    Order: {cat.displayOrder}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
                    {cat.name}
                  </h3>
                  <span className="text-xs font-semibold text-levix-orange">
                    {productCount} Products
                  </span>
                </div>
                <p className="text-xs text-levix-secondary mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-levix-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                      cat.isPublished
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-levix-gray text-levix-secondary border-levix-border'
                    }`}
                  >
                    {cat.isPublished ? 'Visible' : 'Hidden'}
                  </span>
                  {cat.isFeatured && (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-levix-soft-orange text-levix-orange border border-levix-orange/30">
                      Featured
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(cat)}
                  className="btn-secondary py-1 px-3 text-xs uppercase inline-flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Category Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full border border-levix-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-levix-border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
                {editingCat ? 'Edit Collection' : 'Create Collection'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-levix-secondary hover:text-levix-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="form-label">Collection Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Minimal Essentials"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">URL Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="essentials"
                  className="form-input font-mono"
                />
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Banner Image URL *</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                  className="form-input font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="form-label">Display Order Sequence (1, 2, 3...)</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 text-levix-orange accent-levix-orange"
                  />
                  <span className="font-semibold text-levix-charcoal">Published</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-levix-orange accent-levix-orange"
                  />
                  <span className="font-semibold text-levix-charcoal">Feature on Homepage</span>
                </label>
              </div>

              <div className="pt-4 border-t border-levix-border flex gap-2">
                <button
                  type="submit"
                  className="flex-1 btn-primary py-2.5 text-xs uppercase tracking-wider"
                >
                  Save Collection
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary py-2.5 px-4 text-xs uppercase"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
