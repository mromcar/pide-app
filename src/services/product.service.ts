import { PrismaClient, Product, ProductTranslation, ProductHistory, ProductAllergen, Prisma, UserRole, Allergen, AllergenTranslation, User } from '@prisma/client';
import {
  ProductCreateDTO, 
  ProductUpdateDTO, 
  ProductResponseDTO,
} from '../types/dtos/product';
import {
  ProductTranslationCreateDTO,
  ProductTranslationResponseDTO,
  ProductTranslationUpdateDTO
} from '../types/dtos/productTranslation';
import {
  ProductAllergenResponseDTO
} from '../types/dtos/productAllergen';
import {
  AllergenResponseDTO // Asegúrate de que esta importación exista y sea correcta
} from '../types/dtos/allergen';
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

const prisma = new PrismaClient();

// Tipo para el alérgeno incluido en ProductAllergen con sus traducciones
type AllergenWithTranslations = Allergen & { translations?: AllergenTranslation[] };

// Tipo para ProductHistory que incluye el usuario (opcionalmente)
// Prisma generará esto, pero es bueno tenerlo en mente para los DTOs
type ProductHistoryWithUser = ProductHistory & { user?: User | null };

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
    // Ahora 'details', 'action_type', 'changed_at' y 'user_id' existen en 'history'
    const detailsJson = history.details as Prisma.JsonObject | null;
    return {
      id: history.id,
      product_id: history.product_id,
      // Estos campos pueden venir de 'details' o de los campos directos si los mantienes
      name: (detailsJson?.name as string) || history.name || '', 
      description: (detailsJson?.description as string) || history.description || null,
      is_active: typeof (detailsJson?.is_active) === 'boolean' ? (detailsJson.is_active as boolean) : history.is_active ?? false, // Asumir false si no está
      changed_at: history.changed_at.toISOString(), // changed_at ahora es obligatorio
      action_type: history.action_type, // Añadido
      user_id: history.user_id,
      user_name: history.user?.name, // Ejemplo si incluyes el usuario
      // details: history.details, // Podrías devolver el JSON completo si es necesario
    };
  }

  private mapToDTO(product: Product & { 
    translations?: ProductTranslation[], 
    product_allergens?: (ProductAllergen & { allergen?: AllergenWithTranslations })[], 
  }): ProductResponseDTO {
    return {
      product_id: product.product_id,
      establishment_id: product.establishment_id,
      category_id: product.category_id,
      name: product.name, 
      description: product.description,
      image_url: product.image_url,
      sort_order: product.sort_order,
      is_active: product.is_active ?? true, // Proporcionar un valor predeterminado
      responsible_role: product.responsible_role as UserRole | null, 
      created_by_user_id: product.created_by_user_id,
      created_at: product.created_at?.toISOString() || null,
      updated_at: product.updated_at?.toISOString() || null,
      deleted_at: product.deleted_at?.toISOString() || null,
      translations: product.translations?.map(this.mapToTranslationDTO) || [],
      allergens: product.product_allergens?.map(pa => this.mapToAllergenDTO(pa)) || [],
    };
  }

  private get allergenInclude() {
    return {
      allergen: {
        include: {
          translations: true, 
        },
      },
    };
  }

  async createProduct(data: ProductCreateInput, userId?: number): Promise<ProductResponseDTO> {
    const { translations, allergen_ids, ...productData } = data;

    const newProduct = await prisma.product.create({
      data: { // Los datos para crear el producto
        ...productData,
        created_by_user_id: userId,
        translations: translations && translations.length > 0 ? {
          createMany: {
            data: translations.map(t => ({ language_code: t.language_code, name: t.name, description: t.description })),
          },
        } : undefined,
        product_allergens: allergen_ids && allergen_ids.length > 0 ? {
          createMany: {
            data: allergen_ids.map(id => ({ allergen_id: id })),
          },
        } : undefined,
      },
      // El 'include' para la respuesta está al mismo nivel que 'data'
      include: { 
        translations: true, 
        product_allergens: { include: this.allergenInclude } 
      },
    });

    // Crear entrada de historial
    await prisma.productHistory.create({
      data: {
        product_id: newProduct.product_id,
        // Los campos name, description, is_active pueden tomarse del newProduct
        // o dejarse nulos si toda la info va en 'details'
        name: newProduct.name,
        description: newProduct.description,
        is_active: newProduct.is_active,
        user_id: userId, // Ahora existe en el modelo ProductHistory
        action_type: 'CREATE',
        details: { createdData: this.mapToDTO(newProduct) } as Prisma.InputJsonValue, 
      },
    });

    return this.mapToDTO(newProduct);
  }

  async getProductById(productId: number): Promise<ProductResponseDTO | null> {
    productIdSchema.parse({ product_id: productId });
    const product = await prisma.product.findUnique({
      where: { product_id: productId, deleted_at: null }, 
      include: {
        translations: true,
        product_allergens: { include: this.allergenInclude },
        category: true, 
      },
    });
    return product ? this.mapToDTO(product) : null;
  }

  async getAllProducts(establishmentId: number, page: number = 1, pageSize: number = 10): Promise<ProductResponseDTO[]> {
    const skip = (page - 1) * pageSize;
    const products = await prisma.product.findMany({
      where: { establishment_id: establishmentId, deleted_at: null },
      skip: skip,
      take: pageSize,
      include: {
        translations: true,
        product_allergens: { include: this.allergenInclude },
        category: true,
      },
      orderBy: [
        { sort_order: 'asc' },
        { name: 'asc' },
      ]
    });
    return products.map(p => this.mapToDTO(p));
  }

  async updateProduct(productId: number, data: ProductUpdateInput, userId?: number): Promise<ProductResponseDTO | null> {
    productIdSchema.parse({ product_id: productId });
    const { translations, allergen_ids, ...productData } = data;

    const existingProduct = await prisma.product.findUnique({ 
      where: { product_id: productId, deleted_at: null },
      include: { 
        translations: true, 
        product_allergens: { include: this.allergenInclude } 
      }
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
            data: translations.map(t => ({ 
                language_code: t.language_code, 
                name: t.name, 
                description: t.description 
            })),
          },
        } : undefined,
        product_allergens: allergen_ids ? {
          deleteMany: { product_id: productId },
          createMany: {
            data: allergen_ids.map(id => ({ allergen_id: id })),
          }
        } : undefined,
      },
      include: { 
        translations: true, 
        product_allergens: { include: this.allergenInclude }
      },
    });

    await prisma.productHistory.create({
      data: {
        product_id: updatedProduct.product_id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        is_active: updatedProduct.is_active,
        user_id: userId, 
        action_type: 'UPDATE',
        details: { oldData: this.mapToDTO(existingProduct), newData: this.mapToDTO(updatedProduct) } as Prisma.InputJsonValue,
      },
    });

    return this.mapToDTO(updatedProduct);
  }

  async deleteProduct(productId: number, userId?: number): Promise<ProductResponseDTO | null> {
    productIdSchema.parse({ product_id: productId });
    
    const existingProduct = await prisma.product.findUnique({ 
        where: { product_id: productId, deleted_at: null },
        include: { // Incluir para el log, mapToDTO lo necesita
            translations: true, 
            product_allergens: { include: this.allergenInclude } 
        }
    });
    if (!existingProduct) return null;

    // Soft delete
    const deletedProduct = await prisma.product.update({
      where: { product_id: productId },
      data: { deleted_at: new Date() },
      include: { 
        translations: true, 
        product_allergens: { include: this.allergenInclude } 
      } 
    });

    await prisma.productHistory.create({
      data: {
        product_id: productId,
        name: deletedProduct.name, 
        description: deletedProduct.description,
        is_active: deletedProduct.is_active, // Esto será false si el producto se desactiva al borrar
        user_id: userId,
        action_type: 'DELETE',
        details: { deletedData: this.mapToDTO(existingProduct) } as Prisma.InputJsonValue, // Log del estado *antes* de marcar como borrado
      },
    });

    return this.mapToDTO(deletedProduct); 
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
    // Aquí podrías añadir validación con Zod para productId y allergenId si lo deseas
    const assignment = await prisma.productAllergen.create({
      data: {
        product_id: productId,
        allergen_id: allergenId,
      },
      include: { allergen: { include: { translations: true } } } 
    });
    return this.mapToAllergenDTO(assignment as any); 
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
      return this.mapToAllergenDTO(unassignment as any); 
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
        changed_at: 'desc', // Usar changed_at
      },
      include: {
        user: { select: { name: true } } // Opcional: incluir nombre del usuario
      }
    });
    return histories.map(h => this.mapToHistoryDTO(h));
  }
}