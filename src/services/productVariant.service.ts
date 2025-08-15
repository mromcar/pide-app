import { prisma } from '@/lib/prisma';
import { ProductVariant, ProductVariantTranslation, ProductVariantHistory } from '@prisma/client';
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
      translationId: translation.translationId,
      variantId: translation.variantId,
      languageCode: translation.languageCode,
      variantDescription: translation.variantDescription,
    };
  }

  private mapToHistoryDTO(history: ProductVariantHistory): ProductVariantHistoryResponseDTO {
    return {
      id: history.id,
      variantId: history.variantId,
      variantDescription: history.variantDescription,
      price: history.price !== null && history.price !== undefined ? parseFloat(history.price.toString()) : null,
      isActive: history.isActive,
      updatedAt: history.updatedAt ? history.updatedAt.toISOString() : new Date(0).toISOString(),
    };
  }

  private mapToDTO(variant: ProductVariant & {
    translations?: ProductVariantTranslation[],
  }): ProductVariantResponseDTO {
    return {
      variantId: variant.variantId,
      productId: variant.productId,
      establishmentId: variant.establishmentId,
      variantDescription: variant.variantDescription,
      price: parseFloat(variant.price.toString()),
      sku: variant.sku,
      sortOrder: variant.sortOrder,
      isActive: variant.isActive ?? true,
      createdByUserId: variant.createdByUserId,
      createdAt: variant.createdAt?.toISOString() || null,
      updatedAt: variant.updatedAt?.toISOString() || null,
      deletedAt: variant.deletedAt?.toISOString() || null,
      translations: variant.translations?.map(this.mapToTranslationDTO) || [],
    };
  }

  async createProductVariant(data: ProductVariantCreateDTO, userId?: number): Promise<ProductVariantResponseDTO> {
    const parsedData = productVariantCreateSchema.parse(data);
    const { translations, ...variantData } = parsedData;

    const newVariant = await prisma.productVariant.create({
      data: {
        ...variantData,
        createdByUserId: userId,
        ...(userId && { updatedByUserId: userId }),
        translations: translations && translations.length > 0 ? {
          createMany: {
            data: translations.map(t => ({
              languageCode: t.languageCode,
              variantDescription: t.variantDescription
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
        variantId: newVariant.variantId,
        variantDescription: newVariant.variantDescription,
        price: newVariant.price,
        isActive: newVariant.isActive,
      },
    });

    return this.mapToDTO(newVariant);
  }

  async getProductVariantById(variantId: number): Promise<ProductVariantResponseDTO | null> {
    productVariantIdSchema.parse({ variantId });
    const variant = await prisma.productVariant.findUnique({
      where: { variantId, deletedAt: null },
      include: {
        translations: true,
      },
    });
    return variant ? this.mapToDTO(variant) : null;
  }

  async getAllProductVariantsForProduct(productId: number, page: number = 1, pageSize: number = 10): Promise<ProductVariantResponseDTO[]> {
    const skip = (page - 1) * pageSize;
    const variants = await prisma.productVariant.findMany({
      where: { productId, deletedAt: null },
      skip: skip,
      take: pageSize,
      include: {
        translations: true,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { variantDescription: 'asc' },
      ]
    });
    return variants.map(v => this.mapToDTO(v));
  }

  async updateProductVariant(variantId: number, data: ProductVariantUpdateDTO, userId?: number): Promise<ProductVariantResponseDTO | null> {
    productVariantIdSchema.parse({ variantId });
    const parsedData = productVariantUpdateSchema.parse(data);
    const { translations, ...variantData } = parsedData;

    const existingVariant = await prisma.productVariant.findUnique({
      where: { variantId, deletedAt: null },
    });

    if (!existingVariant) {
      return null;
    }

    const updatedVariant = await prisma.productVariant.update({
      where: { variantId },
      data: {
        ...variantData,
        ...(userId && { updatedByUserId: userId }),
        translations: translations
          ? {
              deleteMany: { variantId },
              createMany: {
                data: translations
                  .filter(t => t.languageCode !== undefined && t.variantDescription !== undefined)
                  .map(t => ({
                    languageCode: t.languageCode!,
                    variantDescription: t.variantDescription!,
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
        variantId: updatedVariant.variantId,
        variantDescription: updatedVariant.variantDescription,
        price: updatedVariant.price,
        isActive: updatedVariant.isActive,
      },
    });

    return updatedVariant ? this.mapToDTO(updatedVariant) : null;
  }

  async deleteProductVariant(variantId: number, userId?: number): Promise<ProductVariantResponseDTO | null> {
    productVariantIdSchema.parse({ variantId });

    const existingVariant = await prisma.productVariant.findUnique({
        where: { variantId, deletedAt: null },
    });
    if (!existingVariant) return null;

    const deletedVariant = await prisma.productVariant.update({
      where: { variantId },
      data: {
        deletedAt: new Date(),
        // ✅ CORRECCIÓN: Agregar userId para auditoría del soft delete
        ...(userId && { deletedByUserId: userId }),
      },
      include: {
        translations: true,
      }
    });

    await prisma.productVariantHistory.create({
      data: {
        variantId: deletedVariant.variantId,
        variantDescription: deletedVariant.variantDescription,
        price: deletedVariant.price,
        isActive: false,
        // ✅ CORRECCIÓN: Agregar userId para auditoría del historial
        ...(userId && { updatedByUserId: userId }),
      },
    });

    return this.mapToDTO(deletedVariant);
  }

  async addOrUpdateProductVariantTranslation(
    variantId: number,
    translationData: ProductVariantTranslationCreateDTO | ProductVariantTranslationUpdateDTO
  ): Promise<ProductVariantTranslationResponseDTO> {
    productVariantIdSchema.parse({ variantId });

    let parsedData;
    if ('translationId' in translationData && translationData.translationId) {
        parsedData = productVariantTranslationUpdateSchema.parse(translationData);
    } else {
        parsedData = productVariantTranslationCreateSchema.parse({...translationData, variantId });
    }

    const { languageCode, variantDescription } = parsedData;

    if (!languageCode) {
        throw new Error('Language code is required for translation upsert.');
    }

    const translation = await prisma.productVariantTranslation.upsert({
      where: {
        variantId_languageCode: {
          variantId,
          languageCode,
        },
      },
      update: { variantDescription },
      create: { variantId, languageCode, variantDescription: variantDescription! },
    });
    return this.mapToTranslationDTO(translation);
  }

  async getProductVariantHistory(variantId: number, page: number = 1, pageSize: number = 10): Promise<ProductVariantHistoryResponseDTO[]> {
    productVariantIdSchema.parse({ variantId });
    const skip = (page - 1) * pageSize;
    const histories = await prisma.productVariantHistory.findMany({
      where: { variantId },
      skip: skip,
      take: pageSize,
      orderBy: {
        updatedAt: 'desc',
      },
    });
    return histories.map(h => this.mapToHistoryDTO(h));
  }
}

export const productVariantService = new ProductVariantService();
