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

export type CategoryTranslation = Translation & {
  name: string
}

export type ProductTranslation = Translation & {
  name: string
  description?: string
}

export type ProductVariantTranslation = Translation & {
  variant_description: string
}

// Main types
export type ProductVariant = {
  variant_id: number
  product_id: number
  establishment_id: number
  variant_description: string
  price: number
  sku?: string
  sort_order: number
  is_active: boolean
  translations: ProductVariantTranslation[]
}

export type Product = {
  product_id: number
  name: string
  description?: string
  image_url?: string
  category_id: number
  establishment_id: number
  sort_order: number
  translations: ProductTranslation[]
  variants: ProductVariant[]
}

export type Category = {
  category_id: number
  name: string
  image_url?: string
  establishment_id: number
  sort_order: number
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
