import { prisma } from '@/lib/prisma';
import { Product, ProductTranslation, ProductHistory, ProductAllergen, Prisma, UserRole, Allergen, AllergenTranslation, ProductVariant, ProductVariantTranslation } from '@prisma/client';
import { ProductResponseDTO } from '../types/dtos/product';
import { ProductVariantResponseDTO } from '../types/dtos/productVariant';
import { ProductTranslationCreateDTO, ProductTranslationResponseDTO, ProductTranslationUpdateDTO } from '../types/dtos/productTranslation';
import { ProductAllergenResponseDTO } from '../types/dtos/productAllergen';
import { AllergenTranslationResponseDTO } from '../types/dtos/allergenTranslation';
import { ProductHistoryResponseDTO } from '../types/dtos/productHistory';
import { productCreateSchema, productUpdateSchema, productIdSchema, ProductCreateInput, ProductUpdateInput } from '../schemas/product';
import { productTranslationCreateSchema, productTranslationUpdateSchema } from '../schemas/productTranslation';

// Tipo para el alérgeno incluido en ProductAllergen con sus traducciones
type AllergenWithTranslations = Allergen & { translations?: AllergenTranslation[] };

// Tipo para ProductHistory que incluye el usuario (opcionalmente)
type ProductHistoryWithUser = ProductHistory & { user?: { name: string | null } | null };

// Definición del tipo para el producto con todos sus detalles para el mapToDTO
type ProductWithDetails = Product & {
  translations?: ProductTranslation[];
  allergens?: (ProductAllergen & { allergen?: AllergenWithTranslations })[];
  variants?: (ProductVariant & { translations?: ProductVariantTranslation[] })[];
  category?: Prisma.CategoryGetPayload<{}>;
};

export class ProductService {
  private mapToTranslationDTO(translation: ProductTranslation): ProductTranslationResponseDTO {
    return {
      translationId: translation.translationId,
      productId: translation.productId,
      languageCode: translation.languageCode,
      name: translation.name,
      description: translation.description,
    };
  }

  private mapToAllergenTranslationDTO(translation: AllergenTranslation): AllergenTranslationResponseDTO {
    return {
      translationId: translation.translationId,
      allergenId: translation.allergenId,
      languageCode: translation.languageCode,
      name: translation.name,
      description: translation.description,
    };
  }

  private mapToAllergenDTO(productAllergen: ProductAllergen & { allergen?: AllergenWithTranslations }): ProductAllergenResponseDTO {
    return {
      productId: productAllergen.productId,
      allergenId: productAllergen.allergenId,
      allergen: productAllergen.allergen ? {
        allergenId: productAllergen.allergen.allergenId,
        code: productAllergen.allergen.code,
        name: productAllergen.allergen.name,
        description: productAllergen.allergen.description,
        iconUrl: productAllergen.allergen.iconUrl,
        isMajorAllergen: productAllergen.allergen.isMajorAllergen,
        translations: productAllergen.allergen.translations?.map(this.mapToAllergenTranslationDTO) || [],
      } : undefined,
    };
  }

  private mapToHistoryDTO(history: ProductHistoryWithUser): ProductHistoryResponseDTO {
    const detailsJson = history.details as Prisma.JsonObject | null;
    return {
      id: history.id,
      productId: history.productId,
      name: (detailsJson?.name as string) || history.name || '',
      description: (detailsJson?.description as string) || history.description || null,
      isActive: typeof (detailsJson?.isActive) === 'boolean' ? (detailsJson.isActive as boolean) : history.isActive ?? false,
      changedAt: history.changedAt ? history.changedAt.toISOString() : new Date(0).toISOString(),
      actionType: history.actionType,
      userId: history.userId,
      userName: history.user?.name,
    };
  }

  private mapVariantToDTO(variant: ProductVariant & { translations?: ProductVariantTranslation[] }): ProductVariantResponseDTO {
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
      translations: variant.translations?.map(vt => ({
        translationId: vt.translationId,
        variantId: vt.variantId,
        languageCode: vt.languageCode,
        variantDescription: vt.variantDescription,
      })) || [],
    };
  }

  private mapToDTO(product: ProductWithDetails): ProductResponseDTO {
    return {
      productId: product.productId,
      establishmentId: product.establishmentId,
      categoryId: product.categoryId,
      categoryName: product.category?.name,
      name: product.name,
      description: product.description,
      sortOrder: product.sortOrder,
      isActive: product.isActive ?? true,
      responsibleRole: product.responsibleRole as UserRole | null,
      createdByUserId: product.createdByUserId,
      createdAt: product.createdAt?.toISOString() || null,
      updatedAt: product.updatedAt?.toISOString() || null,
      deletedAt: product.deletedAt?.toISOString() || null,
      translations: product.translations?.map(this.mapToTranslationDTO) || [],
      allergens: product.allergens?.map(pa => this.mapToAllergenDTO(pa)) || [],
      variants: product.variants?.map(v => this.mapVariantToDTO(v)) || [],
    };
  }

  private get allergenInclude() {
    return {
      include: {
        allergen: {
          include: {
            translations: true,
          },
        },
      },
    };
  }

  private get variantInclude() {
    return {
      where: { deletedAt: null },
      orderBy: { sortOrder: Prisma.SortOrder.asc },
      include: {
        translations: true,
      },
    };
  }

  async createProduct(data: ProductCreateInput, userId?: number): Promise<ProductResponseDTO> {
    const parsedData = productCreateSchema.parse(data);
    const { translations, allergenIds, ...productData } = parsedData;

    const newProduct = await prisma.product.create({
      data: {
        ...productData,
        createdByUserId: userId,
        translations: translations && translations.length > 0 ? {
          createMany: {
            data: translations.map(t => ({ languageCode: t.languageCode, name: t.name, description: t.description })),
          },
        } : undefined,
        allergens: allergenIds && allergenIds.length > 0 ? {
          createMany: {
            data: allergenIds.map((allergenId: number) => ({ allergenId })),
          },
        } : undefined,
      },
      include: {
        translations: true,
        allergens: this.allergenInclude,
        category: true,
        variants: this.variantInclude,
      },
    });

    await prisma.productHistory.create({
      data: {
        productId: newProduct.productId,
        name: newProduct.name,
        description: newProduct.description,
        isActive: newProduct.isActive,
        actionType: 'CREATE',
        userId: userId,
        details: { ...productData, translations, allergenIds } as unknown as Prisma.JsonObject,
      },
    });

    return this.mapToDTO(newProduct as ProductWithDetails);
  }

  async getAllProducts(
    establishmentId: number,
    page: number = 1,
    pageSize: number = 10,
    categoryId?: number
  ): Promise<ProductResponseDTO[]> {
    const where: Prisma.ProductWhereInput = {
      establishmentId: establishmentId,
      deletedAt: null,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const products = await prisma.product.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        translations: true,
        allergens: this.allergenInclude,
        category: true,
        variants: this.variantInclude,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ]
    });
    return products.map(p => this.mapToDTO(p as ProductWithDetails));
  }

  async getProductById(productId: number): Promise<ProductResponseDTO | null> {
    productIdSchema.parse({ productId });
    const product = await prisma.product.findUnique({
      where: { productId: productId, deletedAt: null },
      include: {
        translations: true,
        allergens: this.allergenInclude,
        category: true,
        variants: this.variantInclude,
      },
    });
    return product ? this.mapToDTO(product as ProductWithDetails) : null;
  }

  async updateProduct(productId: number, data: ProductUpdateInput, userId?: number): Promise<ProductResponseDTO | null> {
    productIdSchema.parse({ productId });
    const parsedData = productUpdateSchema.parse(data);
    const { translations, allergenIds: allergenIdsToSet, ...productData } = parsedData;

    const existingProduct = await prisma.product.findUnique({
      where: { productId: productId, deletedAt: null },
      include: { allergens: true }
    });

    if (!existingProduct) {
      return null;
    }

    const updatedProduct = await prisma.product.update({
      where: { productId: productId },
      data: {
        ...productData,
        translations: translations ? {
          deleteMany: { productId: productId },
          createMany: {
            data: translations.map(t => ({ languageCode: t.languageCode, name: t.name, description: t.description })),
          },
        } : undefined,
        allergens: allergenIdsToSet !== undefined ? {
          deleteMany: { productId: productId },
          createMany: {
            data: allergenIdsToSet.map((allergenId: number) => ({ allergenId })),
          },
        } : undefined,
      },
      include: {
        translations: true,
        allergens: this.allergenInclude,
        category: true,
        variants: this.variantInclude,
      },
    });

    await prisma.productHistory.create({
      data: {
        productId: updatedProduct.productId,
        name: updatedProduct.name,
        description: updatedProduct.description,
        isActive: updatedProduct.isActive,
        actionType: 'UPDATE',
        userId: userId,
        details: { ...parsedData } as unknown as Prisma.JsonObject,
      },
    });

    return this.mapToDTO(updatedProduct as ProductWithDetails);
  }

  async deleteProduct(productId: number, userId?: number): Promise<ProductResponseDTO | null> {
    productIdSchema.parse({ productId });
    const existingProduct = await prisma.product.findUnique({
        where: { productId: productId, deletedAt: null },
    });
    if (!existingProduct) return null;

    const deletedProduct = await prisma.product.update({
      where: { productId: productId },
      data: { deletedAt: new Date() },
      include: {
        translations: true,
        allergens: this.allergenInclude,
        category: true,
        variants: this.variantInclude,
      }
    });

    await prisma.productHistory.create({
      data: {
        productId: deletedProduct.productId,
        name: existingProduct.name,
        description: existingProduct.description,
        isActive: false,
        actionType: 'DELETE',
        userId: userId,
        details: { name: existingProduct.name, description: existingProduct.description, isActive: false } as unknown as Prisma.JsonObject,
      },
    });

    return this.mapToDTO(deletedProduct as ProductWithDetails);
  }

  async addOrUpdateProductTranslation(productId: number, translationData: ProductTranslationCreateDTO | ProductTranslationUpdateDTO ): Promise<ProductTranslationResponseDTO> {
    productIdSchema.parse({ productId });

    let parsedData;
    if ('translationId' in translationData && translationData.translationId) {
        parsedData = productTranslationUpdateSchema.parse(translationData);
    } else {
        parsedData = productTranslationCreateSchema.parse({...translationData, productId: productId });
    }

    const { languageCode, name, description } = parsedData;

    if (!languageCode) {
        throw new Error('Language code is required for translation upsert.');
    }

    const translation = await prisma.productTranslation.upsert({
      where: {
        productId_languageCode: {
          productId: productId,
          languageCode: languageCode,
        },
      },
      update: { name: name, description: description },
      create: { productId: productId, languageCode: languageCode, name: name!, description: description },
    });
    return this.mapToTranslationDTO(translation);
  }

  async assignAllergenToProduct(productId: number, allergenId: number): Promise<ProductAllergenResponseDTO> {
    const assignment = await prisma.productAllergen.create({
      data: {
        productId: productId,
        allergenId: allergenId,
      },
      include: { allergen: { include: { translations: true } } }
    });
    return this.mapToAllergenDTO(assignment);
  }

  async removeAllergenFromProduct(productId: number, allergenId: number): Promise<ProductAllergenResponseDTO | null> {
    try {
      const unassignment = await prisma.productAllergen.delete({
        where: {
          productId_allergenId: {
            productId: productId,
            allergenId: allergenId,
          },
        },
        include: { allergen: { include: { translations: true } } }
      });
      return unassignment ? this.mapToAllergenDTO(unassignment) : null;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  async getProductHistory(productId: number, page: number = 1, pageSize: number = 10): Promise<ProductHistoryResponseDTO[]> {
    productIdSchema.parse({ productId });
    const skip = (page - 1) * pageSize;
    const histories = await prisma.productHistory.findMany({
      where: { productId: productId },
      skip: skip,
      take: pageSize,
      orderBy: {
        changedAt: 'desc',
      },
      include: {
        user: { select: { name: true } }
      }
    });
    return histories.map(h => this.mapToHistoryDTO(h));
  }

  async getProductsByCategory(categoryId: number, languageCode: string): Promise<ProductResponseDTO[]> {
    const products = await prisma.product.findMany({
      where: { categoryId },
      include: {
        category: {
          include: {
            translations: {
              where: { languageCode }
            }
          }
        },
        // ...otras relaciones si necesitas...
      }
    });

    return products.map(product => ({
      productId: product.productId,
      establishmentId: product.establishmentId,
      categoryId: product.categoryId,
      categoryName: product.category?.translations[0]?.name ?? product.category?.name ?? '', // nombre traducido o por defecto
      name: product.name,
      description: product.description,
      sortOrder: product.sortOrder,
      isActive: product.isActive ?? true,
      responsibleRole: product.responsibleRole,
      createdByUserId: product.createdByUserId,
      createdAt: product.createdAt?.toISOString() ?? null,
      updatedAt: product.updatedAt?.toISOString() ?? null,
      deletedAt: product.deletedAt?.toISOString() ?? null,
      // ...otros campos...
    }));
  }
}

export const productService = new ProductService();
