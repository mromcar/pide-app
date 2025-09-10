export type LanguageCode = 'es' | 'en' | 'fr'

// Idioma por defecto
export const DEFAULT_LANGUAGE: LanguageCode = 'es'

// Idiomas soportados por i18n (mantener FR para compatibilidad interna)
export const SUPPORTED_LANGS: LanguageCode[] = ['es', 'en', 'fr']

// Idiomas visibles en UI (FR oculto temporalmente)
export const VISIBLE_LANGS: LanguageCode[] = ['es', 'en']
