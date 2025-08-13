'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { LanguageCode } from '@/constants/languages'
import type { CategoryDTO } from '@/types/dtos/category'
import type { ProductResponseDTO } from '@/types/dtos/product'
import type { AllergenResponseDTO } from '@/types/dtos/allergen'
import type { ProductVariantResponseDTO } from '@/types/dtos/productVariant'
import { ProductModal } from './ProductModal'

// Extender ProductVariantResponseDTO para incluir variantDescription
interface ProductVariantWithDescription extends ProductVariantResponseDTO {
  variantDescription: string
}

// Extender ProductResponseDTO para usar las variantes con descripción
interface ProductWithVariantDescriptions extends Omit<ProductResponseDTO, 'variants'> {
  variants?: ProductVariantWithDescription[]
}

interface ProductManagementProps {
  establishmentId: string
  languageCode: LanguageCode
  categories: CategoryDTO[]
  selectedCategoryId: number | null
  onSelectCategory: (categoryId: number) => void
  allergens: AllergenResponseDTO[]
}

export function ProductManagement({
  establishmentId,
  languageCode,
  categories,
  selectedCategoryId,
  onSelectCategory,
  allergens,
}: ProductManagementProps) {
  const { t } = useTranslation(languageCode)
  const [products, setProducts] = useState<ProductWithVariantDescriptions[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductWithVariantDescriptions | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const selectedCategory = categories.find((c) => c.categoryId === selectedCategoryId)

  // Fetch products for selected category
  const fetchProducts = useCallback(async () => {
    if (!selectedCategoryId) return

    try {
      setLoading(true)
      const response = await fetch(
        `/api/restaurants/${establishmentId}/menu/products?categoryId=${selectedCategoryId}`
      )
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }, [establishmentId, selectedCategoryId])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleAddProduct = () => {
    setEditingProduct(null)
    setShowModal(true)
  }

  const handleEditProduct = (product: ProductWithVariantDescriptions) => {
    setEditingProduct(product)
    setShowModal(true)
  }

  const handleDeleteProduct = async (productId: number) => {
    try {
      const response = await fetch(
        `/api/restaurants/${establishmentId}/menu/products/${productId}`,
        { method: 'DELETE' }
      )
      if (response.ok) {
        await fetchProducts()
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const handleModalSave = async () => {
    await fetchProducts()
    setShowModal(false)
    setEditingProduct(null)
  }

  return (
    <div className="product-management">
      {/* Category Sidebar */}
      <div className="management-layout">
        <aside className="management-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">
              {t.establishmentAdmin.menuManagement.categories.title}
            </h3>
            <div className="category-list">
              {categories.map((category) => (
                <button
                  key={category.categoryId}
                  onClick={() => onSelectCategory(category.categoryId)}
                  className={`category-item ${
                    selectedCategoryId === category.categoryId ? 'active' : ''
                  }`}
                >
                  <div className="category-info">
                    <span className="category-name">{category.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Content */}
        <main className="management-content">
          {selectedCategory ? (
            <div className="products-section">
              {/* Category Header */}
              <div className="section-header">
                <div>
                  <h3>{selectedCategory.name}</h3>
                  <p className="section-subtitle">
                    {products.length}{' '}
                    {t.establishmentAdmin.menuManagement.products.title.toLowerCase()}
                  </p>
                </div>
                <button onClick={handleAddProduct} className="btn btn-primary">
                  <span>➕</span>
                  {t.establishmentAdmin.menuManagement.products.addNew}
                </button>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="loading-state">Cargando productos...</div>
              ) : products.length > 0 ? (
                <div className="products-grid">
                  {products.map((product) => (
                    <ProductCard
                      key={product.productId}
                      product={product}
                      allergens={allergens}
                      onEdit={() => handleEditProduct(product)}
                      onDelete={() => setDeleteConfirm(product.productId)}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No hay productos en esta categoría</p>
                  <button onClick={handleAddProduct} className="btn btn-secondary">
                    Añadir primer producto
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="no-selection">
              <h3>Selecciona una categoría</h3>
              <p>Elige una categoría para ver y gestionar sus productos.</p>
            </div>
          )}
        </main>
      </div>

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          product={editingProduct as ProductResponseDTO | null}
          categories={categories}
          allergens={allergens}
          establishmentId={establishmentId}
          languageCode={languageCode}
          onClose={() => setShowModal(false)}
          onSave={handleModalSave}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal modal-sm">
            <h3>{t.establishmentAdmin.menuManagement.products.confirmDelete}</h3>
            <p>{t.establishmentAdmin.menuManagement.products.deleteMessage}</p>
            <div className="modal-actions">
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-secondary">
                {t.establishmentAdmin.menuManagement.categories.cancel}
              </button>
              <button onClick={() => handleDeleteProduct(deleteConfirm)} className="btn btn-danger">
                {t.establishmentAdmin.menuManagement.categories.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Product Card Component
interface ProductCardProps {
  product: ProductWithVariantDescriptions
  allergens: AllergenResponseDTO[]
  onEdit: () => void
  onDelete: () => void
}

function ProductCard({ product, allergens, onEdit, onDelete }: ProductCardProps) {
  // Helper function to get allergen details by ID
  const getAllergenById = (allergenId: number) => {
    return allergens.find((allergen) => allergen.allergenId === allergenId)
  }

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img
          src={`/images/products/${product.productId}.jpg`}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      </div>
      <div className="product-info">
        <h4 className="product-name">{product.name}</h4>
        <p className="product-description">{product.description}</p>

        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="product-variants">
            {product.variants.map((variant) => (
              <div key={variant.variantId} className="variant-item">
                <span className="variant-description">
                  {variant.variantDescription || `Variante ${variant.variantId}`}
                </span>
                <span className="variant-price">{variant.price}€</span>
              </div>
            ))}
          </div>
        )}

        {/* Allergens */}
        <div className="product-allergens">
          <span className="allergens-label">Alérgenos:</span>
          <div className="allergens-list">
            {product.allergens && product.allergens.length > 0 ? (
              product.allergens.map((productAllergen) => {
                const allergen = getAllergenById(productAllergen.allergenId)
                return allergen ? (
                  <span
                    key={productAllergen.allergenId}
                    className="allergen-item"
                    title={allergen.name}
                  >
                    {/* Usar iconUrl si existe, si no mostrar el código del alérgeno */}
                    {allergen.iconUrl ? (
                      <img
                        src={allergen.iconUrl}
                        alt={allergen.name}
                        className="allergen-icon-img"
                        style={{ width: '16px', height: '16px' }}
                      />
                    ) : (
                      <span className="allergen-code">{allergen.code}</span>
                    )}
                  </span>
                ) : null
              })
            ) : (
              <span className="no-allergens">Ninguno</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="product-actions">
          <button onClick={onEdit} className="btn btn-sm btn-secondary">
            ✏️ Editar
          </button>
          <button onClick={onDelete} className="btn btn-sm btn-danger">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
