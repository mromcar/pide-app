'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { LanguageCode } from '@/constants/languages'
import type { CategoryDTO } from '@/types/dtos/category'
import type { ProductResponseDTO } from '@/types/dtos/product'
import type { ProductVariantResponseDTO } from '@/types/dtos/productVariant'
import { VariantModal } from './VariantModal'

interface VariantManagementProps {
  establishmentId: string
  languageCode: LanguageCode
  categories: CategoryDTO[]
}

export function VariantManagement({
  establishmentId,
  languageCode,
  categories = [],
}: VariantManagementProps) {
  const { t } = useTranslation(languageCode)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    Array.isArray(categories) && categories.length > 0 ? categories[0].categoryId : null
  )
  const [products, setProducts] = useState<ProductResponseDTO[]>([])
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingVariant, setEditingVariant] = useState<ProductVariantResponseDTO | null>(null)

  const selectedProduct = products.find((p) => p.productId === selectedProductId)

  // Fetch products for selected category
  const fetchProducts = useCallback(async () => {
    if (!selectedCategoryId) return

    try {
      const response = await fetch(
        `/api/restaurants/${establishmentId}/menu/products?categoryId=${selectedCategoryId}`
      )
      if (response.ok) {
        const data = await response.json()
        setProducts(data || [])
        if (data && data.length > 0) {
          setSelectedProductId(data[0].productId)
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    }
  }, [establishmentId, selectedCategoryId])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleAddVariant = () => {
    setEditingVariant(null)
    setShowModal(true)
  }

  const handleEditVariant = (variant: ProductVariantResponseDTO) => {
    setEditingVariant(variant)
    setShowModal(true)
  }

  const handleDeleteVariant = async (variantId: number) => {
    try {
      const response = await fetch(
        `/api/restaurants/${establishmentId}/menu/variants/${variantId}`,
        { method: 'DELETE' }
      )
      if (response.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error('Error deleting variant:', error)
    }
  }

  // Verificar si no hay categorías
  if (!Array.isArray(categories) || categories.length === 0) {
    return (
      <div className="variant-management">
        <div className="no-categories-state">
          <div className="empty-icon">📂</div>
          <h3>{t.establishmentAdmin.messages.emptyStates.noCategories}</h3>
          <p>{t.establishmentAdmin.messages.emptyStates.noCategoriesDesc}</p>
          <div className="empty-actions">
            <p className="helper-text">{t.establishmentAdmin.messages.emptyStates.helperText}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="variant-management">
      <div className="management-layout">
        {/* Categories Sidebar */}
        <aside className="management-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">
              {t.establishmentAdmin.menuManagement.categories.title}
            </h3>
            <div className="category-list">
              {categories.map((category) => (
                <button
                  key={category.categoryId}
                  onClick={() => setSelectedCategoryId(category.categoryId)}
                  className={`category-item ${
                    selectedCategoryId === category.categoryId ? 'active' : ''
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products List */}
          {products.length > 0 ? (
            <div className="sidebar-section">
              <h3 className="sidebar-title">
                {t.establishmentAdmin.menuManagement.products.title}
              </h3>
              <div className="product-list">
                {products.map((product) => (
                  <button
                    key={product.productId}
                    onClick={() => setSelectedProductId(product.productId)}
                    className={`product-item ${
                      selectedProductId === product.productId ? 'active' : ''
                    }`}
                  >
                    {product.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            selectedCategoryId && (
              <div className="sidebar-section">
                <div className="no-products-message">
                  <p>📝 {t.establishmentAdmin.messages.emptyStates.noProducts}</p>
                  <small>{t.establishmentAdmin.messages.emptyStates.noProductsDesc}</small>
                </div>
              </div>
            )
          )}
        </aside>

        {/* Variants Content */}
        <main className="management-content">
          {selectedProduct ? (
            <div className="variants-section">
              {/* Product Header */}
              <div className="section-header">
                <div>
                  <h3>{selectedProduct.name}</h3>
                  <p className="section-subtitle">
                    {selectedProduct.variants?.length || 0}{' '}
                    {t.establishmentAdmin.menuManagement.variants.title.toLowerCase()}
                  </p>
                </div>
                <button onClick={handleAddVariant} className="btn btn-primary">
                  <span>➕</span>
                  {t.establishmentAdmin.menuManagement.variants.addNew}
                </button>
              </div>

              {/* Variants List */}
              {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                <div className="variants-list">
                  {selectedProduct.variants.map((variant) => (
                    <VariantCard
                      key={variant.variantId}
                      variant={variant}
                      languageCode={languageCode}
                      onEdit={() => handleEditVariant(variant)}
                      onDelete={() => handleDeleteVariant(variant.variantId)}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🔧</div>
                  <h4>{t.establishmentAdmin.messages.emptyStates.noVariants}</h4>
                  <p>{t.establishmentAdmin.messages.emptyStates.noVariantsDesc}</p>
                  <button onClick={handleAddVariant} className="btn btn-secondary">
                    {t.establishmentAdmin.messages.emptyStates.addFirstVariant}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="no-selection">
              <div className="empty-icon">{products.length === 0 ? '🍽️' : '👈'}</div>
              <h3>
                {products.length === 0
                  ? t.establishmentAdmin.messages.emptyStates.noProducts
                  : t.establishmentAdmin.messages.emptyStates.selectProduct}
              </h3>
              <p>
                {products.length === 0
                  ? t.establishmentAdmin.messages.emptyStates.noProductsDesc
                  : t.establishmentAdmin.messages.emptyStates.selectProductDesc}
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Variant Modal */}
      {showModal && selectedProduct && (
        <VariantModal
          variant={editingVariant}
          productId={selectedProduct.productId}
          establishmentId={establishmentId}
          languageCode={languageCode}
          onClose={() => setShowModal(false)}
          onSave={() => {
            fetchProducts()
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}

// VariantCard Component
interface VariantCardProps {
  variant: ProductVariantResponseDTO
  languageCode: LanguageCode
  onEdit: () => void
  onDelete: () => void
}

function VariantCard({ variant, languageCode, onEdit, onDelete }: VariantCardProps) {
  const { t } = useTranslation(languageCode)

  return (
    <div className="variant-card">
      <div className="variant-info">
        <h4 className="variant-description">{variant.variantDescription}</h4>
        <div className="variant-price">{variant.price}€</div>
      </div>
      <div className="variant-actions">
        <button onClick={onEdit} className="btn btn-sm btn-secondary">
          ✏️ {t.establishmentAdmin.forms.edit}
        </button>
        <button onClick={onDelete} className="btn btn-sm btn-danger">
          🗑️ {t.establishmentAdmin.forms.delete}
        </button>
      </div>
    </div>
  )
}
