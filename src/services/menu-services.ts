import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { EstablishmentBasic } from '@/types/menu'
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateProductInput,
  UpdateProductInput
} from '@/schemas/menu'

type CategoryWithProductsPayload = Prisma.CategoryGetPayload<{
  include: {
    CategoryTranslation: true
    products: {
      include: {
        ProductTranslation: true
        variants: {
          include: {
            ProductVariantTranslation: true
          }
        }
        allergens: {
          include: {
            allergen: {
              include: {
                AllergenTranslation: true
              }
            }
          }
        }
      }
    }
  }
}>

// Validation helpers
export function isValidNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

export function validatePrice(price: any): number | null {
  if (!isValidNumber(price) || price < 0) return null
  return parseFloat(price.toFixed(2))
}

// CRUD operations for categories
export async function createCategory(
  establishmentId: number,
  data: CreateCategoryInput
) {
  return await prisma.category.create({
    data: {
      ...data,
      sort_order: data.sort_order ?? 0,
      establishment_id: establishmentId,
      is_active: true
    },
  })
}

export async function updateCategory(
  establishmentId: number,
  categoryId: number,
  data: UpdateCategoryInput
) {
  const category = await prisma.category.update({
    where: {
      category_id: categoryId,
      establishment_id: establishmentId
    },
    data: {
      name: data.name,
      ...(data.sort_order !== undefined && { sort_order: data.sort_order })
    },
  })

  if (!category) throw new Error("Category not found")
  return category
}

export async function deleteCategory(
  establishmentId: number,
  categoryId: number
) {
  const productsDeleted = await prisma.product.deleteMany({
    where: {
      category_id: categoryId,
      establishment_id: establishmentId
    }
  })

  const { count } = await prisma.category.deleteMany({
    where: {
      category_id: categoryId,
      establishment_id: establishmentId
    }
  })

  if (count === 0) throw new Error("Category not found")
  return { deleted: count, productsDeleted: productsDeleted.count }
}

// CRUD operations for products
export async function updateProduct(
  establishmentId: number,
  productId: number,
  data: UpdateProductInput
) {
  const product = await prisma.product.update({
    where: {
      product_id: productId,
      establishment_id: establishmentId
    },
    data: {
      name: data.name,
      price: data.price,
      description: data.description,
      ...(data.sort_order !== undefined && { sort_order: data.sort_order })
    },
  })

  if (!product) throw new Error("Product not found")
  return product
}

export async function deleteProduct(
  establishmentId: number,
  productId: number
) {
  const { count } = await prisma.product.deleteMany({
    where: {
      product_id: productId,
      establishment_id: establishmentId
    }
  })

  if (count === 0) throw new Error("Product not found")
  return { deleted: count }
}

export async function getCategoriesWithProducts(
  establishmentId: number,
  languageCode: string
): Promise<CategoryWithProductsPayload[]> {
  return await prisma.category.findMany({
    where: {
      establishment_id: establishmentId,
      is_active: true,
    },
    include: {
      CategoryTranslation: {
        where: { language_code: languageCode },
      },
      products: {
        where: { is_active: true },
        include: {
          ProductTranslation: {
            where: { language_code: languageCode },
          },
          variants: {
            where: { is_active: true },
            include: {
              ProductVariantTranslation: {
                where: { language_code: languageCode },
              },
            },
          },
          allergens: {
            include: {
              allergen: {
                include: {
                  AllergenTranslation: {
                    where: { language_code: languageCode },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
}

export async function getEstablishmentById(
  establishmentId: number
): Promise<EstablishmentBasic | null> {
  return await prisma.establishment.findUnique({
    where: { establishment_id: establishmentId },
    select: {
      establishment_id: true,
      name: true,
      description: true,
      website: true,
      is_active: true,
      accepts_orders: true,
    },
  })
}
