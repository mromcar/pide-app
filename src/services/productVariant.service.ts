import { prisma } from '@/lib/prisma';
import { PrismaClient, ProductVariant, ProductVariantTranslation, ProductVariantHistory, Prisma } from '@prisma/client';
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
      translation_id: translation.translation_id,
      variant_id: translation.variant_id,
      language_code: translation.language_code,
      variant_description: translation.variant_description,
    };
  }

  private mapToHistoryDTO(history: ProductVariantHistory): ProductVariantHistoryResponseDTO {
    return {
      id: history.id,
      variant_id: history.variant_id,
      variant_description: history.variant_description,
      price: history.price !== null && history.price !== undefined ? parseFloat(history.price.toString()) : null,
      is_active: history.is_active,
      updated_at: history.updated_at ? history.updated_at.toISOString() : new Date(0).toISOString(),
    };
  }

  private mapToDTO(variant: ProductVariant & {
    translations?: ProductVariantTranslation[],
  }): ProductVariantResponseDTO {
    return {
      variant_id: variant.variant_id,
      product_id: variant.product_id,
      establishment_id: variant.establishment_id,
      variant_description: variant.variant_description,
      price: parseFloat(variant.price.toString()),
      sku: variant.sku,
      sort_order: variant.sort_order,
      is_active: variant.is_active ?? true,
      created_by_user_id: variant.created_by_user_id,
      created_at: variant.created_at?.toISOString() || null,
      updated_at: variant.updated_at?.toISOString() || null,
      deleted_at: variant.deleted_at?.toISOString() || null,
      translations: variant.translations?.map(this.mapToTranslationDTO) || [],
    };
  }

  async createProductVariant(data: ProductVariantCreateDTO, userId?: number): Promise<ProductVariantResponseDTO> {
    const parsedData = productVariantCreateSchema.parse(data);
    const { translations, ...variantData } = parsedData;

    const newVariant = await prisma.productVariant.create({
      data: {
        ...variantData,
        created_by_user_id: userId, // Asignar userId si está presente
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
        // updated_at se establece por defecto por la BD/Prisma
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
              deleteMany: { variant_id: variantId }, // Delete existing translations
              createMany: {
                data: translations
                  .filter(t => t.language_code !== undefined && t.variant_description !== undefined) // Ensure language_code and description are present
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

    return this.mapToDTO(updatedVariant);
  }

  async deleteProductVariant(variantId: number, userId?: number): Promise<ProductVariantResponseDTO | null> {
    productVariantIdSchema.parse({ variant_id: variantId });

    const existingVariant = await prisma.productVariant.findUnique({
        where: { variant_id: variantId, deleted_at: null },
    });
    if (!existingVariant) return null;

    const deletedVariant = await prisma.productVariant.update({
      where: { variant_id: variantId },
      data: { deleted_at: new Date() }, // Soft delete
      include: {
        translations: true,
      }
    });

    // Crear registro de historial para la eliminación (soft delete)
    await prisma.productVariantHistory.create({
      data: {
        variant_id: deletedVariant.variant_id,
        variant_description: deletedVariant.variant_description, // Guardar el estado antes de marcar como eliminado
        price: deletedVariant.price,
        is_active: false, // Marcar como inactivo en el historial
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
    return histories.map(this.mapToHistoryDTO);
  }
}

export const productVariantService = new ProductVariantService();
