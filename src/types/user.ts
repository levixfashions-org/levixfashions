import type { ShippingAddress } from './order'

export interface SavedAddress extends ShippingAddress {
  id: string
  isDefault: boolean
}

export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  phone?: string
  role: 'customer' | 'admin'
  addresses?: SavedAddress[]
  createdAt?: any
  updatedAt?: any
}
