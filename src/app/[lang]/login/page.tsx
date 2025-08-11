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
      <LoginPageClient translations={translations} lang={lang} />
    </>
  )
}
