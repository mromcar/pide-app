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

  const { register, handleSubmit, formState, watch, setValue, setError } = useForm<MenuCategory>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  })

  const isCreateRef = useRef(!initialValues?.id || initialValues.id === 0)
  const [saved, setSaved] = useState(false)
  const submitting = formState.isSubmitting
  const values = watch()

  // ✅ Validación personalizada para idiomas requeridos
  const validateRequiredLanguages = (values: MenuCategory): boolean => {
    const requiredLangs = ['es', 'en'] as const
    const missingLanguages: string[] = []

    for (const lang of requiredLangs) {
      const name = values.translations?.[lang]?.name
      if (!name || name.trim() === '') {
        missingLanguages.push(lang.toUpperCase())
      }
    }

    if (missingLanguages.length > 0) {
      // Mostrar error en el idioma activo
      const errorMessage =
        missingLanguages.length === 1
          ? `${t.establishmentAdmin.forms.requiredLanguage}: ${missingLanguages[0]}`
          : `${t.establishmentAdmin.forms.requiredLanguages}: ${missingLanguages.join(', ')}`

      setError('translations', {
        type: 'manual',
        message: errorMessage,
      })
      return false
    }

    return true
  }

  return (
    <form
      className="admin-form"
      onSubmit={handleSubmit(async (v) => {
        // ✅ Validar idiomas requeridos antes de enviar
        if (!validateRequiredLanguages(v)) {
          return // No enviar si falta algún idioma
        }

        // Ensure values are the correct types before submission
        const validatedValues: MenuCategory = {
          ...v,
          order: Number(v.order),
          active: Boolean(v.active),
        }

        try {
          await onSubmit(validatedValues)
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
            step="1"
            className="admin-input admin-input--small"
            {...register('order', {
              valueAsNumber: true,
              setValueAs: (value) => {
                const num = Number(value)
                return isNaN(num) ? 0 : num
              },
            })}
          />
          {formState.errors.order && (
            <div className="admin-form__error text-xs text-red-600 mt-1">
              {formState.errors.order.message}
            </div>
          )}
        </div>
        <div className="admin-form__control-group admin-form__control-group--end">
          <label className="admin-form__label">{t.establishmentAdmin.forms.active}</label>
          <input
            type="checkbox"
            className="admin-checkbox"
            {...register('active', {
              setValueAs: (value) => Boolean(value),
            })}
          />
        </div>
      </div>

      {/* ✅ Error global de idiomas requeridos */}
      {formState.errors.translations &&
        typeof formState.errors.translations.message === 'string' && (
          <div className="admin-form__error-banner">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="m12 17 .01 0" />
            </svg>
            <span>{formState.errors.translations.message}</span>
          </div>
        )}

      {/* Tabs de idiomas */}
      <LanguageTabs langs={langs} active={activeLang} onChange={setActiveLang} />

      {/* Campo de nombre por idioma */}
      <div className="admin-form__field">
        <label className="admin-form__label admin-form__label--required">
          {t.establishmentAdmin.menuManagement.categories.name}
          {(activeLang === 'es' || activeLang === 'en') && (
            <span className="admin-form__required-indicator">*</span>
          )}
        </label>

        <div className="admin-form__field-input">
          <input
            className="admin-input"
            placeholder={`${
              t.establishmentAdmin.menuManagement.categories.name
            } (${activeLang.toUpperCase()})`}
            value={values.translations?.[activeLang]?.name ?? ''}
            onChange={(e) => {
              setValue(`translations.${activeLang}.name` as any, e.target.value, {
                shouldValidate: true,
              })
              // Limpiar error global cuando se corrige
              if (formState.errors.translations) {
                setError('translations', { type: 'manual', message: undefined })
              }
            }}
          />
        </div>

        {/* Errores de validación por idioma */}
        {formState.errors.translations?.[activeLang]?.name && (
          <div className="admin-form__error">
            {formState.errors.translations[activeLang].name?.message}
          </div>
        )}
      </div>

      {/* Preview de otras traducciones con indicadores de requerido */}
      {langs.length > 1 && (
        <div className="admin-form__translations-preview">
          <div className="admin-form__translations-title">
            {t.establishmentAdmin.forms.translations}:
          </div>
          <div>
            {langs
              .filter((lang) => lang !== activeLang)
              .map((lang) => {
                const isRequired = lang === 'es' || lang === 'en'
                const hasValue = values.translations?.[lang]?.name

                return (
                  <div key={lang} className="admin-form__translation-item">
                    <span className="admin-form__translation-lang">
                      {lang.toUpperCase()}
                      {isRequired && <span className="admin-form__required-indicator">*</span>}:
                    </span>
                    <span
                      className={`admin-form__translation-text ${
                        hasValue
                          ? ''
                          : isRequired
                          ? 'admin-form__translation-text--required-missing'
                          : 'admin-form__translation-text--empty'
                      }`}
                    >
                      {hasValue ||
                        (isRequired
                          ? t.establishmentAdmin.forms.required
                          : t.establishmentAdmin.forms.notTranslated)}
                    </span>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      <div className="admin-form__footer">
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

          <button
            type="submit"
            className="admin-form__submit-btn"
            disabled={submitting}
            title={t.establishmentAdmin.forms.save}
          >
            {submitting ? (
              <>
                <div className="admin-form__spinner"></div>
                <span>{t.establishmentAdmin.forms.saving}</span>
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17,21 17,13 7,13 7,21" />
                  <polyline points="7,3 7,8 15,8" />
                </svg>
                <span>{t.establishmentAdmin.forms.save}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
