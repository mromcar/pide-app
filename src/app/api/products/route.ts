import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Asume que tienes un cliente Prisma inicializado aquí
import type { SerializedProduct } from '@/types/menu'; // Importa el tipo serializado

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const establishmentId = searchParams.get('establishmentId');
    const languageCode = searchParams.get('lang'); // Usaremos 'lang' como parámetro para el código de idioma

    if (!establishmentId) {
      return NextResponse.json(
        { error: 'Parámetro establishmentId es requerido.' },
        { status: 400 }
      );
    }

    if (!languageCode) {
        return NextResponse.json(
            { error: 'Parámetro lang (código de idioma) es requerido.' },
            { status: 400 }
        );
    }

    const products = await prisma.product.findMany({
      where: {
        establishment_id: parseInt(establishmentId),
        is_active: true, // Asumimos que solo quieres productos activos
      },
      include: {
        translations: {
          where: { language_code: languageCode },
        },
        variants: {
          where: { is_active: true }, // Asumimos que solo quieres variantes activas
          include: {
            translations: {
              where: { language_code: languageCode },
            },
          },
        },
        allergens: {
          include: {
            allergen: {
              include: {
                translations: {
                  where: { language_code: languageCode },
                },
              },
            },
          },
        },
      },
      orderBy: { sort_order: 'asc' }, // Opcional: ordenar por orden de clasificación
    });

    // Mapeamos los resultados de Prisma para que coincidan con la estructura de SerializedProduct
    const serializedProducts: SerializedProduct[] = products.map((product) => ({
      product_id: product.product_id,
      establishment_id: product.establishment_id,
      category_id: product.category_id,
      name: product.translations[0]?.name || product.name, // Usa la traducción si existe
      description: product.translations[0]?.description || product.description, // Usa la traducción si existe
      image_url: product.image_url,
      sort_order: product.sort_order,
      is_active: product.is_active,
      translations: product.translations, // Las traducciones ya filtradas
      variants: product.variants.map((variant) => ({
        variant_id: variant.variant_id,
        product_id: variant.product_id,
        establishment_id: variant.establishment_id,
        variant_description: variant.translations[0]?.variant_description || variant.variant_description, // Usa la traducción
        price: variant.price.toNumber(), // Convertir Decimal a number
        sku: variant.sku,
        sort_order: variant.sort_order,
        is_active: variant.is_active,
        translations: variant.translations, // Las traducciones ya filtradas
      })),
      allergens: product.allergens.map((pa) => ({
        product_id: pa.product_id,
        allergen_id: pa.allergen_id,
        allergen: {
          allergen_id: pa.allergen.allergen_id,
          code: pa.allergen.code,
          name: pa.allergen.translations[0]?.name || pa.allergen.name, // Usa la traducción
          description: pa.allergen.translations[0]?.description || pa.allergen.description, // Usa la traducción
          icon_url: pa.allergen.icon_url,
          is_major_allergen: pa.allergen.is_major_allergen,
          translations: pa.allergen.translations, // Las traducciones ya filtradas
        },
      })),
    }));

    return NextResponse.json(serializedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    // Asegúrate de que el error sea una instancia de Error para acceder a `message`
    if (error instanceof Error) {
        return NextResponse.json(
            { error: 'Error fetching products', message: error.message },
            { status: 500 }
        );
    }
    return NextResponse.json(
        { error: 'An unexpected error occurred' },
        { status: 500 }
    );
  } finally {
    // En Next.js App Router, Prisma Client se gestiona automáticamente
    // Si estás usando `new PrismaClient()` por cada request, debes desconectarte.
    // Si usas un patrón Singleton (recomendado), no es necesario.
    // Asumiendo que `prisma` es un singleton, no es necesario `await prisma.$disconnect()`.
    // Si tu `prisma` no es un singleton y estás en un entorno de desarrollo,
    // puedes mantenerlo para evitar advertencias de conexión.
  }
}
