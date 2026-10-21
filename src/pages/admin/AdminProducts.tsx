import React, { useState, useRef, useMemo } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Star,
  Camera,
  Image as ImageIcon,
  Upload,
  Loader2,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { formatPrice, paiseToRupees, rupeesToPaise, normalizeColorImages } from '../../lib/utils'
import type { Product, ProductVariant } from '../../types/product'
import { compressAndProcessImage, processMultipleImages } from '../../lib/imageUpload'

export const DEFAULT_PRODUCT_BULLETS = [
  '• 100% Premium Heavyweight Combed Cotton (240+ GSM)',
  '• Architectural relaxed boxy fit with dropped shoulders',
  '• High-density reinforced ribbed crewneck collar resists stretching',
  '• Pre-shrunk & bio-washed fabric for an ultra-soft luxury hand feel',
  '• Breathable, moisture-wicking all-day comfort for all seasons',
  '• Precision double-needle tonal edge stitching on cuffs and hem',
  '• Designed and crafted for minimalist daily luxury streetwear',
  '• Machine wash cold inside out, gentle cycle, dry flat',
].join('\n')

export const AdminProducts: React.FC = () => {
  const { products, categories, addProductOrUpdate, removeProduct } = useStore()
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('all')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null)

  // Form Fields
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [sku, setSku] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [imagesText, setImagesText] = useState('')
  const [priceRupees, setPriceRupees] = useState<number>(1999)
  const [salePriceRupees, setSalePriceRupees] = useState<number | ''>('')
  const [stock, setStock] = useState<number>(20)
  const [isPublished, setIsPublished] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [isNewArrival, setIsNewArrival] = useState(false)
  const [isBestseller, setIsBestseller] = useState(false)
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  // Camera & Gallery Upload States & Refs
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [showUrlTextarea, setShowUrlTextarea] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  // Variants State (Multiple Colors & Sizes)
  const [hasVariants, setHasVariants] = useState(false)
  const [variantsList, setVariantsList] = useState<ProductVariant[]>([])
  const [quickColors, setQuickColors] = useState('')
  const [quickSizes, setQuickSizes] = useState('S, M, L, XL')
  const [defaultVariantStock, setDefaultVariantStock] = useState(10)
  const [colorImagesMap, setColorImagesMap] = useState<Record<string, { front: string; back: string }>>({})
  const [uploadingColorSide, setUploadingColorSide] = useState<string | null>(null)

  // Memoized Filtered Products
  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim()
    return products.filter((p) => {
      const matchesSearch =
        !s ||
        p.name.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s)
      const matchesCat = selectedCat === 'all' || p.categoryId === selectedCat
      return matchesSearch && matchesCat
    })
  }, [products, search, selectedCat])

  const handleOpenAdd = () => {
    setEditingProduct(null)
    setName('')
    setSlug('')
    setDescription(DEFAULT_PRODUCT_BULLETS)
    setShortDescription('100% Premium Heavyweight Combed Cotton (240+ GSM)')
    setSku(`LVX-${Date.now().toString().slice(-4)}`)
    const tShirtCat = categories.find((c) => c.slug === 't-shirts') || categories[0]
    setCategoryId(tShirtCat?.id || '')
    setImagesText('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80')
    setPriceRupees(2499)
    setSalePriceRupees('')
    setStock(25)
    setHasVariants(false)
    setVariantsList([])
    setQuickColors('')
    setQuickSizes('S, M, L, XL')
    setDefaultVariantStock(10)
    setColorImagesMap({})
    setIsPublished(true)
    setIsFeatured(true)
    setIsNewArrival(true)
    setIsBestseller(false)
    setSeoTitle('')
    setSeoDescription('')
    setShowUrlTextarea(false)
    setIsUploadingImage(false)
    setUploadingColorSide(null)
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p)
    setName(p.name)
    setSlug(p.slug)
    setDescription(p.description)
    setShortDescription(p.shortDescription || '')
    setSku(p.sku)
    setCategoryId(p.categoryId)
    setImagesText(p.images.join('\n'))
    setPriceRupees(paiseToRupees(p.price))
    setSalePriceRupees(p.salePrice ? paiseToRupees(p.salePrice) : '')
    setStock(p.stock)
    setHasVariants(Boolean(p.hasVariants && p.variants && p.variants.length > 0))
    setVariantsList(p.variants || [])
    setQuickColors('')
    setQuickSizes('S, M, L, XL')
    setDefaultVariantStock(10)

    // Load existing color image mappings (supports both legacy single URL and modern front/back)
    const initialColorMap: Record<string, { front: string; back: string }> = {}
    if (p.colorImages) {
      Object.entries(p.colorImages).forEach(([color, data]) => {
        initialColorMap[color] = normalizeColorImages(data)
      })
    }
    if (p.variants) {
      p.variants.forEach((v) => {
        if (v.color && v.imageUrl) {
          if (!initialColorMap[v.color]) {
            initialColorMap[v.color] = { front: v.imageUrl, back: '' }
          } else if (!initialColorMap[v.color].front) {
            initialColorMap[v.color].front = v.imageUrl
          }
        }
      })
    }
    setColorImagesMap(initialColorMap)

    setIsPublished(p.isPublished)
    setIsFeatured(p.isFeatured)
    setIsNewArrival(Boolean(p.isNewArrival))
    setIsBestseller(Boolean(p.isBestseller))
    setSeoTitle(p.seoTitle || '')
    setSeoDescription(p.seoDescription || '')
    setShowUrlTextarea(false)
    setIsUploadingImage(false)
    setUploadingColorSide(null)
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleGenerateVariants = () => {
    const colors = quickColors
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
    const sizes = quickSizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    if (colors.length === 0 && sizes.length === 0) {
      setFormError('Please enter at least one color or size name to auto-generate variants.')
      return
    }

    const generated: ProductVariant[] = []
    const baseSku = sku.trim() || 'LVX-PR'

    if (colors.length > 0 && sizes.length > 0) {
      colors.forEach((color) => {
        sizes.forEach((size) => {
          const colorCode = color.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase()
          generated.push({
            id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: `${color} / ${size}`,
            color,
            size,
            sku: `${baseSku}-${colorCode}-${size}`,
            stock: Number(defaultVariantStock) || 10,
          })
        })
      })
    } else if (colors.length > 0) {
      colors.forEach((color) => {
        const colorCode = color.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase()
        generated.push({
          id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: color,
          color,
          sku: `${baseSku}-${colorCode}`,
          stock: Number(defaultVariantStock) || 10,
        })
      })
    } else {
      sizes.forEach((size) => {
        generated.push({
          id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: size,
          size,
          sku: `${baseSku}-${size}`,
          stock: Number(defaultVariantStock) || 10,
        })
      })
    }

    setVariantsList(generated)
    setHasVariants(true)
    const totalStock = generated.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
    setStock(totalStock)
    setFormError(null)
  }

  const handleAddManualVariant = () => {
    const newVariant: ProductVariant = {
      id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: 'Black / M',
      color: 'Black',
      size: 'M',
      sku: `${sku || 'LVX'}-BLK-M`,
      stock: 10,
    }
    const updated = [...variantsList, newVariant]
    setVariantsList(updated)
    setHasVariants(true)
    setStock(updated.reduce((acc, v) => acc + (Number(v.stock) || 0), 0))
  }

  const handleUpdateVariantField = (index: number, field: keyof ProductVariant, val: any) => {
    const updated = [...variantsList]
    const item = { ...updated[index], [field]: val }
    if (field === 'color' || field === 'size') {
      const c = field === 'color' ? val : item.color
      const s = field === 'size' ? val : item.size
      if (c && s) item.name = `${c} / ${s}`
      else if (c) item.name = c
      else if (s) item.name = s
    }
    updated[index] = item
    setVariantsList(updated)
    if (field === 'stock') {
      setStock(updated.reduce((acc, v) => acc + (Number(v.stock) || 0), 0))
    }
  }

  const handleRemoveVariant = (index: number) => {
    const updated = variantsList.filter((_, i) => i !== index)
    setVariantsList(updated)
    if (updated.length === 0) {
      setHasVariants(false)
    } else {
      setStock(updated.reduce((acc, v) => acc + (Number(v.stock) || 0), 0))
    }
  }

  const handleProductFilesAdded = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setIsUploadingImage(true)
    setFormError(null)
    try {
      const compressedUrls = await processMultipleImages(files)
      if (compressedUrls.length > 0) {
        const currentUrls = imagesText
          .split('\n')
          .map((u) => u.trim())
          .filter(Boolean)
        const updated = [...currentUrls, ...compressedUrls]
        setImagesText(updated.join('\n'))
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to process images. Please try again.')
    } finally {
      setIsUploadingImage(false)
      if (cameraInputRef.current) cameraInputRef.current.value = ''
      if (galleryInputRef.current) galleryInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProductFilesAdded(e.dataTransfer.files)
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    const urls = imagesText.split('\n').map((u) => u.trim()).filter(Boolean)
    const updated = urls.filter((_, i) => i !== indexToRemove)
    setImagesText(updated.join('\n'))
  }

  const handleSetMainCover = (indexToPromote: number) => {
    const urls = imagesText.split('\n').map((u) => u.trim()).filter(Boolean)
    if (indexToPromote <= 0 || indexToPromote >= urls.length) return
    const promoted = urls[indexToPromote]
    const remaining = urls.filter((_, i) => i !== indexToPromote)
    setImagesText([promoted, ...remaining].join('\n'))
  }

  const handleColorImageUploaded = async (color: string, side: 'front' | 'back', file: File | null) => {
    if (!file) return
    const uploadKey = `${color}-${side}`
    setUploadingColorSide(uploadKey)
    try {
      const compressed = await compressAndProcessImage(file)
      setColorImagesMap((prev) => {
        const current = prev[color] || { front: '', back: '' }
        return {
          ...prev,
          [color]: {
            ...current,
            [side]: compressed,
          },
        }
      })
      // Also add to general images if not present
      const currentUrls = imagesText.split('\n').map((u) => u.trim()).filter(Boolean)
      if (!currentUrls.includes(compressed)) {
        setImagesText([...currentUrls, compressed].join('\n'))
      }
    } catch (err: any) {
      setFormError(err.message || `Failed to process ${side} image for ${color}`)
    } finally {
      setUploadingColorSide(null)
    }
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setFormError('Please enter a product title.')
      return
    }

    let imagesArray = imagesText
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0)

    // Add any unique color images (both front and back) to imagesArray if not already present
    const extraColorImages: string[] = []
    Object.values(colorImagesMap).forEach(({ front, back }) => {
      if (front && front.trim() && !imagesArray.includes(front.trim())) extraColorImages.push(front.trim())
      if (back && back.trim() && !imagesArray.includes(back.trim())) extraColorImages.push(back.trim())
    })
    let mergedImages = [...imagesArray, ...extraColorImages]

    if (mergedImages.length === 0) {
      mergedImages = ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80']
    }

    const resolvedCategoryId = categoryId || categories[0]?.id || 'cat-essentials'
    const categoryObj = categories.find((c) => c.id === resolvedCategoryId)

    const totalStock =
      hasVariants && variantsList.length > 0
        ? variantsList.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
        : Number(stock) || 10

    // Ensure all variants receive their color image if available and have no undefined fields
    const finalVariants = variantsList.map((v) => ({
      id: v.id,
      name: v.name || `${v.color || ''} / ${v.size || ''}`.trim() || 'Standard',
      color: v.color || '',
      size: v.size || '',
      sku: v.sku || `${sku || 'LVX'}-${v.size || 'M'}`,
      stock: Number(v.stock) || 0,
      imageUrl: v.imageUrl || (v.color ? colorImagesMap[v.color]?.front : '') || mergedImages[0] || '',
    }))

    const finalDescription = description.trim() || DEFAULT_PRODUCT_BULLETS
    const firstBullet = finalDescription.split('\n')[0]?.replace(/^[•\-\*\s]+/, '') || ''
    const finalShortDescription = shortDescription.trim() || firstBullet || finalDescription.slice(0, 120)
    const finalSku = sku.trim() || `LVX-${Date.now().toString().slice(-4)}`
    const finalPrice = rupeesToPaise(Number(priceRupees) || 1999)

    const payload: Partial<Product> & { name: string } = {
      id: editingProduct?.id,
      name: trimmedName,
      slug: slug.trim() || trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: finalDescription,
      shortDescription: finalShortDescription,
      sku: finalSku,
      categoryId: resolvedCategoryId,
      categoryName: categoryObj?.name || 'Collection',
      images: mergedImages,
      colorImages: Object.keys(colorImagesMap).length > 0 ? colorImagesMap : {},
      price: finalPrice,
      salePrice: salePriceRupees !== '' && Number(salePriceRupees) > 0 ? rupeesToPaise(Number(salePriceRupees)) : null,
      stock: totalStock,
      hasVariants: Boolean(hasVariants && variantsList.length > 0),
      variants: hasVariants && finalVariants.length > 0 ? finalVariants : [],
      isPublished,
      isFeatured,
      isNewArrival,
      isBestseller,
      seoTitle: seoTitle.trim() || trimmedName,
      seoDescription: seoDescription.trim() || finalDescription.slice(0, 150),
    }

    try {
      setIsSaving(true)
      await addProductOrUpdate(payload)
      setIsModalOpen(false)
      setSaveSuccessMsg(`Product "${trimmedName}" was successfully saved and published!`)
      setTimeout(() => setSaveSuccessMsg(null), 5000)
    } catch (err: any) {
      console.error('Failed to save product:', err)
      setFormError(err?.message || 'Failed to save product. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTogglePublished = async (p: Product) => {
    await addProductOrUpdate({
      ...p,
      isPublished: !p.isPublished,
    })
  }

  const handleToggleFeatured = async (p: Product) => {
    await addProductOrUpdate({
      ...p,
      isFeatured: !p.isFeatured,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-levix-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-levix-orange mb-1">
            Catalogue Database
          </p>
          <h1 className="text-2xl font-black uppercase tracking-tight text-levix-charcoal">
            Product Management
          </h1>
          <p className="text-xs text-levix-secondary mt-0.5">
            Total of {products.length} garments & accessories listed.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn-primary py-2.5 px-4 text-xs uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Product</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {saveSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="form-input text-xs pl-9 py-2"
          />
          <Search className="w-4 h-4 text-levix-secondary absolute left-3 top-2.5" />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="form-input text-xs py-2 w-full sm:w-48 cursor-pointer"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Product Table */}
      <div className="bg-white border border-levix-border shadow-subtle overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-levix-border bg-levix-gray text-levix-secondary uppercase tracking-wider">
              <th className="py-3 px-4">Item</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">SKU</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Stock</th>
              <th className="py-3 px-4 text-center">Featured</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-levix-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-levix-secondary">
                  No matching products found.
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product.id} className="hover:bg-levix-gray/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-12 object-cover border border-levix-border bg-levix-gray shrink-0"
                      />
                      <div>
                        <span className="font-bold text-levix-charcoal line-clamp-1 block">
                          {product.name}
                        </span>
                        {product.hasVariants && (
                          <span className="text-[10px] text-levix-secondary">
                            {product.variants?.length} variants
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-levix-secondary">{product.categoryName}</td>
                  <td className="py-3 px-4 font-mono font-bold text-levix-charcoal">{product.sku}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-levix-charcoal">
                      {formatPrice(product.salePrice || product.price)}
                    </span>
                    {product.salePrice && (
                      <span className="text-[10px] text-levix-secondary line-through ml-1.5">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-semibold ${
                        product.stock <= 5 ? 'text-red-600 font-bold' : 'text-levix-charcoal'
                      }`}
                    >
                      {product.stock} units
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(product)}
                      className={`p-1 transition-colors ${
                        product.isFeatured ? 'text-levix-orange' : 'text-levix-secondary/40'
                      }`}
                      aria-label="Toggle featured"
                    >
                      <Star className={`w-4 h-4 ${product.isFeatured ? 'fill-levix-orange' : ''}`} />
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleTogglePublished(product)}
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                        product.isPublished
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-levix-gray text-levix-secondary border-levix-border'
                      }`}
                    >
                      {product.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(product)}
                        className="p-1.5 text-levix-secondary hover:text-levix-charcoal"
                        aria-label="Edit product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
                            removeProduct(product.id)
                          }
                        }}
                        className="p-1.5 text-levix-secondary hover:text-red-600"
                        aria-label="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`bg-white max-w-2xl w-full border shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto relative transition-colors ${
              isDragging ? 'border-2 border-levix-orange ring-4 ring-levix-orange/20' : 'border-levix-border'
            }`}
          >
            {/* Full-Modal Dragging Overlay */}
            {isDragging && (
              <div className="absolute inset-0 z-50 bg-levix-charcoal/90 backdrop-blur-xs flex flex-col items-center justify-center text-white border-4 border-dashed border-levix-orange pointer-events-none p-6 text-center animate-in fade-in duration-150">
                <Upload className="w-14 h-14 text-levix-orange mb-3 animate-bounce" />
                <h4 className="text-base font-black uppercase tracking-widest text-white">
                  Drop Product Photos Here
                </h4>
                <p className="text-xs text-neutral-300 mt-1 max-w-sm">
                  Release to instantly optimize, compress, and attach photos to this product
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pb-3 border-b border-levix-border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
                {editingProduct ? 'Edit Garment / Accessory' : 'Create New Product'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-levix-secondary hover:text-levix-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <p className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs">{formError}</p>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const val = e.target.value
                      setName(val)
                      if (!editingProduct) {
                        setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
                        const lower = val.toLowerCase()
                        if (lower.includes('tee') || lower.includes('t-shirt') || lower.includes('tshirt')) {
                          const match = categories.find((c) => c.slug === 't-shirts')
                          if (match) setCategoryId(match.id)
                        } else if (lower.includes('hoodie')) {
                          const match = categories.find((c) => c.slug === 'hoodies')
                          if (match) setCategoryId(match.id)
                        } else if (lower.includes('pant') || lower.includes('trouser') || lower.includes('cargo') || lower.includes('jeans')) {
                          const match = categories.find((c) => c.slug === 'pants')
                          if (match) setCategoryId(match.id)
                        } else if (lower.includes('jacket') || lower.includes('coat')) {
                          const match = categories.find((c) => c.slug === 'jackets')
                          if (match) setCategoryId(match.id)
                        } else if (lower.includes('shirt')) {
                          const match = categories.find((c) => c.slug === 'shirts')
                          if (match) setCategoryId(match.id)
                        }
                      }
                    }}
                    required
                    placeholder="e.g. Heavyweight Raw French Terry Hoodie"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">SKU (Inventory Identifier)</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Auto-generated if blank"
                    className="form-input font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="form-input cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">URL Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="auto-generated-from-name"
                    className="form-input font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="form-label mb-0">Full Editorial Description (7-8 Bullet Points)</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDescription(DEFAULT_PRODUCT_BULLETS)}
                      className="text-[11px] text-levix-orange hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      + Insert 8 Luxury Bullets
                    </button>
                    {description && !description.includes('•') && (
                      <button
                        type="button"
                        onClick={() => {
                          const lines = description
                            .split(/(?<=\.)\s+|\n+/)
                            .map((s) => s.trim())
                            .filter((s) => s.length > 3)
                          if (lines.length > 0) {
                            setDescription(lines.map((l) => (l.startsWith('•') ? l : `• ${l}`)).join('\n'))
                          }
                        }}
                        className="text-[11px] text-emerald-700 hover:underline font-bold cursor-pointer"
                      >
                        Convert to Bullets
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  placeholder={`• 100% Premium Heavyweight Combed Cotton (240+ GSM)\n• Architectural relaxed boxy fit with dropped shoulders\n• High-density reinforced ribbed crewneck collar resists stretching\n• Pre-shrunk & bio-washed fabric for an ultra-soft luxury hand feel\n• Breathable, moisture-wicking all-day comfort for all seasons\n• Precision double-needle tonal edge stitching on cuffs and hem\n• Designed and crafted for minimalist daily luxury streetwear\n• Machine wash cold inside out, gentle cycle, dry flat`}
                  className="form-input text-xs leading-relaxed font-sans"
                />
                <p className="text-[10px] text-levix-secondary mt-1">
                  💡 Tip: Enter each feature on a new line or with &quot;•&quot; (7 to 8 points). They render as distinct luxury highlight bullets on the customer storefront.
                </p>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-levix-gray border border-levix-border">
                <div>
                  <label className="form-label">Regular Price (₹ INR)</label>
                  <input
                    type="number"
                    min="0"
                    value={priceRupees}
                    onChange={(e) => setPriceRupees(Number(e.target.value))}
                    placeholder="1999"
                    className="form-input"
                  />
                  <p className="text-[10px] text-levix-secondary mt-1">
                    Saved as integer {rupeesToPaise(priceRupees || 0)} paise
                  </p>
                </div>

                <div>
                  <label className="form-label">Sale Price (₹ INR, Optional)</label>
                  <input
                    type="number"
                    min="0"
                    value={salePriceRupees}
                    onChange={(e) =>
                      setSalePriceRupees(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="Leave blank if none"
                    className="form-input"
                  />
                  <p className="text-[10px] text-levix-secondary mt-1">
                    {salePriceRupees ? `Saved as ${rupeesToPaise(Number(salePriceRupees))} paise` : 'None'}
                  </p>
                </div>

                <div>
                  <label className="form-label">Available Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    placeholder="10"
                    className="form-input"
                  />
                  {hasVariants && (
                    <p className="text-[10px] text-levix-orange font-semibold mt-1">
                      Auto-synced from {variantsList.length} variants
                    </p>
                  )}
                </div>
              </div>

              {/* Multiple Colors & Sizes (Variants) Section */}
              <div className="border border-levix-border bg-levix-gray/50 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasVariants}
                      onChange={(e) => {
                        const checked = e.target.checked
                        setHasVariants(checked)
                        if (checked && variantsList.length === 0) {
                          setQuickColors('Black, Vintage White')
                          setQuickSizes('S, M, L, XL')
                        }
                      }}
                      className="w-4 h-4 text-levix-orange accent-levix-orange"
                    />
                    <span className="font-bold text-xs uppercase tracking-wider text-levix-charcoal">
                      This Product Has Multiple Colors & Sizes (Variants)
                    </span>
                  </label>
                  {hasVariants && (
                    <span className="text-[11px] font-semibold text-levix-orange">
                      {variantsList.length} Variant(s) • Total Stock: {stock}
                    </span>
                  )}
                </div>

                {hasVariants && (
                  <div className="space-y-4 pt-2 border-t border-levix-border">
                    {/* Fast Combination Generator */}
                    <div className="bg-white p-3 border border-levix-border space-y-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-levix-secondary">
                        ⚡ Quick Color & Size Generator
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-levix-charcoal mb-1">
                            Colors (Comma-Separated)
                          </label>
                          <input
                            type="text"
                            value={quickColors}
                            onChange={(e) => setQuickColors(e.target.value)}
                            placeholder="e.g. Black, Vintage White, Olive"
                            className="form-input text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-levix-charcoal mb-1">
                            Sizes (Comma-Separated)
                          </label>
                          <input
                            type="text"
                            value={quickSizes}
                            onChange={(e) => setQuickSizes(e.target.value)}
                            placeholder="e.g. S, M, L, XL"
                            className="form-input text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-levix-charcoal mb-1">
                            Stock Per Variant
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min="0"
                              value={defaultVariantStock}
                              onChange={(e) => setDefaultVariantStock(Number(e.target.value))}
                              className="form-input text-xs w-20"
                            />
                            <button
                              type="button"
                              onClick={handleGenerateVariants}
                              className="btn-primary py-1.5 px-3 text-[11px] uppercase tracking-wider whitespace-nowrap"
                            >
                              Generate
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Color-Specific Photo Assignments (Front & Back Views) */}
                    {Array.from(new Set(variantsList.map((v) => v.color?.trim()).filter(Boolean))).length > 0 && (
                      <div className="bg-white p-3.5 border border-levix-border space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-levix-charcoal flex items-center gap-1.5">
                              <span>🎨 Assign Front & Back Photos for Each Color</span>
                            </p>
                            <span className="text-[10px] text-levix-secondary">
                              Add both Front and Back photos for every t-shirt color!
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-levix-orange font-bold">
                            2 Views / Color
                          </span>
                        </div>
                        <div className="space-y-3">
                          {Array.from(new Set(variantsList.map((v) => v.color?.trim()).filter(Boolean) as string[])).map((color) => {
                            const colorData = colorImagesMap[color] || { front: '', back: '' }

                            return (
                              <div
                                key={color}
                                className="bg-levix-gray/30 p-3 border border-levix-border space-y-2.5 transition-colors"
                              >
                                <div className="flex items-center justify-between border-b border-levix-border/40 pb-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-levix-orange" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-levix-charcoal">
                                      {color}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-levix-secondary font-mono">
                                    {colorData.front && colorData.back
                                      ? '✅ Front & Back Attached'
                                      : colorData.front
                                      ? '⚠️ Front Attached (Add Back)'
                                      : 'No Photos Attached'}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {/* FRONT VIEW */}
                                  <div
                                    onDragOver={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      const file = e.dataTransfer.files?.[0] || null
                                      if (file) handleColorImageUploaded(color, 'front', file)
                                    }}
                                    className="bg-white p-2.5 border border-levix-border flex flex-col gap-2"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-levix-orange">
                                        Front View (Main)
                                      </span>
                                      {colorData.front && (
                                        <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1 py-0.5 border border-emerald-200">
                                          Attached
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {/* Preview Thumbnail */}
                                      <div className="w-11 h-13 border border-levix-border overflow-hidden shrink-0 bg-levix-gray/50 flex items-center justify-center relative">
                                        {uploadingColorSide === `${color}-front` ? (
                                          <Loader2 className="w-4 h-4 animate-spin text-levix-orange" />
                                        ) : colorData.front ? (
                                          <img
                                            src={colorData.front}
                                            alt={`${color} front`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              ;(e.target as HTMLElement).style.display = 'none'
                                            }}
                                          />
                                        ) : (
                                          <span className="text-[8px] text-levix-secondary text-center leading-tight">
                                            Front
                                          </span>
                                        )}
                                      </div>

                                      {/* URL Input */}
                                      <input
                                        type="text"
                                        value={colorData.front || ''}
                                        onChange={(e) => {
                                          const url = e.target.value
                                          setColorImagesMap((prev) => ({
                                            ...prev,
                                            [color]: { ...prev[color], front: url },
                                          }))
                                        }}
                                        placeholder={`Front photo URL for ${color}...`}
                                        className="form-input text-xs flex-1 font-mono text-[10px] bg-white py-1.5"
                                      />
                                    </div>

                                    <div className="flex items-center justify-end gap-1.5">
                                      <input
                                        type="file"
                                        id={`cam-color-${color}-front`}
                                        accept="image/*"
                                        capture="environment"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0] || null
                                          handleColorImageUploaded(color, 'front', file)
                                          e.target.value = ''
                                        }}
                                      />
                                      <input
                                        type="file"
                                        id={`gal-color-${color}-front`}
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0] || null
                                          handleColorImageUploaded(color, 'front', file)
                                          e.target.value = ''
                                        }}
                                      />
                                      <label
                                        htmlFor={`cam-color-${color}-front`}
                                        className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 bg-levix-charcoal text-white hover:bg-black text-[9px] font-bold uppercase tracking-wider transition-colors"
                                        title={`Camera for ${color} front`}
                                      >
                                        <Camera className="w-2.5 h-2.5 text-levix-orange" />
                                        <span>Camera</span>
                                      </label>
                                      <label
                                        htmlFor={`gal-color-${color}-front`}
                                        className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 bg-white border border-levix-border hover:bg-levix-gray text-levix-charcoal text-[9px] font-bold uppercase tracking-wider transition-colors"
                                        title={`Gallery for ${color} front`}
                                      >
                                        <ImageIcon className="w-2.5 h-2.5 text-levix-charcoal" />
                                        <span>Gallery</span>
                                      </label>
                                      {colorData.front && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setColorImagesMap((prev) => ({
                                              ...prev,
                                              [color]: { ...prev[color], front: '' },
                                            }))
                                          }}
                                          className="p-1 text-levix-secondary hover:text-red-600 transition-colors"
                                          title="Clear front photo"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* BACK VIEW */}
                                  <div
                                    onDragOver={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      const file = e.dataTransfer.files?.[0] || null
                                      if (file) handleColorImageUploaded(color, 'back', file)
                                    }}
                                    className="bg-white p-2.5 border border-levix-border flex flex-col gap-2"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-levix-charcoal">
                                        Back View (Reverse)
                                      </span>
                                      {colorData.back && (
                                        <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1 py-0.5 border border-emerald-200">
                                          Attached
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {/* Preview Thumbnail */}
                                      <div className="w-11 h-13 border border-levix-border overflow-hidden shrink-0 bg-levix-gray/50 flex items-center justify-center relative">
                                        {uploadingColorSide === `${color}-back` ? (
                                          <Loader2 className="w-4 h-4 animate-spin text-levix-orange" />
                                        ) : colorData.back ? (
                                          <img
                                            src={colorData.back}
                                            alt={`${color} back`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              ;(e.target as HTMLElement).style.display = 'none'
                                            }}
                                          />
                                        ) : (
                                          <span className="text-[8px] text-levix-secondary text-center leading-tight">
                                            Back
                                          </span>
                                        )}
                                      </div>

                                      {/* URL Input */}
                                      <input
                                        type="text"
                                        value={colorData.back || ''}
                                        onChange={(e) => {
                                          const url = e.target.value
                                          setColorImagesMap((prev) => ({
                                            ...prev,
                                            [color]: { ...prev[color], back: url },
                                          }))
                                        }}
                                        placeholder={`Back photo URL for ${color}...`}
                                        className="form-input text-xs flex-1 font-mono text-[10px] bg-white py-1.5"
                                      />
                                    </div>

                                    <div className="flex items-center justify-end gap-1.5">
                                      <input
                                        type="file"
                                        id={`cam-color-${color}-back`}
                                        accept="image/*"
                                        capture="environment"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0] || null
                                          handleColorImageUploaded(color, 'back', file)
                                          e.target.value = ''
                                        }}
                                      />
                                      <input
                                        type="file"
                                        id={`gal-color-${color}-back`}
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0] || null
                                          handleColorImageUploaded(color, 'back', file)
                                          e.target.value = ''
                                        }}
                                      />
                                      <label
                                        htmlFor={`cam-color-${color}-back`}
                                        className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 bg-levix-charcoal text-white hover:bg-black text-[9px] font-bold uppercase tracking-wider transition-colors"
                                        title={`Camera for ${color} back`}
                                      >
                                        <Camera className="w-2.5 h-2.5 text-levix-orange" />
                                        <span>Camera</span>
                                      </label>
                                      <label
                                        htmlFor={`gal-color-${color}-back`}
                                        className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 bg-white border border-levix-border hover:bg-levix-gray text-levix-charcoal text-[9px] font-bold uppercase tracking-wider transition-colors"
                                        title={`Gallery for ${color} back`}
                                      >
                                        <ImageIcon className="w-2.5 h-2.5 text-levix-charcoal" />
                                        <span>Gallery</span>
                                      </label>
                                      {colorData.back && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setColorImagesMap((prev) => ({
                                              ...prev,
                                              [color]: { ...prev[color], back: '' },
                                            }))
                                          }}
                                          className="p-1 text-levix-secondary hover:text-red-600 transition-colors"
                                          title="Clear back photo"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Variants List Table */}
                    {variantsList.length > 0 ? (
                      <div className="overflow-x-auto border border-levix-border bg-white max-h-64 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-levix-gray border-b border-levix-border text-[10px] uppercase font-bold text-levix-charcoal tracking-wider sticky top-0">
                            <tr>
                              <th className="p-2">Color</th>
                              <th className="p-2">Size</th>
                              <th className="p-2">SKU</th>
                              <th className="p-2 w-20">Stock</th>
                              <th className="p-2 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-levix-border">
                            {variantsList.map((v, idx) => (
                              <tr key={v.id} className="hover:bg-levix-soft-orange/20">
                                <td className="p-2">
                                  <input
                                    type="text"
                                    value={v.color || ''}
                                    onChange={(e) => handleUpdateVariantField(idx, 'color', e.target.value)}
                                    placeholder="Color"
                                    className="border border-levix-border px-2 py-1 text-xs w-28"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    value={v.size || ''}
                                    onChange={(e) => handleUpdateVariantField(idx, 'size', e.target.value)}
                                    placeholder="Size"
                                    className="border border-levix-border px-2 py-1 text-xs w-16 uppercase"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    value={v.sku}
                                    onChange={(e) => handleUpdateVariantField(idx, 'sku', e.target.value)}
                                    className="border border-levix-border px-2 py-1 font-mono text-[11px] w-32"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="number"
                                    min="0"
                                    value={v.stock}
                                    onChange={(e) => handleUpdateVariantField(idx, 'stock', Number(e.target.value))}
                                    className="border border-levix-border px-2 py-1 text-xs w-16"
                                  />
                                </td>
                                <td className="p-2 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveVariant(idx)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                    title="Remove Variant"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-[11px] text-levix-secondary italic">
                        No variants generated yet. Enter colors and sizes above and click Generate.
                      </p>
                    )}

                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={handleAddManualVariant}
                        className="text-xs font-bold uppercase tracking-wider text-levix-orange hover:text-levix-orange-hover flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Single Variant Row
                      </button>
                      <span className="text-[11px] text-levix-secondary">
                        Overall Product Stock automatically synchronizes with sum of variant stocks.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Photography & Media */}
              <div className="border border-levix-border bg-white p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-levix-border">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-levix-charcoal">
                      Product Media & Photos *
                    </label>
                    <p className="text-[11px] text-levix-secondary">
                      Snap live photos with your camera or select from your gallery. Automatically optimized.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Hidden Native File Inputs */}
                    <input
                      type="file"
                      ref={cameraInputRef}
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleProductFilesAdded(e.target.files)}
                      className="hidden"
                    />
                    <input
                      type="file"
                      ref={galleryInputRef}
                      accept="image/*"
                      multiple
                      onChange={(e) => handleProductFilesAdded(e.target.files)}
                      className="hidden"
                    />

                    {/* Camera Button */}
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      onClick={() => cameraInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-levix-charcoal text-white hover:bg-black text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                      title="Take a photo with device camera"
                    >
                      <Camera className="w-3.5 h-3.5 text-levix-orange" />
                      <span>Camera</span>
                    </button>

                    {/* Gallery / Photos Button */}
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      onClick={() => galleryInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-levix-gray hover:bg-levix-border text-levix-charcoal border border-levix-border text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                      title="Upload from device gallery or files"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-levix-charcoal" />
                      <span>Gallery</span>
                    </button>

                    {/* Toggle Manual URL link */}
                    <button
                      type="button"
                      onClick={() => setShowUrlTextarea((prev) => !prev)}
                      className={`p-1.5 border transition-colors cursor-pointer ${
                        showUrlTextarea
                          ? 'bg-levix-charcoal text-white border-levix-charcoal'
                          : 'text-levix-secondary hover:text-levix-charcoal border-levix-border bg-white'
                      }`}
                      title="Toggle manual image URL input"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Upload Spinner Alert */}
                {isUploadingImage && (
                  <div className="flex items-center gap-2 p-2.5 bg-levix-soft-orange/30 border border-levix-orange/30 text-levix-charcoal text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-levix-orange" />
                    <span className="font-semibold">Optimizing and compressing high-resolution photos...</span>
                  </div>
                )}

                {/* Visual Image Grid Preview */}
                {(() => {
                  const images = imagesText
                    .split('\n')
                    .map((u) => u.trim())
                    .filter(Boolean)

                  if (images.length === 0) {
                    return (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => galleryInputRef.current?.click()}
                        className="border-2 border-dashed border-levix-orange/60 hover:border-levix-orange bg-levix-orange/5 hover:bg-levix-orange/10 p-7 text-center transition-all cursor-pointer group space-y-3"
                      >
                        <div className="w-12 h-12 mx-auto rounded-full bg-white border border-levix-orange/40 flex items-center justify-center text-levix-orange group-hover:scale-105 transition-transform shadow-xs">
                          <Upload className="w-6 h-6 text-levix-orange" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-levix-charcoal">
                            Drag & Drop Product Images Directly Here
                          </p>
                          <p className="text-[11px] text-levix-secondary max-w-md mx-auto mt-1">
                            Drop images from your desktop/files to instantly optimize & attach, or click to browse.
                          </p>
                        </div>
                        <div
                          className="flex items-center justify-center gap-2 pt-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-levix-charcoal text-white hover:bg-black text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                          >
                            <Camera className="w-3.5 h-3.5 text-levix-orange" />
                            <span>Take Photo</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => galleryInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-levix-border hover:bg-levix-gray text-levix-charcoal text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-levix-charcoal" />
                            <span>Browse Gallery</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-levix-secondary/70 uppercase tracking-widest font-mono">
                          Auto-compressed & web-optimized • Multiple images supported
                        </p>
                      </div>
                    )
                  }

                  return (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {images.map((imgUrl, idx) => (
                          <div
                            key={`${imgUrl.slice(0, 30)}-${idx}`}
                            className="group relative border border-levix-border bg-levix-gray aspect-3/4 overflow-hidden shadow-xs"
                          >
                            <img
                              src={imgUrl}
                              alt={`Product preview ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                ;(e.target as HTMLElement).style.opacity = '0.3'
                              }}
                            />

                            {/* Cover Badge / Button */}
                            {idx === 0 ? (
                              <span className="absolute top-1.5 left-1.5 bg-black text-levix-orange text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 shadow-sm">
                                ★ Main Cover
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetMainCover(idx)}
                                className="absolute top-1.5 left-1.5 bg-black/80 hover:bg-black text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 shadow-sm opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Set as main thumbnail"
                              >
                                Set as Cover
                              </button>
                            )}

                            {/* Delete Action */}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-1.5 right-1.5 bg-red-600/90 hover:bg-red-700 text-white p-1 rounded-xs shadow-sm transition-opacity opacity-90 sm:opacity-0 group-hover:opacity-100"
                              title="Remove image"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>

                            {/* Index Indicator */}
                            <span className="absolute bottom-1 right-1.5 text-[9px] font-mono text-white/80 bg-black/60 px-1 rounded-xs">
                              #{idx + 1}
                            </span>
                          </div>
                        ))}

                        {/* Drag & Drop "+ Add More" Tile */}
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => galleryInputRef.current?.click()}
                          className="border-2 border-dashed border-levix-border hover:border-levix-orange bg-levix-gray/40 hover:bg-levix-orange/5 aspect-3/4 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all group/add"
                          title="Drag and drop photos directly here or click to browse"
                        >
                          <div className="w-8 h-8 rounded-full bg-white border border-levix-border flex items-center justify-center text-levix-charcoal group-hover/add:text-levix-orange group-hover/add:border-levix-orange transition-colors mb-1.5 shadow-xs">
                            <Plus className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-levix-charcoal group-hover/add:text-levix-orange">
                            + Add More
                          </span>
                          <span className="text-[9px] text-levix-secondary leading-tight mt-0.5">
                            Drag & drop or click
                          </span>
                        </div>
                      </div>

                      {/* Bar beneath grid */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-levix-secondary pt-1 border-t border-levix-border">
                        <span>
                          {images.length} photo(s) attached • Drag & drop anywhere in this window to add more
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            className="text-levix-charcoal hover:text-levix-orange font-bold flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                          >
                            <Camera className="w-3 h-3 text-levix-orange" />
                            Camera
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => galleryInputRef.current?.click()}
                            className="text-levix-charcoal hover:text-levix-orange font-bold flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                          >
                            <ImageIcon className="w-3 h-3 text-levix-charcoal" />
                            Browse Files
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* Collapsible Direct URL Editor */}
                {showUrlTextarea && (
                  <div className="pt-2 border-t border-levix-border space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-levix-secondary">
                      Manual Image URLs (one URL per line)
                    </label>
                    <textarea
                      value={imagesText}
                      onChange={(e) => setImagesText(e.target.value)}
                      rows={3}
                      placeholder="https://images.unsplash.com/..."
                      className="form-input font-mono text-[11px] bg-levix-gray/30"
                    />
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-levix-border">
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
                  <span className="font-semibold text-levix-charcoal">Featured Home</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="w-4 h-4 text-levix-orange accent-levix-orange"
                  />
                  <span className="font-semibold text-levix-charcoal">New Arrival</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestseller}
                    onChange={(e) => setIsBestseller(e.target.checked)}
                    className="w-4 h-4 text-levix-orange accent-levix-orange"
                  />
                  <span className="font-semibold text-levix-charcoal">Bestseller</span>
                </label>
              </div>

              {/* SEO Inputs */}
              <div className="pt-2 border-t border-levix-border space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-levix-secondary">
                  SEO & Meta Metadata
                </p>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Custom Meta Title (optional)"
                  className="form-input py-2"
                />
                <input
                  type="text"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Custom Meta Description (optional)"
                  className="form-input py-2"
                />
              </div>

              {/* Error display directly above buttons so user always sees it */}
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Buttons */}
              <div className="pt-4 border-t border-levix-border flex gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 btn-primary py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Saving Product...</span>
                    </>
                  ) : (
                    <span>Save Product</span>
                  )}
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary py-3 px-6 text-xs uppercase tracking-wider disabled:opacity-50"
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
