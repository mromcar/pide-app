import LoginRedirect from '@/components/auth/LoginRedirect'
import LoginPageClient from './LoginPageClient'
import { LanguageCode } from '@/constants/languages'
import { getTranslation } from '@/translations'

interface LoginPageProps {
  params: Promise<{
    lang: LanguageCode
  }>
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { lang } = await params
  const translations = await getTranslation(lang)

  return (
    <>
      <LoginRedirect lang={lang} />
      <LoginPageClient translations={translations} lang={lang} />
    </>
  )
}
