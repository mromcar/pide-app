import { LanguageCode } from '@/constants/languages'
import LoginRedirect from '@/components/auth/LoginRedirect'

interface HomePageProps {
  params: { lang: LanguageCode }
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params

  return <LoginRedirect lang={lang} />
}
