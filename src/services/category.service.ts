import { prisma } from '@/lib/prisma';
import { Category, CategoryTranslation, Prisma } from '@prisma/client';
import {
  CategoryCreateDTO,
  CategoryUpdateDTO,
  CategoryDTO,
} from '../types/dtos/category';
import {
  CategoryTranslationCreateDTO,
  CategoryTranslationDTO,
  CategoryTranslationUpdateDTO
} from '../types/dtos/categoryTranslation';
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  categoryIdSchema,
  CategoryCreateInput, // Import Zod inferred type
  CategoryUpdateInput   // Import Zod inferred type
} from '../schemas/category';
import { categoryTranslationCreateSchema, categoryTranslationUpdateSchema } from '../schemas/categoryTranslation';




export class CategoryService {
  private mapToTranslationDTO(translation: CategoryTranslation): CategoryTranslationDTO {
    return {
      translation_id: translation.translation_id,
      category_id: translation.category_id,
      language_code: translation.language_code,
      name: translation.name,
    };
  }

  private mapToDTO(category: Category & { translations?: CategoryTranslation[] }): CategoryDTO {
    return {
      category_id: category.category_id,
      establishment_id: category.establishment_id,
      name: category.name, // Default name
      image_url: category.image_url,
      sort_order: category.sort_order,
      is_active: category.is_active,
      created_at: category.created_at?.toISOString() || null,
      updated_at: category.updated_at?.toISOString() || null,
      deleted_at: category.deleted_at?.toISOString() || null,
      translations: category.translations?.map(this.mapToTranslationDTO) || [],
    };
  }

  async createCategory(data: CategoryCreateInput): Promise<CategoryDTO> {
    categoryCreateSchema.parse(data); // Validate input

    const { translations, ...categoryData } = data;

    const newCategory = await prisma.category.create({
      data: {
        ...categoryData,
        translations: translations && translations.length > 0 ? {
          createMany: {
            // No need for '!' as categoryTranslationCreateSchema ensures they are strings
            data: translations.map(t => ({ language_code: t.language_code, name: t.name })),
          },
        } : undefined,
      },
      include: { translations: true },
    });
    return this.mapToDTO(newCategory);
  }

  async getAllCategoriesByEstablishment(establishmentId: number, page: number = 1, pageSize: number = 10): Promise<CategoryDTO[]> {
    const skip = (page - 1) * pageSize;
    const categories = await prisma.category.findMany({
      where: {
        establishment_id: establishmentId,
        deleted_at: null, // Typically, you don't want to fetch soft-deleted items
      },
      skip: skip,
      take: pageSize,
      include: { translations: true },
      orderBy: { sort_order: 'asc' }, // Or any other preferred order
    });
    return categories.map(category => this.mapToDTO(category));
  }

  async getCategoryById(categoryId: number): Promise<CategoryDTO | null> {
    categoryIdSchema.parse({ categoryId });
    const category = await prisma.category.findUnique({
      where: {
        category_id: categoryId,
        deleted_at: null,
      },
      include: { translations: true },
    });
    return category ? this.mapToDTO(category) : null;
  }

  async updateCategory(categoryId: number, restaurantId: number, data: CategoryUpdateInput): Promise<CategoryDTO | null> {
    categoryIdSchema.parse({ categoryId });
    categoryUpdateSchema.parse(data); // Zod now ensures translations (if any) have string language_code and name

    const { translations, ...categoryData } = data;

    try {
      const updatedCategory = await prisma.$transaction(async (tx) => {
        // First, verify the category belongs to the restaurant
        const existingCategory = await tx.category.findUnique({
          where: { category_id: categoryId },
        });

        if (!existingCategory || existingCategory.establishment_id !== restaurantId) {
          // Category not found or does not belong to the specified restaurant
          return null; // Or throw a specific error
        }

        const category = await tx.category.update({
          where: { category_id: categoryId }, // No need for establishment_id here as we already checked
          data: categoryData,
        });

        if (translations) {
          await tx.categoryTranslation.deleteMany({
            where: { category_id: categoryId },
          });

          if (translations.length > 0) {
            await tx.categoryTranslation.createMany({
              data: translations.map(t => ({
                category_id: categoryId,
                language_code: t.language_code,
                name: t.name,
              })),
            });
          }
        }

        const result = await tx.category.findUnique({
          where: { category_id: categoryId },
          include: { translations: true },
        });
        if (!result) throw new Error('Category not found after update transaction.');
        return result;
      });

      if (!updatedCategory) return null; // Handles the case where the category didn't belong to the restaurant

      return this.mapToDTO(updatedCategory);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null; // Record to update not found (already handled by the check above, but good as a fallback)
      }
      console.error("Error updating category:", error);
      throw error;
    }
  }

  async deleteCategory(categoryId: number, restaurantId: number): Promise<CategoryDTO | null> {
    categoryIdSchema.parse({ categoryId });
    try {
      // First, verify the category belongs to the restaurant
      const existingCategory = await prisma.category.findUnique({
        where: { category_id: categoryId },
      });

      if (!existingCategory || existingCategory.establishment_id !== restaurantId) {
        // Category not found or does not belong to the specified restaurant
        return null; // Or throw a specific error
      }

      // Soft delete
      const category = await prisma.category.update({
        where: { category_id: categoryId }, // No need for establishment_id here
        data: { deleted_at: new Date() },
        include: { translations: true },
      });
      return this.mapToDTO(category);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null; // Record to delete not found (already handled by the check above)
      }
      console.error("Error deleting category:", error);
      throw error;
    }
  }

  // --- Translation specific methods (optional, if needed outside category updates) ---

  async addOrUpdateCategoryTranslation(
    categoryId: number,
    translationData: { language_code: string; name: string } & Partial<Pick<CategoryTranslationUpdateDTO, 'translation_id'>>
  ): Promise<CategoryTranslationDTO | null> {
    // Validate input based on stricter requirements for this specific operation if needed
    // For example, ensure language_code and name are always provided for an upsert.
    if (!translationData.language_code || !translationData.name) {
        // Or handle this more gracefully depending on requirements
        throw new Error('Language code and name are required for category translation upsert.');
    }

    // It's also a good practice to validate translationData with its Zod schema if available and appropriate here
    // For instance, if you had a specific schema for this upsert operation.
    // categoryTranslationCreateSchema.parse(translationData); // This would ensure structure if translation_id is not part of it

    try {
      const translation = await prisma.categoryTranslation.upsert({
        where: {
          category_id_language_code: {
            category_id: categoryId,
            language_code: translationData.language_code,
          },
        },
        update: { name: translationData.name },
        create: {
          category_id: categoryId,
          language_code: translationData.language_code,
          name: translationData.name,
        },
      });
      return this.mapToTranslationDTO(translation);
    } catch (error) {
      console.error(`Error in addOrUpdateCategoryTranslation for category ${categoryId}:`, error);
      // Depending on the error, you might want to return null or throw a more specific error
      // For example, if the categoryId doesn't exist, Prisma might throw an error that could be caught
      // and handled (e.g., by returning null or a custom error object).
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle known Prisma errors, e.g., foreign key constraint violation if categoryId is invalid
        // Or if the upsert fails for other reasons like unique constraint violations not covered by the where.
      }
      return null; // Or throw error;
    }
  }
}
