import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import type { LanguageCode } from '@/constants/languages'
import { UserRole } from '@prisma/client'

interface AdminRedirectPageProps {
  params: { lang: LanguageCode }
}

export default async function AdminRedirectPage({ params }: AdminRedirectPageProps) {
  const { lang } = params
  const session = await getServerSession(authOptions)

  console.log('[AdminRedirect SSR] Session:', session?.user)

  if (!session?.user) {
    redirect(`/${lang}/login`)
  }

  const userRole = session.user.role as UserRole
  const establishmentId = session.user.establishmentId

  // Redirección directa en el servidor según el rol
  switch (userRole) {
    case UserRole.general_admin:
      redirect(`/${lang}/admin/general`)

    case UserRole.establishment_admin:
    case UserRole.waiter:
    case UserRole.cook:
      if (establishmentId) {
        redirect(`/${lang}/admin/${establishmentId}`)
      } else {
        redirect(`/${lang}/access-denied`)
      }

    case UserRole.client:
    default:
      redirect(`/${lang}`)
  }
}
