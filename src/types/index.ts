export type Pedido = {
    id: number
    estado: string
    detalles: any[]
    // ...otros campos relevantes
}

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

export type Translation = {
    translation_id: number
    language_code: string
}

export type CategoryTranslation = Translation & {
    category_id: number
    name: string
}

export type ProductTranslation = Translation & {
    product_id: number
    name: string
    description?: string
}

export type ProductVariantTranslation = Translation & {
    variant_id: number
    variant_description: string
}

export type Category = {
    category_id: number
    name: string
    image_url?: string
    establishment_id: number
    sort_order: number
    is_active: boolean
    translations: CategoryTranslation[]
    products: Product[]
}

export type Product = {
    product_id: number
    name: string
    description?: string
    image_url?: string
    category_id: number
    establishment_id: number
    sort_order: number
    is_active: boolean
    translations: ProductTranslation[]
    variants: ProductVariant[]
}

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

export type User = {
    user_id: number
    role: UserRole
    name?: string
    email: string
    password_hash: string
    establishment_id?: number
    created_at: Date
    updated_at: Date
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

export type OrderStatusHistory = {
    history_id: number
    order_id: number
    status: OrderStatus
    changed_by_user_id?: number
    changed_at: Date
    notes?: string
}

export type Establishment = {
    establishment_id: number
    name: string
    tax_id?: string
    address?: string
    postal_code?: string
    city?: string
    phone1?: string
    phone2?: string
    billing_bank_details?: string
    payment_bank_details?: string
    contact_person?: string
    admin_user_id?: number
    description?: string
    website?: string
    is_active: boolean
}
