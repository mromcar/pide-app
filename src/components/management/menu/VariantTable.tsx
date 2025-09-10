import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { LanguageCode } from '@/constants/languages'
import type { ProductVariant } from '@/types/management/menu'

interface Props {
  lang: LanguageCode
  variants: ProductVariant[]
  onCreate: () => Promise<void>
  onUpdate: (id: number, patch: Partial<ProductVariant>) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onEdit: (id: number) => void
}

export default function VariantTable({
  lang,
  variants,
  onCreate,
  onUpdate,
  onDelete,
  onEdit,
}: Props) {
  const { t } = useTranslation(lang)
  const [editId, setEditId] = useState<number | null>(null)
  const [draftName, setDraftName] = useState<string>('')
  const [draftPrice, setDraftPrice] = useState<string>('')

  function startEdit(v: ProductVariant) {
    setEditId(v.id)
    setDraftName(v.translations[lang]?.name ?? '')
    setDraftPrice(String(v.priceModifier ?? 0))
  }
  async function save(v: ProductVariant) {
    const priceNum = Number(draftPrice)
    const patch: Partial<ProductVariant> = {
      priceModifier: Number.isFinite(priceNum) ? priceNum : v.priceModifier,
      translations: {
        ...v.translations,
        [lang]: { ...(v.translations[lang] || { name: '' }), name: draftName },
      } as any,
    }
    await onUpdate(v.id, patch)
    setEditId(null)
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header flex items-center justify-between">
        <h3>{t.establishmentAdmin.menuManagement.variants.title}</h3>
        <div className="flex gap-2">
          <button className="admin-btn admin-btn-primary" onClick={onCreate}>
            {t.establishmentAdmin.menuManagement.variants.addNew}
          </button>
        </div>
      </div>

      <div className="admin-card-body overflow-x-auto">
        {variants.length === 0 ? (
          <p className="text-sm text-muted">
            {t.establishmentAdmin.messages.emptyStates.noVariantsDesc}
          </p>
        ) : (
          <table className="admin-menu__table">
            <thead>
              <tr>
                <th>{t.establishmentAdmin.menuManagement.variants.name}</th>
                <th>{t.establishmentAdmin.menuManagement.variants.priceModifier}</th>
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
              {variants.map((v) => {
                const isEdit = editId === v.id
                return (
                  <tr key={v.id}>
                    <td
                      className="admin-menu__cell--editable"
                      onClick={() => !isEdit && startEdit(v)}
                    >
                      {isEdit ? (
                        <input
                          className="admin-input"
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                        />
                      ) : (
                        v.translations[lang]?.name ?? '(no name)'
                      )}
                    </td>
                    <td
                      className="admin-menu__cell--editable"
                      onClick={() => !isEdit && startEdit(v)}
                    >
                      {isEdit ? (
                        <input
                          className="admin-input"
                          value={draftPrice}
                          inputMode="decimal"
                          onChange={(e) => setDraftPrice(e.target.value)}
                        />
                      ) : (
                        v.priceModifier.toFixed(2)
                      )}
                    </td>
                    <td>
                      <button
                        className="admin-tag"
                        onClick={() => onUpdate(v.id, { active: !v.active })}
                      >
                        {v.active
                          ? t.establishmentAdmin.dashboard.active
                          : t.establishmentAdmin.dashboard.inactive}
                      </button>
                    </td>
                    <td className="text-right">
                      {isEdit ? (
                        <div className="admin-menu__row-actions">
                          <button className="admin-menu__save-btn" onClick={() => save(v)}>
                            {t.establishmentAdmin.forms.update}
                          </button>
                          <button
                            className="admin-menu__cancel-btn"
                            onClick={() => setEditId(null)}
                          >
                            {t.establishmentAdmin.forms.cancel}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="h-8 w-8 grid place-items-center rounded hover:bg-neutral-100 text-neutral-700"
                            onClick={() => onEdit(v.id)}
                            aria-label={t.establishmentAdmin.forms.edit}
                            title={t.establishmentAdmin.forms.edit}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="h-8 w-8 grid place-items-center rounded hover:bg-red-50 text-red-600"
                            onClick={() => onDelete(v.id)}
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
