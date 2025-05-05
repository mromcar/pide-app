import { PrismaClient } from '@prisma/client'
import { type Establishment } from '@prisma/client'

export async function getCategoriesWithProducts(establishmentId: number, languageCode: string) {
  const db = new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

  try {
    const categories = await db.category.findMany({
      where: {
        establishment_id: establishmentId,
        is_active: true,
      },
      select: {
        category_id: true,
        establishment_id: true,
        name: true,
        image_url: true,
        sort_order: true,
        is_active: true,
        products: {
          where: { is_active: true },
          select: {
            product_id: true,
            establishment_id: true,
            category_id: true,
            name: true,
            description: true,
            image_url: true,
            sort_order: true,
            is_active: true,
            ProductTranslation: {
              where: { language_code: languageCode },
              select: {
                translation_id: true,
                product_id: true,
                language_code: true,
                name: true,
                description: true,
              },
            },
            variants: {
              where: { is_active: true },
              select: {
                variant_id: true,
                product_id: true,
                establishment_id: true,
                variant_description: true,
                price: true,
                sku: true,
                sort_order: true,
                is_active: true,
                translations: {
                  where: { language_code: languageCode },
                  select: {
                    translation_id: true,
                    variant_id: true,
                    language_code: true,
                    variant_description: true,
                  },
                },
              },
            },
          },
        },
        CategoryTranslation: {
          where: { language_code: languageCode },
          select: {
            translation_id: true,
            category_id: true,
            language_code: true,
            name: true,
          },
        },
      },
    })

    // Transform Decimal to number
    return categories.map(category => ({
      ...category,
      products: category.products.map(product => ({
        ...product,
        variants: product.variants.map(variant => ({
          ...variant,
          price: variant.price.toNumber() // Convert Decimal to number
        }))
      }))
    }))
  } finally {
    await db.$disconnect()
  }
}

export async function getEstablishmentById(establishmentId: number): Promise<Establishment | null> {
  const db = new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

  try {
    const result = await db.establishment.findUnique({
      where: {
        establishment_id: establishmentId
      },
      select: {
        establishment_id: true,
        name: true,
        description: true,
        website: true,
        is_active: true,
        accepts_orders: true,
      }
    })
    return result
  } catch (error) {
    console.error('Error:', error)
    throw error
  } finally {
    await db.$disconnect()
  }
}

// Add type for better TypeScript support
export type Establishment = {
  establishment_id: number
  name: string
  is_active: boolean
  description?: string
}

// Updated types to match the new schema
export type ProductVariantTranslation = {
  translation_id: number
  variant_id: number
  language_code: string
  variant_description: string
}

export type ProductVariant = {
  variant_id: number
  product_id: number
  establishment_id: number
  variant_description: string
  price: number
  sku: string
  sort_order: number | null
  is_active: boolean
  translations: ProductVariantTranslation[]
}

export type ProductTranslation = {
  translation_id: number
  product_id: number
  language_code: string
  name: string
  description: string | null
}

export type Product = {
  product_id: number
  establishment_id: number
  category_id: number
  name: string
  description: string | null
  image_url: string | null
  sort_order: number | null
  is_active: boolean
  translations: ProductTranslation[]
  variants: ProductVariant[]
}

export type CategoryTranslation = {
  translation_id: number
  category_id: number
  language_code: string
  name: string
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
