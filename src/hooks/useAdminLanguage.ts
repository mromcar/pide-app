import { LanguageCode } from '@/constants/languages'
import { useLanguage } from '@/contexts/LanguageContext'

export function useAdminLanguage(): LanguageCode {
  const { languageCode } = useLanguage()
  return languageCode
}
