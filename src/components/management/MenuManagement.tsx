'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { CategoryManagement } from '@/components/management/CategoryManagement'
import { ProductManagement } from '@/components/management/ProductManagement'
import { VariantManagement } from '@/components/management/VariantManagement'
import { LanguageCode } from '@/constants/languages'

interface MenuManagementProps {
  establishmentId: string
  activeTab: string
  onTabChange: (tab: string) => void
  languageCode: LanguageCode
}

export function MenuManagement({
  establishmentId,
  activeTab,
  onTabChange,
  languageCode,
}: MenuManagementProps) {
  const { t } = useTranslation(languageCode)

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
          <CategoryManagement establishmentId={establishmentId} languageCode={languageCode} />
        )}
        {activeTab === 'products' && (
          <ProductManagement establishmentId={establishmentId} languageCode={languageCode} />
        )}
        {activeTab === 'variants' && (
          <VariantManagement establishmentId={establishmentId} languageCode={languageCode} />
        )}
      </div>
    </div>
  )
}
