'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { CategoryManagement } from './CategoryManagement'
import { ProductManagement } from './ProductManagement'
import { VariantManagement } from './VariantManagement'
import type { MenuManagementProps } from '@/types/management'
import type { CategoryDTO } from '@/types/dtos/category'
import type { AllergenResponseDTO } from '@/types/dtos/allergen'

export function MenuManagement({ establishmentId, languageCode }: MenuManagementProps) {
  const { t } = useTranslation(languageCode)
  const [categories, setCategories] = useState<CategoryDTO[]>([])
  const [allergens, setAllergens] = useState<AllergenResponseDTO[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/admin/establishments/${establishmentId}/menu/categories`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      const arr = Array.isArray(data.categories) ? data.categories : []
      setCategories(arr)
      if (arr.length && !selectedCategoryId) setSelectedCategoryId(arr[0].categoryId)
    } catch {
      setError(t.establishmentAdmin.messages.error.loadingFailed)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [establishmentId, selectedCategoryId, t])

  const fetchAllergens = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/establishments/${establishmentId}/menu/allergens`)
      const data = res.ok ? await res.json() : { allergens: [] }
      setAllergens(Array.isArray(data.allergens) ? data.allergens : [])
    } catch {
      setAllergens([])
    }
  }, [establishmentId])

  useEffect(() => {
    fetchCategories()
    fetchAllergens()
  }, [fetchCategories, fetchAllergens])

  const handleCategoriesChange = (list: CategoryDTO[]) => {
    setCategories(list)
    if (!list.length) setSelectedCategoryId(null)
    else if (!selectedCategoryId) setSelectedCategoryId(list[0].categoryId)
  }

  if (loading) {
    return (
      <div className="menu-management-loading">
        <div className="establishment-admin-loading-content">
          <div className="establishment-admin-spinner"></div>
          <p className="establishment-admin-loading-text">{t.establishmentAdmin.forms.loading}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="menu-management-error">
        <div className="error-content">
          <h3>{t.establishmentAdmin.messages.error.title}</h3>
          <p>{error}</p>
          <button
            onClick={() => {
              fetchCategories()
              fetchAllergens()
            }}
            className="btn btn-primary"
          >
            {t.establishmentAdmin.forms.retry}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="menu-studio-grid">
      <section className="menu-pane">
        <h3 className="menu-pane-title">{t.establishmentAdmin.menuManagement.categories.title}</h3>
        <CategoryManagement
          establishmentId={establishmentId}
          languageCode={languageCode}
          categories={categories}
          onCategoriesChange={handleCategoriesChange}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
      </section>

      <section className="menu-pane">
        <h3 className="menu-pane-title">{t.establishmentAdmin.menuManagement.products.title}</h3>
        <ProductManagement
          establishmentId={establishmentId}
          languageCode={languageCode}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          allergens={allergens}
        />
      </section>

      <section className="menu-pane">
        <h3 className="menu-pane-title">{t.establishmentAdmin.menuManagement.variants.title}</h3>
        <VariantManagement
          establishmentId={establishmentId}
          languageCode={languageCode}
          categories={categories}
        />
      </section>
    </div>
  )
}
