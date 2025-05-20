// src/lib/order-context.tsx
'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

// Define la estructura de un ítem en el carrito
export type CartItem = {
  variant_id: number
  product_name: string // Para mostrar en el carrito
  variant_description: string // Para mostrar en el carrito
  price: number
  quantity: number
  notes?: string
  image_url?: string // Si quieres mostrar la imagen del producto en el carrito
}

// Define la estructura del contexto del carrito
type OrderContextType = {
  cartItems: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (variantId: number) => void
  updateCartItemQuantity: (variantId: number, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
}

// Crea el contexto con valores por defecto (null)
const OrderContext = createContext<OrderContextType | null>(null)

// Proveedor del contexto para envolver tus componentes
export function OrderProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  const addToCart = (newItem: CartItem) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.variant_id === newItem.variant_id
      )

      if (existingItemIndex > -1) {
        // Si el ítem ya existe, actualiza la cantidad
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += newItem.quantity
        return updatedItems
      } else {
        // Si es un ítem nuevo, añádelo
        return [...prevItems, newItem]
      }
    })
  }

  const removeFromCart = (variantId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.variant_id !== variantId))
  }

  const updateCartItemQuantity = (variantId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId) // Si la cantidad es 0 o menos, eliminar del carrito
      return
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.variant_id === variantId ? { ...item, quantity: quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return (
    <OrderContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

// Hook personalizado para usar el contexto del carrito
export function useOrder() {
  const context = useContext(OrderContext)
  if (context === null) {
    throw new Error('useOrder debe ser usado dentro de un OrderProvider')
  }
  return context
}
