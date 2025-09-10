import { useMemo, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { LanguageCode } from '@/constants/languages'
import type { UIAllergen, MenuProduct } from '@/types/management/menu'
import { allergenIcons } from '@/components/icons/AllergenIcons'

interface Props {
  lang: LanguageCode
  allergens: UIAllergen[]
  products: MenuProduct[]
  onRowClick: (id: number) => void
  onCreate: () => Promise<void>
  onUpdate: (id: number, patch: Partial<MenuProduct>) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onEdit: (id: number) => void
  onReorder: (next: { id: number; order: number }[]) => Promise<void>
}

type AnyProduct = MenuProduct & {
  translations?: Record<string, { name?: string }>
  price?: number | string
  variants?: unknown[]
  variantsCount?: number
  active?: boolean
  allergens?: number[]
  order?: number
}

export default function ProductTable({
  lang,
  allergens,
  products,
  onRowClick: _onRowClick, // renombrado para cumplir /^_/u
  onCreate,
  onUpdate,
  onDelete,
  onEdit,
  onReorder,
}: Props) {
  const { t } = useTranslation(lang)

  // Orden local optimista para DnD
  const [localOrder, setLocalOrder] = useState<MenuProduct[] | null>(null)
  const rows = useMemo(() => localOrder ?? products, [localOrder, products])

  const [editId, setEditId] = useState<number | null>(null)
  const [draftName, setDraftName] = useState<string>('')
  const [draftPrice, setDraftPrice] = useState<string>('')

  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [overId, setOverId] = useState<number | null>(null)

  function startEdit(p: MenuProduct) {
    const pp = p as AnyProduct
    setEditId(p.id)
    setDraftName(pp.translations?.[lang]?.name ?? '')
    setDraftPrice(String(pp.price ?? 0))
  }

  async function saveEdit(p: MenuProduct) {
    const pp = p as AnyProduct
    const priceNum = Number(draftPrice)

    const patch: Partial<MenuProduct> = {
      ...(Number.isFinite(priceNum) ? { price: priceNum } : {}),
      translations: {
        ...(pp.translations || {}),
        [lang]: { ...(pp.translations?.[lang] || {}), name: draftName },
      } as any,
    }
    await onUpdate(p.id, patch)
    setEditId(null)
  }

  function cancelEdit() {
    setEditId(null)
  }

  // Resolver icono de alérgeno de forma tolerante al tipo
  function renderAllergen(a: UIAllergen, key: string) {
    const anyA = a as any
    const code: string | undefined = anyA.code ?? anyA.slug ?? undefined
    const Icon = code ? (allergenIcons as any)[code] : undefined
    if (Icon) {
      return <Icon key={key} size={16} className="text-neutral-500" title={String(anyA.name)} />
    }
    return (
      <span key={key} className="menu-allergen-badge" title={String(anyA.name)}>
        {code ?? String(anyA.name ?? '·').slice(0, 1)}
      </span>
    )
  }

  // DnD helpers
  function reorderArray<T>(arr: T[], fromIdx: number, toIdx: number) {
    const copy = [...arr]
    const [moved] = copy.splice(fromIdx, 1)
    copy.splice(toIdx, 0, moved)
    return copy
  }

  async function handleDrop(dropOnId: number) {
    if (draggingId == null) return
    const fromIdx = rows.findIndex((r) => r.id === draggingId)
    const toIdx = rows.findIndex((r) => r.id === dropOnId)
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) {
      setDraggingId(null)
      setOverId(null)
      return
    }

    const newOrder = reorderArray(rows, fromIdx, toIdx)
    setLocalOrder(newOrder)

    // Generar órdenes 1..n
    const next = newOrder.map((p, idx) => ({ id: p.id, order: idx + 1 }))
    try {
      await onReorder(next)
    } finally {
      setDraggingId(null)
      setOverId(null)
      setLocalOrder(null)
    }
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header flex items-center justify-between">
        <h3>{t.establishmentAdmin.menuManagement.products.title}</h3>
        <div className="admin-menu__row-actions">
          <button className="admin-btn admin-btn-primary" onClick={onCreate}>
            {t.establishmentAdmin.menuManagement.products.addNew}
          </button>
        </div>
      </div>

      <div className="admin-card-body overflow-x-auto">
        {rows.length === 0 ? (
          <p className="text-sm text-muted">
            {t.establishmentAdmin.messages.emptyStates.noProductsDesc}
          </p>
        ) : (
          <table className="admin-menu__table admin-menu__table--products">
            <thead>
              <tr>
                <th style={{ width: 28 }}></th>
                <th>{t.establishmentAdmin.menuManagement.products.name}</th>
                <th>{t.establishmentAdmin.menuManagement.products.price}</th>
                <th>{t.establishmentAdmin.menuManagement.products.variants}</th>
                <th>{t.establishmentAdmin.menuManagement.products.allergens}</th>
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
              {rows.map((p) => {
                const pp = p as AnyProduct
                const isEdit = editId === p.id
                const nameVal = isEdit ? draftName : pp.translations?.[lang]?.name ?? '(no name)'
                const priceVal = isEdit ? draftPrice : Number(pp.price ?? 0).toFixed(2)
                const variantCount = pp.variants?.length ?? pp.variantsCount ?? 0

                return (
                  <tr
                    key={p.id}
                    className={
                      'cursor-default ' +
                      (draggingId === p.id ? 'admin-menu__row--dragging ' : '') +
                      (overId === p.id ? 'admin-menu__row--dragover ' : '')
                    }
                    draggable
                    onDragStart={() => setDraggingId(p.id)}
                    onDragOver={(e) => {
                      e.preventDefault()
                      if (overId !== p.id) setOverId(p.id)
                    }}
                    onDrop={() => handleDrop(p.id)}
                    onDragEnd={() => {
                      setDraggingId(null)
                      setOverId(null)
                    }}
                  >
                    {/* Drag handle */}
                    <td className="admin-menu__drag-handle" title="Arrastrar para reordenar">
                      ☰
                    </td>

                    {/* Nombre */}
                    <td
                      className="admin-menu__cell--editable"
                      onClick={() => !isEdit && startEdit(p)}
                    >
                      {isEdit ? (
                        <input
                          className="admin-input"
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                        />
                      ) : (
                        nameVal
                      )}
                    </td>

                    {/* Precio */}
                    <td
                      className="admin-menu__cell--editable"
                      onClick={() => !isEdit && startEdit(p)}
                    >
                      {isEdit ? (
                        <input
                          className="admin-input"
                          value={draftPrice}
                          onChange={(e) => setDraftPrice(e.target.value)}
                          inputMode="decimal"
                        />
                      ) : (
                        priceVal
                      )}
                    </td>

                    {/* Nº variantes */}
                    <td className="text-center">{variantCount}</td>

                    {/* Iconos de alérgenos */}
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {(pp.allergens || []).map((id) => {
                          const a = allergens.find((x) => x.id === id)
                          if (!a) return null
                          return renderAllergen(a, `alg-${p.id}-${a.id}`)
                        })}
                      </div>
                    </td>

                    {/* Estado */}
                    <td>
                      <button
                        className="admin-tag"
                        onClick={() => onUpdate(p.id, { active: !pp.active } as any)}
                      >
                        {pp.active
                          ? t.establishmentAdmin.dashboard.active
                          : t.establishmentAdmin.dashboard.inactive}
                      </button>
                    </td>

                    {/* Acciones */}
                    <td className="text-right">
                      {isEdit ? (
                        <div className="admin-menu__row-actions">
                          <button className="admin-menu__save-btn" onClick={() => saveEdit(p)}>
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
                            onClick={() => onEdit(p.id)}
                            aria-label={t.establishmentAdmin.forms.edit}
                            title={t.establishmentAdmin.forms.edit}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="h-8 w-8 grid place-items-center rounded hover:bg-red-50 text-red-600"
                            onClick={() => onDelete(p.id)}
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
