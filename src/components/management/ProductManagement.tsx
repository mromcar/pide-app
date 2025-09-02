'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { LanguageCode } from '@/constants/languages'
import type { CategoryDTO } from '@/types/dtos/category'
import type { ProductResponseDTO } from '@/types/dtos/product'
import type { AllergenResponseDTO } from '@/types/dtos/allergen'
import type { ProductVariantResponseDTO } from '@/types/dtos/productVariant'
import { ProductModal } from './ProductModal'

interface ProductVariantWithDescription extends ProductVariantResponseDTO {
  variantDescription: string
}

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
  categories = [],
  selectedCategoryId,
  onSelectCategory,
  allergens = [],
}: ProductManagementProps) {
  const { t } = useTranslation(languageCode)
  const [products, setProducts] = useState<ProductWithVariantDescriptions[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductWithVariantDescriptions | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const selectedCategory = Array.isArray(categories)
    ? categories.find((c) => c.categoryId === selectedCategoryId)
    : null

  // Fetch products for selected category
  const fetchProducts = useCallback(async () => {
    if (!selectedCategoryId) return

    try {
      setLoading(true)
      console.log('🔍 ProductManagement: Fetching products for category:', selectedCategoryId)

      // ✅ MIGRACIÓN: Cambiar a API admin
      const response = await fetch(
        `/api/admin/establishments/${establishmentId}/menu/products?categoryId=${selectedCategoryId}`
      )
      console.log('📊 ProductManagement: Products response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ ProductManagement: Products data received:', data)

        // ✅ CORRECCIÓN: Extraer products del response de la nueva API
        const productsArray = Array.isArray(data.products) ? data.products : []
        setProducts(productsArray)
        console.log('🎯 ProductManagement: Products state will be set to:', productsArray)
      } else {
        console.error('❌ ProductManagement: Failed to fetch products, status:', response.status)
        const errorText = await response.text()
        console.error('❌ ProductManagement: Error response:', errorText)
        setProducts([])
      }
    } catch (error) {
      console.error('🚨 ProductManagement: Error fetching products:', error)
      setProducts([])
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
      console.log('🗑️ ProductManagement: Deleting product:', productId)

      // ✅ MIGRACIÓN: Cambiar a API admin
      const response = await fetch(
        `/api/admin/establishments/${establishmentId}/menu/products/${productId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        console.log('✅ ProductManagement: Product deleted successfully')
        await fetchProducts()
        setDeleteConfirm(null)
      } else {
        console.error('❌ ProductManagement: Failed to delete product, status:', response.status)
      }
    } catch (error) {
      console.error('🚨 ProductManagement: Error deleting product:', error)
    }
  }

  const handleModalSave = async () => {
    await fetchProducts()
    setShowModal(false)
    setEditingProduct(null)
  }

  if (!Array.isArray(categories) || categories.length === 0) {
    return (
      <div className="product-management">
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
    <div className="product-management">
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

        <main className="management-content">
          {selectedCategory ? (
            <div className="products-section">
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

              {loading ? (
                <div className="loading-state">{t.establishmentAdmin.forms.loading}</div>
              ) : products.length > 0 ? (
                <div className="products-grid">
                  {products.map((product) => (
                    <ProductCard
                      key={product.productId}
                      product={product}
                      allergens={allergens}
                      languageCode={languageCode}
                      onEdit={() => handleEditProduct(product)}
                      onDelete={() => setDeleteConfirm(product.productId)}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🍽️</div>
                  <h4>{t.establishmentAdmin.messages.emptyStates.noProducts}</h4>
                  <p>{t.establishmentAdmin.messages.emptyStates.noProductsDesc}</p>
                  <button onClick={handleAddProduct} className="btn btn-secondary">
                    {t.establishmentAdmin.messages.emptyStates.addFirstProduct}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="no-selection">
              <div className="empty-icon">👈</div>
              <h3>{t.establishmentAdmin.messages.emptyStates.selectCategory}</h3>
              <p>{t.establishmentAdmin.messages.emptyStates.selectCategoryDesc}</p>
            </div>
          )}
        </main>
      </div>

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

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal modal-sm">
            <div className="modal-header">
              <h3>{t.establishmentAdmin.menuManagement.products.confirmDelete}</h3>
              <button onClick={() => setDeleteConfirm(null)} className="modal-close">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>{t.establishmentAdmin.menuManagement.products.deleteMessage}</p>
            </div>
            <div className="modal-footer">
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

// ProductCard Component - sin cambios en URLs
function ProductCard({ product, allergens, languageCode, onEdit, onDelete }: ProductCardProps) {
  const { t } = useTranslation(languageCode)

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
                  {variant.variantDescription ||
                    `${t.establishmentAdmin.menuManagement.products.variantNumber} ${variant.variantId}`}
                </span>
                <span className="variant-price">{variant.price}€</span>
              </div>
            ))}
          </div>
        )}

        {/* Allergens */}
        <div className="product-allergens">
          <span className="allergens-label">
            {t.establishmentAdmin.menuManagement.products.allergensLabel}
          </span>
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
              <span className="no-allergens">
                {t.establishmentAdmin.menuManagement.products.noAllergens}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="product-actions">
          <button onClick={onEdit} className="btn btn-sm btn-secondary">
            ✏️ {t.establishmentAdmin.forms.edit}
          </button>
          <button onClick={onDelete} className="btn btn-sm btn-danger">
            🗑️ {t.establishmentAdmin.forms.delete}
          </button>
        </div>
      </div>
    </div>
  )
}

// Interface para ProductCard
interface ProductCardProps {
  product: ProductWithVariantDescriptions
  allergens: AllergenResponseDTO[]
  languageCode: LanguageCode
  onEdit: () => void
  onDelete: () => void
}
