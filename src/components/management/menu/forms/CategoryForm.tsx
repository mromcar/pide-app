import { useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import LanguageTabs from './LanguageTabs'
import type { LanguageCode } from '@/constants/languages'
import type { MenuCategory } from '@/types/management/menu'
import { useTranslation } from '@/hooks/useTranslation'

const buildTranslationSchema = (requiredMsg: string) =>
  z.object({
    name: z.string().min(1, requiredMsg),
  })

const buildSchema = (langs: LanguageCode[], requiredMsg: string) =>
  z.object({
    id: z.number(),
    order: z.number().min(0),
    active: z.boolean(),
    translations: z.object(
      Object.fromEntries(langs.map((l) => [l, buildTranslationSchema(requiredMsg)])) as Record<
        LanguageCode,
        ReturnType<typeof buildTranslationSchema>
      >
    ),
  })

interface CategoryFormProps {
  langs: LanguageCode[]
  initialValues: MenuCategory
  onSubmit: (values: MenuCategory) => Promise<void>
  uiLang: LanguageCode
}

export default function CategoryForm({
  langs,
  initialValues,
  onSubmit,
  uiLang,
}: CategoryFormProps) {
  const { t } = useTranslation(uiLang)
  const requiredMsg = t.establishmentAdmin.forms.required

  const [activeLang, setActiveLang] = useState<LanguageCode>(langs[0])
  const schema = useMemo(() => buildSchema(langs, requiredMsg), [langs, requiredMsg])

  const { register, handleSubmit, formState, watch, setValue } = useForm<MenuCategory>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  })

  const isCreateRef = useRef(!initialValues?.id || initialValues.id === 0)
  const [saved, setSaved] = useState(false)
  const submitting = formState.isSubmitting
  const values = watch()

  return (
    <form
      className="admin-form"
      onSubmit={handleSubmit(async (v) => {
        console.log('[CategoryForm] Submitting values:', v)
        try {
          await onSubmit(v)
          setSaved(true)
          setTimeout(() => setSaved(false), 2000)
        } catch (error) {
          console.error('[CategoryForm] Submit error:', error)
        }
      })}
    >
      {/* Header con orden y estado activo */}
      <div className="admin-form__header">
        <div className="admin-form__control-group">
          <label className="admin-form__label">
            {t.establishmentAdmin.menuManagement.categories.order}
          </label>
          <input
            type="number"
            min="0"
            className="admin-input admin-input--small"
            {...register('order', { valueAsNumber: true })}
          />
        </div>
        <div className="admin-form__control-group admin-form__control-group--end">
          <label className="admin-form__label">{t.establishmentAdmin.forms.active}</label>
          <input type="checkbox" className="admin-checkbox" {...register('active')} />
        </div>
      </div>

      {/* Tabs de idiomas */}
      <LanguageTabs langs={langs} active={activeLang} onChange={setActiveLang} />

      {/* Campo de nombre */}
      <div className="admin-form__field">
        <label className="admin-form__label admin-form__label--required">
          {t.establishmentAdmin.menuManagement.categories.name}
        </label>

        <div className="admin-form__field-input">
          <input
            className="admin-input"
            placeholder={`${
              t.establishmentAdmin.menuManagement.categories.name
            } (${activeLang.toUpperCase()})`}
            value={values.translations?.[activeLang]?.name ?? ''}
            onChange={(e) =>
              setValue(`translations.${activeLang}.name` as any, e.target.value, {
                shouldValidate: true,
              })
            }
          />
        </div>

        {/* Errores de validación */}
        {formState.errors.translations?.[activeLang]?.name && (
          <div className="admin-form__error">
            {formState.errors.translations[activeLang].name?.message}
          </div>
        )}
      </div>

      {/* Preview de otras traducciones */}
      {langs.length > 1 && (
        <div className="admin-form__translations-preview">
          <div className="admin-form__translations-title">
            {t.establishmentAdmin.forms.translations}:
          </div>
          <div>
            {langs
              .filter((lang) => lang !== activeLang)
              .map((lang) => (
                <div key={lang} className="admin-form__translation-item">
                  <span className="admin-form__translation-lang">{lang.toUpperCase()}:</span>
                  <span
                    className={
                      values.translations?.[lang]?.name
                        ? 'admin-form__translation-text'
                        : 'admin-form__translation-text admin-form__translation-text--empty'
                    }
                  >
                    {values.translations?.[lang]?.name || t.establishmentAdmin.forms.notTranslated}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Footer con acciones */}
      <div className="admin-form__footer">
        <div className="admin-form__hint">{t.establishmentAdmin.forms.translationHint}</div>

        <div className="admin-form__actions">
          {saved && (
            <div className="admin-form__success">
              <span>✅</span>
              <span>
                {isCreateRef.current
                  ? t.establishmentAdmin.notifications?.categoryCreated
                  : t.establishmentAdmin.notifications?.categoryUpdated}
              </span>
            </div>
          )}
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
