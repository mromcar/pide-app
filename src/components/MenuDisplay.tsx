'use client';
import { CategoryDTO } from '@/types/dtos/category';
import { ProductResponseDTO } from '@/types/dtos/product';
// import { useTranslation } from '@/hooks/useTranslation'; // Ya no se usaría directamente aquí si pasamos 't'
import { ProductImage } from '@/components/ProductImage'; // CORREGIDO: Importación nombrada
import { LanguageCode } from '@/constants/languages'; // Importar LanguageCode
import { uiTranslations } from '@/translations/ui'; // Importar uiTranslations

interface MenuCategoryWithProducts extends CategoryDTO {
  products: ProductResponseDTO[];
}

interface MenuDisplayProps {
  menu: MenuCategoryWithProducts[];
  lang: LanguageCode; // Añadir lang como prop
}

export default function MenuDisplay({ menu, lang }: MenuDisplayProps) {
  const t = uiTranslations[lang]; // Obtener las traducciones para el idioma actual

  if (!menu || menu.length === 0) {
    return <p>{t.restaurantMenu.menuNoItems}</p>; // CORREGIDO: Acceder a la clave anidada
  }

  return (
    <div>
      {menu.map((category) => (
        <section key={category.category_id} className="mb-12">
          <div className="flex items-center mb-6">
            {category.image_url && (
              <img 
                src={category.image_url} 
                alt={category.name} // El alt podría ser también t.categoryImageAlt(category.name) si necesitas traducirlo
                className="w-20 h-20 object-cover rounded-md mr-4"
              />
            )}
            {/* El nombre de la categoría y producto vienen traducidos de la BBDD o se gestionan con otro sistema de traducción de contenido */}
            <h2 className="text-2xl font-semibold text-gray-800">{category.name}</h2>
          </div>
          
          {category.products.length === 0 ? (
            <p className="text-gray-500 italic ml-4">{t.restaurantMenu.menuNoProductsInCategory}</p> // CORREGIDO: Acceder a la clave anidada
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.products.map((product) => (
                <article 
                  key={product.product_id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <ProductImage src={product.image_url} alt={product.name} />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-500 mb-2 min-h-[40px]">{product.description}</p>
                    )}
                    {product.allergens && product.allergens.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-400">
                          {t.productAllergens}: {product.allergens.map(a => a.allergen.name).join(', ')} {/* Esta clave está bien, no necesita cambios */}
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}