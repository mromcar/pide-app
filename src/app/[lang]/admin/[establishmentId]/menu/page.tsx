'use client'

import AuthGuard from '@/components/auth/AuthGuard'
import { useTranslation } from '@/hooks/useTranslation'
import AdminNavbar from '@/components/admin/AdminNavbar'
import AdminMenuManager from '@/components/management/menu/AdminMenuManager'
import type { LanguageCode } from '@/constants/languages'

interface EstablishmentMenuPageProps {
  params: { lang: LanguageCode; establishmentId: string }
}

export default function EstablishmentMenuPage({ params }: EstablishmentMenuPageProps) {
  const { lang, establishmentId } = params
  const { t } = useTranslation(lang)

  return (
    <AuthGuard
      fallback={
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>{t.establishmentAdmin.messages.error.verifyingPermissions}</p>
        </div>
      }
    >
      <div className="admin-page">
        <AdminNavbar languageCode={lang} establishmentId={establishmentId} establishment={null} />
        <AdminMenuManager establishmentId={establishmentId} lang={lang} />
      </div>
    </AuthGuard>
  )
}
