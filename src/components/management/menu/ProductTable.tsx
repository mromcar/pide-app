import { useMemo, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { LanguageCode } from '@/constants/languages'
import type { UIAllergen, MenuProduct } from '@/types/management/menu'

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
  onRowClick,
  onCreate,
  onUpdate,
  onDelete,
  onEdit,
  onReorder,
}: Props) {
  const { t } = useTranslation(lang)

  // Estados locales para DnD y edición inline
  const [localOrder, setLocalOrder] = useState<MenuProduct[] | null>(null)
  const rows = useMemo(() => localOrder ?? products, [localOrder, products])

  const [editId, setEditId] = useState<number | null>(null)
  const [draftName, setDraftName] = useState<string>('')
  const [draftPrice, setDraftPrice] = useState<string>('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [overId, setOverId] = useState<number | null>(null)

  // Edición inline
  function startEdit(p: MenuProduct) {
    const pp = p as AnyProduct
    setEditId(p.id)
    setDraftName(pp.translations?.[lang]?.name ?? '')
    setDraftPrice(String(pp.price ?? 0))
    setConfirmDeleteId(null)
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

  // Confirmación inline
  function startDeleteConfirmation(id: number) {
    setConfirmDeleteId(id)
    setEditId(null)
  }

  function cancelDelete() {
    setConfirmDeleteId(null)
  }

  async function confirmDelete(id: number) {
    setIsDeleting(true)
    try {
      await onDelete(id)
      setConfirmDeleteId(null)
    } catch (error) {
      console.error('Error deleting product:', error)
    } finally {
      setIsDeleting(false)
    }
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
      <div className="admin-card-header">
        <div className="admin-card-title-row">
          <h3 className="admin-card-title">{t.establishmentAdmin.menuManagement.products.title}</h3>
          <button className="admin-icon-btn admin-icon-btn--primary" onClick={onCreate}>
            +
          </button>
        </div>
      </div>

      <div className="admin-card-body">
        {rows.length === 0 ? (
          <div className="no-categories-state">
            <div className="empty-icon">📦</div>
            <h3>{t.establishmentAdmin.messages.emptyStates.noProducts}</h3>
            <p>{t.establishmentAdmin.messages.emptyStates.noProductsDesc}</p>
          </div>
        ) : (
          <table className="admin-menu__table admin-menu__table--products-simple">
            <thead>
              <tr>
                <th className="admin-menu__drag-column">
                  <span className="sr-only">Reordenar</span>
                </th>
                <th className="admin-menu__name-column">
                  {t.establishmentAdmin.menuManagement.products.name}
                </th>
                <th className="admin-menu__price-column">
                  {t.establishmentAdmin.menuManagement.products.price}
                </th>
                <th className="admin-menu__variants-column">
                  {t.establishmentAdmin.menuManagement.products.variants}
                </th>
                <th className="admin-menu__status-column">{t.establishmentAdmin.forms.active}</th>
                <th className="admin-menu__actions-column">
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
                const isConfirming = confirmDeleteId === p.id
                const isDragging = draggingId === p.id
                const isOver = overId === p.id

                const nameVal = isEdit ? draftName : pp.translations?.[lang]?.name ?? '(sin nombre)'
                const priceVal = isEdit ? draftPrice : Number(pp.price ?? 0).toFixed(2)
                const variantCount = pp.variants?.length ?? pp.variantsCount ?? 0

                return (
                  <tr
                    key={p.id}
                    className={[
                      'admin-menu__row',
                      isDragging ? 'admin-menu__row--dragging' : '',
                      isOver ? 'admin-menu__row--dragover' : '',
                      isConfirming ? 'admin-menu__row--confirming' : '',
                      !isEdit && !isConfirming ? 'admin-menu__row--selectable' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => !isEdit && !isConfirming && onRowClick(p.id)}
                    draggable={!isEdit && !isConfirming}
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
                    <td className="admin-menu__drag-handle" aria-label="Arrastrar para reordenar">
                      ☰
                    </td>

                    {/* Nombre - Editable inline */}
                    <td
                      className="admin-menu__cell--editable"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!isEdit && !isConfirming) startEdit(p)
                      }}
                    >
                      {isEdit ? (
                        <input
                          className="admin-input"
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                          placeholder="Nombre del producto"
                        />
                      ) : (
                        <span className="admin-menu__cell-text">{nameVal}</span>
                      )}
                    </td>

                    {/* Precio - Editable inline */}
                    <td
                      className="admin-menu__cell--editable"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!isEdit && !isConfirming) startEdit(p)
                      }}
                    >
                      {isEdit ? (
                        <input
                          className="admin-input"
                          value={draftPrice}
                          onChange={(e) => setDraftPrice(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          inputMode="decimal"
                          placeholder="0.00"
                        />
                      ) : (
                        <span className="admin-menu__cell-text">€{priceVal}</span>
                      )}
                    </td>

                    {/* Nº Variantes - Solo lectura */}
                    <td className="admin-menu__cell-center" onClick={(e) => e.stopPropagation()}>
                      <span className="admin-menu__variants-count">{variantCount}</span>
                    </td>

                    {/* ✅ NUEVO: Estado - Con iconos claros */}
                    <td className="admin-menu__cell-status" onClick={(e) => e.stopPropagation()}>
                      <button
                        className={`admin-status-toggle ${
                          pp.active
                            ? 'admin-status-toggle--active'
                            : 'admin-status-toggle--inactive'
                        }`}
                        onClick={() =>
                          !isConfirming && onUpdate(p.id, { active: !pp.active } as any)
                        }
                        disabled={isConfirming}
                        title={pp.active ? 'Desactivar producto' : 'Activar producto'}
                        aria-label={pp.active ? 'Producto activo' : 'Producto inactivo'}
                      >
                        {pp.active ? '🟢' : '🔴'}
                      </button>
                    </td>

                    {/* ✅ MEJORADO: Acciones consistentes */}
                    <td className="admin-menu__cell-actions" onClick={(e) => e.stopPropagation()}>
                      {isConfirming ? (
                        // Confirmación con overlay
                        <div className="admin-menu__confirm-overlay">
                          <div className="admin-menu__confirm-content">
                            <button
                              className="admin-menu__confirm-btn admin-menu__confirm-btn--delete"
                              onClick={() => confirmDelete(p.id)}
                              disabled={isDeleting}
                              title="Confirmar eliminación"
                            >
                              {isDeleting ? '⏳' : '💀'}
                            </button>
                            <button
                              className="admin-menu__confirm-btn admin-menu__confirm-btn--cancel"
                              onClick={cancelDelete}
                              disabled={isDeleting}
                              title="Cancelar"
                            >
                              ❌
                            </button>
                          </div>
                        </div>
                      ) : (
                        // ✅ ICONOS CONSISTENTES - NUNCA CAMBIAN
                        <div className="admin-menu__row-actions">
                          <button
                            type="button"
                            className="admin-icon-btn admin-icon-btn--edit"
                            onClick={() => onEdit(p.id)}
                            aria-label="Editar producto completo"
                            title="Editar producto (alérgenos, descripción, variantes...)"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="admin-icon-btn admin-icon-btn--delete"
                            onClick={() => startDeleteConfirmation(p.id)}
                            aria-label="Eliminar producto"
                            title="Eliminar producto"
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
