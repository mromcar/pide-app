import { Product, ProductVariant } from '@/types/menu'
import { uiTranslations } from '@/translations/ui'
import type { LanguageCode } from '@/constants/languages'
import { useTranslation } from '@/hooks/useTranslation'
import {
    modalOverlayClasses,
    modalContentClasses,
    btnFinalizarPedidoClasses,
    varianteClasses,
} from '@/utils/tailwind'

interface ProductModalProps {
    product: Product
    onClose: () => void
    handleChange: (variantId: number, delta: number) => void
    order: { [variantId: number]: number }
    finishOrder: () => void
    total: number
    language: LanguageCode
}

export function ProductModal({ language, product, onClose, handleChange, order, finishOrder, total }: ProductModalProps) {
    const t = useTranslation(language)
    const translation = product.translations?.find((t) => t.language_code === language)
    const name = translation?.name || product.name
    const description = translation?.description || product.description

    return (
        <div className={modalOverlayClasses}>
            <div className={modalContentClasses}>
                <button className="mb-4 text-blue-600" onClick={onClose}>
                    {t.backToCategories}
                </button>
                {product.image_url && (
                    <img
                        src={`/images/${product.image_url}`}
                        alt={name}
                        className="w-full h-48 object-cover rounded-xl mb-4"
                    />
                )}
                <h2 className="text-xl font-bold mb-2">{name}</h2>
                {description && <p className="mb-2 text-gray-600">{description}</p>}

                {/* Product Variants */}
                <div className="space-y-4 mb-6">
                    {product.variants.map((variant) => {
                        const variantTranslation = variant.translations?.find(
                            (t) => t.language_code === language
                        )
                        const variantDesc =
                            variantTranslation?.variant_description || variant.variant_description
                        const quantity = order[variant.variant_id] || 0

                        return (
                            <div key={variant.variant_id} className={varianteClasses}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-700">{variantDesc}</span>
                                    <span className="font-semibold">{variant.price.toString()} €</span>
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
                    <span className="font-semibold text-lg">Total: {total.toFixed(2)} €</span>
                    <button
                        className={btnFinalizarPedidoClasses}
                        disabled={total === 0}
                        onClick={finishOrder}
                    >
                        {t.finishOrder}
                    </button>
                </div>
            </div>
        </div>
    )
}

