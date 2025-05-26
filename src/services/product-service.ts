// src/services/product-service.ts
import { prisma } from '../lib/prisma';
import type { Product, ProductVariant } from '@prisma/client';
import type { CreateProductDTO, UpdateProductDTO, CreateProductVariantDTO, UpdateProductVariantDTO } from '../types/dtos/product';

function cleanVariantData(
  v: CreateProductVariantDTO,
  establishmentId: number
) {
  const { ...variantData } = v;
  if (
    typeof variantData.variantDescription !== 'string' ||
    typeof variantData.price !== 'number' ||
    typeof variantData.isActive !== 'boolean'
  ) {
    throw new Error('Missing required fields for variant');
  }
  return {
    ...variantData,
    establishmentId,
  };
}

export const productService = {
  async createProduct(data: CreateProductDTO): Promise<Product> {
    const { translations, variants, allergenIds, ...productData } = data;

    return prisma.product.create({
      data: {
        ...productData,
        translations: translations
          ? {
              createMany: {
                data: translations.map(t => ({
                  languageCode: t.languageCode,
                  name: t.name,
                  description: t.description,
                })),
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
                          data: variantTranslations.map(vt => ({
                            languageCode: vt.languageCode,
                            variantDescription: vt.variantDescription,
                          })),
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
                allergen: { connect: { id: allergenId } },
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
    establishmentId: number,
    options?: { categoryId?: number; isActive?: boolean; includeAllergens?: boolean, includeTranslations?: boolean, languageCode?: string }
  ): Promise<Product[]> {
    return prisma.product.findMany({
      where: {
        establishmentId,
        categoryId: options?.categoryId,
        isActive: options?.isActive,
      },
      include: {
        translations: options?.includeTranslations ? (options.languageCode ? { where: { languageCode: options.languageCode }} : true) : false,
        variants: {
          where: { isActive: true },
          include: {
            translations: options?.includeTranslations ? (options.languageCode ? { where: { languageCode: options.languageCode }} : true) : false,
          },
          orderBy: { sortOrder: 'asc' }
        },
        allergens: options?.includeAllergens ? { include: { allergen: { include: { translations: options?.includeTranslations ? (options.languageCode ? { where: { languageCode: options.languageCode }} : true) : false, } } } } : false,
        category: { include: { translations: options?.includeTranslations ? (options.languageCode ? { where: { languageCode: options.languageCode }} : true) : false, } },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });
  },

  async getProductById(productId: number, options?: { languageCode?: string }): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id: productId },
      include: {
        translations: options?.languageCode ? { where: { languageCode: options.languageCode } } : true,
        variants: {
          include: {
            translations: options?.languageCode ? { where: { languageCode: options.languageCode } } : true,
          },
          orderBy: { sortOrder: 'asc' }
        },
        allergens: {
          include: {
            allergen: {
              include: {
                translations: options?.languageCode ? { where: { languageCode: options.languageCode } } : true,
              },
            },
          },
        },
        category: { include: { translations: options?.languageCode ? { where: { languageCode: options.languageCode } } : true, } },
        establishment: true,
      },
    });
  },

  async updateProduct(productId: number, data: UpdateProductDTO): Promise<Product | null> {
    const { translations, variants, allergenIds, categoryId, ...productData } = data;

    return prisma.$transaction(async (tx) => {
      // 1. Actualizar datos del producto principal
      // Elimina campos que no se pueden actualizar directamente
      const { ...updatableProductData } = productData;

      // Limpia los campos undefined
      const cleanData = Object.fromEntries(
        Object.entries(updatableProductData).filter(([v]) => v !== undefined)
      );

      await tx.product.update({
        where: { id: productId },
        data: {
          ...cleanData,
          ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
        },
      });

      // 2. Actualizar traducciones del producto
      if (translations) {
        await tx.productTranslation.deleteMany({ where: { productId } });
        if (translations.length > 0) {
          await tx.productTranslation.createMany({
            data: translations.map(t => ({ productId, ...t })),
          });
        }
      }

      // 3. Actualizar variantes (borrar y crear nuevas, con traducciones)
      if (variants) {
        await tx.productVariant.deleteMany({ where: { productId } });
        const product = await tx.product.findUnique({ where: { id: productId }, select: { establishmentId: true } });
        if (product?.establishmentId) {
          for (const v of variants) {
            // Elimina variantId y asegura campos obligatorios
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
                productId,
                establishmentId: product.establishmentId,
                variantDescription,
                price,
                isActive,
                ...(typeof sortOrder === 'number' ? { sortOrder } : {}),
                ...(typeof sku === 'string' ? { sku } : {}),
              },
            });

            if (variantTranslations && variantTranslations.length > 0) {
              await tx.productVariantTranslation.createMany({
                data: variantTranslations.map(t => ({
                  variantId: variant.id,
                  ...t,
                })),
              });
            }
          }
        }
      }

      // 4. Actualizar alérgenos
      if (allergenIds) {
        await tx.productAllergen.deleteMany({ where: { productId } });
        if (allergenIds.length > 0) {
          await tx.productAllergen.createMany({
            data: allergenIds.map(allergenId => ({ productId, allergenId })),
          });
        }
      }

      return tx.product.findUnique({
        where: { id: productId },
        include: {
          translations: true,
          variants: { include: { translations: true } },
          allergens: { include: { allergen: { include: { translations: true } } } },
          category: { include: { translations: true } },
        },
      });
    });
  },

  async deleteProduct(productId: number): Promise<Product | null> {
    // Se borrarán en cascada: ProductTranslation, ProductVariant (y sus traducciones), ProductAllergen.
    // Si hay OrderItems referenciando una ProductVariant de este producto con onDelete: RESTRICT, fallará.
    return prisma.product.delete({
      where: { id: productId },
    });
  },

  // Métodos específicos para Variantes podrían estar aquí o en un product-variant-service.ts
  async addVariantToProduct(productId: number, establishmentId: number, variantData: CreateProductVariantDTO): Promise<ProductVariant> {
     const { translations, ...data } = variantData;
     return prisma.productVariant.create({
        data: {
            ...data,
            product: { connect: { id: productId }},
            establishment: { connect: { id: establishmentId }},
            translations: translations ? {
                createMany: { data: translations }
            } : undefined,
        },
        include: { translations: true }
     });
  },

  async updateProductVariant(variantId: number, data: UpdateProductVariantDTO): Promise<ProductVariant | null> {
    const { translations, ...variantData } = data; // productId y establishmentId no se actualizan directamente aquí
    return prisma.$transaction(async (tx) => {
        await tx.productVariant.update({
            where: {id: variantId},
            data: variantData
        });
        if (translations) {
            await tx.productVariantTranslation.deleteMany({ where: { variantId }});
            if (translations.length > 0) {
                await tx.productVariantTranslation.createMany({
                    data: translations.map(t => ({ variantId, ...t}))
                });
            }
        }
        return tx.productVariant.findUnique({
            where: { id: variantId },
            include: { translations: true }
        });
    });
  },

  async deleteProductVariant(variantId: number): Promise<ProductVariant | null> {
    return prisma.productVariant.delete({ where: { id: variantId }});
  }
};
