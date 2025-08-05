'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import AdminLayout from '@/components/admin/AdminLayout' // Cambiar a default import
import type { Establishment } from '@/types/entities/establishment'
import type { LanguageCode } from '@/constants/languages'

interface EstablishmentAdminDashboardProps {
  establishment: Establishment | null
  establishmentId: string
  language: LanguageCode
}

export function EstablishmentAdminDashboard({
  establishment,
  establishmentId,
  language,
}: EstablishmentAdminDashboardProps) {
  const { t } = useTranslation(language)
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('dashboard')

  const navigationItems = [
    {
      id: 'dashboard',
      label: t.establishmentAdmin.navigation.dashboard,
      icon: '🏠',
      path: `/admin/establishment/${establishmentId}`,
    },
    {
      id: 'menu',
      label: t.establishmentAdmin.navigation.menuManagement,
      icon: '📋',
      path: `/admin/establishment/${establishmentId}/menu`,
    },
    {
      id: 'employees',
      label: t.establishmentAdmin.navigation.employeeManagement,
      icon: '👥',
      path: `/admin/establishment/${establishmentId}/employees`,
    },
    {
      id: 'orders',
      label: t.establishmentAdmin.navigation.orderSupervision,
      icon: '📦',
      path: `/admin/establishment/${establishmentId}/orders`,
    },
    {
      id: 'settings',
      label: t.establishmentAdmin.navigation.settings,
      icon: '⚙️',
      path: `/admin/establishment/${establishmentId}/settings`,
    },
  ]

  const quickActions = [
    {
      title: t.establishmentAdmin.menuManagement.categories.addNew,
      description: 'Add new menu category',
      icon: '➕',
      action: () => router.push(`/admin/establishment/${establishmentId}/menu?action=add-category`),
    },
    {
      title: t.establishmentAdmin.menuManagement.products.addNew,
      description: 'Add new product to menu',
      icon: '🍽️',
      action: () => router.push(`/admin/establishment/${establishmentId}/menu?action=add-product`),
    },
    {
      title: t.establishmentAdmin.employeeManagement.addEmployee,
      description: 'Add new team member',
      icon: '👤',
      action: () => router.push(`/admin/establishment/${establishmentId}/employees?action=add`),
    },
    {
      title: 'View Live Orders',
      description: 'Monitor current orders',
      icon: '📊',
      action: () => router.push(`/admin/establishment/${establishmentId}/orders`),
    },
  ]

  return (
    <AdminLayout
      title={t.establishmentAdmin.dashboard.title}
      subtitle={establishment?.name || t.establishmentAdmin.dashboard.subtitle}
      navigationItems={navigationItems}
      activeSection={activeSection}
    >
      <div className="establishment-admin-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">{t.establishmentAdmin.dashboard.title}</h1>
          <p className="dashboard-subtitle">
            {establishment?.name || t.establishmentAdmin.dashboard.subtitle}
          </p>
        </div>

        {/* Overview Cards */}
        <div className="dashboard-overview">
          <h2 className="section-title">{t.establishmentAdmin.dashboard.overview}</h2>
          <div className="overview-grid">
            <div className="overview-card">
              <div className="card-icon">📋</div>
              <div className="card-content">
                <h3>Menu Items</h3>
                <p className="card-number">--</p>
                <p className="card-description">Active products</p>
              </div>
            </div>

            <div className="overview-card">
              <div className="card-icon">👥</div>
              <div className="card-content">
                <h3>Employees</h3>
                <p className="card-number">--</p>
                <p className="card-description">Active staff members</p>
              </div>
            </div>

            <div className="overview-card">
              <div className="card-icon">📦</div>
              <div className="card-content">
                <h3>Today's Orders</h3>
                <p className="card-number">--</p>
                <p className="card-description">Orders processed</p>
              </div>
            </div>

            <div className="overview-card">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <h3>Revenue</h3>
                <p className="card-number">--</p>
                <p className="card-description">Today's total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-actions">
          <h2 className="section-title">{t.establishmentAdmin.dashboard.quickActions}</h2>
          <div className="actions-grid">
            {quickActions.map((action, index) => (
              <button key={index} onClick={action.action} className="action-card">
                <div className="action-icon">{action.icon}</div>
                <div className="action-content">
                  <h3 className="action-title">{action.title}</h3>
                  <p className="action-description">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
