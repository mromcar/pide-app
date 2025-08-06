// src/lib/cart-context.tsx
'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type CartItem = {
  variantId: number
  productName: string
  variantDescription: string
  price: number
  quantity: number
  notes?: string
  imageUrl?: string
}

interface ProductToAdd {
  variantId: number
  productName: string
  variantDescription: string
  price: number
  quantity?: number
  notes?: string
  imageUrl?: string
}

export interface CartContextType {
  cartItems: CartItem[]
  addToCart: (newItem: CartItem) => void
  removeFromCart: (variantId: number) => void
  updateCartItemQuantity: (variantId: number, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  restaurantId: number | null
  setRestaurantId: (id: number | null) => void
  addProduct: (product: ProductToAdd) => void
  tableNumber: string
  setTableNumber: (tableNumber: string) => void
  orderNotes: string
  setOrderNotes: (notes: string) => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [restaurantId, setRestaurantIdState] = useState<number | null>(null)
  const [tableNumber, setTableNumber] = useState<string>('')
  const [orderNotes, setOrderNotes] = useState<string>('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem('currentRestaurantId')
      if (savedId) {
        setRestaurantIdState(parseInt(savedId, 10))
      }
    }
  }, [])

  const setRestaurantId = (id: number | null) => {
    setRestaurantIdState(id)
    if (typeof window !== 'undefined') {
      if (id) {
        localStorage.setItem('currentRestaurantId', id.toString())
      } else {
        localStorage.removeItem('currentRestaurantId')
      }
    }
  }

  const addToCart = (newItem: CartItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.variantId === newItem.variantId)
      if (existingItem) {
        return prevItems.map((item) =>
          item.variantId === newItem.variantId
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      }
      return [...prevItems, newItem]
    })
  }

  const addProduct = (product: ProductToAdd) => {
    const cartItem: CartItem = {
      variantId: product.variantId,
      productName: product.productName,
      variantDescription: product.variantDescription,
      price: product.price,
      quantity: product.quantity || 1,
      notes: product.notes,
      imageUrl: product.imageUrl,
    }
    addToCart(cartItem)
  }

  const removeFromCart = (variantId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.variantId !== variantId))
  }

  const updateCartItemQuantity = (variantId: number, quantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.variantId === variantId ? { ...item, quantity } : item))
    )
  }

  const clearCart = () => {
    setCartItems([])
    setTableNumber('')
    setOrderNotes('')
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        getCartTotal,
        restaurantId,
        setRestaurantId,
        addProduct,
        tableNumber,
        setTableNumber,
        orderNotes,
        setOrderNotes,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === null) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
