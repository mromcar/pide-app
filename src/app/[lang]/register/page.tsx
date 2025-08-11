import { LanguageCode } from '@/constants/languages'
import { getTranslation } from '@/translations'
import type { Metadata } from 'next'
import RegisterPageClient from './RegisterPageClient'

interface RegisterPageProps {
  params: { lang: LanguageCode }
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { lang } = await params // <-- usa await aquí
  const t = await getTranslation(lang as LanguageCode)

  return <RegisterPageClient translations={t.register} lang={lang} />
}

export async function generateMetadata({ params }: RegisterPageProps): Promise<Metadata> {
  const { lang } = await params // <-- usa await aquí también
  const t = await getTranslation(lang as LanguageCode)

  return {
    title: t.register.title,
    description: t.register.subtitle,
  }
}
