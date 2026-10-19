import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { localStore } from '../lib/storage'
import { useStore } from './StoreContext'

export interface CartItem {
  productId: string
  variantId?: string
  name: string
  slug: string
  imageUrl: string
  sku: string
  variantName?: string
  price: number // in integer paise
  quantity: number
  maxStock: number
}

interface CartContextType {
  items: CartItem[]
  totalItems: number
  subtotal: number // in paise
  shippingFee: number // in paise
  isFreeShipping: boolean
  amountToFreeShipping: number // in paise
  total: number // in paise
  isCartDrawerOpen: boolean
  setIsCartDrawerOpen: (open: boolean) => void
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useStore()
  const [items, setItems] = useState<CartItem[]>(() => localStore.getCart())
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false)

  // Persist cart to localStorage whenever items change
  useEffect(() => {
    localStore.setCart(items)
  }, [items])

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (i) => i.productId === item.productId && i.variantId === item.variantId
      )

      if (existingIndex > -1) {
        const updated = [...prevItems]
        const currentQty = updated[existingIndex].quantity
        const newQty = Math.min(currentQty + quantity, item.maxStock)
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          maxStock: item.maxStock,
          price: item.price, // ensure current price
        }
        return updated
      } else {
        const addQty = Math.min(quantity, item.maxStock)
        return [...prevItems, { ...item, quantity: addQty }]
      }
    })
    setIsCartDrawerOpen(true)
  }

  const removeItem = (productId: string, variantId?: string) => {
    setItems((prevItems) =>
      prevItems.filter((i) => !(i.productId === productId && i.variantId === variantId))
    )
  }

  const updateQuantity = (productId: string, variantId: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, variantId)
      return
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.productId === productId && item.variantId === variantId) {
          const finalQty = Math.min(quantity, item.maxStock)
          return { ...item, quantity: finalQty }
        }
        return item
      })
    )
  }

  const clearCart = () => {
    setItems([])
    localStore.setCart([])
  }

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }, [items])

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [items])

  const isFreeShipping = useMemo(() => {
    return subtotal >= settings.freeShippingThreshold
  }, [subtotal, settings.freeShippingThreshold])

  const shippingFee = useMemo(() => {
    if (items.length === 0) return 0
    return isFreeShipping ? 0 : settings.standardShippingFee
  }, [items.length, isFreeShipping, settings.standardShippingFee])

  const amountToFreeShipping = useMemo(() => {
    return Math.max(0, settings.freeShippingThreshold - subtotal)
  }, [settings.freeShippingThreshold, subtotal])

  const total = useMemo(() => {
    return subtotal + shippingFee
  }, [subtotal, shippingFee])

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        shippingFee,
        isFreeShipping,
        amountToFreeShipping,
        total,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
