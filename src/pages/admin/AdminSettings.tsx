import { useState } from 'react'
import {
  Save,
  Check,
  Database,
  Truck,
  CreditCard,
  Megaphone,
  Sparkles,
} from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { paiseToRupees, rupeesToPaise } from '../../lib/utils'
import type { StoreSettings } from '../../types/settings'

export const AdminSettings: React.FC = () => {
  const { settings, updateStoreSettings, seedInitialData } = useStore()

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
  const [heroHeadline, setHeroHeadline] = useState(settings.hero.headline)
  const [heroSubheadline, setHeroSubheadline] = useState(settings.hero.subheadline)
  const [heroImageUrl, setHeroImageUrl] = useState(settings.hero.imageUrl)
  const [heroPrimaryBtnText, setHeroPrimaryBtnText] = useState(settings.hero.primaryButtonText)
  const [heroPrimaryBtnLink, setHeroPrimaryBtnLink] = useState(settings.hero.primaryButtonLink)

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
      announcementBar: {
        enabled: announcementEnabled,
        text: announcementText.trim(),
        link: announcementLink.trim(),
      },
      hero: {
        headline: heroHeadline.trim(),
        subheadline: heroSubheadline.trim(),
        imageUrl: heroImageUrl.trim(),
        primaryButtonText: heroPrimaryBtnText.trim(),
        primaryButtonLink: heroPrimaryBtnLink.trim(),
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
        'Populate Firestore database with initial products, categories, and settings? Existing data with the same IDs will be updated.'
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
        <p className="text-xs font-bold uppercase tracking-widest text-levix-orange mb-1">
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
        <div className="p-4 bg-levix-soft-orange border border-levix-orange/30 text-levix-orange text-xs flex items-center gap-2">
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
            <Truck className="w-4 h-4 text-levix-orange" />
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
                className="w-4 h-4 text-levix-orange accent-levix-orange"
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
              <CreditCard className="w-3.5 h-3.5 text-levix-orange" />
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
            <Megaphone className="w-4 h-4 text-levix-orange" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
              3. Storefront Announcement Bar
            </h2>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={announcementEnabled}
              onChange={(e) => setAnnouncementEnabled(e.target.checked)}
              className="w-4 h-4 text-levix-orange accent-levix-orange"
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

        {/* Hero Banner Editor */}
        <div className="bg-white border border-levix-border p-6 shadow-subtle space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal pb-3 border-b border-levix-border">
            4. Homepage Editorial Hero Banner
          </h2>
          <div className="space-y-3">
            <div>
              <label className="form-label">Hero Headline *</label>
              <input
                type="text"
                value={heroHeadline}
                onChange={(e) => setHeroHeadline(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Supporting Subheadline</label>
              <textarea
                value={heroSubheadline}
                onChange={(e) => setHeroSubheadline(e.target.value)}
                rows={2}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Hero Background Image URL *</label>
              <input
                type="url"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                required
                className="form-input font-mono text-[11px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Primary Button Text</label>
                <input
                  type="text"
                  value={heroPrimaryBtnText}
                  onChange={(e) => setHeroPrimaryBtnText(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Primary Button Destination Link</label>
                <input
                  type="text"
                  value={heroPrimaryBtnLink}
                  onChange={(e) => setHeroPrimaryBtnLink(e.target.value)}
                  className="form-input font-mono"
                />
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
          <Database className="w-4 h-4 text-levix-orange" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-levix-charcoal">
            5. Database Synchronization & Initial Seeding
          </h2>
        </div>
        <p className="text-xs text-levix-secondary leading-relaxed">
          When deploying to Hostinger or connecting a fresh Firebase project, use this 1-click utility to populate Cloud Firestore with the complete LEVIX catalogue, categories, and initial settings.
        </p>

        <button
          type="button"
          onClick={handleSeedDatabase}
          disabled={seeding}
          className="btn-secondary py-2.5 px-5 text-xs uppercase tracking-wider flex items-center gap-2 border-levix-charcoal"
        >
          <Database className="w-4 h-4 text-levix-orange" />
          <span>{seeding ? 'Seeding Firestore...' : 'Seed Initial Firestore Database'}</span>
        </button>
      </div>
    </div>
  )
}
