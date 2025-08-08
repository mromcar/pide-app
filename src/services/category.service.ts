import { prisma } from '../lib/prisma';
import { Category, CategoryTranslation, Prisma } from '@prisma/client';
import {
  CategoryDTO,
} from '../types/dtos/category';
import {
  CategoryTranslationDTO,
  CategoryTranslationUpdateDTO
} from '../types/dtos/categoryTranslation';
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  categoryIdSchema,
  CategoryCreateInput,
  CategoryUpdateInput
} from '../schemas/category';
import logger from '@/lib/logger';

function mapToTranslationDTO(translation: CategoryTranslation): CategoryTranslationDTO {
  return {
    translationId: translation.translation_id,
    categoryId: translation.category_id,
    languageCode: translation.language_code,
    name: translation.name,
  };
}

function mapToDTO(category: Category & { translations: CategoryTranslation[] }): CategoryDTO {
  return {
    categoryId: category.category_id,
    establishmentId: category.establishment_id,
    name: category.name,
    sortOrder: category.sort_order,
    isActive: category.is_active,
    createdAt: category.created_at?.toISOString() ?? null,
    updatedAt: category.updated_at?.toISOString() ?? null,
    deletedAt: category.deleted_at?.toISOString() ?? null,
    translations: category.translations.map(mapToTranslationDTO),
  };
}

// --- CRUD Functions ---

export async function createCategory(data: CategoryCreateInput): Promise<CategoryDTO> {
  categoryCreateSchema.parse(data);

  const { translations, ...categoryData } = data;

  const newCategory = await prisma.category.create({
    data: {
      ...categoryData,
      translations: translations && translations.length > 0 ? {
        createMany: {
          data: translations.map(t => ({ language_code: t.language_code, name: t.name })),
        },
      } : undefined,
    },
    include: { translations: true },
  });
  return mapToDTO(newCategory);
}

export async function getAllCategoriesByEstablishment(
  establishmentId: number,
  page: number = 1,
  pageSize: number = 10
): Promise<CategoryDTO[]> {
  const skip = (page - 1) * pageSize;
  const categories = await prisma.category.findMany({
    where: {
      establishment_id: establishmentId,
      deleted_at: null,
    },
    skip: skip,
    take: pageSize,
    include: { translations: true },
    orderBy: { sort_order: 'asc' },
  });
  return categories.map(mapToDTO);
}

export async function getCategoryById(categoryId: number): Promise<CategoryDTO | null> {
  categoryIdSchema.parse({ categoryId });
  const category = await prisma.category.findUnique({
    where: {
      category_id: categoryId,
      deleted_at: null,
    },
    include: { translations: true },
  });
  return category ? mapToDTO(category) : null;
}

export async function updateCategory(
  categoryId: number,
  restaurantId: number,
  data: CategoryUpdateInput
): Promise<CategoryDTO | null> {
  categoryIdSchema.parse({ categoryId });
  categoryUpdateSchema.parse(data);

  const { translations, ...categoryData } = data;

  try {
    const updatedCategory = await prisma.$transaction(async (tx) => {
      const existingCategory = await tx.category.findUnique({
        where: { category_id: categoryId },
      });

      if (!existingCategory || existingCategory.establishment_id !== restaurantId) {
        return null;
      }

      await tx.category.update({
        where: { category_id: categoryId },
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

    if (!updatedCategory) return null;
    return mapToDTO(updatedCategory);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return null;
    }
    logger.error('Error updating category:', { categoryId, error });
    throw error;
  }
}

export async function deleteCategory(
  categoryId: number,
  restaurantId: number
): Promise<CategoryDTO | null> {
  categoryIdSchema.parse({ categoryId });
  try {
    const existingCategory = await prisma.category.findUnique({
      where: { category_id: categoryId },
    });

    if (!existingCategory || existingCategory.establishment_id !== restaurantId) {
      return null;
    }

    const category = await prisma.category.update({
      where: { category_id: categoryId },
      data: { deleted_at: new Date() },
      include: { translations: true },
    });
    return mapToDTO(category);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return null;
    }
    logger.error('Error deleting category:', { categoryId, error });
    throw error;
  }
}

// --- Translation Methods ---

export async function addOrUpdateCategoryTranslation(
  categoryId: number,
  translationData: { language_code: string; name: string } & Partial<Pick<CategoryTranslationUpdateDTO, 'translation_id'>>
): Promise<CategoryTranslationDTO | null> {
  if (!translationData.language_code || !translationData.name) {
    throw new Error('Language code and name are required for category translation upsert.');
  }

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
    return mapToTranslationDTO(translation);
  } catch (error) {
    logger.error(`Error in addOrUpdateCategoryTranslation for category ${categoryId}:`, { error });
    return null;
  }
}

export class CategoryService {
  async createCategory(data: CategoryCreateInput): Promise<CategoryDTO> {
    return createCategory(data);
  }

  async getAllCategoriesByEstablishment(establishmentId: number, page: number = 1, pageSize: number = 10): Promise<CategoryDTO[]> {
    return getAllCategoriesByEstablishment(establishmentId, page, pageSize);
  }

  async getCategoryById(categoryId: number): Promise<CategoryDTO | null> {
    return getCategoryById(categoryId);
  }

  async updateCategory(categoryId: number, data: CategoryUpdateInput & { establishment_id: number }): Promise<CategoryDTO | null> {
    return updateCategory(categoryId, data.establishment_id, data);
  }

  async deleteCategory(categoryId: number, restaurantId: number): Promise<boolean> {
    const result = await deleteCategory(categoryId, restaurantId);
    return result !== null;
  }

  async addOrUpdateCategoryTranslation(
    categoryId: number,
    translationData: { language_code: string; name: string } & Partial<Pick<CategoryTranslationUpdateDTO, 'translation_id'>>
  ): Promise<CategoryTranslationDTO | null> {
    return addOrUpdateCategoryTranslation(categoryId, translationData);
  }
}
