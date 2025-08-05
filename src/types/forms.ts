export interface CategoryFormData {
  name: string
  image_url?: string
  sort_order?: number
  is_active?: boolean
}

export interface ProductFormData {
  name: string
  description?: string
  category_id: number
  image_url?: string
  sort_order?: number
  is_active?: boolean
  responsible_role?: string
}

export interface VariantFormData {
  product_id: number
  variant_description: string
  price: string
  sku?: string
  is_active: boolean
}

export interface OrderFormData {
  table_number?: string
  notes?: string
  order_type?: string
}