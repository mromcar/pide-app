'use client'

import { useParams } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { OrderSupervision } from '@/components/orders/OrderSupervision'
import { ProtectedPage } from '@/components/auth/ProtectedPage'
import { AdminLayout } from '@/components/admin/AdminLayout'
import type { LanguageCode } from '@/constants/languages'
import { UserRole } from '@/types/enums'

export default function OrderSupervisionPage() {
  const params = useParams()
  const languageCode = params.lang as LanguageCode
  const { t } = useTranslation(languageCode)

  const establishmentId = params.id as string

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
  ]

  return (
    <ProtectedPage allowedRoles={[UserRole.ESTABLISHMENT_ADMIN, UserRole.GENERAL_ADMIN]}>
      {/* Solo admins pueden gestionar empleados */}
      <AdminLayout
        title={t.establishmentAdmin.orderSupervision.title}
        subtitle={t.establishmentAdmin.orderSupervision.subtitle}
        navigationItems={navigationItems}
        activeSection="orders"
      >
        <OrderSupervision establishmentId={establishmentId} languageCode={languageCode} />
      </AdminLayout>
    </ProtectedPage>
  )
}
