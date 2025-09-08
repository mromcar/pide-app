import type { LanguageCode } from '@/constants/languages'

interface LanguageTabsProps {
  langs: LanguageCode[]
  active: LanguageCode
  onChange: (lang: LanguageCode) => void
}

export default function LanguageTabs({ langs, active, onChange }: LanguageTabsProps) {
  return (
    <div className="mb-3 flex gap-2 border-b">
      {langs.map((l) => (
        <button
          key={l}
          type="button"
          className={`px-2 py-1 text-sm ${active === l ? 'border-b-2 border-black font-medium' : 'text-gray-500'}`}
          onClick={() => onChange(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
