import { useEffect, useMemo } from 'react'
import type { LanguageCode } from '@/constants/languages'
import { VISIBLE_LANGS } from '@/constants/languages'

interface LanguageTabsProps {
  langs: LanguageCode[]
  active: LanguageCode
  onChange: (lang: LanguageCode) => void
}

export default function LanguageTabs({ langs, active, onChange }: LanguageTabsProps) {
  const tabs = useMemo(
    () =>
      (langs?.length ? langs : (['es', 'en'] as LanguageCode[])).filter((l) =>
        VISIBLE_LANGS.includes(l)
      ),
    [langs]
  )

  useEffect(() => {
    if (tabs.length && !tabs.includes(active)) {
      onChange(tabs[0])
    }
  }, [active, tabs, onChange])

  return (
    <div className="admin-form__language-tabs">
      {tabs.map((lang) => (
        <button
          key={lang}
          type="button"
          className={`admin-form__language-tab ${
            active === lang ? 'admin-form__language-tab--active' : ''
          }`}
          onClick={() => onChange(lang)}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
