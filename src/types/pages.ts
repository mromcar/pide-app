import { LanguageCode } from '@/constants/languages'

/**
 * Base interface for all page props with language support
 */
export interface BasePageProps {
  params: Promise<{
    lang: LanguageCode
  }>
}

/**
 * Props for pages that need search parameters
 */
export interface BasePagePropsWithSearch extends BasePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// ===== ESTABLISHMENT & MENU PAGES =====

/**
 * Props for establishment menu page: /[lang]/[establishmentId]/menu
 */
export interface EstablishmentMenuPageProps extends BasePageProps {
  params: Promise<{
    lang: LanguageCode
    establishmentId: string
  }>
}

// ===== ORDER PAGES =====

/**
 * Props for order confirmation page: /[lang]/order/[orderId]
 */
export interface OrderPageProps extends BasePageProps {
  params: Promise<{
    lang: LanguageCode
    orderId: string
  }>
}

/**
 * Props for order tracking page: /[lang]/order/[orderId]/track
 */
export interface OrderTrackPageProps extends BasePageProps {
  params: Promise<{
    lang: LanguageCode
    orderId: string
  }>
}

// ===== AUTH PAGES =====
// ✅ ARREGLADO: Usar type alias para interfaces que no añaden properties

/**
 * Props for login page: /[lang]/login
 */
export type LoginPageProps = BasePageProps

/**
 * Props for register page: /[lang]/register
 */
export type RegisterPageProps = BasePageProps

// ===== ADMIN PAGES =====

/**
 * Props for admin establishment page: /[lang]/admin/[establishmentId]
 */
export interface AdminEstablishmentPageProps extends BasePageProps {
  params: Promise<{
    lang: LanguageCode
    establishmentId: string
  }>
}

/**
 * Props for admin menu management: /[lang]/admin/[establishmentId]/menu
 */
export interface AdminMenuPageProps extends BasePageProps {
  params: Promise<{
    lang: LanguageCode
    establishmentId: string
  }>
}

// ===== HOME & GENERAL PAGES =====
// ✅ ARREGLADO: Usar type alias para interfaces que no añaden properties

/**
 * Props for home page: /[lang]
 */
export type HomePageProps = BasePageProps

/**
 * Props for establishment selection/discovery page
 */
export type EstablishmentSelectionPageProps = BasePageProps

// ===== UTILITY TYPES =====

/**
 * Extract params from page props
 */
export type PageParams<T extends BasePageProps> = T['params']

/**
 * Extract search params if they exist
 */
export type PageSearchParams<T> = T extends BasePagePropsWithSearch
  ? T['searchParams']
  : never

// ===== METADATA GENERATION HELPERS =====

/**
 * Helper type for generateMetadata functions
 */
export interface MetadataProps<T extends BasePageProps> {
  params: T['params']
  searchParams?: T extends BasePagePropsWithSearch ? T['searchParams'] : never
}
