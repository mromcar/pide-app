import { prisma } from '@/lib/prisma';
import { Product, ProductTranslation, ProductHistory, ProductAllergen, Prisma, UserRole, Allergen, AllergenTranslation, ProductVariant, ProductVariantTranslation } from '@prisma/client';
import { ProductResponseDTO } from '../types/dtos/product';
import {
  ProductVariantResponseDTO
} from '../types/dtos/productVariant';
import {
  ProductTranslationCreateDTO,
  ProductTranslationResponseDTO,
  ProductTranslationUpdateDTO
} from '../types/dtos/productTranslation';
import {
  ProductAllergenResponseDTO
} from '../types/dtos/productAllergen';
import {
  AllergenTranslationResponseDTO
} from '../types/dtos/allergenTranslation';
import {
  ProductHistoryResponseDTO
} from '../types/dtos/productHistory';
import {
  productCreateSchema,
  productUpdateSchema,
  productIdSchema,
  ProductCreateInput,
  ProductUpdateInput
} from '../schemas/product';
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
  category?: Prisma.CategoryGetPayload<{}>; // Assuming category is a simple type or adjust as needed
};

export class ProductService {
  private mapToTranslationDTO(translation: ProductTranslation): ProductTranslationResponseDTO {
    return {
      translation_id: translation.translation_id,
      product_id: translation.product_id,
      language_code: translation.language_code,
      name: translation.name,
      description: translation.description,
    };
  }

  private mapToAllergenTranslationDTO(translation: AllergenTranslation): AllergenTranslationResponseDTO {
    return {
      translation_id: translation.translation_id,
      language_code: translation.language_code,
      name: translation.name,
      description: translation.description,
    };
  }

  private mapToAllergenDTO(productAllergen: ProductAllergen & { allergen?: AllergenWithTranslations }): ProductAllergenResponseDTO {
    return {
      product_id: productAllergen.product_id,
      allergen_id: productAllergen.allergen_id,
      allergen: productAllergen.allergen ? {
        allergen_id: productAllergen.allergen.allergen_id,
        code: productAllergen.allergen.code,
        name: productAllergen.allergen.name,
        description: productAllergen.allergen.description,
        icon_url: productAllergen.allergen.icon_url,
        is_major_allergen: productAllergen.allergen.is_major_allergen,
        translations: productAllergen.allergen.translations?.map(this.mapToAllergenTranslationDTO) || [],
      } : undefined,
    };
  }

  private mapToHistoryDTO(history: ProductHistoryWithUser): ProductHistoryResponseDTO {
    const detailsJson = history.details as Prisma.JsonObject | null;
    return {
      id: history.id,
      product_id: history.product_id,
      name: (detailsJson?.name as string) || history.name || '',
      description: (detailsJson?.description as string) || history.description || null,
      is_active: typeof (detailsJson?.is_active) === 'boolean' ? (detailsJson.is_active as boolean) : history.is_active ?? false,
      changed_at: history.changed_at ? history.changed_at.toISOString() : new Date(0).toISOString(),
      action_type: history.action_type,
      user_id: history.user_id,
      user_name: history.user?.name,
    };
  }

  private mapVariantToDTO(variant: ProductVariant & { translations?: ProductVariantTranslation[] }): ProductVariantResponseDTO { // <<< Ensure ProductVariantResponseDTO is imported
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
      translations: variant.translations?.map(vt => ({
        translation_id: vt.translation_id,
        variant_id: vt.variant_id,
        language_code: vt.language_code,
        variant_description: vt.variant_description,
      })) || [],
    };
  }

  private mapToDTO(product: ProductWithDetails): ProductResponseDTO {
    return {
      product_id: product.product_id,
      establishment_id: product.establishment_id,
      category_id: product.category_id,
      category_name: product.category?.name, // Safely access category name
      name: product.name,
      description: product.description,
      sort_order: product.sort_order,
      is_active: product.is_active ?? true,
      responsible_role: product.responsible_role as UserRole | null,
      created_by_user_id: product.created_by_user_id,
      created_at: product.created_at?.toISOString() || null,
      updated_at: product.updated_at?.toISOString() || null,
      deleted_at: product.deleted_at?.toISOString() || null,
      translations: product.translations?.map(this.mapToTranslationDTO) || [],
      allergens: product.allergens?.map(pa => this.mapToAllergenDTO(pa)) || [],
      variants: product.variants?.map(v => this.mapVariantToDTO(v)) || [], // Corrected to call this.mapVariantToDTO
      // category: product.category ? this.mapToCategoryDTO(product.category) : undefined, // If you have a mapToCategoryDTO
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
      orderBy: { sort_order: Prisma.SortOrder.asc }, // <<< CORRECTED: Use Prisma.SortOrder.asc
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
            // Ensure 'data' property is used for createMany
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
        details: { ...productData, translations, allergen_ids } as unknown as Prisma.JsonObject, // Use allergen_ids here as well
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
        category: true, // Ensure category is included
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
        allergens: this.allergenInclude, // <<< CORRECTED: Use the getter directly
        category: true,
        variants: this.variantInclude, // <<< CORRECTED: Use the getter directly
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
            // Ensure 'data' property is used for createMany
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
        allergens: this.allergenInclude, // <<< CORRECTED: Use the getter directly
        category: true,
        variants: this.variantInclude, // <<< CORRECTED: Use the getter directly
      }
    });

    await prisma.productHistory.create({
      data: {
        product_id: deletedProduct.product_id,
        name: existingProduct.name, // Log current name before soft delete
        description: existingProduct.description,
        is_active: false, // Mark as inactive in history
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
      return this.mapToAllergenDTO(unassignment);
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
