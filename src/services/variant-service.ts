import { prisma } from '../lib/prisma';
import type { ProductVariant } from '@prisma/client';
import type {
  CreateProductVariantDTO,
  UpdateProductVariantDTO,
} from '../types/dtos/product';
import { toSnakeCase } from '@/utils/case';

function cleanVariantData(v: CreateProductVariantDTO | UpdateProductVariantDTO) {
  const {
    variantDescription,
    price,
    isActive,
    sortOrder,
    sku,
  } = v;

  if (
    typeof variantDescription !== 'string' ||
    typeof price !== 'number' ||
    typeof isActive !== 'boolean'
  ) {
    throw new Error('Missing required fields for variant');
  }

  return {
    variant_description: variantDescription,
    price,
    is_active: isActive,
    ...(typeof sortOrder === 'number' ? { sort_order: sortOrder } : {}),
    ...(typeof sku === 'string' ? { sku } : {}),
  };
}

function cleanVariantTranslation(t: any, variant_id?: number) {
  return {
    ...(variant_id ? { variant_id } : {}),
    language_code: t.languageCode,
    variant_description: t.variantDescription,
  };
}

export const variantService = {
  async createVariant(data: CreateProductVariantDTO): Promise<ProductVariant> {
    const { translations, ...variantData } = data;
    const cleanedVariantData = cleanVariantData(variantData);
    return prisma.product_variant.create({
      data: {
        ...cleanedVariantData,
        translations: translations
          ? {
            createMany: {
              data: translations.map(t => cleanVariantTranslation(t)),
            },
          }
          : undefined,
      },
      include: { translations: true },
    });
  },

  async getAllVariants(establishment_id: number, language?: string): Promise<ProductVariant[]> {
    return prisma.product_variant.findMany({
      where: { establishment_id },
      include: {
        translations: language
          ? { where: { language_code: language } }
          : true,
      },
      orderBy: { sort_order: 'asc' },
    });
  },

  async updateVariant(
    variant_id: number,
    establishment_id: number,
    data: UpdateProductVariantDTO
  ): Promise<ProductVariant | null> {
    const { translations, ...variantData } = data;
    const cleanedVariantData = cleanVariantData(variantData);

    return prisma.$transaction(async (tx) => {
      await tx.product_variant.update({
        where: { variant_id, establishment_id },
        data: cleanedVariantData,
      });

      if (translations) {
        await tx.product_variant_translation.deleteMany({ where: { variant_id } });
        if (translations.length > 0) {
          await tx.product_variant_translation.createMany({
            data: translations.map(t => cleanVariantTranslation(t, variant_id)),
          });
        }
      }

      return tx.product_variant.findUnique({
        where: { variant_id, establishment_id },
        include: { translations: true }
      });
    });
  },

  async deleteVariant(variant_id: number, establishment_id: number): Promise<ProductVariant | null> {
    return prisma.product_variant.delete({
      where: { variant_id, establishment_id },
    });
  },
};
