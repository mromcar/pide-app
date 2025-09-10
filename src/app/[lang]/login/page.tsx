import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import LoginPageClient from './LoginPageClient'
import { getTranslation } from '@/translations'
import type { LanguageCode } from '@/constants/languages'

interface LoginPageProps {
  params: { lang: LanguageCode }
  searchParams?: { callbackUrl?: string }
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { lang } = params
  const translations = await getTranslation(lang)

  const session = await getServerSession(authOptions)

  console.log('[LoginPage SSR] Session exists:', !!session?.user)

  if (session?.user) {
    const u = session.user as any
    if (u?.role === 'general_admin') redirect(`/${lang}/super-admin`)
    if (u?.establishmentId) redirect(`/${lang}/admin/${u.establishmentId}`)
    redirect(`/${lang}`)
  }

  const callbackUrl = searchParams?.callbackUrl ?? `/${lang}`
  return <LoginPageClient translations={translations} lang={lang} callbackUrl={callbackUrl} />
}
