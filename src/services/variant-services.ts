import { prisma } from '../lib/prisma';
import type { ProductVariant } from '@prisma/client';
import type {
  CreateProductVariantDTO,
  UpdateProductVariantDTO,
} from '../types/dtos/product';

function cleanVariantData(v: CreateProductVariantDTO | UpdateProductVariantDTO) {
  const {
    translations,
    variantId, // nunca enviar en create/update
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
    variantDescription,
    price,
    isActive,
    ...(typeof sortOrder === 'number' ? { sortOrder } : {}),
    ...(typeof sku === 'string' ? { sku } : {}),
  };
}

export const variantService = {
  async createVariant(data: CreateProductVariantDTO): Promise<ProductVariant> {
    const { translations, ...variantData } = data;
    const cleanedVariantData = cleanVariantData(data);
    return prisma.productVariant.create({
      data: {
        ...cleanedVariantData,
        translations: translations
          ? {
              createMany: {
                data: translations.map(t => ({
                  languageCode: t.languageCode,
                  variantDescription: t.variantDescription,
                })),
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
    // Puedes añadir lógica para actualizar traducciones si lo necesitas
    const cleanedVariantData = cleanVariantData(data);
    return prisma.productVariant.update({
      where: { id: variantId, establishmentId },
      data: cleanedVariantData,
      include: { translations: true },
    });
  },

  async deleteVariant(variantId: number, establishmentId: number): Promise<ProductVariant | null> {
    return prisma.productVariant.delete({
      where: { id: variantId, establishmentId },
    });
  },
};
