'use client'

import { useParams } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { EmployeeManagement } from '@/components/employee/EmployeeManagement'
import { ProtectedPage } from '@/components/auth/ProtectedPage'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { DEFAULT_LANGUAGE, type LanguageCode } from '@/constants/languages'

export default function EmployeeManagementPage() {
  const params = useParams()
  const { t } = useTranslation(DEFAULT_LANGUAGE)

  const establishment_id = params.id as string
  const language_code = DEFAULT_LANGUAGE

  const navigationItems = [
    {
      id: 'dashboard',
      label: t.establishmentAdmin.navigation.dashboard,
      icon: '🏠',
      path: `/admin/establishment/${establishment_id}`,
    },
    {
      id: 'menu',
      label: t.establishmentAdmin.navigation.menuManagement,
      icon: '📋',
      path: `/admin/establishment/${establishment_id}/menu`,
    },
    {
      id: 'employees',
      label: t.establishmentAdmin.navigation.employeeManagement,
      icon: '👥',
      path: `/admin/establishment/${establishment_id}/employees`,
    },
    {
      id: 'orders',
      label: t.establishmentAdmin.navigation.orderSupervision,
      icon: '📦',
      path: `/admin/establishment/${establishment_id}/orders`,
    },
  ]

  return (
    <ProtectedPage allowedRoles={['establishment_admin', 'general_admin']}>
      <AdminLayout
        title={t.establishmentAdmin.employeeManagement.title}
        subtitle={t.establishmentAdmin.employeeManagement.subtitle}
        navigationItems={navigationItems}
        activeSection="employees"
      >
        <EmployeeManagement establishment_id={establishment_id} language_code={language_code} />
      </AdminLayout>
    </ProtectedPage>
  )
}
