import { useEffect, useMemo, useState, useRef } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { LanguageCode } from '@/constants/languages'
import type { MenuCategory } from '@/types/management/menu'
import type { CategoryUpdateDTO } from '@/types/dtos/category'
import { mapCategoryPartialToUpdateDTO } from '@/services/mappers/menuMappers'

interface Props {
  lang: LanguageCode
  categories: MenuCategory[]
  selectedCategoryId?: number | null
  onSelect: (id: number) => void
  onCreate: (draft: Omit<MenuCategory, 'id'>) => Promise<void> | void
  onDelete: (id: number) => Promise<void> | void
  onEdit: (id: number) => void
  onUpdate: (id: number, updateDTO: CategoryUpdateDTO) => Promise<void>
  onReorder: (nextOrders: Array<{ id: number; order: number }>) => Promise<void>
}

type RowCat = MenuCategory & { _tmpKey?: string }

export default function CategoryList({
  lang,
  categories,
  selectedCategoryId,
  onSelect,
  onDelete,
  onEdit,
  onUpdate,
  onReorder,
  onCreate,
}: Props) {
  const { t } = useTranslation(lang)
  const confirmRef = useRef<HTMLDivElement>(null)

  function getCategoryName(c: MenuCategory, l: LanguageCode) {
    const anyC = c as any
    const tr = anyC.translations as Record<string, { name?: string; title?: string }> | undefined
    return (
      tr?.[l]?.name ??
      tr?.[l]?.title ??
      tr?.es?.name ??
      tr?.es?.title ??
      tr?.en?.name ??
      anyC.name ??
      anyC.title ??
      ''
    )
  }

  const sorted = useMemo(() => [...categories].sort((a, b) => a.order - b.order), [categories])
  const [items, setItems] = useState<RowCat[]>(sorted)
  useEffect(() => setItems(sorted), [sorted])

  // ✅ Estados de UI simplificados
  const [editId, setEditId] = useState<number | null>(null)
  const [draftName, setDraftName] = useState<string>('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState<number | null>(null)

  // ✅ Drag & Drop states mejorados
  const [dragId, setDragId] = useState<number | null>(null)
  const [dragOverId, setDragOverId] = useState<number | null>(null)

  // ✅ MEJORADO: Click fuera para cancelar confirmación
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        confirmDeleteId &&
        confirmRef.current &&
        !confirmRef.current.contains(event.target as Node)
      ) {
        setConfirmDeleteId(null)
      }
    }

    if (confirmDeleteId) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [confirmDeleteId])

  // ✅ MEJORADO: Edición inline con mapper consistente
  function startEdit(c: MenuCategory, e?: React.MouseEvent) {
    if (e) {
      e.stopPropagation()
    }
    setEditId(c.id)
    setDraftName(getCategoryName(c, lang))
    setConfirmDeleteId(null)
  }

  async function saveEdit(c: MenuCategory) {
    if (!draftName.trim() || draftName === getCategoryName(c, lang)) {
      setEditId(null)
      return
    }

    setIsUpdating(c.id)

    try {
      // ✅ Preservar translations existentes y actualizar solo el idioma actual
      const updatedTranslations = {
        ...c.translations,
        [lang]: {
          ...(c.translations as any)?.[lang],
          name: draftName.trim(),
        },
      }

      const patch = { translations: updatedTranslations }
      const updateDTO = mapCategoryPartialToUpdateDTO(patch)

      await onUpdate(c.id, updateDTO)
      setEditId(null)
    } catch (error) {
      console.error('Error updating category name:', error)
      setDraftName(getCategoryName(c, lang))
    } finally {
      setIsUpdating(null)
    }
  }

  function cancelEdit() {
    setEditId(null)
    setDraftName('')
  }

  // ✅ CORREGIDO: Toggle de estado activo con mapper
  async function toggleActive(c: MenuCategory, e?: React.MouseEvent) {
    if (e) {
      e.stopPropagation()
    }

    setIsUpdating(c.id)

    try {
      // Obtener el nombre actual en español o inglés
      const currentName =
        c.translations?.es?.name ||
        c.translations?.en?.name ||
        Object.values(c.translations ?? {})[0]?.name ||
        ''

      // Usar mapper para conversión consistente, asegurando que name esté presente
      const patch = { active: !c.active, translations: c.translations, name: currentName }
      const updateDTO = mapCategoryPartialToUpdateDTO(patch)

      await onUpdate(c.id, updateDTO)
    } catch (error) {
      console.error('Error toggling category status:', error)
    } finally {
      setIsUpdating(null)
    }
  }

  // ✅ MEJORADO: Confirmación con click fuera
  function startDeleteConfirmation(id: number, e?: React.MouseEvent) {
    if (e) {
      e.stopPropagation()
    }
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
      console.error('Error deleting category:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // ✅ MEJORADO: Drag & Drop con reordenamiento visual inmediato
  function onDragStart(e: React.DragEvent, id: number) {
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(id))
    setConfirmDeleteId(null)
    setEditId(null)
  }

  function onDragOver(e: React.DragEvent, overId: number) {
    e.preventDefault()
    if (!dragId || dragId === overId) return

    setDragOverId(overId)

    // ✅ Reordenamiento visual inmediato
    const curr = [...items]
    const fromIdx = curr.findIndex((c) => c.id === dragId)
    const toIdx = curr.findIndex((c) => c.id === overId)

    if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return

    const [moved] = curr.splice(fromIdx, 1)
    curr.splice(toIdx, 0, moved)

    // Actualizar órdenes visualmente
    const reordered = curr.map((item, index) => ({
      ...item,
      order: index + 1,
    }))

    setItems(reordered)
  }

  async function onDragEnd() {
    if (!dragId) return

    setDragOverId(null)
    const currentDragId = dragId
    setDragId(null)

    try {
      // ✅ Enviar nuevo orden al backend
      const nextOrders = items.map((c, idx) => ({ id: c.id, order: idx + 1 }))
      await onReorder(nextOrders)
    } catch (error) {
      console.error('Error reordering categories:', error)
      // ✅ Revertir en caso de error
      setItems(sorted)
    }
  }

  // ✅ CORREGIDO: Edición de orden con mapper
  async function handleOrderEdit(c: MenuCategory, newOrder: number) {
    if (newOrder === c.order || newOrder < 1 || newOrder > items.length) return

    setIsUpdating(c.id)

    try {
      // Crear nuevo array con el orden actualizado
      const newItems = [...items]
      const currentIndex = newItems.findIndex((item) => item.id === c.id)
      const targetIndex = newOrder - 1

      // Mover el elemento
      const [moved] = newItems.splice(currentIndex, 1)
      newItems.splice(targetIndex, 0, moved)

      // Actualizar todos los órdenes
      const reordered = newItems.map((item, index) => ({
        ...item,
        order: index + 1,
      }))

      setItems(reordered)

      // ✅ Enviar al backend con mappers consistentes
      const nextOrders = reordered.map((item, idx) => ({ id: item.id, order: idx + 1 }))
      await onReorder(nextOrders)
    } catch (error) {
      console.error('Error updating order:', error)
      setItems(sorted)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleCreateClick = () => {
    const nextOrder = (items.at(-1)?.order ?? 0) + 1
    const draft: Omit<MenuCategory, 'id'> = {
      order: nextOrder,
      active: true,
      translations: { es: { name: '' }, en: { name: '' } } as any, // Solo español e inglés
    }
    onCreate(draft)
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-card-title-row">
          <h3 className="admin-card-title">
            {t.establishmentAdmin.menuManagement.categories.title}
          </h3>
          <button
            type="button"
            className="admin-icon-btn admin-icon-btn--primary"
            onClick={handleCreateClick}
            aria-label={t.establishmentAdmin.menuManagement.categories.addNew}
            title={t.establishmentAdmin.menuManagement.categories.addNew}
          >
            +
          </button>
        </div>
      </div>

      <div className="admin-card-body">
        {items.length === 0 ? (
          <div className="no-categories-state">
            <div className="empty-icon">📁</div>
            <h3>{t.establishmentAdmin.messages.emptyStates.noCategories}</h3>
            <p>{t.establishmentAdmin.messages.emptyStates.noCategoriesDesc}</p>
          </div>
        ) : (
          <table className="admin-menu__table admin-menu__table--categories">
            <thead>
              <tr>
                <th style={{ width: 32, textAlign: 'center' }}>
                  <span className="sr-only">
                    {t.establishmentAdmin.menuManagement.categories.order}
                  </span>
                </th>
                <th style={{ width: 140, textAlign: 'left' }}>
                  {t.establishmentAdmin.menuManagement.categories.name}
                </th>
                <th style={{ width: 40, textAlign: 'center' }}>#</th>
                <th style={{ width: 110, textAlign: 'center' }}>
                  {t.establishmentAdmin.menuManagement.categories.active}
                </th>
                <th style={{ width: 60, textAlign: 'right' }}>
                  <span className="sr-only">
                    {t.establishmentAdmin.menuManagement.categories.actions}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => {
                const isEdit = editId === c.id
                const isConfirming = confirmDeleteId === c.id
                const isDragging = dragId === c.id
                const isOver = dragOverId === c.id
                const isSelected = selectedCategoryId === c.id
                const isLoading = isUpdating === c.id
                const nameVal = isEdit
                  ? draftName
                  : getCategoryName(c, lang) || t.establishmentAdmin.menuManagement.categories.name

                return (
                  <tr
                    key={c.id}
                    className={[
                      'admin-menu__row',
                      isDragging ? 'admin-menu__row--dragging' : '',
                      isOver ? 'admin-menu__row--dragover' : '',
                      isConfirming ? 'admin-menu__row--confirming' : '',
                      isSelected ? 'admin-menu__row--selected' : '',
                      !isEdit && !isConfirming ? 'admin-menu__row--selectable' : '',
                      isLoading ? 'admin-menu__row--loading' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => !isEdit && !isConfirming && onSelect(c.id)}
                    onDragOver={(e) => onDragOver(e, c.id)}
                    onDrop={onDragEnd}
                  >
                    {/* Drag handle */}
                    <td
                      className="admin-menu__drag-handle"
                      draggable={!isEdit && !isConfirming && !isLoading}
                      onDragStart={(e) => onDragStart(e, c.id)}
                      aria-label={t.establishmentAdmin.menuManagement.categories.order}
                      style={{
                        textAlign: 'center',
                        paddingRight: 0,
                        paddingLeft: 0,
                        width: 32,
                        minWidth: 32,
                        maxWidth: 32,
                      }}
                    >
                      {/* Solo muestra ⏳ si la fila está cargando Y es la fila de estado, nunca en el drag handle */}
                      {'☰'}
                    </td>
                    {/* Nombre */}
                    <td
                      className="admin-menu__cell--editable"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!isEdit && !isConfirming && !isLoading) {
                          startEdit(c, e)
                        }
                      }}
                      style={{
                        maxWidth: 140,
                        minWidth: 100,
                        paddingLeft: 8,
                        paddingRight: 8,
                        position: 'relative',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {isEdit ? (
                        <div className="admin-menu__inline-edit">
                          <input
                            className="admin-input"
                            value={draftName}
                            onChange={(e) => setDraftName(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                saveEdit(c)
                              } else if (e.key === 'Escape') {
                                cancelEdit()
                              }
                            }}
                            onBlur={() => saveEdit(c)}
                            autoFocus
                            placeholder={t.establishmentAdmin.menuManagement.categories.name}
                            disabled={isLoading}
                          />
                          {isLoading && <span className="admin-menu__loading-indicator">⏳</span>}
                        </div>
                      ) : (
                        <span
                          className="admin-menu__cell-text"
                          title={`${nameVal} - ${t.establishmentAdmin.menuManagement.categories.edit}`}
                        >
                          {nameVal}
                          <span className="admin-menu__edit-hint">✏️</span>
                        </span>
                      )}
                    </td>
                    {/* Orden */}
                    <td
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        textAlign: 'center',
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        width: 40,
                        minWidth: 40,
                        maxWidth: 40,
                        paddingLeft: 0,
                        paddingRight: 0,
                      }}
                    >
                      <input
                        type="number"
                        min="1"
                        max={items.length}
                        value={c.order}
                        onChange={(e) => {
                          const newOrder = parseInt(e.target.value)
                          if (!isNaN(newOrder)) {
                            handleOrderEdit(c, newOrder)
                          }
                        }}
                        className="admin-order-input"
                        disabled={isLoading}
                        title={t.establishmentAdmin.menuManagement.categories.order}
                      />
                    </td>
                    {/* Estado + Eliminar */}
                    <td
                      style={{
                        textAlign: 'center',
                        paddingLeft: 0,
                        paddingRight: 0,
                        width: 110,
                        minWidth: 80,
                        maxWidth: 120,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <button
                          className={`admin-status-toggle ${
                            c.active
                              ? 'admin-status-toggle--active'
                              : 'admin-status-toggle--inactive'
                          }`}
                          onClick={(e) => !isConfirming && !isLoading && toggleActive(c, e)}
                          disabled={isConfirming || isLoading}
                          title={
                            c.active
                              ? t.establishmentAdmin.forms.active
                              : t.establishmentAdmin.forms.inactive
                          }
                          aria-label={
                            c.active
                              ? t.establishmentAdmin.forms.active
                              : t.establishmentAdmin.forms.inactive
                          }
                          style={{ marginRight: 2 }}
                        >
                          {isLoading ? '⏳' : c.active ? '🟢' : '🔴'}
                        </button>
                        {/* Eliminar */}
                        <div className="admin-menu__row-actions" style={{ gap: 0 }}>
                          {isConfirming ? (
                            <div className="admin-menu__confirm-overlay" ref={confirmRef}>
                              <div className="admin-menu__confirm-content">
                                <button
                                  className="admin-menu__confirm-btn admin-menu__confirm-btn--delete"
                                  onClick={() => confirmDelete(c.id)}
                                  disabled={isDeleting}
                                  title={
                                    t.establishmentAdmin.menuManagement.categories.confirmDelete
                                  }
                                >
                                  {isDeleting ? '⏳' : '✓'}
                                </button>
                                <button
                                  className="admin-menu__confirm-btn admin-menu__confirm-btn--cancel"
                                  onClick={cancelDelete}
                                  disabled={isDeleting}
                                  title={t.establishmentAdmin.forms.cancel}
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="admin-icon-btn admin-icon-btn--delete"
                              onClick={(e) => {
                                e.stopPropagation()
                                startDeleteConfirmation(c.id, e)
                              }}
                              aria-label={t.establishmentAdmin.menuManagement.categories.delete}
                              title={t.establishmentAdmin.menuManagement.categories.delete}
                              disabled={isEdit || isLoading}
                              style={{ marginLeft: 2 }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Acciones (vacío, solo para estructura) */}
                    <td
                      style={{
                        width: 60,
                        minWidth: 40,
                        maxWidth: 80,
                        textAlign: 'right',
                        padding: 0,
                      }}
                    />
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
