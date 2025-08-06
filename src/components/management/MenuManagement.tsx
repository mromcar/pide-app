'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { CategoryManagement } from '@/components/management/CategoryManagement'
import { ProductManagement } from '@/components/management/ProductManagement'
import { VariantManagement } from '@/components/management/VariantManagement'
import { LanguageCode } from '@/constants/languages'

interface MenuManagementProps {
  establishment_id: string
  active_tab: string
  on_tab_change: (tab: string) => void
  language_code: LanguageCode
}

export function MenuManagement({
  establishment_id,
  active_tab,
  on_tab_change,
  language_code,
}: MenuManagementProps) {
  const { t } = useTranslation(language_code)

  const tabs = [
    {
      id: 'categories',
      label: t.establishmentAdmin.menuManagement.categories.title,
      icon: '📂',
    },
    {
      id: 'products',
      label: t.establishmentAdmin.menuManagement.products.title,
      icon: '🍽️',
    },
    {
      id: 'variants',
      label: t.establishmentAdmin.menuManagement.variants.title,
      icon: '🔧',
    },
  ]

  return (
    <div className="menu-management">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => on_tab_change(tab.id)}
            className={`tab-button ${active_tab === tab.id ? 'active' : ''}`}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {active_tab === 'categories' && (
          <CategoryManagement establishment_id={establishment_id} language_code={language_code} />
        )}
        {active_tab === 'products' && (
          <ProductManagement establishment_id={establishment_id} language_code={language_code} />
        )}
        {active_tab === 'variants' && (
          <VariantManagement establishment_id={establishment_id} language_code={language_code} />
        )}
      </div>
    </div>
  )
}
