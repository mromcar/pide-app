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
import QuantitySelector from './QuantitySelector'
import AllergenDisplay from './AllergenDisplay'

interface MenuCategoryWithProducts extends CategoryDTO {
  products: ProductResponseDTO[]
}

interface MenuDisplayProps {
  menu: MenuCategoryWithProducts[]
  lang: LanguageCode
}

export default function MenuDisplay({ menu, lang }: MenuDisplayProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(
    menu.length > 0 ? menu[0].category_id : null
  )
  const t = getTranslation(lang)
  const { addProduct } = useCart()

  const activeCategory = useMemo(
    () => menu.find((c) => c.category_id === activeCategoryId),
    [menu, activeCategoryId]
  )

  if (!menu || menu.length === 0) {
    return <p className="menu-page-info">{t.restaurantMenu.menuNoItems}</p>
  }

  const handleCategoryClick = (categoryId: number) => {
    setActiveCategoryId(activeCategoryId === categoryId ? null : categoryId)
  }

  // Función para obtener el nombre traducido del producto
  const getProductName = (product: ProductResponseDTO) => {
    const translation = product.translations?.find((t) => t.language_code === lang)
    return translation?.name || product.name
  }

  // Función para obtener la descripción traducida del producto
  const getProductDescription = (product: ProductResponseDTO) => {
    const translation = product.translations?.find((t) => t.language_code === lang)
    return translation?.description || product.description
  }

  // Función para obtener la descripción traducida de la variante
  const getVariantDescription = (variant: ProductVariantResponseDTO) => {
    const translation = variant.translations?.find(
      (t: ProductVariantTranslationResponseDTO) => t.language_code === lang
    )
    return translation?.variant_description || variant.variant_description
  }

  return (
    <div className="app-container">
      <nav className="category-nav-container">
        {menu.map((category) => (
          <div key={category.category_id} className="category-nav-item">
            <CategoryImage categoryId={category.category_id} alt={category.name} className="mb-2" />
            <button
              onClick={() => handleCategoryClick(category.category_id)}
              className={`category-nav-button ${activeCategoryId === category.category_id ? 'active' : ''}`}
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
              // En la sección de productos, ajustar el CSS para evitar espacios vacíos:
              <article key={product.product_id} className="product-card">
                <ProductImage
                  productId={product.product_id}
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
                        <div key={variant.variant_id} className="variant-option">
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
