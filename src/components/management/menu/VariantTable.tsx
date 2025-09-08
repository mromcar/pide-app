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
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t.establishmentAdmin.menuManagement.variants.name}</th>
                <th>{t.establishmentAdmin.menuManagement.variants.priceModifier}</th>
                <th>{t.establishmentAdmin.forms.active}</th>
                <th className="w-1">{t.establishmentAdmin.menuManagement.products.actions}</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id}>
                  <td>{v.translations[lang]?.name ?? '(no name)'}</td>
                  <td>{v.priceModifier.toFixed(2)}</td>
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
                  <td>
                    <div className="flex gap-2">
                      <button
                        className="admin-btn admin-btn-secondary"
                        onClick={() => onEdit(v.id)}
                      >
                        {t.establishmentAdmin.forms.edit}
                      </button>
                      <button className="admin-btn admin-btn-danger" onClick={() => onDelete(v.id)}>
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
