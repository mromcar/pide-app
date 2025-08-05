import { LanguageCode } from '@/constants/languages'
import { useLanguage } from '@/contexts/LanguageContext'

export function useAdminLanguage(): LanguageCode {
  const { language } = useLanguage()
  return language
}