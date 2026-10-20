import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats an amount given in integer paise into INR currency display
 * Example: 299900 -> ₹2,999
 */
export function formatPrice(amountInPaise: number | undefined | null): string {
  if (amountInPaise === undefined || amountInPaise === null || isNaN(amountInPaise)) {
    return '₹0'
  }
  const rupees = amountInPaise / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: amountInPaise % 100 === 0 ? 0 : 2,
  }).format(rupees)
}

export function paiseToRupees(paise: number): number {
  return Math.round((paise / 100) * 100) / 100
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100)
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export function formatDate(date: string | number | Date | any): string {
  if (!date) return ''
  try {
    const d = date?.toDate ? date.toDate() : new Date(date)
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return String(date)
  }
}

export function generateOrderNumber(): string {
  const prefix = 'LVX'
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${dateStr}-${random}`
}

/**
 * Normalizes any color image representation (string URL, array [front, back], or object { front, back })
 * into a consistent { front: string, back: string } shape.
 */
export function normalizeColorImages(val: unknown): { front: string; back: string } {
  if (!val) return { front: '', back: '' }
  if (typeof val === 'string') return { front: val.trim(), back: '' }
  if (Array.isArray(val)) {
    return {
      front: typeof val[0] === 'string' ? val[0].trim() : '',
      back: typeof val[1] === 'string' ? val[1].trim() : '',
    }
  }
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, any>
    return {
      front: typeof obj.front === 'string' ? obj.front.trim() : typeof obj.frontImage === 'string' ? obj.frontImage.trim() : typeof obj[0] === 'string' ? obj[0].trim() : '',
      back: typeof obj.back === 'string' ? obj.back.trim() : typeof obj.backImage === 'string' ? obj.backImage.trim() : typeof obj[1] === 'string' ? obj[1].trim() : '',
    }
  }
  return { front: '', back: '' }
}
