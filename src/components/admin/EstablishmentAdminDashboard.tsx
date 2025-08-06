'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { LanguageCode } from '@/types/language'
import { Establishment } from '@/types/establishment'

interface EstablishmentAdminDashboardProps {
  establishment: Establishment | null
  establishmentId: string
  languageCode: LanguageCode
}

export function EstablishmentAdminDashboard({
  establishment,
  establishmentId,
  languageCode,
}: EstablishmentAdminDashboardProps) {
  const router = useRouter()
  const { t } = useTranslation(languageCode)
  const [activeSection, setActiveSection] = useState('dashboard')

  const navigationItems = [
    {
      id: 'dashboard',
      label: t.establishmentAdmin.navigation.dashboard,
      path: `/${languageCode}/admin/establishment/${establishmentId}`,
    },
    {
      id: 'menu',
      label: t.establishmentAdmin.navigation.menuManagement,
      path: `/${languageCode}/admin/establishment/${establishmentId}/menu`,
    },
    {
      id: 'staff',
      label: t.establishmentAdmin.navigation.staffManagement,
      path: `/${languageCode}/admin/establishment/${establishmentId}/staff`,
    },
    {
      id: 'orders',
      label: t.establishmentAdmin.navigation.orderSupervision,
      path: `/${languageCode}/admin/establishment/${establishmentId}/orders`,
    },
    {
      id: 'settings',
      label: t.establishmentAdmin.navigation.settings,
      path: `/${languageCode}/admin/establishment/${establishmentId}/settings`,
    },
  ]

  const handleNavigation = (path: string, sectionId: string) => {
    setActiveSection(sectionId)
    router.push(path)
  }

  return (
    <div className="admin-container">
      <div className="admin-main-content">
        {/* Nombre del restaurante */}
        <div className="menu-page-header">
          <h1 className="menu-page-title">
            {establishment?.name || (languageCode === 'es' ? 'Establecimiento' : 'Establishment')}
          </h1>
        </div>

        {/* Navegación horizontal estilo categorías */}
        <div className="category-nav-container">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path, item.id)}
              className={`category-nav-button ${activeSection === item.id ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Contenido principal */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">{t.establishmentAdmin.dashboard.overview}</h2>
          </div>
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
              {languageCode === 'es'
                ? 'Selecciona una opción del menú superior para comenzar a gestionar tu establecimiento.'
                : 'Select an option from the menu above to start managing your establishment.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
