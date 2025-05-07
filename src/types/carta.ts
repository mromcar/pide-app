import type { Prisma } from '@prisma/client'

// Enums
export enum UserRole {
  client = 'client',
  waiter = 'waiter',
  cook = 'cook',
  establishment_admin = 'establishment_admin',
  general_admin = 'general_admin'
}

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

// Base Translation Types
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
  description?: string | null
}

export type ProductVariantTranslation = {
  translation_id: number
  variant_id: number
  language_code: string
  variant_description: string
}

export type AllergenTranslation = {
  translation_id: number
  allergen_id: number
  language_code: string
  name: string
  description?: string | null
}

// Main Entity Types
export type Category = {
  category_id: number
  establishment_id: number
  name: string
  image_url: string | null
  sort_order: number | null
  is_active: boolean | null
  translations: CategoryTranslation[]
  products: Product[]
}

export type Product = {
  product_id: number
  establishment_id: number
  category_id: number
  name: string
  description: string | null
  image_url: string | null
  sort_order: number | null
  is_active: boolean | null
  translations: ProductTranslation[]
  variants: ProductVariant[]
  allergens?: {
    allergen: Allergen
    allergen_id: number
  }[]
}

export type ProductVariant = {
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

export type Allergen = {
  allergen_id: number
  name: string
  icon_url: string | null
  translations?: AllergenTranslation[]
}

export type ProductAllergen = {
  product_id: number
  allergen_id: number
}

// Order Related Types
export type OrderItem = {
  order_item_id: number
  order_id: number
  variant_id: number
  quantity: number
  unit_price: Prisma.Decimal
  item_total_price: Prisma.Decimal | null
  status: OrderItemStatus | null
  notes: string | null
}

export type Order = {
  order_id: number
  establishment_id: number
  client_user_id: number | null
  waiter_user_id: number | null
  table_number: string | null
  status: OrderStatus
  total_amount: Prisma.Decimal | null
  payment_method: string | null
  payment_status: string | null
  order_type: string | null
  notes: string | null
  created_at: Date | null
  updated_at: Date | null
  items: OrderItem[]
}

export type OrderStatusHistory = {
  history_id: number
  order_id: number
  status: OrderStatus
  changed_by_user_id: number | null
  changed_at: Date | null
  notes: string | null
}

// User and Establishment Types
export type User = {
  user_id: number
  role: UserRole
  name: string | null
  email: string
  password_hash: string
  establishment_id: number | null
  created_at: Date | null
  updated_at: Date | null
}

export type Establishment = {
  establishment_id: number
  name: string
  tax_id: string | null
  address: string | null
  postal_code: string | null
  city: string | null
  phone1: string | null
  phone2: string | null
  billing_bank_details: string | null
  payment_bank_details: string | null
  contact_person: string | null
  admin_user_id: number | null
  description: string | null
  website: string | null
  is_active: boolean | null
  accepts_orders: boolean
}
