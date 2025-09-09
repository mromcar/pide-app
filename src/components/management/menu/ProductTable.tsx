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
}: Props) {
  const { t } = useTranslation(lang)
  const rows = useMemo(() => products, [products])

  const [editId, setEditId] = useState<number | null>(null)
  const [draftName, setDraftName] = useState<string>('')
  const [draftPrice, setDraftPrice] = useState<string>('')

  function startEdit(p: MenuProduct) {
    setEditId(p.id)
    setDraftName(p.translations[lang]?.name ?? '')
    setDraftPrice(String(p.price ?? 0))
  }
  async function saveEdit(p: MenuProduct) {
    const priceNum = Number(draftPrice)
    const patch: Partial<MenuProduct> = {
      price: Number.isFinite(priceNum) ? priceNum : p.price,
      translations: {
        ...p.translations,
        [lang]: { ...(p.translations[lang] || { name: '' }), name: draftName },
      } as any,
    }
    await onUpdate(p.id, patch)
    setEditId(null)
  }
  function cancelEdit() {
    setEditId(null)
  }

  const toggleAllergen = async (p: MenuProduct, allergenId: number, checked: boolean) => {
    const set = new Set<number>(p.allergens || [])
    if (checked) set.add(allergenId)
    else set.delete(allergenId)
    await onUpdate(p.id, { allergens: Array.from(set) })
  }

  const short = (name: string) => (name.length > 10 ? name.slice(0, 10) + '…' : name)

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
          <table className="admin-menu__table">
            <thead>
              <tr>
                <th>{t.establishmentAdmin.menuManagement.products.name}</th>
                <th>{t.establishmentAdmin.menuManagement.products.price}</th>
                {allergens.map((a) => (
                  <th key={`alg-h-${a.id}`} className="text-center" title={a.name}>
                    {short(a.name)}
                  </th>
                ))}
                <th>{t.establishmentAdmin.forms.active}</th>
                <th className="w-1">{t.establishmentAdmin.menuManagement.products.actions}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const isEdit = editId === p.id
                const nameVal = isEdit ? draftName : p.translations[lang]?.name ?? '(no name)'
                const priceVal = isEdit ? draftPrice : p.price.toFixed(2)
                const selected = new Set<number>(p.allergens || [])

                return (
                  <tr key={p.id} onClick={() => onRowClick(p.id)} className="cursor-pointer">
                    <td
                      className="admin-menu__cell--editable"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!isEdit) startEdit(p)
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

                    <td
                      className="admin-menu__cell--editable"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!isEdit) startEdit(p)
                      }}
                    >
                      {isEdit ? (
                        <input
                          className="admin-input"
                          value={draftPrice}
                          onChange={(e) => setDraftPrice(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          inputMode="decimal"
                        />
                      ) : (
                        priceVal
                      )}
                    </td>

                    {allergens.map((a) => {
                      const checked = selected.has(a.id)
                      return (
                        <td key={`alg-c-${p.id}-${a.id}`} className="admin-menu__cell--checkbox">
                          <input
                            type="checkbox"
                            checked={checked}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => toggleAllergen(p, a.id, e.currentTarget.checked)}
                            aria-label={`${nameVal} - ${a.name}`}
                            title={a.name}
                          />
                        </td>
                      )
                    })}

                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        className="admin-tag"
                        onClick={() => onUpdate(p.id, { active: !p.active })}
                      >
                        {p.active
                          ? t.establishmentAdmin.dashboard.active
                          : t.establishmentAdmin.dashboard.inactive}
                      </button>
                    </td>

                    <td onClick={(e) => e.stopPropagation()}>
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
                        <div className="admin-menu__row-actions">
                          <button
                            className="admin-btn admin-btn-secondary"
                            onClick={() => onEdit(p.id)}
                          >
                            {t.establishmentAdmin.forms.edit}
                          </button>
                          <button
                            className="admin-btn admin-btn-danger"
                            onClick={() => onDelete(p.id)}
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
