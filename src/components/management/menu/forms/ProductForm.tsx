import { useMemo, useState } from 'react'
import * as RHF from 'react-hook-form'
type UseFormGeneric = <TFieldValues extends RHF.FieldValues = RHF.FieldValues, TContext = unknown>(
  props?: RHF.UseFormProps<TFieldValues, TContext>
) => RHF.UseFormReturn<TFieldValues, TContext>
const rhfAny = RHF as unknown as { useForm?: unknown; default?: { useForm?: unknown } }
const useForm = (rhfAny.useForm ?? rhfAny.default?.useForm) as unknown as UseFormGeneric
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import LanguageTabs from './LanguageTabs'
import AllergenSelector from '../selectors/AllergenSelector'
import type { LanguageCode } from '@/constants/languages'
import type { MenuProduct, UIAllergen } from '@/types/management/menu'
import { useTranslation } from '@/hooks/useTranslation'

const buildTranslationSchema = (requiredMsg: string) =>
  z.object({
    name: z.string().min(1, requiredMsg),
    description: z.string().optional().nullable(),
  })
const buildSchema = (langs: LanguageCode[], requiredMsg: string) =>
  z.object({
    id: z.number(),
    categoryId: z.number(),
    price: z.number().min(0),
    active: z.boolean(),
    allergens: z.array(z.number()),
    translations: z.object(
      Object.fromEntries(langs.map((l) => [l, buildTranslationSchema(requiredMsg)])) as Record<
        LanguageCode,
        ReturnType<typeof buildTranslationSchema>
      >
    ),
  })

interface ProductFormProps {
  langs: LanguageCode[]
  allergens: UIAllergen[]
  initialValues: MenuProduct
  onSubmit: (values: MenuProduct) => Promise<void>
  uiLang: LanguageCode
}

export default function ProductForm({
  langs,
  allergens,
  initialValues,
  onSubmit,
  uiLang,
}: ProductFormProps) {
  const { t } = useTranslation(uiLang)
  const [activeLang, setActiveLang] = useState<LanguageCode>(langs[0])
  const schema = useMemo(
    () => buildSchema(langs, t.establishmentAdmin.forms.required ?? 'Requerido'),
    [langs, t.establishmentAdmin.forms.required]
  )
  const { register, handleSubmit, formState, watch, setValue } = useForm<MenuProduct>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  })

  const submitting = formState.isSubmitting
  const values = watch()

  return (
    <form
      className="admin-form"
      onSubmit={handleSubmit(async (v: MenuProduct) => {
        await onSubmit(v)
      })}
    >
      <div className="admin-form__header">
        <div className="admin-form__control-group">
          <label className="admin-form__label">{t.establishmentAdmin.forms.active}</label>
          <input type="checkbox" className="admin-checkbox" {...register('active')} />
        </div>
        <div className="admin-form__control-group admin-form__control-group--end">
          <label className="admin-form__label">
            {t.establishmentAdmin.menuManagement.products.price}
          </label>
          <input
            type="number"
            step="0.01"
            className="admin-input admin-input--medium"
            {...register('price', { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="admin-form__field">
        <label className="admin-form__label">
          {t.establishmentAdmin.menuManagement.products.allergens}
        </label>
        <AllergenSelector
          allergens={allergens}
          selectedIds={new Set(values.allergens)}
          onChange={(ids) =>
            setValue('allergens' as RHF.FieldPath<MenuProduct>, ids, { shouldValidate: true })
          }
        />
      </div>

      <LanguageTabs langs={langs} active={activeLang} onChange={setActiveLang} />

      <div className="admin-form__field">
        <label className="admin-form__label admin-form__label--required">
          {t.establishmentAdmin.menuManagement.products.name}
        </label>
        <input
          className="admin-input"
          value={values.translations[activeLang]?.name ?? ''}
          onChange={(e) =>
            setValue(
              `translations.${activeLang}.name` as RHF.FieldPath<MenuProduct>,
              e.target.value,
              { shouldValidate: true }
            )
          }
        />
      </div>

      <div className="admin-form__field">
        <label className="admin-form__label">
          {t.establishmentAdmin.menuManagement.products.description}
        </label>
        <textarea
          className="admin-textarea"
          value={values.translations[activeLang]?.description ?? ''}
          onChange={(e) =>
            setValue(
              `translations.${activeLang}.description` as RHF.FieldPath<MenuProduct>,
              e.target.value,
              { shouldValidate: false }
            )
          }
        />
      </div>

      <div className="admin-form__footer">
        <div className="admin-form__hint">{t.establishmentAdmin.forms.translationHint}</div>
        <div className="admin-form__actions">
          <button type="submit" className="admin-form__submit-btn" disabled={submitting}>
            {submitting ? (
              <>
                <div className="admin-form__spinner"></div>
                <span>{t.establishmentAdmin.forms.saving}</span>
              </>
            ) : (
              <span>{t.establishmentAdmin.forms.save}</span>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
