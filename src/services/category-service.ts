// src/services/category-service.ts
import { prisma } from '../lib/prisma';
import type { Category } from '@prisma/client';
import type { CreateCategoryDTO, UpdateCategoryDTO } from '../types/dtos/category';
import { toSnakeCase } from '@/utils/case';



function cleanCategoryTranslation(t: any, categoryId?: number) {
  // Recibe camelCase, devuelve snake_case
  return {
    ...(categoryId ? { category_id: categoryId } : {}),
    language_code: t.languageCode,
    name: t.name,
    ...(typeof t.description === 'string' ? { description: t.description } : {}),
  };
}

// Crear categoría
export async function createCategory(data: CreateCategoryDTO): Promise<Category> {
  const { translations, ...categoryData } = data;
  return prisma.category.create({
    data: {
      ...toSnakeCase(categoryData),
      translations: translations && translations.length > 0
        ? {
          createMany: {
            data: translations.map(t => cleanCategoryTranslation(t)),
          },
        }
        : undefined,
    },
    include: {
      translations: true,
    },
  });
}

// Obtener todas las categorías de un restaurante
export async function getCategoriesByEstablishment(
  establishment_id: number,
  options?: { is_active?: boolean }
): Promise<Category[]> {
  return prisma.category.findMany({
    where: {
      establishment_id,
      is_active: options?.is_active,
    },
    include: {
      translations: true,
      _count: { select: { products: true } }
    },
    orderBy: {
      sort_order: 'asc',
    },
  });
}

// Obtener una categoría por ID
export async function getCategoryById(category_id: number): Promise<Category | null> {
  return prisma.category.findUnique({
    where: { category_id },
    include: {
      translations: true,
      products: {
        where: { is_active: true },
        include: {
          variants: { where: { is_active: true } },
          translations: true,
        }
      }
    },
  });
}

// Actualizar categoría
export async function updateCategory(
  category_id: number,
  establishment_id: number,
  data: UpdateCategoryDTO
): Promise<Category | null> {
  const { translations, ...categoryData } = data;

  return prisma.$transaction(async (tx) => {
    await tx.category.update({
      where: { category_id, establishment_id },
      data: toSnakeCase(categoryData),
    });

    if (translations) {
      await tx.categoryTranslation.deleteMany({ where: { category_id } });
      if (translations.length > 0) {
        await tx.categoryTranslation.createMany({
          data: translations.map(t => cleanCategoryTranslation(t, category_id)),
        });
      }
    }

    return tx.category.findUnique({
      where: { category_id, establishment_id },
      include: { translations: true }
    });
  });
}

// Eliminar categoría
export async function deleteCategory(
  category_id: number,
  establishment_id: number
): Promise<Category | null> {
  return prisma.category.delete({
    where: { category_id, establishment_id },
  });
}
