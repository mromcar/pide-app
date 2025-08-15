'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { LanguageCode } from '@/constants/languages'
import type { ProductVariantResponseDTO } from '@/types/dtos/productVariant'

interface VariantModalProps {
  variant: ProductVariantResponseDTO | null
  productId: number
  establishmentId: string
  languageCode: LanguageCode
  onClose: () => void
  onSave: () => void
}

export function VariantModal({
  variant,
  productId,
  establishmentId,
  languageCode,
  onClose,
  onSave,
}: VariantModalProps) {
  const { t } = useTranslation(languageCode)
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
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error saving variant')
      }
    } catch (error) {
      console.error('Error saving variant:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener el placeholder traducido
  const getPlaceholder = () => {
    switch (languageCode) {
      case 'es':
        return 'Ej: Ración normal, Media ración, Pequeña...'
      case 'fr':
        return 'Ex: Portion normale, Demi-portion, Petite...'
      default:
        return 'Ex: Normal portion, Half portion, Small...'
    }
  }

  // Función para obtener el texto de ayuda traducido
  const getHelpText = () => {
    switch (languageCode) {
      case 'es':
        return 'Las variantes inactivas no aparecerán en el menú público'
      case 'fr':
        return "Les variantes inactives n'apparaîtront pas dans le menu public"
      default:
        return 'Inactive variants will not appear in the public menu'
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal modal-sm">
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h3>
              {isEditing
                ? t.establishmentAdmin.menuManagement.variants.edit
                : t.establishmentAdmin.menuManagement.variants.addNew}
            </h3>
            <button type="button" onClick={onClose} className="modal-close">
              ✕
            </button>
          </div>

          <div className="modal-body">
            <div className="form-field">
              <label htmlFor="variantDescription">
                {t.establishmentAdmin.menuManagement.variants.description}
              </label>
              <input
                id="variantDescription"
                type="text"
                value={formData.variantDescription}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, variantDescription: e.target.value }))
                }
                className="form-input"
                required
                placeholder={getPlaceholder()}
              />
            </div>

            <div className="form-field">
              <label htmlFor="price">{t.establishmentAdmin.menuManagement.variants.price}</label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                className="form-input"
                required
                placeholder="0.00"
              />
            </div>

            <div className="form-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
                {t.establishmentAdmin.menuManagement.variants.active}
              </label>
              <small className="form-help-text">{getHelpText()}</small>
            </div>
          </div>

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
                ? t.establishmentAdmin.menuManagement.variants.saving
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
