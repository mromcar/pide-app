'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { LanguageCode } from '@/constants/languages'
import type { CategoryDTO } from '@/types/dtos/category'
import type { ProductResponseDTO } from '@/types/dtos/product'
import type { AllergenResponseDTO } from '@/types/dtos/allergen'
import type { ProductVariantResponseDTO } from '@/types/dtos/productVariant'

interface ProductModalProps {
  product: ProductResponseDTO | null
  categories: CategoryDTO[]
  allergens: AllergenResponseDTO[]
  establishmentId: string
  languageCode: LanguageCode
  onClose: () => void
  onSave: () => void
}

interface VariantForm {
  id?: number
  variantDescription: string
  price: string
}

// Extender ProductVariantResponseDTO para incluir variantDescription si no existe
interface ProductVariantWithDescription extends ProductVariantResponseDTO {
  variantDescription: string
}

export function ProductModal({
  product,
  categories,
  allergens,
  establishmentId,
  languageCode,
  onClose,
  onSave,
}: ProductModalProps) {
  const { t } = useTranslation(languageCode)
  const isEditing = !!product

  // Form state
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    categoryId: product?.categoryId || categories[0]?.categoryId || '',
    isActive: product?.isActive ?? true,
  })

  const [variants, setVariants] = useState<VariantForm[]>(
    product?.variants?.map((v) => {
      // Type assertion más específica
      const variantWithDescription = v as ProductVariantWithDescription
      return {
        id: v.variantId,
        variantDescription: variantWithDescription.variantDescription || '',
        price: v.price?.toString() || '',
      }
    }) || [{ variantDescription: '', price: '' }]
  )

  const [selectedAllergens, setSelectedAllergens] = useState<Set<number>>(
    new Set(product?.allergens?.map((a) => a.allergenId) || [])
  )

  const [loading, setLoading] = useState(false)

  // Tipo más específico para value
  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleVariantChange = (index: number, field: keyof VariantForm, value: string) => {
    setVariants((prev) =>
      prev.map((variant, i) => (i === index ? { ...variant, [field]: value } : variant))
    )
  }

  const addVariant = () => {
    setVariants((prev) => [...prev, { variantDescription: '', price: '' }])
  }

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const toggleAllergen = (allergenId: number) => {
    setSelectedAllergens((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(allergenId)) {
        newSet.delete(allergenId)
      } else {
        newSet.add(allergenId)
      }
      return newSet
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      const productData = {
        name: formData.name,
        description: formData.description,
        categoryId: Number(formData.categoryId),
        isActive: formData.isActive,
        variants: variants
          .filter((v) => v.variantDescription && v.price)
          .map((v) => ({
            ...(v.id && { variantId: v.id }),
            variantDescription: v.variantDescription,
            price: parseFloat(v.price),
          })),
        allergenIds: Array.from(selectedAllergens),
      }

      // ✅ MIGRACIÓN: Cambiar a API admin
      const url = isEditing
        ? `/api/admin/establishments/${establishmentId}/menu/products/${product.productId}`
        : `/api/admin/establishments/${establishmentId}/menu/products`

      const method = isEditing ? 'PUT' : 'POST'

      console.log('🔄 ProductModal: Submitting product data:', {
        method,
        url,
        productData,
        isEditing,
      })

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })

      console.log('📊 ProductModal: Response status:', response.status)

      if (response.ok) {
        const responseData = await response.json()
        console.log('✅ ProductModal: Product saved successfully:', responseData)
        onSave()
      } else {
        const errorText = await response.text()
        console.error('❌ ProductModal: Failed to save product:', response.status, errorText)
        throw new Error(`Error saving product: ${response.status}`)
      }
    } catch (error) {
      console.error('🚨 ProductModal: Error saving product:', error)
      // Aquí podrías mostrar un toast/notification de error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="modal-header">
            <h3>
              {isEditing
                ? t.establishmentAdmin.menuManagement.products.edit
                : t.establishmentAdmin.menuManagement.products.addNew}
            </h3>
            <button type="button" onClick={onClose} className="modal-close">
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="modal-body">
            {/* Basic Information */}
            <div className="form-section">
              <h4 className="section-title">Información Básica</h4>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="name">{t.establishmentAdmin.menuManagement.products.name}</label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="category">
                    {t.establishmentAdmin.menuManagement.products.category}
                  </label>
                  <select
                    id="category"
                    value={formData.categoryId}
                    onChange={(e) => handleInputChange('categoryId', e.target.value)}
                    className="form-select"
                    required
                  >
                    {categories.map((category) => (
                      <option key={category.categoryId} value={category.categoryId}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field form-field-full">
                  <label htmlFor="description">
                    {t.establishmentAdmin.menuManagement.products.description}
                  </label>
                  <textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="form-textarea"
                    rows={3}
                  />
                </div>

                <div className="form-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    />
                    {t.establishmentAdmin.menuManagement.products.active}
                  </label>
                </div>
              </div>
            </div>

            {/* Variants */}
            <div className="form-section">
              <h4 className="section-title">Variantes y Precios</h4>
              <div className="variants-container">
                {variants.map((variant, index) => (
                  <div key={index} className="variant-row">
                    <input
                      type="text"
                      placeholder="Descripción (ej: Ración normal)"
                      value={variant.variantDescription}
                      onChange={(e) =>
                        handleVariantChange(index, 'variantDescription', e.target.value)
                      }
                      className="form-input variant-description"
                    />
                    <input
                      type="number"
                      placeholder="Precio"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                      className="form-input variant-price"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="btn btn-sm btn-danger"
                      disabled={variants.length === 1}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addVariant} className="btn btn-sm btn-secondary">
                  ➕ Añadir variante
                </button>
              </div>
            </div>

            {/* Allergens */}
            <div className="form-section">
              <h4 className="section-title">Alérgenos</h4>
              <div className="allergens-grid">
                {allergens.map((allergen) => (
                  <button
                    key={allergen.allergenId}
                    type="button"
                    onClick={() => toggleAllergen(allergen.allergenId)}
                    className={`allergen-button ${
                      selectedAllergens.has(allergen.allergenId) ? 'selected' : ''
                    }`}
                  >
                    <span className="allergen-icon">
                      {allergen.iconUrl ? (
                        <img
                          src={allergen.iconUrl}
                          alt={allergen.name}
                          className="allergen-icon-img"
                          style={{ width: '20px', height: '20px' }}
                        />
                      ) : (
                        <span className="allergen-code">{allergen.code}</span>
                      )}
                    </span>
                    <span className="allergen-name">{allergen.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              {t.establishmentAdmin.menuManagement.categories.cancel}
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading
                ? 'Guardando...'
                : isEditing
                  ? t.establishmentAdmin.menuManagement.categories.update
                  : t.establishmentAdmin.menuManagement.categories.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
