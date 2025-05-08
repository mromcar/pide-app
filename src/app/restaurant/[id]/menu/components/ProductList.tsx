import { Product, Allergen, ProductVariant } from '@/types/menu'

interface ProductListProps {
    products: Product[]
    onSelectProduct: (product: Product) => void
    handleChange: (variantId: number, delta: number) => void
    order: { [variantId: number]: number }
    language: string
}

export default function ProductList({ products, onSelectProduct, handleChange, order, language }: ProductListProps) {
    return (
        <div className="flex flex-wrap justify-center gap-4">
            {products.map((product) => (
                <div key={product.product_id} className="cardMinimalista">
                    {product.image_url && (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                    )}
                    <h3 className="cardTitle">{product.name}</h3>
                    <p className="cardDescription">{product.description}</p>
                    {product.variants.map((variant) => (
                        <div key={variant.variant_id} className="flex justify-between items-center mb-2">
                            <span className="text-gray-700">{variant.variant_description}</span>
                            <span className="cardPrice">{variant.price.toString()} €</span>
                        </div>
                    ))}
                    <button
                        className="btnMinimalista mt-4"
                        onClick={() => onSelectProduct(product)}
                    >
                        Ver detalles
                    </button>
                </div>
            ))}
        </div>
    )
}
