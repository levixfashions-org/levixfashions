import type { StoreSettings } from '../types/settings'

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'LEVIX',
  supportEmail: 'care@levix.in',
  supportPhone: '+91 8000 123 456',
  currency: 'INR',
  currencySymbol: '₹',
  freeShippingThreshold: 199900, // ₹1,999 in paise
  standardShippingFee: 14900, // ₹149 in paise
  codEnabled: true,
  maxCodAmount: 1000000, // ₹10,000 in paise
  razorpayKeyId: 'rzp_test_LEVIX_DEFAULT',
  announcementBar: {
    enabled: true,
    text: 'COMPLIMENTARY SHIPPING ON ORDERS OVER ₹1,999 • DISPATCH WITHIN 24 HOURS',
    link: '/shop',
  },
  hero: {
    headline: '',
    subheadline: '',
    primaryButtonText: 'Shop now',
    primaryButtonLink: '/shop',
    secondaryButtonText: '',
    secondaryButtonLink: '',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85',
    subtitle: 'Autumn / Winter Lookbook 2026',
  },
  productCardBgColor: '#f0f0f0',
  socialLinks: {
    instagram: 'https://instagram.com/levix.official',
    twitter: 'https://x.com/levix_official',
    facebook: 'https://facebook.com/levix',
  },
}
