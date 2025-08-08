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
      translationId: translation.translation_id,
      productId: translation.product_id,
      languageCode: translation.language_code,
      name: translation.name,
      description: translation.description,
    };
  }

  private mapToAllergenTranslationDTO(translation: AllergenTranslation): AllergenTranslationResponseDTO {
    return {
      translationId: translation.translation_id,
      languageCode: translation.language_code,
      name: translation.name,
      description: translation.description,
    };
  }

  private mapToAllergenDTO(productAllergen: ProductAllergen & { allergen?: AllergenWithTranslations }): ProductAllergenResponseDTO {
    return {
      productId: productAllergen.product_id,
      allergenId: productAllergen.allergen_id,
      allergen: productAllergen.allergen ? {
        allergenId: productAllergen.allergen.allergen_id,
        code: productAllergen.allergen.code,
        name: productAllergen.allergen.name,
        description: productAllergen.allergen.description,
        iconUrl: productAllergen.allergen.icon_url,
        isMajorAllergen: productAllergen.allergen.is_major_allergen,
        translations: productAllergen.allergen.translations?.map(this.mapToAllergenTranslationDTO) || [],
      } : undefined,
    };
  }

  private mapToHistoryDTO(history: ProductHistoryWithUser): ProductHistoryResponseDTO {
    const detailsJson = history.details as Prisma.JsonObject | null;
    return {
      id: history.id,
      productId: history.product_id,
      name: (detailsJson?.name as string) || history.name || '',
      description: (detailsJson?.description as string) || history.description || null,
      isActive: typeof (detailsJson?.is_active) === 'boolean' ? (detailsJson.is_active as boolean) : history.is_active ?? false,
      changedAt: history.changed_at ? history.changed_at.toISOString() : new Date(0).toISOString(),
      actionType: history.action_type,
      userId: history.user_id,
      userName: history.user?.name,
    };
  }

  private mapVariantToDTO(variant: ProductVariant & { translations?: ProductVariantTranslation[] }): ProductVariantResponseDTO {
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
      translations: variant.translations?.map(vt => ({
        translationId: vt.translation_id,
        variantId: vt.variant_id,
        languageCode: vt.language_code,
        variantDescription: vt.variant_description,
      })) || [],
    };
  }

  private mapToDTO(product: ProductWithDetails): ProductResponseDTO {
    return {
      productId: product.product_id,
      establishmentId: product.establishment_id,
      categoryId: product.category_id,
      categoryName: product.category?.name,
      name: product.name,
      description: product.description,
      sortOrder: product.sort_order,
      isActive: product.is_active ?? true,
      responsibleRole: product.responsible_role as UserRole | null,
      createdByUserId: product.created_by_user_id,
      createdAt: product.created_at?.toISOString() || null,
      updatedAt: product.updated_at?.toISOString() || null,
      deletedAt: product.deleted_at?.toISOString() || null,
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
      where: { deleted_at: null },
      orderBy: { sort_order: Prisma.SortOrder.asc },
      include: {
        translations: true,
      },
    };
  }

  async createProduct(data: ProductCreateInput, userId?: number): Promise<ProductResponseDTO> {
    const parsedData = productCreateSchema.parse(data);
    const { translations, allergen_ids, ...productData } = parsedData;

    const newProduct = await prisma.product.create({
      data: {
        ...productData,
        created_by_user_id: userId,
        translations: translations && translations.length > 0 ? {
          createMany: {
            data: translations.map(t => ({ language_code: t.language_code, name: t.name, description: t.description })),
          },
        } : undefined,
        allergens: allergen_ids && allergen_ids.length > 0 ? {
          createMany: {
            data: allergen_ids.map((allergen_id: number) => ({ allergen_id })),
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
        product_id: newProduct.product_id,
        name: newProduct.name,
        description: newProduct.description,
        is_active: newProduct.is_active,
        action_type: 'CREATE',
        user_id: userId,
        details: { ...productData, translations, allergen_ids } as unknown as Prisma.JsonObject,
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
      establishment_id: establishmentId,
      deleted_at: null,
    };

    if (categoryId) {
      where.category_id = categoryId;
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
        { sort_order: 'asc' },
        { name: 'asc' },
      ]
    });
    return products.map(p => this.mapToDTO(p as ProductWithDetails));
  }

  async getProductById(productId: number): Promise<ProductResponseDTO | null> {
    productIdSchema.parse({ product_id: productId });
    const product = await prisma.product.findUnique({
      where: { product_id: productId, deleted_at: null },
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
    productIdSchema.parse({ product_id: productId });
    const parsedData = productUpdateSchema.parse(data);
    const { translations, allergen_ids: allergenIdsToSet, ...productData } = parsedData;

    const existingProduct = await prisma.product.findUnique({
      where: { product_id: productId, deleted_at: null },
      include: { allergens: true }
    });

    if (!existingProduct) {
      return null;
    }

    const updatedProduct = await prisma.product.update({
      where: { product_id: productId },
      data: {
        ...productData,
        translations: translations ? {
          deleteMany: { product_id: productId },
          createMany: {
            data: translations.map(t => ({ language_code: t.language_code, name: t.name, description: t.description })),
          },
        } : undefined,
        allergens: allergenIdsToSet !== undefined ? {
          deleteMany: { product_id: productId },
          createMany: {
            data: allergenIdsToSet.map((allergen_id: number) => ({ allergen_id })),
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
        product_id: updatedProduct.product_id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        is_active: updatedProduct.is_active,
        action_type: 'UPDATE',
        user_id: userId,
        details: { ...parsedData } as unknown as Prisma.JsonObject,
      },
    });

    return this.mapToDTO(updatedProduct as ProductWithDetails);
  }

  async deleteProduct(productId: number, userId?: number): Promise<ProductResponseDTO | null> {
    productIdSchema.parse({ product_id: productId });
    const existingProduct = await prisma.product.findUnique({
        where: { product_id: productId, deleted_at: null },
    });
    if (!existingProduct) return null;

    const deletedProduct = await prisma.product.update({
      where: { product_id: productId },
      data: { deleted_at: new Date() },
      include: {
        translations: true,
        allergens: this.allergenInclude,
        category: true,
        variants: this.variantInclude,
      }
    });

    await prisma.productHistory.create({
      data: {
        product_id: deletedProduct.product_id,
        name: existingProduct.name,
        description: existingProduct.description,
        is_active: false,
        action_type: 'DELETE',
        user_id: userId,
        details: { name: existingProduct.name, description: existingProduct.description, is_active: false } as unknown as Prisma.JsonObject,
      },
    });

    return this.mapToDTO(deletedProduct as ProductWithDetails);
  }

  async addOrUpdateProductTranslation(productId: number, translationData: ProductTranslationCreateDTO | ProductTranslationUpdateDTO ): Promise<ProductTranslationResponseDTO> {
    productIdSchema.parse({ product_id: productId });

    let parsedData;
    if ('translation_id' in translationData && translationData.translation_id) {
        parsedData = productTranslationUpdateSchema.parse(translationData);
    } else {
        parsedData = productTranslationCreateSchema.parse({...translationData, product_id: productId });
    }

    const { language_code, name, description } = parsedData;

    if (!language_code) {
        throw new Error('Language code is required for translation upsert.');
    }

    const translation = await prisma.productTranslation.upsert({
      where: {
        product_id_language_code: {
          product_id: productId,
          language_code: language_code,
        },
      },
      update: { name: name, description: description },
      create: { product_id: productId, language_code: language_code, name: name!, description: description },
    });
    return this.mapToTranslationDTO(translation);
  }

  async assignAllergenToProduct(productId: number, allergenId: number): Promise<ProductAllergenResponseDTO> {
    const assignment = await prisma.productAllergen.create({
      data: {
        product_id: productId,
        allergen_id: allergenId,
      },
      include: { allergen: { include: { translations: true } } }
    });
    return this.mapToAllergenDTO(assignment);
  }

  async removeAllergenFromProduct(productId: number, allergenId: number): Promise<ProductAllergenResponseDTO | null> {
    try {
      const unassignment = await prisma.productAllergen.delete({
        where: {
          product_id_allergen_id: {
            product_id: productId,
            allergen_id: allergenId,
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
    productIdSchema.parse({ product_id: productId });
    const skip = (page - 1) * pageSize;
    const histories = await prisma.productHistory.findMany({
      where: { product_id: productId },
      skip: skip,
      take: pageSize,
      orderBy: {
        changed_at: 'desc',
      },
      include: {
        user: { select: { name: true } }
      }
    });
    return histories.map(h => this.mapToHistoryDTO(h));
  }
}

export const productService = new ProductService();
