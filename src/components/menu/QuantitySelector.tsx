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

  const cartItem = cartItems.find((item) => item.variant_id === variant.variant_id)
  const initialQuantity = cartItem ? cartItem.quantity : 1

  const [quantity, setQuantity] = useState(initialQuantity)

  // Función para obtener la descripción traducida de la variante - CORREGIDA
  const getVariantDescription = (variant: ProductVariantResponseDTO) => {
    const translation = variant.translations?.find(
      (t: ProductVariantTranslationResponseDTO) => t.language_code === lang
    )
    return translation?.variant_description || variant.variant_description
  }

  // Función para obtener el nombre traducido del producto
  const getProductName = (product: ProductResponseDTO) => {
    const translation = product.translations?.find((t) => t.language_code === lang)
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
      updateCartItemQuantity(variant.variant_id, quantity)
    } else {
      const itemToAdd: CartItem = {
        variant_id: variant.variant_id,
        product_name: getProductName(product),
        variant_description: getVariantDescription(variant),
        price: variant.price,
        quantity: quantity,
        image_url: product.image_url ?? undefined,
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

// ✅ Agregar image_url a ProductResponseDTO o usar una propiedad alternativa
<img 
  src={product.image_url || '/images/products/default.jpg'} // ✅ Agregar fallback
  alt={product.name}
/>
