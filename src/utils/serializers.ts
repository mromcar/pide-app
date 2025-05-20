import type {
  Category,
  Product,
  ProductVariant,
  Allergen, // Añadimos Allergen para su serialización directa
  OrderItem,
  Order,
  SerializedCategory,
  SerializedProduct,
  SerializedProductVariant,
  SerializedProductAllergen,
  SerializedAllergen, // Añadimos SerializedAllergen
  SerializedOrderItem,
  SerializedOrder
} from '@/types/menu';
import { Prisma } from '@prisma/client';
import type { LanguageCode } from '@/constants/languages';
import { getTranslation } from './translations';

// Helper functions for common serialization tasks
export const serializeDate = (date: Date | null): string | null => (date ? date.toISOString() : null);
export const serializeDecimal = (decimal: Prisma.Decimal | null): number | null =>
  (decimal ? decimal.toNumber() : null);

// MODIFICACIÓN CLAVE: serializeDecimals está bien, pero para los objetos principales,
// es mejor ser explícito con qué campos se serializan y se traducen.
// Mantendremos serializeDecimals para casos generales o anidados si es necesario,
// pero priorizaremos funciones de serialización explícitas para Category, Product, etc.

export function serializeAllergen(
  allergen: Allergen,
  language: LanguageCode
): SerializedAllergen {
  const name = getTranslation(allergen, (allergen as any).translations, language, 'name'); // Asegúrate que 'translations' exista en Allergen
  const description = getTranslation(allergen, (allergen as any).translations, language, 'description');

  return {
    allergen_id: allergen.allergen_id,
    code: allergen.code,
    name: name,
    description: description,
    icon_url: allergen.icon_url,
    is_major_allergen: allergen.is_major_allergen,
    // No incluir 'translations' aquí, ya que el tipo SerializedAllergen no la tiene.
  };
}

export function serializeProductVariant(
  variant: ProductVariant,
  language: LanguageCode
): SerializedProductVariant {
  const variant_description = getTranslation(
    variant,
    (variant as any).translations, // Asumiendo que Prisma te da ProductVariant con `translations`
    language,
    'variant_description'
  );

  return {
    variant_id: variant.variant_id,
    product_id: variant.product_id,
    establishment_id: variant.establishment_id,
    variant_description: variant_description,
    price: serializeDecimal(variant.price) as number, // Asegura que price siempre sea number si no es null
    sku: variant.sku,
    sort_order: variant.sort_order,
    is_active: variant.is_active,
    // No incluir 'translations' aquí
  };
}

export function serializeProduct(
  product: Product,
  language: LanguageCode
): SerializedProduct {
  const name = getTranslation(product, (product as any).translations, language, 'name');
  const description = getTranslation(product, (product as any).translations, language, 'description');

  return {
    product_id: product.product_id,
    establishment_id: product.establishment_id,
    category_id: product.category_id,
    name: name,
    description: description,
    image_url: product.image_url,
    sort_order: product.sort_order,
    is_active: product.is_active,
    // No incluir 'translations' aquí
    variants: product.variants.map(v => serializeProductVariant(v, language)),
    allergens: product.allergens.map(pa => ({
      product_id: pa.product_id,
      allergen_id: pa.allergen_id,
      allergen: serializeAllergen(pa.allergen, language), // Serializa el objeto allergen anidado
    })),
  };
}

export function serializeCategory(
  category: Category,
  language: LanguageCode
): SerializedCategory {
  const name = getTranslation(category, (category as any).translations, language, 'name');

  return {
    category_id: category.category_id,
    establishment_id: category.establishment_id,
    name: name,
    image_url: category.image_url,
    sort_order: category.sort_order,
    is_active: category.is_active,
    // La propiedad 'translations' se elimina aquí, ya que el 'name' ya está traducido.
    products: category.products.map(p => serializeProduct(p, language)),
  };
}

// Para SerializedOrderItem, necesitas la variante y la info del producto
// Esta función dependerá de cómo se obtiene la información de la variante y el producto en tu `route.ts` o servicio.
// Si ya recibes la variante completa con el producto anidado, puedes usarla directamente.
export function serializeOrderItem(
  item: OrderItem,
  language: LanguageCode, // Necesitamos el idioma para serializar la variante/producto
  productVariant?: ProductVariant & { product: Product & { allergens: { allergen: Allergen }[] } } // Opcional, si no viene en el item
): SerializedOrderItem {
  const serializedVariant = productVariant
    ? {
        ...serializeProductVariant(productVariant, language),
        product: {
          name: getTranslation(productVariant.product, (productVariant.product as any).translations, language, 'name'),
          description: getTranslation(productVariant.product, (productVariant.product as any).translations, language, 'description'),
          allergens: productVariant.product.allergens.map(pa => ({
            product_id: pa.product_id,
            allergen_id: pa.allergen_id,
            allergen: serializeAllergen(pa.allergen, language)
          }))
        }
      }
    : null; // O un objeto vacío si no se proporciona

  return {
    order_item_id: item.order_item_id,
    order_id: item.order_id,
    variant_id: item.variant_id,
    quantity: item.quantity,
    unit_price: serializeDecimal(item.unit_price) as number,
    item_total_price: serializeDecimal(item.item_total_price),
    status: item.status,
    notes: item.notes,
    variant: serializedVariant as SerializedOrderItem['variant'], // Casteamos para asegurar el tipo, ya que puede ser null inicialmente
  };
}

// Serialización de la orden principal
export function serializeOrder(order: Order, language: LanguageCode): SerializedOrder {
    // La serialización de los items dentro de la orden necesita el idioma para sus componentes anidados.
    // Esto asume que 'order.items' ya trae las relaciones necesarias para 'variant' y 'product'.
    // Si no es el caso, deberás cargar esas relaciones en tu servicio de pedidos antes de serializar la orden.
    const serializedItems = order.items.map(item => {
        // Aquí deberías tener acceso a la variante y el producto asociado al OrderItem
        // Esto generalmente implica hacer un `include` en tu query de Prisma para la Order y sus OrderItems.
        // Ejemplo: `include: { variant: { include: { product: { include: { allergens: { include: { allergen: true } }, translations: true } }, translations: true } } }`
        return serializeOrderItem(item, language, (item as any).variant); // Asegúrate de que item.variant exista y tenga las relaciones necesarias
    });

    return {
        order_id: order.order_id,
        establishment_id: order.establishment_id,
        client_user_id: order.client_user_id,
        waiter_user_id: order.waiter_user_id,
        table_number: order.table_number,
        status: order.status,
        total_amount: serializeDecimal(order.total_amount),
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        order_type: order.order_type,
        notes: order.notes,
        created_at: serializeDate(order.created_at),
        updated_at: serializeDate(order.updated_at),
        items: serializedItems,
    };
}


// No necesitas serializeResponse si usas las funciones de serialización explícitas
// para cada tipo de dato principal (Category, Product, Order, etc.)
// export function serializeResponse<T extends Record<string, any>>(data: T): T {
//   return serializeDecimals(data)
// }
