// src/services/product-service.ts
import { prisma } from '../lib/prisma';
import type { Product, ProductVariant } from '@prisma/client';
import type {
  CreateProductDTO,
  UpdateProductDTO,
  CreateProductVariantDTO,
  UpdateProductVariantDTO
} from '../types/dtos/product';
import { toSnakeCase } from '@/utils/case';

function cleanVariantData(
  v: CreateProductVariantDTO,
  establishment_id: number
) {
  if (
    typeof v.variantDescription !== 'string' ||
    typeof v.price !== 'number' ||
    typeof v.isActive !== 'boolean'
  ) {
    throw new Error('Missing required fields for variant');
  }
  return {
    variant_description: v.variantDescription,
    price: v.price,
    is_active: v.isActive,
    sort_order: v.sortOrder,
    sku: v.sku,
    establishment_id,
  };
}

function cleanProductTranslation(t: any, product_id?: number) {
  return {
    ...(product_id ? { product_id } : {}),
    language_code: t.languageCode,
    name: t.name,
    description: t.description,
  };
}

function cleanVariantTranslation(t: any, variant_id?: number) {
  return {
    ...(variant_id ? { variant_id } : {}),
    language_code: t.languageCode,
    variant_description: t.variantDescription,
  };
}

export const productService = {
  async createProduct(data: CreateProductDTO): Promise<Product> {
    const { translations, variants, allergenIds, ...productData } = data;

    return prisma.product.create({
      data: {
        ...toSnakeCase(productData),
        translations: translations
          ? {
            createMany: {
              data: translations.map(t => cleanProductTranslation(t)),
            },
          }
          : undefined,
        variants: variants
          ? {
            create: variants.map(v => {
              const { translations: variantTranslations } = v;
              const variantData = cleanVariantData(v, productData.establishmentId);
              return {
                ...variantData,
                translations: variantTranslations
                  ? {
                    createMany: {
                      data: variantTranslations.map(vt => cleanVariantTranslation(vt)),
                    },
                  }
                  : undefined,
              };
            }),
          }
          : undefined,
        allergens: allergenIds
          ? {
            create: allergenIds.map(allergenId => ({
              allergen: { connect: { allergen_id: allergenId } },
            })),
          }
          : undefined,
      },
      include: {
        translations: true,
        variants: { include: { translations: true } },
        allergens: { include: { allergen: { include: { translations: true } } } },
        category: { include: { translations: true } },
      },
    });
  },

  async getProductsByEstablishment(
    establishment_id: number,
    options?: { category_id?: number; is_active?: boolean; includeAllergens?: boolean, includeTranslations?: boolean, language_code?: string }
  ): Promise<Product[]> {
    return prisma.product.findMany({
      where: {
        establishment_id,
        category_id: options?.category_id,
        is_active: options?.is_active,
      },
      include: {
        translations: options?.includeTranslations
          ? (options.language_code ? { where: { language_code: options.language_code } } : true)
          : false,
        variants: {
          where: { is_active: true },
          include: {
            translations: options?.includeTranslations
              ? (options.language_code ? { where: { language_code: options.language_code } } : true)
              : false,
          },
          orderBy: { sort_order: 'asc' }
        },
        allergens: options?.includeAllergens
          ? {
            include: {
              allergen: {
                include: {
                  translations: options?.includeTranslations
                    ? (options.language_code ? { where: { language_code: options.language_code } } : true)
                    : false,
                }
              }
            }
          } : false,
        category: {
          include: {
            translations: options?.includeTranslations
              ? (options.language_code ? { where: { language_code: options.language_code } } : true)
              : false,
          }
        },
      },
      orderBy: {
        sort_order: 'asc',
      },
    });
  },

  async getProductById(product_id: number, options?: { language_code?: string }): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { product_id },
      include: {
        translations: options?.language_code ? { where: { language_code: options.language_code } } : true,
        variants: {
          include: {
            translations: options?.language_code ? { where: { language_code: options.language_code } } : true,
          },
          orderBy: { sort_order: 'asc' }
        },
        allergens: {
          include: {
            allergen: {
              include: {
                translations: options?.language_code ? { where: { language_code: options.language_code } } : true,
              },
            },
          },
        },
        category: { include: { translations: options?.language_code ? { where: { language_code: options.language_code } } : true, } },
        establishment: true,
      },
    });
  },

  async updateProduct(product_id: number, data: UpdateProductDTO): Promise<Product | null> {
    const { translations, variants, allergenIds, categoryId, ...productData } = data;

    return prisma.$transaction(async (tx) => {
      // 1. Actualizar datos del producto principal
      const cleanData = Object.fromEntries(
        Object.entries(productData).filter(([_, v]) => v !== undefined)
      );

      await tx.product.update({
        where: { product_id },
        data: {
          ...toSnakeCase(cleanData),
          ...(categoryId ? { category: { connect: { category_id: categoryId } } } : {}),
        },
      });

      // 2. Actualizar traducciones del producto
      if (translations) {
        await tx.productTranslation.deleteMany({ where: { product_id } });
        if (translations.length > 0) {
          await tx.productTranslation.createMany({
            data: translations.map(t => cleanProductTranslation(t, product_id)),
          });
        }
      }

      // 3. Actualizar variantes (borrar y crear nuevas, con traducciones)
      if (variants) {
        await tx.productVariant.deleteMany({ where: { product_id } });
        const product = await tx.product.findUnique({ where: { product_id }, select: { establishment_id: true } });
        if (product?.establishment_id) {
          for (const v of variants) {
            const {
              translations: variantTranslations,
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

            const variant = await tx.productVariant.create({
              data: {
                product_id,
                establishment_id: product.establishment_id,
                variant_description: variantDescription,
                price,
                is_active: isActive,
                ...(typeof sortOrder === 'number' ? { sort_order: sortOrder } : {}),
                ...(typeof sku === 'string' ? { sku } : {}),
              },
            });

            if (variantTranslations && variantTranslations.length > 0) {
              await tx.productVariantTranslation.createMany({
                data: variantTranslations.map(t => cleanVariantTranslation(t, variant.product_variant_id)),
              });
            }
          }
        }
      }

      // 4. Actualizar alérgenos
      if (allergenIds) {
        await tx.productAllergen.deleteMany({ where: { product_id } });
        if (allergenIds.length > 0) {
          await tx.productAllergen.createMany({
            data: allergenIds.map(allergenId => ({ product_id, allergen_id: allergenId })),
          });
        }
      }

      return tx.product.findUnique({
        where: { product_id },
        include: {
          translations: true,
          variants: { include: { translations: true } },
          allergens: { include: { allergen: { include: { translations: true } } } },
          category: { include: { translations: true } },
        },
      });
    });
  },

  async deleteProduct(product_id: number): Promise<Product | null> {
    return prisma.product.delete({
      where: { product_id },
    });
  },

  async addVariantToProduct(product_id: number, establishment_id: number, variantData: CreateProductVariantDTO): Promise<ProductVariant> {
    const { translations, ...data } = variantData;
    return prisma.productVariant.create({
      data: {
        ...cleanVariantData(data, establishment_id),
        product: { connect: { product_id } },
        establishment: { connect: { establishment_id } },
        translations: translations ? {
          createMany: { data: translations.map(t => cleanVariantTranslation(t)) }
        } : undefined,
      },
      include: { translations: true }
    });
  },

  async updateProductVariant(variant_id: number, data: UpdateProductVariantDTO): Promise<ProductVariant | null> {
    const { translations, ...variantData } = data;
    return prisma.$transaction(async (tx) => {
      await tx.productVariant.update({
        where: { variant_id },
        data: toSnakeCase(variantData)
      });
      if (translations) {
        await tx.productVariantTranslation.deleteMany({ where: { variant_id } });
        if (translations.length > 0) {
          await tx.productVariantTranslation.createMany({
            data: translations.map(t => cleanVariantTranslation(t, variant_id))
          });
        }
      }
      return tx.productVariant.findUnique({
        where: { variant_id },
        include: { translations: true }
      });
    });
  },

  async deleteProductVariant(variant_id: number): Promise<ProductVariant | null> {
    return prisma.productVariant.delete({ where: { variant_id } });
  }
};
