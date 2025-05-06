import { AvailableLanguage } from '@/constants/languages'

interface LanguageSelectorProps {
  language: string
  availableLanguages: readonly AvailableLanguage[]
}

export default function LanguageSelector({
  language,
  availableLanguages
}: LanguageSelectorProps) {
  return (
    <div className="flex justify-end mb-4">
      <select
        value={language}
        onChange={(e) => {
          const url = new URL(window.location.href)
          url.searchParams.set('lang', e.target.value)
          window.location.href = url.toString()
        }}
        className="border rounded px-2 py-1"
      >
        {availableLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  )
}
