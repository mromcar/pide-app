import { useMemo } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import AllergenSelector from './selectors/AllergenSelector'
import type { LanguageCode } from '@/constants/languages'
import type { UIAllergen } from '@/types/management/menu'
import type { MenuProduct } from '@/types/management/menu'

interface Props {
  lang: LanguageCode
  allergens: UIAllergen[] // changed
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
  return (
    <div className="admin-card">
      <div className="admin-card-header flex items-center justify-between">
        <h3>{t.establishmentAdmin.menuManagement.products.title}</h3>
        <div className="flex gap-2">
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
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t.establishmentAdmin.menuManagement.products.name}</th>
                <th>{t.establishmentAdmin.menuManagement.products.price}</th>
                <th>{t.establishmentAdmin.menuManagement.products.allergens}</th>
                <th>{t.establishmentAdmin.forms.active}</th>
                <th className="w-1">{t.establishmentAdmin.menuManagement.products.actions}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} onClick={() => onRowClick(p.id)} className="cursor-pointer">
                  <td>{p.translations[lang]?.name ?? '(no name)'}</td>
                  <td>{p.price.toFixed(2)}</td>
                  <td>
                    <AllergenSelector
                      allergens={allergens}
                      selectedIds={new Set(p.allergens)}
                      onChange={(ids) => onUpdate(p.id, { allergens: ids })}
                    />
                  </td>
                  <td>
                    <button
                      className="admin-tag"
                      onClick={(e) => {
                        e.stopPropagation()
                        onUpdate(p.id, { active: !p.active })
                      }}
                    >
                      {p.active
                        ? t.establishmentAdmin.dashboard.active
                        : t.establishmentAdmin.dashboard.inactive}
                    </button>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        className="admin-btn admin-btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(p.id)
                        }}
                      >
                        {t.establishmentAdmin.forms.edit}
                      </button>
                      <button
                        className="admin-btn admin-btn-danger"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(p.id)
                        }}
                      >
                        {t.establishmentAdmin.forms.delete}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
