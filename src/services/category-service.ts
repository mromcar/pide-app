// src/services/category-service.ts
import { prisma } from '../lib/prisma';
import type { Category } from '@prisma/client';
import type { CreateCategoryDTO, UpdateCategoryDTO } from '../types/dtos/category'; // Usando los DTOs de product.ts si están allí

export const categoryService = {
  async createCategory(data: CreateCategoryDTO): Promise<Category> {
    const { translations, ...categoryData } = data;
    return prisma.category.create({
      data: {
        ...categoryData,
        translations: translations
          ? {
              createMany: {
                data: translations.map(t => ({ languageCode: t.languageCode, name: t.name })),
              },
            }
          : undefined,
      },
      include: {
        translations: true,
      },
    });
  },

  async getCategoriesByEstablishment(establishmentId: number, options?: { isActive?: boolean }): Promise<Category[]> {
    return prisma.category.findMany({
      where: {
        establishmentId,
        isActive: options?.isActive,
      },
      include: {
        translations: true, // Considera filtrar por idioma aquí si es necesario
        _count: { // Opcional: contar productos por categoría
          select: { products: true }
        }
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });
  },

  async getCategoryById(categoryId: number): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        translations: true,
        products: { // Opcional: cargar productos asociados
          where: { isActive: true },
          include: {
            variants: { where: { isActive: true } },
            translations: true,
          }
        }
      },
    });
  },

  async updateCategory(categoryId: number, data: UpdateCategoryDTO): Promise<Category | null> {
    const { translations, ...categoryData } = data;

    return prisma.$transaction(async (tx) => {
      const updatedCategory = await tx.category.update({
        where: { id: categoryId },
        data: {
          ...categoryData,
        },
      });

      if (translations) {
        // Eliminar traducciones existentes y crear las nuevas, o hacer upsert
        await tx.categoryTranslation.deleteMany({
          where: { categoryId: categoryId },
        });
        if (translations.length > 0) {
          await tx.categoryTranslation.createMany({
            data: translations.map(t => ({
              categoryId: categoryId,
              languageCode: t.languageCode,
              name: t.name,
            })),
          });
        }
      }

      return tx.category.findUnique({
        where: { id: categoryId },
        include: { translations: true }
      });
    });
  },

  async deleteCategory(categoryId: number): Promise<Category | null> {
    // Prisma se encargará de las acciones onDelete (e.g., borrar traducciones en cascada)
    // Si los productos tienen onDelete: RESTRICT para categoryId, este borrado fallará si hay productos.
    return prisma.category.delete({
      where: { id: categoryId },
    });
  },
};
