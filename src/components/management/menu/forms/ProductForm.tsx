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

const translationSchema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().optional().nullable(),
})
const buildSchema = (langs: LanguageCode[]) =>
  z.object({
    id: z.number(),
    categoryId: z.number(),
    price: z.number().min(0),
    active: z.boolean(),
    allergens: z.array(z.number()),
    translations: z.object(
      Object.fromEntries(langs.map((l) => [l, translationSchema])) as Record<
        LanguageCode,
        typeof translationSchema
      >
    ),
  })

interface ProductFormProps {
  langs: LanguageCode[]
  allergens: UIAllergen[]
  initialValues: MenuProduct
  onSubmit: (values: MenuProduct) => Promise<void>
}

export default function ProductForm({
  langs,
  allergens,
  initialValues,
  onSubmit,
}: ProductFormProps) {
  const [activeLang, setActiveLang] = useState<LanguageCode>(langs[0])
  const schema = useMemo(() => buildSchema(langs), [langs])
  const { register, handleSubmit, formState, watch, setValue } = useForm<MenuProduct>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  })

  const submitting = formState.isSubmitting
  const values = watch()

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (v: MenuProduct) => {
        await onSubmit(v)
      })}
    >
      <div className="flex items-center gap-3">
        <label className="text-sm">Active</label>
        <input type="checkbox" {...register('active')} />
        <label className="text-sm">Price (€)</label>
        <input
          type="number"
          step="0.01"
          className="admin-input w-32"
          {...register('price', { valueAsNumber: true })}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm">Allergens</label>
        <AllergenSelector
          allergens={allergens}
          selectedIds={new Set(values.allergens)}
          onChange={(ids) =>
            setValue('allergens' as RHF.FieldPath<MenuProduct>, ids, { shouldValidate: true })
          }
        />
      </div>

      <LanguageTabs langs={langs} active={activeLang} onChange={setActiveLang} />
      <div className="space-y-2">
        <label className="text-sm">Name</label>
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
        <label className="text-sm">Description</label>
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

      <div className="flex justify-end gap-2">
        <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>
          Save
        </button>
      </div>
    </form>
  )
}
