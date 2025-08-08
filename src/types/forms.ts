export interface CategoryFormData {
  name: string
  imageUrl?: string
  sortOrder?: number
  isActive?: boolean
}

export interface ProductFormData {
  name: string
  description?: string
  categoryId: number
  imageUrl?: string
  sortOrder?: number
  isActive?: boolean
  responsibleRole?: string
}

export interface VariantFormData {
  productId: number
  variantDescription: string
  price: string
  sku?: string
  isActive: boolean
}

export interface OrderFormData {
  tableNumber?: string
  notes?: string
  orderType?: string
}
