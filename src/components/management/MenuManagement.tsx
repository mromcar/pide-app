'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { CategoryManagement } from './CategoryManagement'
import { ProductManagement } from './ProductManagement'
import { VariantManagement } from './VariantManagement'
import type { LanguageCode } from '@/constants/languages'
import type { CategoryDTO } from '@/types/dtos/category'
import type { AllergenResponseDTO } from '@/types/dtos/allergen'

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
  const [categories, setCategories] = useState<CategoryDTO[]>([])
  const [allergens, setAllergens] = useState<AllergenResponseDTO[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  // ✅ SOLO AGREGAR: Estado de error
  const [error, setError] = useState<string | null>(null)

  // Fetch categories - MANTENER TU CÓDIGO + agregar error handling
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      // ✅ AGREGAR: Reset error
      setError(null)
      console.log('🔍 MenuManagement: Fetching categories for establishment:', establishmentId)

      const response = await fetch(`/api/admin/establishments/${establishmentId}/menu/categories`)
      console.log('📊 MenuManagement: Categories response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ MenuManagement: Categories data received:', data)
        console.log(
          '📝 MenuManagement: Data structure:',
          'hasCategories:',
          !!data.categories,
          'Length:',
          data.categories?.length
        )

        const categoriesArray = Array.isArray(data.categories) ? data.categories : []
        setCategories(categoriesArray)
        console.log('🎯 MenuManagement: Categories state will be set to:', categoriesArray)

        if (categoriesArray.length > 0 && !selectedCategoryId) {
          console.log(
            '🎯 MenuManagement: Setting first category as selected:',
            categoriesArray[0].categoryId
          )
          setSelectedCategoryId(categoriesArray[0].categoryId)
        }
      } else {
        console.error('❌ MenuManagement: Failed to fetch categories, status:', response.status)
        const errorText = await response.text()
        console.error('❌ MenuManagement: Error response:', errorText)
        // ✅ AGREGAR: Set error state
        setError(
          `${t.establishmentAdmin.messages.errors.loadingCategories || 'Error al cargar categorías'}: ${response.status}`
        )
        setCategories([])
      }
    } catch (error) {
      console.error('🚨 MenuManagement: Error fetching categories:', error)
      // ✅ AGREGAR: Set error state
      setError(
        error instanceof Error
          ? error.message
          : t.establishmentAdmin.messages.errors.loadingCategories || 'Error al cargar categorías'
      )
      setCategories([])
    } finally {
      setLoading(false)
      console.log('🏁 MenuManagement: Fetch categories completed')
    }
  }, [establishmentId, selectedCategoryId, t])

  // Fetch allergens - MANTENER TU CÓDIGO
  const fetchAllergens = useCallback(async () => {
    try {
      console.log('🔍 MenuManagement: Fetching allergens')
      const response = await fetch(`/api/admin/establishments/${establishmentId}/menu/allergens`)
      if (response.ok) {
        const data = await response.json()
        console.log('✅ MenuManagement: Allergens received:', data.allergens?.length || 0)
        setAllergens(Array.isArray(data.allergens) ? data.allergens : [])
      } else {
        console.log('⚠️ MenuManagement: Allergens request failed, continuing without them')
        setAllergens([])
      }
    } catch (error) {
      console.error('🚨 MenuManagement: Error fetching allergens:', error)
      setAllergens([])
    }
  }, [establishmentId])

  // MANTENER TU useEffect
  useEffect(() => {
    console.log('🚀 MenuManagement: useEffect triggered')
    fetchCategories()
    fetchAllergens()
  }, [fetchCategories, fetchAllergens])

  // MANTENER TU debug useEffect
  useEffect(() => {
    console.log('📈 MenuManagement: Categories state changed:', categories)
    console.log('📈 MenuManagement: Categories length:', categories.length)
  }, [categories])

  // MANTENER TU tabs
  const tabs = [
    { id: 'categories', name: t.establishmentAdmin.menuManagement.categories.title, icon: '📂' },
    { id: 'products', name: t.establishmentAdmin.menuManagement.products.title, icon: '🍽️' },
    { id: 'variants', name: t.establishmentAdmin.menuManagement.variants.title, icon: '🔧' },
  ]

  // MANTENER TUS handlers
  const handleTabChange = (tabId: string) => {
    console.log('🔄 MenuManagement: Tab changed to:', tabId)
    onTabChange?.(tabId)
  }

  const handleCategoriesChange = (newCategories: CategoryDTO[]) => {
    console.log('🔄 MenuManagement: Categories changed from child:', newCategories)
    setCategories(newCategories)
  }

  // ✅ AGREGAR: Handler de retry
  const handleRetry = () => {
    fetchCategories()
    fetchAllergens()
  }

  // MANTENER TU loading state
  if (loading) {
    console.log('⏳ MenuManagement: Rendering loading state')
    return (
      <div className="menu-management-loading">
        <div className="establishment-admin-loading-content">
          <div className="establishment-admin-spinner"></div>
          <p className="establishment-admin-loading-text">{t.establishmentAdmin.forms.loading}</p>
        </div>
      </div>
    )
  }

  // ✅ SOLO AGREGAR: Error state
  if (error) {
    return (
      <div className="menu-management-error">
        <div className="error-content">
          <h3>{t.establishmentAdmin.messages.errors.title || 'Error'}</h3>
          <p>{error}</p>
          <button onClick={handleRetry} className="btn btn-primary">
            {t.establishmentAdmin.messages.actions.retry || 'Reintentar'}
          </button>
        </div>
      </div>
    )
  }

  console.log(
    '🎨 MenuManagement: Rendering with categories:',
    categories.length,
    'activeTab:',
    activeTab
  )

  // MANTENER TODO TU RENDER
  return (
    <div className="menu-management">
      {/* Tabs - MANTENER TU CÓDIGO */}
      <div className="menu-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-name">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Content - MANTENER TU CÓDIGO */}
      <div className="menu-content">
        {activeTab === 'categories' && (
          <>
            {console.log(
              '🎨 MenuManagement: Rendering CategoryManagement with:',
              categories.length,
              'categories'
            )}
            <CategoryManagement
              establishmentId={establishmentId}
              languageCode={languageCode}
              categories={categories}
              onCategoriesChange={handleCategoriesChange}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
            />
          </>
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
  )
}
