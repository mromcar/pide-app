import type {
  Category as PrismaCategory,
  Product as PrismaProduct,
  ProductVariant as PrismaProductVariant,
  ProductTranslation as PrismaProductTranslation,
  ProductVariantTranslation as PrismaProductVariantTranslation,
  Allergen as PrismaAllergen,
  AllergenTranslation as PrismaAllergenTranslation,
  ProductAllergen as PrismaProductAllergen,
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
  OrderStatusHistory as PrismaOrderStatusHistory,
  User as PrismaUser,
  Establishment as PrismaEstablishment,
  Prisma,
  UserRole,
  OrderStatus,
  OrderItemStatus
} from '@prisma/client'

// Re-export enums directly from Prisma
export type { UserRole, OrderStatus, OrderItemStatus }

// Define base Prisma types with relations
type CategoryWithRelations = Prisma.CategoryGetPayload<{
  include: {
    CategoryTranslation: true // Changed from translations to match schema
    products: {
      include: {
        ProductTranslation: true // Changed from translations to match schema
        variants: {
          include: {
            ProductVariantTranslation: true // Changed from translations to match schema
          }
        }
        allergens: {
          include: {
            allergen: {
              include: {
                AllergenTranslation: true // Changed from translations to match schema
              }
            }
          }
        }
      }
    }
  }
}>

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    ProductTranslation: true // Changed from translations to match schema
    variants: {
      include: {
        ProductVariantTranslation: true // Changed from translations to match schema
      }
    }
    allergens: {
      include: {
        allergen: {
          include: {
            AllergenTranslation: true // Changed from translations to match schema
          }
        }
      }
    }
  }
}>

// Database types (direct from Prisma)
export type Category = CategoryWithRelations
export type Product = ProductWithRelations
export type ProductVariant = PrismaProductVariant & {
  ProductVariantTranslation: ProductVariantTranslation[] // Changed from translations
}

// Serialized types (for API/JSON responses)
export type SerializedCategory = Omit<Category, 'price'> & {
  products: SerializedProduct[]
  CategoryTranslation: PrismaProductTranslation[] // Changed from translations
}

export type SerializedProduct = Omit<Product, 'price'> & {
  variants: SerializedProductVariant[]
  allergens: SerializedProductAllergen[]
  ProductTranslation: PrismaProductTranslation[] // Changed from translations
}

export type SerializedProductVariant = Omit<ProductVariant, 'price' | 'created_at' | 'updated_at'> & {
  price: number // Convert Prisma.Decimal to number for JSON
  created_at: string // ISO date string
  updated_at: string // ISO date string
  ProductVariantTranslation: PrismaProductVariantTranslation[] // Changed from translations
}

export type SerializedProductAllergen = Omit<ProductAllergen, 'created_at' | 'updated_at'> & {
  allergen: SerializedAllergen
  created_at: string // ISO date string
  updated_at: string // ISO date string
}

export type SerializedAllergen = Omit<Allergen, 'created_at' | 'updated_at'> & {
  created_at: string // ISO date string
  updated_at: string // ISO date string
  AllergenTranslation: PrismaAllergenTranslation[] // Changed from translations
}

// Order types with proper serialization
export type SerializedOrderItem = Omit<OrderItem, 'price' | 'created_at' | 'updated_at'> & {
  price: number // Convert Prisma.Decimal to number
  created_at: string
  updated_at: string
}

export type SerializedOrder = Omit<Order, 'total_amount' | 'created_at' | 'updated_at'> & {
  items: SerializedOrderItem[]
  total_amount: number // Convert Prisma.Decimal to number
  created_at: string
  updated_at: string
}

// Base types for database operations
export type OrderItem = PrismaOrderItem
export type Order = PrismaOrder & {
  items: OrderItem[]
}
export type OrderStatusHistory = PrismaOrderStatusHistory

// User and Establishment types
export type User = PrismaUser
export type Establishment = PrismaEstablishment

export type EstablishmentBasic = Pick<
  PrismaEstablishment,
  | 'establishment_id'
  | 'name'
  | 'description'
  | 'website'
  | 'is_active'
  | 'accepts_orders'
>
