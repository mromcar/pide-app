import { prisma } from '@/lib/prisma';
import { ProductVariant, ProductVariantTranslation, ProductVariantHistory, Prisma } from '@prisma/client';
import {
  ProductVariantCreateDTO,
  ProductVariantUpdateDTO,
  ProductVariantResponseDTO,
} from '../types/dtos/productVariant';
import {
  ProductVariantTranslationCreateDTO,
  ProductVariantTranslationResponseDTO,
  ProductVariantTranslationUpdateDTO
} from '../types/dtos/productVariantTranslation';
import { ProductVariantHistoryResponseDTO } from '../types/dtos/productVariantHistory';
import {
  productVariantCreateSchema,
  productVariantUpdateSchema,
  productVariantIdSchema,
} from '../schemas/productVariant';
import { productVariantTranslationCreateSchema, productVariantTranslationUpdateSchema } from '../schemas/productVariantTranslation';

export class ProductVariantService {
  private mapToTranslationDTO(translation: ProductVariantTranslation): ProductVariantTranslationResponseDTO {
    return {
      translationId: translation.translation_id,
      variantId: translation.variant_id,
      languageCode: translation.language_code,
      variantDescription: translation.variant_description,
    };
  }

  private mapToHistoryDTO(history: ProductVariantHistory): ProductVariantHistoryResponseDTO {
    return {
      id: history.id,
      variantId: history.variant_id,
      variantDescription: history.variant_description,
      price: history.price !== null && history.price !== undefined ? parseFloat(history.price.toString()) : null,
      isActive: history.is_active,
      updatedAt: history.updated_at ? history.updated_at.toISOString() : new Date(0).toISOString(),
    };
  }

  private mapToDTO(variant: ProductVariant & {
    translations?: ProductVariantTranslation[],
  }): ProductVariantResponseDTO {
    return {
      variantId: variant.variant_id,
      productId: variant.product_id,
      establishmentId: variant.establishment_id,
      variantDescription: variant.variant_description,
      price: parseFloat(variant.price.toString()),
      sku: variant.sku,
      sortOrder: variant.sort_order,
      isActive: variant.is_active ?? true,
      createdByUserId: variant.created_by_user_id,
      createdAt: variant.created_at?.toISOString() || null,
      updatedAt: variant.updated_at?.toISOString() || null,
      deletedAt: variant.deleted_at?.toISOString() || null,
      translations: variant.translations?.map(this.mapToTranslationDTO) || [],
    };
  }

  async createProductVariant(data: ProductVariantCreateDTO, userId?: number): Promise<ProductVariantResponseDTO> {
    const parsedData = productVariantCreateSchema.parse(data);
    const { translations, ...variantData } = parsedData;

    const newVariant = await prisma.productVariant.create({
      data: {
        ...variantData,
        created_by_user_id: userId,
        translations: translations && translations.length > 0 ? {
          createMany: {
            data: translations.map(t => ({
              language_code: t.language_code,
              variant_description: t.variant_description
            })),
          },
        } : undefined,
      },
      include: {
        translations: true,
      },
    });

    await prisma.productVariantHistory.create({
      data: {
        variant_id: newVariant.variant_id,
        variant_description: newVariant.variant_description,
        price: newVariant.price,
        is_active: newVariant.is_active,
      },
    });

    return this.mapToDTO(newVariant);
  }

  async getProductVariantById(variantId: number): Promise<ProductVariantResponseDTO | null> {
    productVariantIdSchema.parse({ variant_id: variantId });
    const variant = await prisma.productVariant.findUnique({
      where: { variant_id: variantId, deleted_at: null },
      include: {
        translations: true,
      },
    });
    return variant ? this.mapToDTO(variant) : null;
  }

  async getAllProductVariantsForProduct(productId: number, page: number = 1, pageSize: number = 10): Promise<ProductVariantResponseDTO[]> {
    const skip = (page - 1) * pageSize;
    const variants = await prisma.productVariant.findMany({
      where: { product_id: productId, deleted_at: null },
      skip: skip,
      take: pageSize,
      include: {
        translations: true,
      },
      orderBy: [
        { sort_order: 'asc' },
        { variant_description: 'asc' },
      ]
    });
    return variants.map(v => this.mapToDTO(v));
  }

  async updateProductVariant(variantId: number, data: ProductVariantUpdateDTO, userId?: number): Promise<ProductVariantResponseDTO | null> {
    productVariantIdSchema.parse({ variant_id: variantId });
    const parsedData = productVariantUpdateSchema.parse(data);
    const { translations, ...variantData } = parsedData;

    const existingVariant = await prisma.productVariant.findUnique({
      where: { variant_id: variantId, deleted_at: null },
    });

    if (!existingVariant) {
      return null;
    }

    const updatedVariant = await prisma.productVariant.update({
      where: { variant_id: variantId },
      data: {
        ...variantData,
        translations: translations
          ? {
              deleteMany: { variant_id: variantId },
              createMany: {
                data: translations
                  .filter(t => t.language_code !== undefined && t.variant_description !== undefined)
                  .map(t => ({
                    language_code: t.language_code!,
                    variant_description: t.variant_description!,
                  })),
              },
            }
          : undefined,
      },
      include: {
        translations: true,
      },
    });

    await prisma.productVariantHistory.create({
      data: {
        variant_id: updatedVariant.variant_id,
        variant_description: updatedVariant.variant_description,
        price: updatedVariant.price,
        is_active: updatedVariant.is_active,
      },
    });

    return updatedVariant ? this.mapToDTO(updatedVariant) : null;
  }

  async deleteProductVariant(variantId: number, userId?: number): Promise<ProductVariantResponseDTO | null> {
    productVariantIdSchema.parse({ variant_id: variantId });

    const existingVariant = await prisma.productVariant.findUnique({
        where: { variant_id: variantId, deleted_at: null },
    });
    if (!existingVariant) return null;

    const deletedVariant = await prisma.productVariant.update({
      where: { variant_id: variantId },
      data: { deleted_at: new Date() },
      include: {
        translations: true,
      }
    });

    await prisma.productVariantHistory.create({
      data: {
        variant_id: deletedVariant.variant_id,
        variant_description: deletedVariant.variant_description,
        price: deletedVariant.price,
        is_active: false,
      },
    });

    return this.mapToDTO(deletedVariant);
  }

  async addOrUpdateProductVariantTranslation(
    variantId: number,
    translationData: ProductVariantTranslationCreateDTO | ProductVariantTranslationUpdateDTO
  ): Promise<ProductVariantTranslationResponseDTO> {
    productVariantIdSchema.parse({ variant_id: variantId });

    let parsedData;
    if ('translation_id' in translationData && translationData.translation_id) {
        parsedData = productVariantTranslationUpdateSchema.parse(translationData);
    } else {
        parsedData = productVariantTranslationCreateSchema.parse({...translationData, variant_id: variantId });
    }

    const { language_code, variant_description } = parsedData;

    if (!language_code) {
        throw new Error('Language code is required for translation upsert.');
    }

    const translation = await prisma.productVariantTranslation.upsert({
      where: {
        variant_id_language_code: {
          variant_id: variantId,
          language_code: language_code,
        },
      },
      update: { variant_description: variant_description },
      create: { variant_id: variantId, language_code: language_code, variant_description: variant_description! },
    });
    return this.mapToTranslationDTO(translation);
  }

  async getProductVariantHistory(variantId: number, page: number = 1, pageSize: number = 10): Promise<ProductVariantHistoryResponseDTO[]> {
    productVariantIdSchema.parse({ variant_id: variantId });
    const skip = (page - 1) * pageSize;
    const histories = await prisma.productVariantHistory.findMany({
      where: { variant_id: variantId },
      skip: skip,
      take: pageSize,
      orderBy: {
        updated_at: 'desc',
      },
    });
    return histories.map(h => this.mapToHistoryDTO(h));
  }
}

export const productVariantService = new ProductVariantService();
