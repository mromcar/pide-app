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
    translationId: translation.translationId,
    categoryId: translation.categoryId,
    languageCode: translation.languageCode,
    name: translation.name,
  };
}

function mapToDTO(category: Category & { translations: CategoryTranslation[] }): CategoryDTO {
  return {
    categoryId: category.categoryId,
    establishmentId: category.establishmentId,
    name: category.name,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    createdAt: category.createdAt?.toISOString() ?? null,
    updatedAt: category.updatedAt?.toISOString() ?? null,
    deletedAt: category.deletedAt?.toISOString() ?? null,
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
          data: translations.map(t => ({ languageCode: t.languageCode, name: t.name })),
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
      establishmentId: establishmentId,
      deletedAt: null,
    },
    skip: skip,
    take: pageSize,
    include: { translations: true },
    orderBy: { sortOrder: 'asc' },
  });
  return categories.map(mapToDTO);
}

export async function getCategoryById(categoryId: number): Promise<CategoryDTO | null> {
  categoryIdSchema.parse({ categoryId });
  const category = await prisma.category.findUnique({
    where: {
      categoryId: categoryId,
      deletedAt: null,
    },
    include: { translations: true },
  });
  return category ? mapToDTO(category) : null;
}

export async function updateCategory(
  categoryId: number,
  establishmentId: number,
  data: CategoryUpdateInput
): Promise<CategoryDTO | null> {
  categoryIdSchema.parse({ categoryId });
  categoryUpdateSchema.parse(data);

  const { translations, ...categoryData } = data;

  try {
    const updatedCategory = await prisma.$transaction(async (tx) => {
      const existingCategory = await tx.category.findUnique({
        where: { categoryId: categoryId },
      });

      if (!existingCategory || existingCategory.establishmentId !== establishmentId) {
        return null;
      }

      await tx.category.update({
        where: { categoryId: categoryId },
        data: categoryData,
      });

      if (translations) {
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

      const result = await tx.category.findUnique({
        where: { categoryId: categoryId },
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
  establishmentId: number
): Promise<CategoryDTO | null> {
  categoryIdSchema.parse({ categoryId });
  try {
    const existingCategory = await prisma.category.findUnique({
      where: { categoryId: categoryId },
    });

    if (!existingCategory || existingCategory.establishmentId !== establishmentId) {
      return null;
    }

    const category = await prisma.category.update({
      where: { categoryId: categoryId },
      data: { deletedAt: new Date() },
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
  translationData: { languageCode: string; name: string } & Partial<Pick<CategoryTranslationUpdateDTO, 'translationId'>>
): Promise<CategoryTranslationDTO | null> {
  if (!translationData.languageCode || !translationData.name) {
    throw new Error('Language code and name are required for category translation upsert.');
  }

  try {
    const translation = await prisma.categoryTranslation.upsert({
      where: {
        categoryId_languageCode: {
          categoryId: categoryId,
          languageCode: translationData.languageCode,
        },
      },
      update: { name: translationData.name },
      create: {
        categoryId: categoryId,
        languageCode: translationData.languageCode,
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

  async updateCategory(categoryId: number, data: CategoryUpdateInput & { establishmentId: number }): Promise<CategoryDTO | null> {
    return updateCategory(categoryId, data.establishmentId, data);
  }

  async deleteCategory(categoryId: number, establishmentId: number): Promise<boolean> {
    const result = await deleteCategory(categoryId, establishmentId);
    return result !== null;
  }

  async addOrUpdateCategoryTranslation(
    categoryId: number,
    translationData: { languageCode: string; name: string } & Partial<Pick<CategoryTranslationUpdateDTO, 'translationId'>>
  ): Promise<CategoryTranslationDTO | null> {
    return addOrUpdateCategoryTranslation(categoryId, translationData);
  }
}
