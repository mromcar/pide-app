import type {
  Category,
  Product,
  ProductVariant,
  SerializedCategory,
  SerializedProduct,
  SerializedProductVariant,
  SerializedProductAllergen,
  SerializedOrder,
  SerializedOrderItem,
  Order,
  OrderItem
} from '@/types/menu'
import { Prisma } from '@prisma/client'
import type { LanguageCode } from '@/constants/languages'
import { getTranslation } from './translations'

// Helper functions for common serialization tasks
export const serializeDate = (date: Date): string => date.toISOString()
export const serializeDecimal = (decimal: Prisma.Decimal): number => decimal.toNumber()

// Helper to serialize any object containing Decimal values
export function serializeDecimals<T extends Record<string, any>>(obj: T): T {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value?.constructor?.name === 'Decimal') {
      acc[key] = serializeDecimal(value)
    } else if (Array.isArray(value)) {
      acc[key] = value.map(item =>
        typeof item === 'object' ? serializeDecimals(item) : item
      )
    } else if (typeof value === 'object' && value !== null) {
      acc[key] = serializeDecimals(value)
    } else {
      acc[key] = value
    }
    return acc
  }, {} as T)
}

export function serializeVariant(
  variant: ProductVariant,
  language: LanguageCode
): SerializedProductVariant {
  return serializeDecimals({
    ...variant,
    variant_description: getTranslation(
      variant,
      variant.ProductVariantTranslation,
      language,
      'variant_description'
    ),
    created_at: serializeDate(variant.created_at),
    updated_at: serializeDate(variant.updated_at)
  })
}

export function serializeProduct(
  product: Product,
  language: LanguageCode
): SerializedProduct {
  return {
    ...product,
    name: getTranslation(product, product.ProductTranslation, language),
    description: getTranslation(product, product.ProductTranslation, language, 'description'),
    variants: product.variants.map(v => serializeVariant(v, language)),
    allergens: product.allergens.map(allergen => ({
      ...allergen,
      allergen: {
        ...allergen.allergen,
        name: getTranslation(
          allergen.allergen,
          allergen.allergen.AllergenTranslation,
          language
        )
      },
      created_at: serializeDate(allergen.created_at),
      updated_at: serializeDate(allergen.updated_at)
    }))
  }
}

export function serializeCategory(
  category: Category,
  language: LanguageCode
): SerializedCategory {
  return {
    ...category,
    name: getTranslation(category, category.CategoryTranslation, language),
    products: category.products.map(p => serializeProduct(p, language))
  }
}

export function serializeOrder(order: Order): SerializedOrder {
  return serializeDecimals({
    ...order,
    items: order.items.map(item => ({
      ...item,
      created_at: serializeDate(item.created_at),
      updated_at: serializeDate(item.updated_at)
    })),
    created_at: serializeDate(order.created_at),
    updated_at: serializeDate(order.updated_at)
  })
}

export function serializeOrderItem(item: OrderItem): SerializedOrderItem {
  return serializeDecimals({
    ...item,
    created_at: serializeDate(item.created_at),
    updated_at: serializeDate(item.updated_at)
  })
}

// Helper for API responses
export function serializeResponse<T extends Record<string, any>>(data: T): T {
  return serializeDecimals(data)
}
