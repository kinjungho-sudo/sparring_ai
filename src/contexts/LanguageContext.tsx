'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { Language } from '@/types'

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: (ko: string, en: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ko')

  const t = (ko: string, en: string) => (language === 'ko' ? ko : en)

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
