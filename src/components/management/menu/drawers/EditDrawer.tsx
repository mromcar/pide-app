import React, { useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { LanguageCode } from '@/constants/languages'

interface EditDrawerProps {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  lang: LanguageCode
}

export default function EditDrawer({ open, title, onClose, children, lang }: EditDrawerProps) {
  const { t } = useTranslation(lang)

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [onClose])

  return (
    <div
      className={`fixed inset-0 z-40 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-xl transition-transform ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4">
          <h3 className="text-lg font-semibold truncate">{title}</h3>
          <button
            onClick={onClose}
            aria-label={t.establishmentAdmin.forms.cancel}
            title={t.establishmentAdmin.forms.cancel}
            className="h-8 w-8 grid place-items-center rounded hover:bg-neutral-100 text-neutral-700"
          >
            ✖
          </button>
        </div>

        <div className="h-full overflow-y-auto px-5 py-4">{children}</div>
      </aside>
    </div>
  )
}
