'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { CategoryManagement } from '@/components/CategoryManagement'
import { ProductManagement } from '@/components/ProductManagement'
import { VariantManagement } from '@/components/VariantManagement'
import { LanguageCode } from '@/constants/languages'

interface MenuManagementProps {
  establishmentId: string
  activeTab: string
  onTabChange: (tab: string) => void
  language: LanguageCode
}

export function MenuManagement({
  establishmentId,
  activeTab,
  onTabChange,
  language,
}: MenuManagementProps) {
  const { t } = useTranslation(language)

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
            onClick={() => onTabChange(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'categories' && (
          <CategoryManagement establishmentId={establishmentId} language={language} />
        )}
        {activeTab === 'products' && (
          <ProductManagement establishmentId={establishmentId} language={language} />
        )}
        {activeTab === 'variants' && (
          <VariantManagement establishmentId={establishmentId} language={language} />
        )}
      </div>
    </div>
  )
}
