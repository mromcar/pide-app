// src/app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { getCategoriesWithProducts } from '@/services/menu-services'; // Asegúrate de que esta ruta sea correcta
import type { SerializedCategory } from '@/types/menu'; // Importa el tipo SerializedCategory

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const establishmentId = searchParams.get('establishmentId');
    const languageCode = searchParams.get('lang');

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

    // Llama a la función de servicio que ya maneja la lógica de la base de datos
    // y la transformación de las traducciones.
    // Nota: getCategoriesWithProducts devuelve Category[], pero dado que estamos transformando
    // las traducciones en el servicio, la estructura es similar a SerializedCategory.
    // Si SerializedCategory tiene anidaciones extra (como SerializedProductAllergen),
    // asegúrate de que tu servicio también las genere o haz un mapeo adicional aquí.
    const categories = await getCategoriesWithProducts(
      parseInt(establishmentId),
      languageCode
    );

    // Si tu función `getCategoriesWithProducts` ya devuelve el formato `SerializedCategory[]`
    // (es decir, con los nombres/descripciones traducidos y alérgenos serializados),
    // entonces no necesitas un mapeo adicional aquí, solo un casting de tipo si es necesario.
    // Basado en la última `menu-services.ts` que te pasé, ya hace el mapeo de traducciones,
    // pero los alérgenos están como `ProductAllergen[]` que incluye `allergen: Allergen`,
    // no `SerializedProductAllergen[]` que incluye `allergen: SerializedAllergen`.
    // Para ser estrictos con `SerializedCategory`, deberías tener un mapeo si hay diferencias.
    // Sin embargo, si tu `menu-services.ts` ya te da lo que necesitas, puedes simplificar.

    // Asumimos que `getCategoriesWithProducts` ya te devuelve una estructura que se alinea
    // bien con SerializedCategory después de la lógica de transformación en el servicio.
    // Podrías añadir un paso de mapeo aquí si necesitas asegurarte de que cada `Product` dentro
    // de `Category` tiene los `allergens` en el formato `SerializedProductAllergen`.

    const serializedCategories: SerializedCategory[] = categories.map(category => ({
        category_id: category.category_id,
        establishment_id: category.establishment_id,
        name: category.name, // Ya traducido por el servicio
        image_url: category.image_url,
        sort_order: category.sort_order,
        is_active: category.is_active,
        translations: category.translations,
        products: category.products.map(product => ({
            product_id: product.product_id,
            establishment_id: product.establishment_id,
            category_id: product.category_id,
            name: product.name, // Ya traducido por el servicio
            description: product.description, // Ya traducido por el servicio
            image_url: product.image_url,
            sort_order: product.sort_order,
            is_active: product.is_active,
            translations: product.translations,
            variants: product.variants.map(variant => ({
                variant_id: variant.variant_id,
                product_id: variant.product_id,
                establishment_id: variant.establishment_id,
                variant_description: variant.variant_description, // Ya traducido por el servicio
                price: variant.price, // Ya convertido a number por el servicio
                sku: variant.sku,
                sort_order: variant.sort_order,
                is_active: variant.is_active,
                translations: variant.translations,
            })),
            // Asegúrate de que los alérgenos se serialicen correctamente aquí si el servicio no lo hace 100% como `SerializedProductAllergen`
            // La función `getCategoriesWithProducts` ya mapea `allergens` para incluir el objeto `allergen` completo,
            // por lo que esto debería ser compatible.
            allergens: product.allergens.map(pa => ({
              product_id: pa.product_id,
              allergen_id: pa.allergen_id,
              allergen: {
                allergen_id: pa.allergen.allergen_id,
                code: pa.allergen.code,
                name: pa.allergen.name, // Ya traducido por el servicio
                description: pa.allergen.description, // Ya traducido por el servicio
                icon_url: pa.allergen.icon_url,
                is_major_allergen: pa.allergen.is_major_allergen,
                translations: pa.allergen.translations,
              }
            }))
        }))
    }));

    return NextResponse.json(serializedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    if (error instanceof Error) {
        return NextResponse.json(
            { error: 'Error fetching categories', message: error.message },
            { status: 500 }
        );
    }
    return NextResponse.json(
        { error: 'An unexpected error occurred' },
        { status: 500 }
    );
  }
}
