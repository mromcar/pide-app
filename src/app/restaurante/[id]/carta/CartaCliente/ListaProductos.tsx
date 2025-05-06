import { Product, Allergen, ProductVariant } from '@/types/carta'
import {
  cardProductoClasses,
  productoNombreClasses,
  productoDescripcionClasses,
  productoPrecioClasses,
  contadorClasses,
  btnCantidadCompactoClasses,
  indicadorCantidadClasses,
  productoImgClasses,
  varianteClasses,
} from '@/utils/tailwind'

interface ListaProductosProps {
  products: Product[]
  onSelectProduct: (product: Product) => void
  handleChange: (variantId: number, delta: number) => void
  order: { [variantId: number]: number }
  language: string
}

export default function ListaProductos({
  products,
  onSelectProduct,
  handleChange,
  order,
  language,
}: ListaProductosProps) {
  console.log('ListaProductos debug:', {
    productsCount: products.length,
    productsDetails: products.map((p) => ({
      id: p.product_id,
      name: p.name,
      variantsCount: p.variants.length,
    })),
    language,
    orderKeys: Object.keys(order),
  })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-40">
      {products.map((product) => {
        const translation = product.translations?.find((t) => t.language_code === language)
        const name = translation?.name || product.name
        const description = translation?.description || product.description

        return (
          <div
            key={product.product_id}
            className={cardProductoClasses}
            onClick={() => onSelectProduct(product)}
          >
            {product.image_url && (
              <img src={`/images/${product.image_url}`} alt={name} className={productoImgClasses} />
            )}
            <div>
              <p className={productoNombreClasses}>{name}</p>
              {description && <p className={productoDescripcionClasses}>{description}</p>}

              {/* Alérgenos section */}
              {product.allergens && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-500">Alérgenos:</p>
                  <div className="flex gap-2">
                    {product.allergens.map((productAllergen) => {
                      const allergen = productAllergen.allergen
                      const translation = allergen.translations?.find(
                        (t) => t.language_code === language
                      )
                      const allergenName = translation?.name || allergen.name

                      return (
                        <div
                          key={allergen.allergen_id}
                          className="flex items-center gap-1 text-xs bg-yellow-100 px-2 py-1 rounded"
                        >
                          {allergen.icon_url && (
                            <img
                              src={allergen.icon_url}
                              alt={allergenName}
                              className="w-4 h-4"
                            />
                          )}
                          <span>{allergenName}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Variants section */}
              <div className="mt-3 space-y-2">
                {product.variants.map((variant) => {
                  const variantTranslation = variant.translations?.find(
                    (t) => t.language_code === language
                  )
                  const variantDesc =
                    variantTranslation?.variant_description || variant.variant_description
                  const quantity = order[variant.variant_id] || 0

                  return (
                    <div
                      key={variant.variant_id}
                      className={varianteClasses}
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium">{variantDesc}</span>
                          <span className={productoPrecioClasses}>{variant.price.toString()} €</span>
                        </div>
                        <div className={contadorClasses}>
                          <button
                            className={btnCantidadCompactoClasses}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleChange(variant.variant_id, -1)
                            }}
                            disabled={quantity === 0}
                          >
                            −
                          </button>
                          <span className={indicadorCantidadClasses}>{quantity}</span>
                          <button
                            className={btnCantidadCompactoClasses}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleChange(variant.variant_id, 1)
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
