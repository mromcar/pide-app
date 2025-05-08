'use client'

import type { LanguageCode, AvailableLanguage } from '@/constants/languages'
import { useRouter, useSearchParams } from 'next/navigation'

interface LanguageSelectorProps {
  language: LanguageCode
  availableLanguages: readonly AvailableLanguage[]
}

export default function LanguageSelector({ language, availableLanguages }: LanguageSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChangeLang = (newLang: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('lang', newLang)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="idiomaSelector">
      {availableLanguages.map((lang) => (
        <button
          key={lang.code}
          className={`idiomaBtn ${language === lang.code ? 'active' : ''}`}
          onClick={() => handleChangeLang(lang.code)}
          aria-label={`Seleccionar idioma ${lang.code.toUpperCase()}`}
        >
          {lang.code.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
