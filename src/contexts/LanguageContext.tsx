'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { LanguageCode, DEFAULT_LANGUAGE } from '@/constants/languages'

interface LanguageContextType {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE)

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}