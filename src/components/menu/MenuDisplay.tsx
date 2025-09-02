'use client'

import { useMemo, useState } from 'react'
import ProductImage from '@/components/menu/ProductImage'
import CategoryImage from '@/components/menu/CategoryImage'
import { LanguageCode } from '@/constants/languages'
import { useCart } from '@/lib/cart-context'
import { getTranslation } from '@/translations'
import type { CategoryDTO } from '@/types/dtos/category'
import type { ProductResponseDTO } from '@/types/dtos/product'
import type { ProductVariantResponseDTO } from '@/types/dtos/productVariant'
import type { ProductVariantTranslationResponseDTO } from '@/types/dtos/productVariantTranslation'
import type { EstablishmentResponseDTO } from '@/types/dtos/establishment'
import QuantitySelector from './QuantitySelector'
import AllergenDisplay from './AllergenDisplay'

interface MenuCategoryWithProducts extends CategoryDTO {
  products: ProductResponseDTO[]
}

// ✅ CAMBIO: Añadir props que faltaban
interface MenuDisplayProps {
  menu: MenuCategoryWithProducts[]
  lang: LanguageCode
  establishment: EstablishmentResponseDTO // ✅ AÑADIDO
  allergens: any[] // ✅ AÑADIDO
}

// ✅ CAMBIO: Recibir props adicionales
export default function MenuDisplay({ menu, lang, establishment, allergens }: MenuDisplayProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(
    menu.length > 0 ? menu[0].categoryId : null
  )
  const t = getTranslation(lang)

  // ✅ CAMBIO: Solo llamar useCart() para tener acceso al contexto
  useCart()

  const activeCategory = useMemo(
    () => menu.find((c) => c.categoryId === activeCategoryId),
    [menu, activeCategoryId]
  )

  // ✅ MEJORADO: Log para debugging
  console.log('🎨 MenuDisplay: Rendering with:', {
    establishmentName: establishment?.name,
    categoriesCount: menu?.length || 0,
    allergensCount: allergens?.length || 0,
    activeCategoryId,
  })

  if (!menu || menu.length === 0) {
    return <p className="menu-page-info">{t.restaurantMenu.menuNoItems}</p>
  }

  const handleCategoryClick = (categoryId: number) => {
    setActiveCategoryId(activeCategoryId === categoryId ? null : categoryId)
  }

  // Función para obtener el nombre traducido del producto
  const getProductName = (product: ProductResponseDTO) => {
    const translation = product.translations?.find((t) => t.languageCode === lang)
    return translation?.name || product.name
  }

  // Función para obtener la descripción traducida del producto
  const getProductDescription = (product: ProductResponseDTO) => {
    const translation = product.translations?.find((t) => t.languageCode === lang)
    return translation?.description || product.description
  }

  // Función para obtener la descripción traducida de la variante
  const getVariantDescription = (variant: ProductVariantResponseDTO) => {
    const translation = variant.translations?.find(
      (t: ProductVariantTranslationResponseDTO) => t.languageCode === lang
    )
    return translation?.variantDescription || variant.variantDescription
  }

  return (
    <div className="app-container">
      <nav className="category-nav-container">
        {menu.map((category) => (
          <div key={category.categoryId} className="category-nav-item">
            <CategoryImage categoryId={category.categoryId} alt={category.name} className="mb-2" />
            <button
              onClick={() => handleCategoryClick(category.categoryId)}
              className={`category-nav-button ${activeCategoryId === category.categoryId ? 'active' : ''}`}
            >
              {category.name}
            </button>
          </div>
        ))}
      </nav>

      <div className="pt-6">
        {activeCategory && activeCategory.products.length > 0 ? (
          <div className="products-grid">
            {activeCategory.products.map((product) => (
              <article key={product.productId} className="product-card">
                <ProductImage
                  productId={product.productId}
                  alt={getProductName(product)}
                  className="product-image"
                />
                <div className="product-info">
                  <h3 className="product-name">{getProductName(product)}</h3>
                  <p className="product-description">{getProductDescription(product)}</p>

                  {/* Mostrar alérgenos debajo de la descripción */}
                  {product.allergens && product.allergens.length > 0 && (
                    <div className="product-allergens-container">
                      <AllergenDisplay
                        allergens={product.allergens}
                        lang={lang}
                        className="product-allergens"
                      />
                    </div>
                  )}

                  {/* Mostrar todas las variantes al final */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="product-variants">
                      {product.variants.map((variant) => (
                        <div key={variant.variantId} className="variant-option">
                          <div className="variant-info">
                            <span className="variant-description">
                              {getVariantDescription(variant)}
                            </span>
                            <span className="variant-price">{variant.price.toFixed(2)}€</span>
                          </div>
                          <QuantitySelector product={product} variant={variant} lang={lang} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="menu-page-info">{t.restaurantMenu.menuNoProductsInCategory}</p>
        )}
      </div>
    </div>
  )
}
