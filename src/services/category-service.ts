// src/services/category-service.ts
import { prisma } from '../lib/prisma';
import type { Category } from '@prisma/client';
import type { CreateCategoryDTO, UpdateCategoryDTO } from '../types/dtos/category';

// Función de limpieza para traducciones (camelCase, como espera Prisma Client)
function cleanCategoryTranslation(t: any, categoryId?: number) {
  return {
    ...(categoryId ? { categoryId } : {}),
    languageCode: t.languageCode,
    name: t.name,
    ...(typeof t.description === 'string' ? { description: t.description } : {}),
  };
}

// Crear categoría
export async function createCategory(data: CreateCategoryDTO): Promise<Category> {
  const { translations, ...categoryData } = data;
  return prisma.category.create({
    data: {
      ...categoryData, // camelCase aquí
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
  establishmentId: number,
  options?: { isActive?: boolean }
): Promise<Category[]> {
  return prisma.category.findMany({
    where: {
      establishmentId,
      isActive: options?.isActive,
    },
    include: {
      translations: true,
      _count: { select: { products: true } }
    },
    orderBy: {
      sortOrder: 'asc',
    },
  });
}

// Obtener una categoría por ID
export async function getCategoryById(categoryId: number): Promise<Category | null> {
  return prisma.category.findUnique({
    where: { categoryId },
    include: {
      translations: true,
      products: {
        where: { isActive: true },
        include: {
          variants: { where: { isActive: true } },
          translations: true,
        }
      }
    },
  });
}

// Actualizar categoría
export async function updateCategory(
  categoryId: number,
  establishmentId: number,
  data: UpdateCategoryDTO
): Promise<Category | null> {
  const { translations, ...categoryData } = data;

  return prisma.$transaction(async (tx) => {
    await tx.category.update({
      where: { categoryId, establishmentId },
      data: categoryData, // camelCase aquí
    });

    if (translations) {
      await tx.categoryTranslation.deleteMany({ where: { categoryId } });
      if (translations.length > 0) {
        await tx.categoryTranslation.createMany({
          data: translations.map(t => cleanCategoryTranslation(t, categoryId)),
        });
      }
    }

    return tx.category.findUnique({
      where: { categoryId, establishmentId },
      include: { translations: true }
    });
  });
}

// Eliminar categoría
export async function deleteCategory(
  categoryId: number,
  establishmentId: number
): Promise<Category | null> {
  return prisma.category.delete({
    where: { categoryId, establishmentId },
  });
}
