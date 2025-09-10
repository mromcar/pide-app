import type { LanguageCode } from '@/constants/languages'
import { VISIBLE_LANGS } from '@/constants/languages'
import { useEffect, useMemo } from 'react'

interface LanguageTabsProps {
  langs: LanguageCode[]
  active: LanguageCode
  onChange: (lang: LanguageCode) => void
}

export default function LanguageTabs({ langs, active, onChange }: LanguageTabsProps) {
  // Solo mostrar ES/EN, aunque el caller pase FR
  const visible = useMemo<LanguageCode[]>(
    () => (langs?.length ? langs : VISIBLE_LANGS).filter((l) => VISIBLE_LANGS.includes(l)),
    [langs]
  )

  // Si el activo es FR (u otro no visible), forzar al primero visible
  useEffect(() => {
    if (visible.length && !visible.includes(active)) onChange(visible[0])
  }, [active, visible, onChange])

  return (
    <div className="mb-3 flex gap-2 border-b">
      {visible.map((l) => (
        <button
          key={l}
          type="button"
          className={`px-2 py-1 text-sm ${
            active === l ? 'border-b-2 border-black font-medium' : 'text-gray-500'
          }`}
          onClick={() => onChange(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
