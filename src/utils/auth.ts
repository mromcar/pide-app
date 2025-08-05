import { DEFAULT_LANGUAGE } from '@/constants/languages'

export function getLoginUrl(lang?: string): string {
  const language = lang || DEFAULT_LANGUAGE
  return `/${language}/login`
}