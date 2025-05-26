import { prisma } from '../lib/prisma';
import type { ProductVariant } from '@prisma/client';
import type {
  CreateProductVariantDTO,
  UpdateProductVariantDTO,
} from '../types/dtos/product';

// Función de limpieza para datos de variante (camelCase)
function cleanVariantData(v: CreateProductVariantDTO | UpdateProductVariantDTO, establishmentId?: number) {
  const {
    variantDescription,
    price,
    isActive,
    sortOrder,
    sku,
    productId,
  } = v;

  if (
    typeof variantDescription !== 'string' ||
    typeof price !== 'number' ||
    typeof isActive !== 'boolean'
  ) {
    throw new Error('Missing required fields for variant');
  }

  return {
    productId,
    establishmentId,
    variantDescription,
    price,
    isActive,
    ...(typeof sortOrder === 'number' ? { sortOrder } : {}),
    ...(typeof sku === 'string' ? { sku } : {}),
  };
}

// Función de limpieza para traducción de variante (camelCase)
function cleanVariantTranslation(t: any, variantId?: number) {
  return {
    ...(variantId ? { variantId } : {}),
    languageCode: t.languageCode,
    variantDescription: t.variantDescription,
  };
}

export const variantService = {
  async createVariant(data: CreateProductVariantDTO): Promise<ProductVariant> {
    const { translations, establishmentId, ...variantData } = data;
    const cleanedVariantData = cleanVariantData(variantData, establishmentId);
    return prisma.productVariant.create({
      data: {
        ...cleanedVariantData,
        establishmentId,
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

  async getAllVariants(establishmentId: number, language?: string): Promise<ProductVariant[]> {
    return prisma.productVariant.findMany({
      where: { establishmentId },
      include: {
        translations: language
          ? { where: { languageCode: language } }
          : true,
      },
      orderBy: { sortOrder: 'asc' },
    });
  },

  async updateVariant(
    variantId: number,
    establishmentId: number,
    data: UpdateProductVariantDTO
  ): Promise<ProductVariant | null> {
    const { translations, ...variantData } = data;
    const cleanedVariantData = cleanVariantData(variantData, establishmentId);

    return prisma.$transaction(async (tx) => {
      await tx.productVariant.update({
        where: { id: variantId },
        data: cleanedVariantData,
      });

      if (translations) {
        await tx.productVariantTranslation.deleteMany({ where: { variantId } });
        if (translations.length > 0) {
          await tx.productVariantTranslation.createMany({
            data: translations.map(t => cleanVariantTranslation(t, variantId)),
          });
        }
      }

      return tx.productVariant.findUnique({
        where: { id: variantId },
        include: { translations: true }
      });
    });
  },

  async deleteVariant(variantId: number): Promise<ProductVariant | null> {
    return prisma.productVariant.delete({
      where: { id: variantId },
    });
  },
};
