import { LanguageCode, DEFAULT_LANGUAGE } from '@/constants/languages'
import { getTranslation } from '@/translations'
import type { Metadata } from 'next'
import RegisterPageClient from './RegisterPageClient'

interface RegisterPageProps {
  params: { lang: LanguageCode }
}

export async function generateMetadata({ params }: RegisterPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const { lang } = resolvedParams
  const t = getTranslation(lang as LanguageCode)

  return {
    title: t.register.title,
    description: t.register.subtitle,
  }
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const resolvedParams = await params
  const { lang } = resolvedParams

  return <RegisterPageClient lang={lang} />
}
