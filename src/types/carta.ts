import type { Prisma } from '@prisma/client'

// Enums
export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum OrderItemStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

// Base types
export type Translation = {
  translation_id: number
  language_code: string
}

export type CategoryTranslation = {
  translation_id: number
  category_id: number
  language_code: string
  name: string
}

export type ProductTranslation = {
  translation_id: number
  product_id: number
  language_code: string
  name: string
  description: string | null
}

export type ProductVariantTranslation = {
  translation_id: number
  variant_id: number
  language_code: string
  variant_description: string
}

// Frontend types (after serialization)
export type ProductVariant = {
  variant_id: number
  product_id: number
  establishment_id: number
  variant_description: string
  price: number // Note: number instead of Decimal
  sku: string | null
  sort_order: number
  is_active: boolean
  translations: ProductVariantTranslation[]
}

export type Product = {
  product_id: number
  establishment_id: number
  category_id: number
  name: string
  description: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
  translations: ProductTranslation[]
  variants: ProductVariant[]
}

export type Category = {
  category_id: number
  establishment_id: number
  name: string
  image_url: string | null
  sort_order: number | null
  is_active: boolean
  translations: CategoryTranslation[]
  products: Product[]
}

// Order types
export type OrderItem = {
  order_item_id: number
  order_id: number
  variant_id: number
  quantity: number
  unit_price: number
  item_total_price: number
  status: OrderItemStatus
  notes?: string
}

export type Order = {
  order_id: number
  establishment_id: number
  client_user_id?: number
  waiter_user_id?: number
  table_number?: string
  status: OrderStatus
  total_amount: number
  payment_method?: string
  payment_status: string
  order_type?: string
  notes?: string
  created_at: Date
  updated_at: Date
  items: OrderItem[]
}

export type OrderStatusHistory = {
  history_id: number
  order_id: number
  status: OrderStatus
  changed_by_user_id?: number
  changed_at: Date
  notes?: string
}

// Raw types from database
export type RawCategory = {
  category_id: number
  establishment_id: number
  name: string
  image_url: string | null
  sort_order: number | null
  is_active: boolean | null
  products: RawProduct[]
  CategoryTranslation?: CategoryTranslation[]
}

export type RawProduct = {
  product_id: number
  establishment_id: number
  category_id: number
  name: string
  description: string | null
  image_url: string | null
  sort_order: number | null
  is_active: boolean | null
  ProductTranslation?: ProductTranslation[]
  variants: RawProductVariant[]
}

export type RawProductVariant = {
  variant_id: number
  product_id: number
  establishment_id: number
  variant_description: string
  price: Prisma.Decimal
  sku: string | null
  sort_order: number | null
  is_active: boolean | null
  translations: ProductVariantTranslation[]
}

// Database types (exactly as returned by Prisma)
export type DBProductVariantTranslation = {
  translation_id: number
  variant_id: number
  language_code: string
  variant_description: string
}

export type DBProductVariant = {
  variant_id: number
  product_id: number
  establishment_id: number
  variant_description: string
  price: Prisma.Decimal
  sku: string | null
  sort_order: number | null
  is_active: boolean | null
  translations: DBProductVariantTranslation[]
}

export type DBProductTranslation = {
  translation_id: number
  product_id: number
  language_code: string
  name: string
  description: string | null
}

export type DBProduct = {
  product_id: number
  establishment_id: number
  category_id: number
  name: string
  description: string | null
  image_url: string | null
  sort_order: number | null
  is_active: boolean | null
  ProductTranslation: DBProductTranslation[]
  variants: DBProductVariant[]
}

export type DBCategoryTranslation = {
  translation_id: number
  category_id: number
  language_code: string
  name: string
}

export type DBCategory = {
  category_id: number
  establishment_id: number
  name: string
  image_url: string | null
  sort_order: number | null
  is_active: boolean | null
  products: DBProduct[]
  CategoryTranslation: DBCategoryTranslation[]
}

export type EstablishmentBasic = {
  establishment_id: number
  name: string
  description: string | null
  website: string | null
  is_active: boolean
  accepts_orders: boolean
}
