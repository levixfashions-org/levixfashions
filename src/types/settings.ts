export interface AnnouncementBarConfig {
  enabled: boolean
  text: string
  link?: string
}

export interface HeroConfig {
  headline?: string
  subheadline?: string
  primaryButtonText?: string
  primaryButtonLink: string
  secondaryButtonText?: string
  secondaryButtonLink?: string
  imageUrl: string
  subtitle?: string // Small sentence above "Shop now" (e.g. "Late Drop" or "A/W 2026 Collection")
  targetCollectionSlug?: string // Destination collection slug
}

export interface StoreSettings {
  storeName: string
  supportEmail: string
  supportPhone: string
  currency: string
  currencySymbol: string
  freeShippingThreshold: number // in paise (e.g. 99900 = ₹999)
  standardShippingFee: number // in paise (e.g. 9900 = ₹99)
  codEnabled: boolean
  maxCodAmount: number // in paise (e.g. 1000000 = ₹10,000)
  razorpayKeyId?: string
  announcementBar: AnnouncementBarConfig
  hero: HeroConfig
  productCardBgColor?: string // Custom product card background HEX color (e.g. #f0f0f0)
  socialLinks: {
    instagram?: string
    twitter?: string
    facebook?: string
    youtube?: string
  }
}
