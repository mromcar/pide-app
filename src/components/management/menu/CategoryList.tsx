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

  function getCategoryName(c: MenuCategory, l: LanguageCode) {
    const anyC = c as any
    const tr = anyC.translations as Record<string, { name?: string; title?: string }> | undefined
    return (
      tr?.[l]?.name ??
      tr?.[l]?.title ??
      tr?.es?.name ??
      tr?.es?.title ??
      tr?.en?.name ??
      tr?.fr?.name ??
      anyC.name ??
      anyC.title ??
      ''
    )
  }

  const sorted = useMemo(() => [...categories].sort((a, b) => a.order - b.order), [categories])
  const [items, setItems] = useState<RowCat[]>(sorted)
  useEffect(() => setItems(sorted), [sorted])

  // Edición inline
  const [editId, setEditId] = useState<number | null>(null)
  const [draftName, setDraftName] = useState<string>('')

  function startEdit(c: MenuCategory) {
    setEditId(c.id)
    setDraftName(getCategoryName(c, lang))
  }
  async function saveEdit(c: MenuCategory) {
    const patch: Partial<MenuCategory> = {
      translations: {
        ...c.translations,
        [lang]: { ...(c.translations as any)[lang], name: draftName },
      } as any,
    }
    await onUpdate(c.id, patch)
    setEditId(null)
  }
  function cancelEdit() {
    setEditId(null)
  }

  // Drag & Drop
  const [dragId, setDragId] = useState<number | null>(null)
  const [dragOverId, setDragOverId] = useState<number | null>(null)

  function onDragStart(e: React.DragEvent, id: number) {
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
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
    const nextOrders = items.map((c, idx) => ({ id: c.id, order: idx + 1 }))
    await onReorder(nextOrders)
  }

  const handleCreateClick = () => {
    const nextOrder = (items.at(-1)?.order ?? 0) + 1
    const draft: Omit<MenuCategory, 'id'> = {
      order: nextOrder,
      active: true,
      // FR oculto en UI pero mantenemos estructura
      translations: { es: { name: '' }, en: { name: '' }, fr: { name: '' } } as any,
    }
    onCreate(draft)
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header flex items-center justify-between">
        <h3>{t.establishmentAdmin.menuManagement.categories.title}</h3>
        <button
          type="button"
          className="h-8 w-8 grid place-items-center rounded bg-black text-white hover:bg-neutral-800"
          onClick={handleCreateClick}
          aria-label={t.establishmentAdmin.menuManagement.categories.addNew}
          title={t.establishmentAdmin.menuManagement.categories.addNew}
        >
          +
        </button>
      </div>

      <div className="admin-card-body">
        {items.length === 0 ? (
          <p className="text-sm text-muted">
            {t.establishmentAdmin.messages.emptyStates.noCategoriesDesc}
          </p>
        ) : (
          <table className="admin-menu__table admin-menu__table--categories">
            <thead>
              <tr>
                <th style={{ width: 28 }} />
                <th>{t.establishmentAdmin.menuManagement.categories.name}</th>
                <th style={{ width: 68 }}>#</th>
                <th>{t.establishmentAdmin.forms.active}</th>
                <th className="w-1 text-right">
                  <span aria-hidden>⋯</span>
                  <span className="sr-only">
                    {t.establishmentAdmin.menuManagement.products.actions}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => {
                const isEdit = editId === c.id
                const isDragging = dragId === c.id
                const isOver = dragOverId === c.id
                const nameVal = isEdit ? draftName : getCategoryName(c, lang) || '(no name)'

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
                      title="Drag to reorder"
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

                    <td className="text-center text-muted" onClick={(e) => e.stopPropagation()}>
                      {c.order}
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

                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
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
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="h-8 w-8 grid place-items-center rounded hover:bg-neutral-100 text-neutral-700"
                            onClick={() => onEdit(c.id)}
                            aria-label={t.establishmentAdmin.forms.edit}
                            title={t.establishmentAdmin.forms.edit}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="h-8 w-8 grid place-items-center rounded hover:bg-red-50 text-red-600"
                            onClick={() => onDelete(c.id)}
                            aria-label={t.establishmentAdmin.forms.delete}
                            title={t.establishmentAdmin.forms.delete}
                          >
                            🗑️
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
