'use server'

import LoginPageClient from './LoginPageClient'
import { LanguageCode } from '@/constants/languages'
import { getTranslation } from '@/translations'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

type SessionUser = {
  id?: string
  role?: string
  establishmentId?: string | null
}

interface LoginPageProps {
  params: { lang: LanguageCode }
  searchParams?: { callbackUrl?: string }
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { lang } = params
  const translations = await getTranslation(lang)

  const session = await getServerSession()
  const user = (session?.user as SessionUser | undefined) ?? undefined
  const role = user?.role
  const establishmentId = user?.establishmentId ?? undefined

  if (role === 'restaurant_admin' && establishmentId) {
    redirect(`/${lang}/admin/${establishmentId}`)
  }
  if (role === 'general_admin') {
    redirect(`/${lang}/super-admin`)
  }

  return (
    <LoginPageClient
      translations={translations}
      lang={lang}
      callbackUrl={
        searchParams?.callbackUrl ??
        (role === 'restaurant_admin' && establishmentId
          ? `/${lang}/admin/${establishmentId}`
          : role === 'general_admin'
            ? `/${lang}/super-admin`
            : `/${lang}`)
      }
    />
  )
}
