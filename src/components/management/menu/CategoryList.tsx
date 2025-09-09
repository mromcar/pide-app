import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { LanguageCode } from '@/constants/languages'
import type { MenuCategory } from '@/types/management/menu'

interface Props {
  lang: LanguageCode
  categories: MenuCategory[]
  onSelect: (id: number) => void
  onCreate: (draft: Omit<MenuCategory, 'id'>) => Promise<void> | void
  onDelete: (id: number) => Promise<void> | void
  onEdit: (id: number) => void
  onUpdate: (id: number, patch: Partial<MenuCategory>) => Promise<void>
  onReorder: (nextOrders: Array<{ id: number; order: number }>) => Promise<void>
}

type RowCat = MenuCategory & { _tmpKey?: string }

export default function CategoryList({
  lang,
  categories,
  onSelect,
  onCreate,
  onDelete,
  onEdit,
  onUpdate,
  onReorder,
}: Props) {
  const { t } = useTranslation(lang)

  // Lista local para drag & drop (orden visual)
  const sorted = useMemo(() => [...categories].sort((a, b) => a.order - b.order), [categories])
  const [items, setItems] = useState<RowCat[]>(sorted)
  useEffect(() => setItems(sorted), [sorted])

  // Crear nueva
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

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

  // Edición inline
  const [editId, setEditId] = useState<number | null>(null)
  const [draftName, setDraftName] = useState<string>('')

  function startEdit(c: MenuCategory) {
    setEditId(c.id)
    setDraftName(c.translations[lang]?.name ?? '')
  }
  async function saveEdit(c: MenuCategory) {
    // Solo mutamos traducción en el idioma actual
    const patch: Partial<MenuCategory> = {
      translations: {
        ...c.translations,
        [lang]: { ...(c.translations[lang] || { name: '' }), name: draftName },
      } as any,
    }

    await onUpdate(c.id, patch)
    setEditId(null)
  }
  function cancelEdit() {
    setEditId(null)
  }

  // Drag & Drop HTML5
  const [dragId, setDragId] = useState<number | null>(null)
  const [dragOverId, setDragOverId] = useState<number | null>(null)

  function onDragStart(e: React.DragEvent, id: number) {
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
    // Necesario para Firefox
    e.dataTransfer.setData('text/plain', String(id))
  }

  function onDragOver(e: React.DragEvent, overId: number) {
    e.preventDefault()
    if (!dragId || dragId === overId) return
    setDragOverId(overId)

    const curr = [...items]
    const fromIdx = curr.findIndex((c) => c.id === dragId)
    const toIdx = curr.findIndex((c) => c.id === overId)
    if (fromIdx < 0 || toIdx < 0) return

    const [moved] = curr.splice(fromIdx, 1)
    curr.splice(toIdx, 0, moved)
    setItems(curr)
  }

  async function onDragEnd() {
    if (!dragId) return
    setDragOverId(null)
    setDragId(null)
    // Persistir nuevo orden 1..n
    const nextOrders = items.map((c, idx) => ({ id: c.id, order: idx + 1 }))
    await onReorder(nextOrders)
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
          <table className="admin-menu__table">
            <thead>
              <tr>
                <th style={{ width: 28 }} />
                <th>{t.establishmentAdmin.menuManagement.categories.name}</th>
                <th style={{ width: 68 }}>#</th>
                <th>{t.establishmentAdmin.forms.active}</th>
                <th className="w-1">{t.establishmentAdmin.menuManagement.products.actions}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => {
                const isEdit = editId === c.id
                const isDragging = dragId === c.id
                const isOver = dragOverId === c.id
                const nameVal = isEdit ? draftName : c.translations[lang]?.name ?? '(no name)'

                return (
                  <tr
                    key={c.id}
                    className={[
                      isDragging ? 'admin-menu__row--dragging' : '',
                      isOver ? 'admin-menu__row--dragover' : '',
                      'cursor-pointer',
                    ].join(' ')}
                    onClick={() => onSelect(c.id)}
                    onDragOver={(e) => onDragOver(e, c.id)}
                    onDrop={onDragEnd}
                  >
                    <td
                      className="admin-menu__drag-handle"
                      draggable
                      onDragStart={(e) => onDragStart(e, c.id)}
                    >
                      ☰
                    </td>

                    <td
                      className="admin-menu__cell--editable"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!isEdit) startEdit(c)
                      }}
                    >
                      {isEdit ? (
                        <input
                          className="admin-input"
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        nameVal
                      )}
                    </td>

                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        className="admin-tag"
                        onClick={() => onUpdate(c.id, { active: !c.active })}
                      >
                        {c.active
                          ? t.establishmentAdmin.dashboard.active
                          : t.establishmentAdmin.dashboard.inactive}
                      </button>
                    </td>

                    <td onClick={(e) => e.stopPropagation()}>
                      {isEdit ? (
                        <div className="admin-menu__row-actions">
                          <button className="admin-menu__save-btn" onClick={() => saveEdit(c)}>
                            {t.establishmentAdmin.forms.update}
                          </button>
                          <button className="admin-menu__cancel-btn" onClick={cancelEdit}>
                            {t.establishmentAdmin.forms.cancel}
                          </button>
                        </div>
                      ) : (
                        <div className="admin-menu__row-actions">
                          <button
                            className="admin-btn admin-btn-secondary"
                            onClick={() => onEdit(c.id)}
                          >
                            {t.establishmentAdmin.forms.edit}
                          </button>
                          <button
                            className="admin-btn admin-btn-danger"
                            onClick={() => onDelete(c.id)}
                          >
                            {t.establishmentAdmin.forms.delete}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
