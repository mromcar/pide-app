import { useMemo, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { LanguageCode } from '@/constants/languages'
import type { MenuCategory } from '@/types/management/menu'

interface Props {
  lang: LanguageCode
  categories: MenuCategory[]
  onSelect: (id: number) => void
  onCreate: (draft: Omit<MenuCategory, 'id'>) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onEdit: (id: number) => void
}

export default function CategoryList({
  lang,
  categories,
  onSelect,
  onCreate,
  onDelete,
  onEdit,
}: Props) {
  const { t } = useTranslation(lang)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  const items = useMemo(() => [...categories].sort((a, b) => a.order - b.order), [categories])

  const create = async () => {
    if (!name.trim()) return
    setCreating(true)
    try {
      const draft: Omit<MenuCategory, 'id'> = {
        order: (items.at(-1)?.order ?? 0) + 1,
        active: true,
        translations: { [lang]: { name } } as MenuCategory['translations'],
      }
      await onCreate(draft)
      setName('')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3>{t.establishmentAdmin.menuManagement.categories.title}</h3>
      </div>
      <div className="admin-card-body space-y-2">
        <div className="flex gap-2">
          <input
            className="admin-input flex-1"
            placeholder={t.establishmentAdmin.placeholders.categories.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="admin-btn admin-btn-primary" onClick={create} disabled={creating}>
            {t.establishmentAdmin.menuManagement.categories.addNew}
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted">
            {t.establishmentAdmin.messages.emptyStates.noCategoriesDesc}
          </p>
        ) : (
          <ul className="divide-y">
            {items.map((cat) => (
              <li key={cat.id} className="flex items-center justify-between py-2">
                <button className="text-left" onClick={() => onSelect(cat.id)}>
                  <div className="font-medium">{cat.translations[lang]?.name ?? '(no name)'}</div>
                  <div className="text-xs text-muted">
                    {cat.active
                      ? t.establishmentAdmin.dashboard.active
                      : t.establishmentAdmin.dashboard.inactive}
                    {' · '}#{cat.order}
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <button className="admin-btn admin-btn-secondary" onClick={() => onEdit(cat.id)}>
                    {t.establishmentAdmin.forms.edit}
                  </button>
                  <button className="admin-btn admin-btn-danger" onClick={() => onDelete(cat.id)}>
                    {t.establishmentAdmin.forms.delete}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
