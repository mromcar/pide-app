import { PrismaClient } from '@prisma/client'
// Importa todos los tipos directamente desde tu archivo centralizado de tipos
import type {
  Category,
  Product,
  ProductVariant,
  CategoryTranslation,
  ProductTranslation,
  ProductVariantTranslation,
  EstablishmentBasic,
  ProductAllergen, // Necesario si vas a incluirlo en la consulta de Product
  Allergen // Necesario si vas a incluirlo en la consulta de ProductAllergen
} from '@/types/menu' // Asegúrate de que esta ruta sea correcta para tu proyecto

const db = new PrismaClient({ log: ['query', 'error', 'warn'] })

// Las interfaces definidas manualmente han sido eliminadas ya que ahora se importan desde '@/types/menu'

export async function getCategoriesWithProducts(
  establishmentId: number,
  languageCode: string
): Promise<Category[]> {
  try {
    const categories = await db.category.findMany({
      where: {
        establishment_id: establishmentId,
        is_active: true,
      },
      // Usamos `include` para cargar las relaciones.
      // Los campos `select` aseguran que solo traemos lo necesario y que los nombres de campos coincidan
      // con los de nuestros tipos.
      include: {
        products: {
          where: { is_active: true },
          include: {
            translations: {
              where: { language_code: languageCode },
            },
            variants: {
              where: { is_active: true },
              include: {
                translations: {
                  where: { language_code: languageCode },
                },
              },
            },
            // Si quieres incluir alérgenos y sus traducciones, sería así:
            allergens: {
              include: {
                allergen: {
                  include: {
                    translations: {
                      where: { language_code: languageCode }
                    }
                  }
                }
              }
            }
          },
        },
        translations: {
          where: { language_code: languageCode },
        },
      },
    })

    // Mapeamos los resultados de Prisma para que coincidan con la estructura de nuestros tipos
    // y manejamos las traducciones.
    const mappedCategories: Category[] = categories.map(category => ({
      category_id: category.category_id,
      establishment_id: category.establishment_id,
      name: category.translations[0]?.name || category.name, // Usa la traducción si existe, sino el nombre base
      image_url: category.image_url,
      sort_order: category.sort_order,
      is_active: category.is_active,
      translations: category.translations, // Ya filtrado por languageCode
      products: category.products.map(product => ({
        product_id: product.product_id,
        establishment_id: product.establishment_id,
        category_id: product.category_id,
        name: product.translations[0]?.name || product.name, // Usa la traducción si existe, sino el nombre base
        description: product.translations[0]?.description || product.description, // Usa la traducción si existe
        image_url: product.image_url,
        sort_order: product.sort_order,
        is_active: product.is_active,
        // El tipo `ProductTranslation` ahora se llama `translations` en el modelo
        translations: product.translations, // Ya filtrado por languageCode
        variants: product.variants.map(variant => ({
          variant_id: variant.variant_id,
          product_id: variant.product_id,
          establishment_id: variant.establishment_id,
          variant_description: variant.translations[0]?.variant_description || variant.variant_description, // Usa la traducción
          price: variant.price.toNumber(), // Convierte Prisma.Decimal a number
          sku: variant.sku,
          sort_order: variant.sort_order,
          is_active: variant.is_active,
          translations: variant.translations, // Ya filtrado por languageCode
        })),
        allergens: product.allergens.map(pa => ({
          product_id: pa.product_id,
          allergen_id: pa.allergen_id,
          // Si incluyes el objeto allergen completo, asegúrate de que sus campos
          // también coincidan con tus tipos y que las traducciones se apliquen.
          allergen: {
            allergen_id: pa.allergen.allergen_id,
            code: pa.allergen.code,
            name: pa.allergen.translations[0]?.name || pa.allergen.name,
            description: pa.allergen.translations[0]?.description || pa.allergen.description,
            icon_url: pa.allergen.icon_url,
            is_major_allergen: pa.allergen.is_major_allergen,
            translations: pa.allergen.translations
          }
        })) as ProductAllergen[], // Asegura el tipo correcto de ProductAllergen
      })),
    }));

    return mappedCategories;

  } catch (error) {
    console.error('Error fetching categories with products:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

export async function getEstablishmentById(
  establishmentId: number
): Promise<EstablishmentBasic | null> {
  try {
    // La consulta aquí es bastante directa y los campos ya coinciden bien.
    return await db.establishment.findUnique({
      where: { establishment_id: establishmentId },
      select: {
        establishment_id: true,
        name: true,
        description: true,
        website: true,
        is_active: true,
        accepts_orders: true,
      },
    })
  } catch (error) {
    console.error('Error fetching establishment by ID:', error)
    throw error
  } finally {
    await db.$disconnect()
  }
}
