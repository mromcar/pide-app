'use client'

import { useState } from 'react'
import { useCart, CartItem } from '@/lib/cart-context'
import { ProductResponseDTO } from '@/types/dtos/product'
import { ProductVariantResponseDTO } from '@/types/dtos/productVariant'
import { ProductVariantTranslationResponseDTO } from '@/types/dtos/productVariantTranslation'
import { LanguageCode } from '@/constants/languages'
import { getTranslation } from '@/translations'

interface QuantitySelectorProps {
  product: ProductResponseDTO
  variant: ProductVariantResponseDTO
  lang: LanguageCode
}

export default function QuantitySelector({ product, variant, lang }: QuantitySelectorProps) {
  const { addToCart, updateCartItemQuantity, cartItems } = useCart()
  const t = getTranslation(lang)

  if (!variant) return null

  // Usar camelCase para acceder a las propiedades del carrito
  const cartItem = (cartItems ?? []).find((item) => item.variantId === variant.variantId)
  const initialQuantity = cartItem ? cartItem.quantity : 1

  const [quantity, setQuantity] = useState(initialQuantity)

  // Función para obtener la descripción traducida de la variante
  const getVariantDescription = (variant: ProductVariantResponseDTO) => {
    const translation = variant.translations?.find(
      (t: ProductVariantTranslationResponseDTO) => t.languageCode === lang
    )
    return translation?.variantDescription || variant.variantDescription
  }

  // Función para obtener el nombre traducido del producto
  const getProductName = (product: ProductResponseDTO) => {
    const translation = product.translations?.find((t) => t.languageCode === lang)
    return translation?.name || product.name
  }

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1)
  }

  const handleDecrease = () => {
    setQuantity((prev) => (prev > 0 ? prev - 1 : 0))
  }

  const handleAddToCart = () => {
    if (quantity === 0) return

    if (cartItem) {
      updateCartItemQuantity(variant.variantId, quantity)
    } else {
      const itemToAdd: CartItem = {
        variantId: variant.variantId,
        productName: getProductName(product),
        variantDescription: getVariantDescription(variant),
        price: variant.price,
        quantity: quantity,
      }
      addToCart(itemToAdd)
    }
  }

  return (
    <div className="add-to-cart-controls">
      <div className="quantity-selector-persistent">
        <button onClick={handleDecrease} className="quantity-button" disabled={quantity === 0}>
          -
        </button>
        <span className="quantity-display">{quantity}</span>
        <button onClick={handleIncrease} className="quantity-button">
          +
        </button>
      </div>
      <button
        onClick={handleAddToCart}
        className="add-to-cart-button-standalone"
        disabled={quantity === 0}
      >
        {t.addToCart}
      </button>
    </div>
  )
}
