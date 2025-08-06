'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTranslation } from '@/hooks/useTranslation'
import { MenuManagement } from '@/components/management/MenuManagement'
import ProtectedPage from '@/components/auth/ProtectedPage'
import AdminLayout from '@/components/admin/AdminLayout'
import type { LanguageCode } from '@/constants/languages'

export default function MenuManagementPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const languageCode = params.lang as LanguageCode
  const { t } = useTranslation(languageCode)
  const [activeTab, setActiveTab] = useState('categories')

  const establishmentId = params.id as string
  const action = searchParams.get('action')

  useEffect(() => {
    if (action === 'add-category') setActiveTab('categories')
    if (action === 'add-product') setActiveTab('products')
  }, [action])

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
    <ProtectedPage allowedRoles={['establishment_admin', 'general_admin']}>
      <AdminLayout
        title={t.establishmentAdmin.menuManagement.title}
        subtitle={t.establishmentAdmin.menuManagement.subtitle}
        navigationItems={navigationItems}
        activeSection="menu"
      >
        <MenuManagement
          establishmentId={establishmentId}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          languageCode={languageCode}
        />
      </AdminLayout>
    </ProtectedPage>
  )
}
