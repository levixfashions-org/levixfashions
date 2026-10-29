import { useState, useRef, useEffect } from 'react'
import {
  Save,
  Check,
  Database,
  Truck,
  CreditCard,
  Megaphone,
  Sparkles,
  Camera,
  Upload,
  Loader2,
} from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { paiseToRupees, rupeesToPaise } from '../../lib/utils'
import { compressAndProcessImage } from '../../lib/imageUpload'
import type { StoreSettings } from '../../types/settings'

export const AdminSettings: React.FC = () => {
  const { settings, categories, updateStoreSettings, seedInitialData } = useStore()

  // Form states
  const [storeName, setStoreName] = useState(settings.storeName)
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail)
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone)
  const [freeShippingRupees, setFreeShippingRupees] = useState(
    paiseToRupees(settings.freeShippingThreshold)
  )
  const [standardShippingRupees, setStandardShippingRupees] = useState(
    paiseToRupees(settings.standardShippingFee)
  )
  const [codEnabled, setCodEnabled] = useState(settings.codEnabled)
  const [maxCodRupees, setMaxCodRupees] = useState(paiseToRupees(settings.maxCodAmount))
  const [razorpayKeyId, setRazorpayKeyId] = useState(settings.razorpayKeyId || '')

  // Announcement Bar
  const [announcementEnabled, setAnnouncementEnabled] = useState(settings.announcementBar?.enabled ?? true)
  const [announcementText, setAnnouncementText] = useState(settings.announcementBar?.text || '')
  const [announcementLink, setAnnouncementLink] = useState(settings.announcementBar?.link || '')

  // Hero Section
  const [heroImageUrl, setHeroImageUrl] = useState(
    settings.hero?.imageUrl ||
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85'
  )
  const [productCardBgColor, setProductCardBgColor] = useState(
    settings.productCardBgColor && !['#add8e6', 'blue', '#0000ff'].includes(settings.productCardBgColor.toLowerCase())
      ? settings.productCardBgColor
      : '#f0f0f0'
  )
  const [heroSubtitle, setHeroSubtitle] = useState(settings.hero?.subtitle || 'Autumn / Winter Lookbook 2026')
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const handleBannerFile = async (file?: File) => {
    if (!file) return
    setIsUploadingBanner(true)
    setUploadError(null)
    try {
      const url = await compressAndProcessImage(file, 1600, 0.85)
      setHeroImageUrl(url)
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to process banner photo. Try another image or direct URL.')
    } finally {
      setIsUploadingBanner(false)
    }
  }

  const [heroPrimaryBtnText, setHeroPrimaryBtnText] = useState(settings.hero.primaryButtonText)
  const [heroPrimaryBtnLink, setHeroPrimaryBtnLink] = useState(settings.hero.primaryButtonLink)

  // Synchronize state with store settings when loaded from database
  useEffect(() => {
    if (settings) {
      if (settings.storeName !== undefined) setStoreName(settings.storeName)
      if (settings.supportEmail !== undefined) setSupportEmail(settings.supportEmail)
      if (settings.supportPhone !== undefined) setSupportPhone(settings.supportPhone)
      if (settings.freeShippingThreshold !== undefined) setFreeShippingRupees(paiseToRupees(settings.freeShippingThreshold))
      if (settings.standardShippingFee !== undefined) setStandardShippingRupees(paiseToRupees(settings.standardShippingFee))
      if (settings.codEnabled !== undefined) setCodEnabled(settings.codEnabled)
      if (settings.maxCodAmount !== undefined) setMaxCodRupees(paiseToRupees(settings.maxCodAmount))
      if (settings.razorpayKeyId !== undefined) setRazorpayKeyId(settings.razorpayKeyId || "")
      if (settings.announcementBar?.enabled !== undefined) setAnnouncementEnabled(settings.announcementBar.enabled)
      if (settings.announcementBar?.text !== undefined) setAnnouncementText(settings.announcementBar.text)
      if (settings.announcementBar?.link !== undefined) setAnnouncementLink(settings.announcementBar.link)
      if (settings.hero?.imageUrl !== undefined) setHeroImageUrl(settings.hero.imageUrl)
      if (settings.hero?.subtitle !== undefined) setHeroSubtitle(settings.hero.subtitle)
      if (settings.hero?.primaryButtonText !== undefined) setHeroPrimaryBtnText(settings.hero.primaryButtonText)
      if (settings.hero?.primaryButtonLink !== undefined) setHeroPrimaryBtnLink(settings.hero.primaryButtonLink)
      if (settings.productCardBgColor !== undefined) {
        const bg = settings.productCardBgColor.trim()
        setProductCardBgColor(['#add8e6', 'blue', '#0000ff'].includes(bg.toLowerCase()) ? '#f0f0f0' : bg)
      }
    }
  }, [settings])

  // Statuses
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [seedMessage, setSeedMessage] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveSuccess(false)

    const updated: StoreSettings = {
      ...settings,
      storeName: storeName.trim(),
      supportEmail: supportEmail.trim(),
      supportPhone: supportPhone.trim(),
      freeShippingThreshold: rupeesToPaise(Number(freeShippingRupees) || 0),
      standardShippingFee: rupeesToPaise(Number(standardShippingRupees) || 0),
      codEnabled,
      maxCodAmount: rupeesToPaise(Number(maxCodRupees) || 0),
      razorpayKeyId: razorpayKeyId.trim(),
      productCardBgColor: (productCardBgColor.trim().startsWith("#") ? productCardBgColor.trim() : ("#" + productCardBgColor.trim())) || "#f0f0f0",
      announcementBar: {
        enabled: announcementEnabled,
        text: announcementText.trim(),
        link: announcementLink.trim(),
      },
      hero: {
        headline: '',
        subheadline: '',
        imageUrl: heroImageUrl.trim(),
        primaryButtonText: (heroPrimaryBtnText || '').trim() || 'Shop now',
        primaryButtonLink: heroPrimaryBtnLink.trim(),
        subtitle: heroSubtitle.trim(),
      },
    }

    await updateStoreSettings(updated)
    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleSeedDatabase = async () => {
    if (
      !window.confirm(
        'Populate Firestore database with initial products, collections, and settings? Existing data with the same IDs will be updated.'
      )
    ) {
      return
    }

    setSeeding(true)
    const res = await seedInitialData()
    setSeedMessage(res.message)
    setSeeding(false)
    setTimeout(() => setSeedMessage(null), 6000)
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-4 border-b border-levix-border">
        <p className="text-xs font-bold uppercase tracking-widest text-black mb-1">
          Store Configuration
        </p>
        <h1 className="text-2xl font-black uppercase tracking-tight text-levix-charcoal">
          Store Settings
        </h1>
        <p className="text-xs text-levix-secondary mt-0.5">
          Configure shipping rules, announcement banner, COD policies, and editorial homepage content.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">Store settings successfully saved and published!</span>
        </div>
      )}

      {seedMessage && (
        <div className="p-4 bg-black/5 border border-neutral-300 text-black text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>{seedMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8 text-xs">
        {/* Brand & Support Contact */}
        <div className="bg-white border border-levix-border p-6 shadow-subtle space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal pb-3 border-b border-levix-border">
            1. Brand Identity & Client Support
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Store Brand Name *</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Support Email *</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Support Toll-Free Phone *</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                required
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Shipping & COD Rules */}
        <div className="bg-white border border-levix-border p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-levix-border">
            <Truck className="w-4 h-4 text-black" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
              2. Shipping Rules & Payment Policies
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Free Express Shipping Threshold (₹ INR) *</label>
              <input
                type="number"
                min="0"
                value={freeShippingRupees}
                onChange={(e) => setFreeShippingRupees(Number(e.target.value))}
                required
                className="form-input"
              />
              <p className="text-[11px] text-levix-secondary mt-1">
                Orders equal or exceeding this total qualify for complimentary shipping.
              </p>
            </div>

            <div>
              <label className="form-label">Standard Shipping Fee (₹ INR) *</label>
              <input
                type="number"
                min="0"
                value={standardShippingRupees}
                onChange={(e) => setStandardShippingRupees(Number(e.target.value))}
                required
                className="form-input"
              />
              <p className="text-[11px] text-levix-secondary mt-1">
                Charged on domestic orders below the free shipping threshold.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-levix-border space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={codEnabled}
                onChange={(e) => setCodEnabled(e.target.checked)}
                className="w-4 h-4 text-black accent-black"
              />
              <span className="font-bold text-levix-charcoal uppercase tracking-wider">
                Enable Cash on Delivery (COD) Checkout Option
              </span>
            </label>

            {codEnabled && (
              <div className="max-w-xs pl-6">
                <label className="form-label">Maximum Allowed COD Order Limit (₹ INR)</label>
                <input
                  type="number"
                  min="0"
                  value={maxCodRupees}
                  onChange={(e) => setMaxCodRupees(Number(e.target.value))}
                  className="form-input py-2"
                />
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-levix-border">
            <label className="form-label flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-black" />
              <span>Razorpay Key ID (Client-facing)</span>
            </label>
            <input
              type="text"
              value={razorpayKeyId}
              onChange={(e) => setRazorpayKeyId(e.target.value)}
              placeholder="rzp_test_..."
              className="form-input font-mono text-xs max-w-sm"
            />
            <p className="text-[10px] text-levix-secondary mt-1">
              Public Key ID utilized by the frontend Razorpay checkout modal. Secrets are never exposed.
            </p>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-white border border-levix-border p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-levix-border">
            <Megaphone className="w-4 h-4 text-black" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
              3. Storefront Announcement Bar
            </h2>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={announcementEnabled}
              onChange={(e) => setAnnouncementEnabled(e.target.checked)}
              className="w-4 h-4 text-black accent-black"
            />
            <span className="font-semibold text-levix-charcoal">Display Announcement Bar at top of website</span>
          </label>

          {announcementEnabled && (
            <div className="space-y-3 pl-6">
              <div>
                <label className="form-label">Announcement Message</label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="e.g. COMPLIMENTARY SHIPPING ON ORDERS OVER ₹1,999"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Target Link Destination</label>
                <input
                  type="text"
                  value={announcementLink}
                  onChange={(e) => setAnnouncementLink(e.target.value)}
                  placeholder="/shop"
                  className="form-input font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Hero Banner Editor (Full-Bleed Minimal Look with Photo Upload & Collection Picker) */}
        <div id="hero-banner" className="bg-white border border-levix-border p-6 shadow-subtle space-y-5">
          <div className="pb-3 border-b border-levix-border">
            <h2 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
              4. Homepage Full-Screen Hero Banner
            </h2>
            <p className="text-xs text-levix-secondary mt-0.5">
              Manage the full-screen mobile cover photo, small sentence, and destination collection for \"Shop now\".
            </p>
          </div>

          {/* Live Mobile Simulation Preview */}
          <div>
            <label className="form-label mb-2">Live Mobile Banner Preview</label>
            <div className="relative max-w-[320px] mx-auto h-[460px] rounded-2xl overflow-hidden border-4 border-neutral-800 shadow-2xl bg-neutral-900 flex flex-col justify-end">
              <img
                src={heroImageUrl || "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85"}
                alt="Banner Preview"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent pointer-events-none" />

              {/* Preview Underlined Shop now & Subtitle */}
              <div className="relative z-10 w-full pb-8 flex flex-col items-center justify-center text-center px-4">
                {heroSubtitle && heroSubtitle.trim() && (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90 drop-shadow-md mb-1.5">
                    {heroSubtitle}
                  </p>
                )}
                <span className="text-sm font-semibold tracking-wide text-white underline underline-offset-8 decoration-white drop-shadow-md">
                  {heroPrimaryBtnText || "Shop now"}
                </span>
                <span className="text-[10px] text-white/70 mt-2 font-mono">
                  &rarr; {heroPrimaryBtnLink}
                </span>
              </div>
            </div>
          </div>

          {/* Photo Upload & Camera Controls */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="form-label">Banner Photo (Camera, Gallery, or Direct URL)</label>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <input
                  type="file"
                  ref={cameraInputRef}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleBannerFile(e.target.files?.[0])}
                />
                <input
                  type="file"
                  ref={galleryInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleBannerFile(e.target.files?.[0])}
                />

                <button
                  type="button"
                  disabled={isUploadingBanner}
                  onClick={() => cameraInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-levix-charcoal hover:bg-black text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <Camera className="w-4 h-4 text-white" />
                  <span>Take Photo (Camera)</span>
                </button>

                <button
                  type="button"
                  disabled={isUploadingBanner}
                  onClick={() => galleryInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-levix-gray hover:bg-neutral-200 text-levix-charcoal border border-levix-border text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <Upload className="w-4 h-4 text-levix-secondary" />
                  <span>Upload from Gallery</span>
                </button>

                {isUploadingBanner && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-black font-medium animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Compressing & uploading photo...</span>
                  </div>
                )}
              </div>

              {uploadError && (
                <p className="text-xs text-rose-600 mb-2">{uploadError}</p>
              )}

              <input
                type="url"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                placeholder="Or paste an image URL..."
                required
                className="form-input font-mono text-[11px]"
              />
            </div>

            {/* Curated Editorial Preset Photos */}
            <div>
              <p className="text-[11px] font-semibold text-levix-secondary uppercase tracking-wider mb-2">
                Or pick a luxury editorial preset:
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Look 1", url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85" },
                  { label: "Look 2", url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=85" },
                  { label: "Look 3", url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85" },
                  { label: "Look 4", url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=85" },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setHeroImageUrl(preset.url)}
                    className={"relative rounded-md overflow-hidden aspect-[4/5] border-2 transition-all " + (heroImageUrl === preset.url ? "border-black ring-2 ring-black/30" : "border-levix-border hover:border-black")}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 inset-x-1 bg-black/75 text-white text-[9px] font-bold uppercase text-center py-0.5 rounded-xs">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Small sentence above shop now */}
            <div>
              <label className="form-label">
                Small Sentence Above \"Shop now\" (Optional)
              </label>
              <input
                type="text"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder="e.g. AUTUMN / WINTER 26 or LATE DROP"
                className="form-input"
              />
              <p className="text-[11px] text-levix-secondary mt-1">
                Displays in clean, understated uppercase typography directly above the \"Shop now\" text.
              </p>
            </div>

            {/* Redirect Collection Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Destination Collection</label>
                <select
                  value={heroPrimaryBtnLink}
                  onChange={(e) => setHeroPrimaryBtnLink(e.target.value)}
                  className="form-input cursor-pointer font-medium"
                >
                  <option value="/shop">All Collections (/shop)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={"/collection/" + cat.slug}>
                      {cat.name} (/collection/{cat.slug})
                    </option>
                  ))}
                  <option value="/shop?sort=newest">New Arrivals (/shop?sort=newest)</option>
                  <option value="/shop?sort=price_desc">High to Low (/shop?sort=price_desc)</option>
                </select>
                <p className="text-[11px] text-levix-secondary mt-1">
                  Customer will be instantly redirected here when clicking \"Shop now\".
                </p>
              </div>

              <div>
                <label className="form-label">Underlined Link Text</label>
                <input
                  type="text"
                  value={heroPrimaryBtnText}
                  onChange={(e) => setHeroPrimaryBtnText(e.target.value)}
                  placeholder="Shop now"
                  className="form-input font-medium"
                />
                <p className="text-[11px] text-levix-secondary mt-1">
                  Default: <span className="font-semibold text-black">Shop now</span> (underlined design, no button box).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Card Background Color Styling */}
        <div id="product-card-style" className="bg-white border border-levix-border p-6 shadow-subtle space-y-4">
          <div className="pb-3 border-b border-levix-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
                5. Product Card Background Color
              </h2>
              <p className="text-xs text-levix-secondary mt-0.5">
                Customize the background color of product cards across the entire website by entering any HEX code (e.g. #f0f0f0).
              </p>
            </div>
            {/* Visual Color Swatch */}
            <div
              className="w-10 h-10 rounded-lg border-2 border-levix-border shadow-xs"
              style={{ backgroundColor: productCardBgColor || "#f0f0f0" }}
              title={"Current background: " + (productCardBgColor || "#f0f0f0")}
            />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="form-label">Background HEX Code</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={productCardBgColor}
                      onChange={(e) => {
                        let val = e.target.value.trim()
                        if (!val.startsWith("#") && val.length > 0) val = "#" + val
                        setProductCardBgColor(val)
                      }}
                      placeholder="#f0f0f0"
                      maxLength={7}
                      className="form-input font-mono uppercase tracking-wider font-bold"
                    />
                  </div>
                  {/* Native HTML Color Picker synced with HEX */}
                  <input
                    type="color"
                    value={/^#[0-9A-Fa-f]{6}$/.test(productCardBgColor) ? productCardBgColor : "#f0f0f0"}
                    onChange={(e) => setProductCardBgColor(e.target.value)}
                    className="w-11 h-10 p-1 bg-white border border-levix-border rounded cursor-pointer shrink-0"
                    title="Choose color using color picker"
                  />
                </div>
                <p className="text-[11px] text-levix-secondary mt-1">
                  Enter any valid 6-digit HEX code (e.g. <span className="font-mono font-bold text-black">#f0f0f0</span>).
                </p>
              </div>

              {/* Live Mini Product Card Preview */}
              <div>
                <label className="form-label">Live Product Card Preview</label>
                <div
                  style={{ backgroundColor: productCardBgColor || "#f0f0f0" }}
                  className="p-3 border border-levix-border rounded-lg shadow-xs flex items-center gap-3 transition-colors"
                >
                  <div className="w-12 h-14 bg-black/10 rounded overflow-hidden flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-mono text-neutral-500">Image</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">T-SHIRTS</span>
                    <p className="text-xs font-bold text-black line-clamp-1">Heavyweight Boxy Tee</p>
                    <p className="text-xs font-semibold text-neutral-800">₹2,499</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <p className="text-[11px] font-semibold text-levix-secondary uppercase tracking-wider mb-2">
                Quick Luxury Color Presets:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "#f0f0f0 (Default Minimal Studio)", hex: "#f0f0f0" },
                  { label: "#ffffff (Pure White)", hex: "#ffffff" },
                  { label: "#f8f8f8 (Soft Off-White)", hex: "#f8f8f8" },
                  { label: "#eceae6 (Warm Oatmeal)", hex: "#eceae6" },
                  { label: "#e5e5e5 (Neutral Studio Gray)", hex: "#e5e5e5" },
                ].map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setProductCardBgColor(preset.hex)}
                    className={"inline-flex items-center gap-2 px-3 py-1.5 border text-xs transition-all " + (productCardBgColor.toLowerCase() === preset.hex.toLowerCase() ? "border-black bg-black text-white font-bold" : "border-levix-border bg-white text-levix-charcoal hover:border-black")}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save Settings Action */}
        <div className="flex items-center justify-between pt-4 border-t border-levix-border">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary py-3 px-8 text-xs uppercase tracking-wider flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>

      {/* Cloud Firestore Database Sync & Seeding Utility */}
      <div className="bg-white border border-levix-border p-6 shadow-subtle space-y-3 mt-10">
        <div className="flex items-center gap-2 pb-2 border-b border-levix-border">
          <Database className="w-4 h-4 text-black" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
            6. Database Synchronization & Initial Seeding
          </h2>
        </div>
        <p className="text-xs text-levix-secondary leading-relaxed">
          When deploying to Hostinger or connecting a fresh Firebase project, use this 1-click utility to populate Cloud Firestore with the complete LEVIX catalogue, collections, and initial settings.
        </p>

        <button
          type="button"
          onClick={handleSeedDatabase}
          disabled={seeding}
          className="btn-secondary py-2.5 px-5 text-xs uppercase tracking-wider flex items-center gap-2 border-levix-charcoal"
        >
          <Database className="w-4 h-4 text-black" />
          <span>{seeding ? 'Seeding Firestore...' : 'Seed Initial Firestore Database'}</span>
        </button>
      </div>
    </div>
  )
}
