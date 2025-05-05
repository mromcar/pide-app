import { PrismaClient } from '@prisma/client'
import prisma from '@/lib/prisma'

export async function obtenerCategoriasConProductos(
  establishmentId: number,
  languageCode: string
) {
  return prisma.category.findMany({
    where: {
      establishment_id: establishmentId,
      is_active: true
    },
    select: {
      category_id: true,
      name: true,
      image_url: true,
      sort_order: true,
      products: {
        where: { is_active: true },
        select: {
          product_id: true,
          name: true,
          description: true,
          price: true,
          image_url: true,
          sort_order: true,
          ProductTranslation: {
            where: { language_code },
            select: {
              translation_id: true,
              name: true,
              description: true,
              language_code: true,
            },
          },
        },
        orderBy: { sort_order: 'asc' },
      },
    },
    orderBy: { sort_order: 'asc' },
  })
}

export async function obtenerEstablecimientoPorId(establishmentId: number) {
  return prisma.establishment.findUnique({
    where: {
      establishment_id: establishmentId
    },
    select: {
      establishment_id: true,
      name: true,
      is_active: true
    }
  })
}

export type ProductTranslation = {
  name: string
  description: string | null
  language_code: string
  translation_id: number
}

export type ProductWithTranslation = {
  product_id: number
  name: string
  description: string | null
  price: Prisma.Decimal
  image_url?: string
  sort_order?: number
  ProductTranslation: ProductTranslation[]
}

export type CategoryWithProducts = {
  category_id: number
  name: string
  image_url?: string
  sort_order?: number
  products: ProductWithTranslation[]
}
