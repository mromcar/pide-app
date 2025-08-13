'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { LanguageCode } from '@/constants/languages'
import type { CategoryDTO } from '@/types/dtos/category'
import type { AllergenResponseDTO } from '@/types/dtos/allergen'
import { CategoryManagement } from './CategoryManagement'
import { ProductManagement } from './ProductManagement'
import { VariantManagement } from './VariantManagement'

interface MenuManagementProps {
  establishmentId: string
  activeTab?: string
  onTabChange?: (tab: string) => void
  languageCode: LanguageCode
}

export function MenuManagement({
  establishmentId,
  activeTab = 'categories',
  onTabChange,
  languageCode,
}: MenuManagementProps) {
  const { t } = useTranslation(languageCode)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<CategoryDTO[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [allergens, setAllergens] = useState<AllergenResponseDTO[]>([])

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/restaurants/${establishmentId}/menu/categories`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
        if (data.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(data[0].categoryId)
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }, [establishmentId, selectedCategoryId])

  // Fetch allergens
  const fetchAllergens = useCallback(async () => {
    try {
      const response = await fetch(`/api/restaurants/${establishmentId}/menu/allergens`)
      if (response.ok) {
        const data = await response.json()
        setAllergens(data)
      }
    } catch (error) {
      console.error('Error fetching allergens:', error)
    }
  }, [establishmentId])

  useEffect(() => {
    fetchCategories()
    fetchAllergens()
  }, [fetchCategories, fetchAllergens])

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab)
  }

  const handleCategoriesChange = (newCategories: CategoryDTO[]) => {
    setCategories(newCategories)
  }

  if (loading) {
    return (
      <div className="menu-management-loading">{t.establishmentAdmin.establishment.loading}</div>
    )
  }

  return (
    <div className="menu-management">
      {/* Header */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="header-main">
            <div>
              <h1 className="admin-card-title">{t.establishmentAdmin.menuManagement.title}</h1>
              <p className="admin-card-subtitle">{t.establishmentAdmin.menuManagement.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="menu-tabs">
          <button
            className={`menu-tab ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => handleTabChange('categories')}
          >
            <span>📂</span>
            {t.establishmentAdmin.menuManagement.categories.title}
          </button>
          <button
            className={`menu-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => handleTabChange('products')}
          >
            <span>🍽️</span>
            {t.establishmentAdmin.menuManagement.products.title}
          </button>
          <button
            className={`menu-tab ${activeTab === 'variants' ? 'active' : ''}`}
            onClick={() => handleTabChange('variants')}
          >
            <span>🔧</span>
            {t.establishmentAdmin.menuManagement.variants.title}
          </button>
        </div>

        {/* Content */}
        <div className="menu-content">
          {activeTab === 'categories' && (
            <CategoryManagement
              establishmentId={establishmentId}
              languageCode={languageCode}
              categories={categories}
              onCategoriesChange={handleCategoriesChange}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
            />
          )}
          {activeTab === 'products' && (
            <ProductManagement
              establishmentId={establishmentId}
              languageCode={languageCode}
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
              allergens={allergens}
            />
          )}
          {activeTab === 'variants' && (
            <VariantManagement
              establishmentId={establishmentId}
              languageCode={languageCode}
              categories={categories}
            />
          )}
        </div>
      </div>
    </div>
  )
}
