// src/app/restaurant/[id]/menu/components/ProductModal.tsx
import { SerializedProduct } from '@/types/menu' // Usa SerializedProduct
import { uiTranslations } from '@/translations/ui'
import type { LanguageCode } from '@/constants/languages'
// import { useTranslation } from '@/hooks/useTranslation'; // Si lo tienes, úsalo. Si no, usa uiTranslations directamente.
import {
  modalOverlayClasses,
  modalContentClasses,
  btnFinalizarPedidoClasses,
  varianteClasses,
} from '@/utils/tailwind'

interface ProductModalProps {
  product: SerializedProduct // Ahora recibe SerializedProduct
  onClose: () => void
  handleChange: (variantId: number, delta: number) => void
  order: { [variantId: number]: number } // El objeto 'order' ahora viene de Zustand
  finishOrder: () => void // Ya no es async en este nivel del componente
  total: number
  language: LanguageCode
}

export function ProductModal({
  language,
  product,
  onClose,
  handleChange,
  order,
  finishOrder,
  total,
}: ProductModalProps) {
  // const t = useTranslation(language); // Si usas un hook useTranslation
  const t = uiTranslations[language] // Si accedes a las traducciones directamente

  // Las traducciones del producto y la variante ya deben venir aplicadas por el serializador
  const name = product.name
  const description = product.description

  return (
    <div className={modalOverlayClasses}>
      <div className={modalContentClasses}>
        <button className="mb-4 text-blue-600" onClick={onClose}>
          ← {t.backToCategories} {/* Usa traducción */}
        </button>
        {product.image_url && (
          <img
            src={product.image_url}
            alt={name}
            className="w-full h-48 object-cover rounded-xl mb-4"
          />
        )}
        <h2 className="text-xl font-bold mb-2">{name}</h2>
        {description && <p className="mb-2 text-gray-600">{description}</p>}

        {/* Product Variants */}
        <div className="space-y-4 mb-6">
          {product.variants.map((variant) => {
            // La descripción de la variante ya debe venir traducida del serializador
            const variantDesc = variant.variant_description
            const quantity = order[variant.variant_id] || 0

            return (
              <div key={variant.variant_id} className={varianteClasses}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">{variantDesc}</span>
                  <span className="font-semibold">{variant.price.toFixed(2)} €</span>{' '}
                  {/* Formatear precio */}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => handleChange(variant.variant_id, -1)}
                  >
                    −
                  </button>
                  <span className="w-8 text-center">{quantity}</span>
                  <button
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => handleChange(variant.variant_id, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex justify-between items-center">
          <span className="font-semibold text-lg">
            {t.total}: {total.toFixed(2)} €
          </span>{' '}
          {/* Usa traducción */}
          <button
            className={btnFinalizarPedidoClasses}
            disabled={total === 0}
            onClick={finishOrder}
          >
            {t.finishOrder} {/* Usa traducción */}
          </button>
        </div>
      </div>
    </div>
  )
}
