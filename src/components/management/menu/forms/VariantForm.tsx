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
import type { LanguageCode } from '@/constants/languages'
import type { ProductVariant } from '@/types/management/menu'
import { useTranslation } from '@/hooks/useTranslation'

const buildTranslationSchema = (requiredMsg: string) =>
  z.object({
    name: z.string().min(1, requiredMsg),
    description: z.string().optional().nullable(),
  })
const buildSchema = (langs: LanguageCode[], requiredMsg: string) =>
  z.object({
    id: z.number(),
    productId: z.number(),
    priceModifier: z.number(),
    active: z.boolean(),
    translations: z.object(
      Object.fromEntries(langs.map((l) => [l, buildTranslationSchema(requiredMsg)])) as Record<
        LanguageCode,
        ReturnType<typeof buildTranslationSchema>
      >
    ),
  })

interface VariantFormProps {
  langs: LanguageCode[]
  initialValues: ProductVariant
  onSubmit: (values: ProductVariant) => Promise<void>
  uiLang: LanguageCode
}

export default function VariantForm({ langs, initialValues, onSubmit, uiLang }: VariantFormProps) {
  const { t } = useTranslation(uiLang)
  const [activeLang, setActiveLang] = useState<LanguageCode>(langs[0])
  const schema = useMemo(
    () => buildSchema(langs, t.establishmentAdmin.forms.required ?? 'Requerido'),
    [langs, t.establishmentAdmin.forms.required]
  )
  const { register, handleSubmit, formState, watch, setValue } = useForm<ProductVariant>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  })

  const submitting = formState.isSubmitting
  const values = watch()

  return (
    <form
      className="admin-form"
      onSubmit={handleSubmit(async (v: ProductVariant) => {
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
            {t.establishmentAdmin.menuManagement.variants.priceModifier}
          </label>
          <input
            type="number"
            step="0.01"
            className="admin-input admin-input--medium"
            {...register('priceModifier', { valueAsNumber: true })}
          />
        </div>
      </div>

      <LanguageTabs langs={langs} active={activeLang} onChange={setActiveLang} />

      <div className="admin-form__field">
        <label className="admin-form__label admin-form__label--required">
          {t.establishmentAdmin.menuManagement.variants.name}
        </label>
        <input
          className="admin-input"
          value={values.translations[activeLang]?.name ?? ''}
          onChange={(e) =>
            setValue(
              `translations.${activeLang}.name` as RHF.FieldPath<ProductVariant>,
              e.target.value,
              { shouldValidate: true }
            )
          }
        />
      </div>

      <div className="admin-form__field">
        <label className="admin-form__label">
          {t.establishmentAdmin.menuManagement.variants.description}
        </label>
        <textarea
          className="admin-textarea"
          value={values.translations[activeLang]?.description ?? ''}
          onChange={(e) =>
            setValue(
              `translations.${activeLang}.description` as RHF.FieldPath<ProductVariant>,
              e.target.value,
              { shouldValidate: false }
            )
          }
        />
      </div>

      <div className="admin-form__footer">
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
