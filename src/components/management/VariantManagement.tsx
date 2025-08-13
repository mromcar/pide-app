'use client'

import { useState, useEffect, useCallback } from 'react'
import type { LanguageCode } from '@/constants/languages'
import type { CategoryDTO } from '@/types/dtos/category'
import type { ProductResponseDTO } from '@/types/dtos/product'
import type { ProductVariantResponseDTO } from '@/types/dtos/productVariant'

interface VariantManagementProps {
  establishmentId: string
  languageCode: LanguageCode
  categories: CategoryDTO[]
}

export function VariantManagement({
  establishmentId,
  languageCode,
  categories,
}: VariantManagementProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    categories[0]?.categoryId || null
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
        setProducts(data)
        if (data.length > 0) {
          setSelectedProductId(data[0].productId)
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error)
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

  return (
    <div className="variant-management">
      <div className="management-layout">
        {/* Categories Sidebar */}
        <aside className="management-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Categorías</h3>
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
          {products.length > 0 && (
            <div className="sidebar-section">
              <h3 className="sidebar-title">Productos</h3>
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
                    {selectedProduct.variants?.length || 0} variantes
                  </p>
                </div>
                <button onClick={handleAddVariant} className="btn btn-primary">
                  <span>➕</span>
                  Añadir Variante
                </button>
              </div>

              {/* Variants List */}
              {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                <div className="variants-list">
                  {selectedProduct.variants.map((variant) => (
                    <VariantCard
                      key={variant.variantId}
                      variant={variant}
                      onEdit={() => handleEditVariant(variant)}
                      onDelete={() => handleDeleteVariant(variant.variantId)}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <h4>No hay variantes</h4>
                  <p>Añade variantes para ofrecer diferentes opciones de este producto.</p>
                  <button onClick={handleAddVariant} className="btn btn-secondary">
                    Añadir primera variante
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="no-selection">
              <h3>Selecciona un producto</h3>
              <p>Elige un producto para gestionar sus variantes.</p>
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

// Variant Card Component
interface VariantCardProps {
  variant: ProductVariantResponseDTO
  onEdit: () => void
  onDelete: () => void
}

function VariantCard({ variant, onEdit, onDelete }: VariantCardProps) {
  return (
    <div className="variant-card">
      <div className="variant-info">
        <h4 className="variant-description">{variant.variantDescription}</h4>
        <div className="variant-price">{variant.price}€</div>
      </div>
      <div className="variant-actions">
        <button onClick={onEdit} className="btn btn-sm btn-secondary">
          ✏️ Editar
        </button>
        <button onClick={onDelete} className="btn btn-sm btn-danger">
          🗑️ Eliminar
        </button>
      </div>
    </div>
  )
}

// Variant Modal Component
interface VariantModalProps {
  variant: ProductVariantResponseDTO | null
  productId: number
  establishmentId: string
  languageCode: LanguageCode
  onClose: () => void
  onSave: () => void
}

function VariantModal({ variant, productId, establishmentId, onClose, onSave }: VariantModalProps) {
  const isEditing = !!variant
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    variantDescription: variant?.variantDescription || '',
    price: variant?.price?.toString() || '',
    isActive: variant?.isActive ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      const variantData = {
        productId,
        establishmentId: parseInt(establishmentId),
        variantDescription: formData.variantDescription,
        price: parseFloat(formData.price),
        isActive: formData.isActive,
      }

      const url = isEditing
        ? `/api/restaurants/${establishmentId}/menu/variants/${variant.variantId}`
        : `/api/restaurants/${establishmentId}/menu/variants`

      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variantData),
      })

      if (response.ok) {
        onSave()
      } else {
        throw new Error('Error saving variant')
      }
    } catch (error) {
      console.error('Error saving variant:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal modal-sm">
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h3>{isEditing ? 'Editar Variante' : 'Nueva Variante'}</h3>
            <button type="button" onClick={onClose} className="modal-close">
              ✕
            </button>
          </div>

          <div className="modal-body">
            <div className="form-field">
              <label htmlFor="variantDescription">Descripción</label>
              <input
                id="variantDescription"
                type="text"
                value={formData.variantDescription}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, variantDescription: e.target.value }))
                }
                className="form-input"
                required
                placeholder="Ej: Ración normal, Media ración..."
              />
            </div>

            <div className="form-field">
              <label htmlFor="price">Precio (€)</label>
              <input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
                Variante activa
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
